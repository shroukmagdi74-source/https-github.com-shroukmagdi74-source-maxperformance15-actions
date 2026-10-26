const { computeNextRunAt } = require('../utils/broadcastRecurrence');
const { resolveAudience } = require('./broadcastAudienceResolver');
const { getSharedPrismaClient } = require('./sharedDatabase');

function generateId() {
  return 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
}

/**
 * Resolve a usable WhatsApp session for the campaign (same fallback chain as the scheduler).
 */
async function resolveSessionId(prisma, campaign) {
  if (campaign.whatsAppSessionId) return campaign.whatsAppSessionId;
  const meta = await prisma.whatsAppSession.findFirst({
    where: { companyId: campaign.companyId, provider: 'META_CLOUD' },
  });
  if (meta) return meta.id;
  const def =
    (await prisma.whatsAppSession.findFirst({ where: { companyId: campaign.companyId, isDefault: true } })) ||
    (await prisma.whatsAppSession.findFirst({ where: { companyId: campaign.companyId } }));
  return def?.id || null;
}

/**
 * Build the per-run template context once: body text, header format, bound local variables.
 * Mirrors the scheduler so a run sends exactly what a one-off send would send.
 */
async function buildSendContext({ prisma, campaign, waSessionId }) {
  const { hasOrderVariables, getTemplateHeaderFormat } = require('../utils/broadcastTemplateParams');
  const MetaCloudProvider = require('./whatsapp/providers/MetaCloudProvider');

  let templateBodyText = '';
  let templateHeaderFormat = null;
  let boundLocalVariables = null;

  try {
    const metaTemplates = await MetaCloudProvider.listTemplates(waSessionId);
    const target = (metaTemplates || []).find((t) => t.name === campaign.waTemplateName);
    if (target) {
      templateBodyText = target.components?.find((c) => c.type === 'BODY')?.text || '';
      templateHeaderFormat = getTemplateHeaderFormat(target);
    }
  } catch (err) {
    console.warn(`⚠️ [CampaignRunner] Could not fetch template body text: ${err.message}`);
  }

  try {
    const boundLocal = await prisma.whatsAppNotificationTemplate.findFirst({
      where: { companyId: campaign.companyId, metaTemplateName: campaign.waTemplateName },
      select: { variables: true },
    });
    if (boundLocal?.variables) {
      const parsed = JSON.parse(boundLocal.variables);
      if (Array.isArray(parsed)) boundLocalVariables = parsed;
    }
  } catch (err) {
    console.warn(`⚠️ [CampaignRunner] Could not load bound local template variables: ${err?.message || err}`);
  }

  return {
    templateBodyText,
    templateHeaderFormat,
    boundLocalVariables,
    needOrderForCustomer: hasOrderVariables(boundLocalVariables),
  };
}

/**
 * Find (or provision) an ACTIVE whatsapp conversation for the recipient.
 * BroadcastRecipient.conversationId is a hard FK — a generated id would violate it.
 */
async function ensureConversation({ prisma, campaign, recipient }) {
  if (recipient.conversationId) return recipient.conversationId;

  if (recipient.customerId) {
    const existing = await prisma.conversation.findFirst({
      where: { companyId: campaign.companyId, customerId: recipient.customerId, channel: 'whatsapp' },
      select: { id: true },
    });
    if (existing) return existing.id;
  } else {
    const existing = await prisma.conversation.findFirst({
      where: { companyId: campaign.companyId, channel: 'whatsapp', customer: { phone: recipient.phone } },
      select: { id: true, customerId: true },
    });
    if (existing) {
      recipient.customerId = existing.customerId || null;
      return existing.id;
    }
  }

  const created = await prisma.conversation.create({
    data: {
      id: generateId(),
      companyId: campaign.companyId,
      customerId: recipient.customerId || null,
      status: 'ACTIVE',
      channel: 'whatsapp',
    },
    select: { id: true },
  });
  return created.id;
}

/**
 * Send one template message with the same parameter shape the scheduler builds,
 * so variable-count (#132000) and media-header templates behave identically.
 */
async function sendOneTemplate({ prisma, campaign, waSessionId, ctx, recipient }) {
  const { buildBroadcastBodyParams, buildBroadcastHeaderParams } = require('../utils/broadcastTemplateParams');
  const WhatsAppMessageHandler = require('./whatsapp').WhatsAppMessageHandler;

  const customer = recipient.customerId
    ? await prisma.customer.findUnique({ where: { id: recipient.customerId } })
    : null;

  const phone = customer?.phone || recipient.phone;
  if (!phone) throw new Error('No phone number');
  const to = phone.startsWith('+') ? phone.slice(1) : phone;

  let orderForCustomer = null;
  if (ctx.needOrderForCustomer && customer) {
    try {
      orderForCustomer = await prisma.order.findFirst({
        where: { companyId: campaign.companyId, customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        select: {
          orderNumber: true, total: true, subtotal: true, shipping: true,
          currency: true, turboTrackingNumber: true, status: true,
        },
      });
    } catch (orderErr) {
      console.warn(`⚠️ [CampaignRunner] Could not fetch latest order: ${orderErr?.message || orderErr}`);
    }
  }

  const bodyParams = buildBroadcastBodyParams(
    ctx.templateBodyText,
    customer,
    ctx.boundLocalVariables,
    orderForCustomer,
  );

  const components = [];
  if (ctx.templateHeaderFormat?.hasMedia) {
    if (!campaign.waHeaderMedia) {
      throw new Error(
        `القالب "${campaign.waTemplateName}" يتطلب صورة أو وسيط (${ctx.templateHeaderFormat.format}) في الترويسة، ولم يتم تحديد وسيط للحملة`,
      );
    }
    if (String(campaign.waHeaderMedia).startsWith('4:')) {
      throw new Error('مقبض الوسائط هذا غير صالح للإرسال (خاص بإنشاء القوالب فقط). يُرجى إعادة رفع الصورة كصورة حملة');
    }
    const headerParam = buildBroadcastHeaderParams(
      campaign.waHeaderMedia,
      ctx.templateHeaderFormat.format.toLowerCase(),
    );
    if (headerParam) components.push(headerParam);
  }
  if (bodyParams.length > 0) {
    components.push({ type: 'body', parameters: bodyParams });
  }

  const result = await WhatsAppMessageHandler.sendTemplateMessage(
    waSessionId,
    to,
    campaign.waTemplateName,
    {
      name: campaign.waTemplateName,
      language: campaign.waLanguageCode,
      languageCode: campaign.waLanguageCode,
      components,
    },
    {
      metadata: { isBroadcast: true, campaignId: campaign.id },
      templateBody: ctx.templateBodyText,
      senderId: campaign.creatorId,
    },
  );

  return { messageId: result?.messages?.[0]?.id || result?.messageId || result?.id || null };
}

/**
 * Execute a campaign run with atomic mutex claim and failure-rate safety limits.
 *
 * @param {Object} params
 * @param {string} params.campaignId
 * @param {string} [params.trigger='cron'] - 'cron' | 'manual'
 * @param {Date} [params.now=new Date()]
 * @param {Object} [params.options]
 * @param {Function} [params.sendFn] - Injectable sender for testing/overrides: async ({ recipient, campaign }) => ({ messageId })
 * @param {Object} [params.prisma] - Optional prisma override for testing
 * @returns {Promise<{ ran: boolean, reason?: string, runId?: string, status?: string, stats?: Object }>}
 */
async function runCampaign({
  campaignId,
  trigger = 'cron',
  now = new Date(),
  sendFn,
  options = {},
  prisma: customPrisma,
} = {}) {
  const prisma = customPrisma || options.prisma || getSharedPrismaClient();
  const effectiveSendFn = sendFn || options.sendFn;

  // 1. Read campaign
  const campaign = await prisma.broadcastCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    return { ran: false, reason: 'campaign_not_found' };
  }

  if (campaign.status !== 'active') {
    return { ran: false, reason: 'not_claimed' };
  }

  // 1. Atomic claim before doing anything else
  const next = computeNextRunAt({ ...campaign, from: now });
  const claimWhere = {
    id: campaignId,
    status: 'active',
  };

  // If cron trigger, ensure nextRunAt <= now
  if (trigger === 'cron') {
    claimWhere.nextRunAt = { lte: now };
  }

  const claimed = await prisma.broadcastCampaign.updateMany({
    where: claimWhere,
    data: {
      nextRunAt: next,
      lastRunAt: now,
    },
  });

  if (claimed.count !== 1) {
    return { ran: false, reason: 'not_claimed' };
  }

  // 2. Create the BroadcastCampaignRun row
  const runId = generateId();
  const scheduledFor = campaign.nextRunAt || now;

  await prisma.broadcastCampaignRun.create({
    data: {
      id: runId,
      campaignId: campaign.id,
      companyId: campaign.companyId,
      trigger,
      status: 'running',
      scheduledFor,
      startedAt: now,
      audienceCount: 0,
      excludedCount: 0,
      cappedCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      failureRate: 0,
    },
  });

  // 3. Resolve audience via broadcastAudienceResolver with maxRecipients
  const audience = await resolveAudience({
    prisma,
    campaign,
    companyId: campaign.companyId,
    maxRecipients: campaign.maxRecipientsPerRun,
  });

  await prisma.broadcastCampaignRun.update({
    where: { id: runId },
    data: {
      audienceCount: audience.phones.length,
      excludedCount: audience.excludedCount,
      cappedCount: audience.cappedCount,
    },
  });

  // 4. Zero recipients -> finalise completed with zeros, keep campaign active, return
  if (audience.phones.length === 0) {
    await prisma.broadcastCampaignRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        finishedAt: new Date(),
        audienceCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        failureRate: 0,
      },
    });

    if (campaign.recurrence === 'none') {
      await prisma.broadcastCampaign.update({
        where: { id: campaign.id },
        data: {
          status: 'completed',
          nextRunAt: null,
          runCount: { increment: 1 },
        },
      });
    } else {
      await prisma.broadcastCampaign.update({
        where: { id: campaign.id },
        data: {
          runCount: { increment: 1 },
        },
      });
    }

    return {
      ran: true,
      runId,
      status: 'completed',
      reason: 'no_recipients',
      stats: { audienceCount: 0, sentCount: 0, failedCount: 0, failureRate: 0 },
    };
  }

  // 5. Send loop setup
  let sentCount = 0;
  let failedCount = 0;
  let stopped = false;
  let stopReason = null;
  const threshold =
    typeof campaign.failureRateThreshold === 'number'
      ? campaign.failureRateThreshold
      : 5;

  let sendDelayMs = 1000;
  if (!effectiveSendFn) {
    try {
      const bcastSettings = await prisma.broadcastSettings.findUnique({
        where: { companyId: campaign.companyId },
        select: { messagesPerMinute: true },
      });
      const mpm = Number(bcastSettings?.messagesPerMinute);
      if (mpm && mpm > 0) {
        sendDelayMs = Math.max(100, Math.floor(60000 / mpm));
      }
    } catch {
      // use default
    }
  }

  // Real send path needs a session + one-shot template context per run.
  let waSessionId = null;
  let sendCtx = null;
  if (!effectiveSendFn) {
    try {
      waSessionId = await resolveSessionId(prisma, campaign);
      if (!waSessionId) throw new Error('لا توجد جلسة واتساب نشطة متاحة لهذه الحملة');
      sendCtx = await buildSendContext({ prisma, campaign, waSessionId });
    } catch (sessionErr) {
      await prisma.broadcastCampaignRun.update({
        where: { id: runId },
        data: { status: 'failed', finishedAt: new Date(), stopReason: sessionErr.message },
      });
      return {
        ran: true,
        runId,
        status: 'failed',
        reason: 'session_unavailable',
        stats: { audienceCount: audience.phones.length, sentCount: 0, failedCount: 0, failureRate: 0 },
      };
    }
  }

  for (let i = 0; i < audience.phones.length; i++) {
    const recipient = audience.phones[i];
    const recipientId = generateId();

    // BroadcastRecipient.conversationId is a hard FK: provision it before inserting.
    let conversationId = recipient.conversationId || null;
    if (!conversationId) {
      try {
        conversationId = await ensureConversation({ prisma, campaign, recipient });
      } catch (convErr) {
        console.warn(`⚠️ [CampaignRunner] Could not provision conversation for ${recipient.phone}: ${convErr.message}`);
      }
    }

    if (!conversationId) {
      failedCount++;
      continue;
    }

    // Insert BroadcastRecipient row BEFORE the send so an interrupted run stays countable.
    await prisma.broadcastRecipient.create({
      data: {
        id: recipientId,
        campaignId: campaign.id,
        runId,
        conversationId,
        customerPhone: recipient.phone,
        customerName: recipient.name,
        status: 'pending',
      },
    });

    try {
      let result;
      if (effectiveSendFn) {
        result = await effectiveSendFn({ recipient, campaign, runId });
      } else {
        result = await sendOneTemplate({ prisma, campaign, waSessionId, ctx: sendCtx, recipient });
      }

      sentCount++;
      await prisma.broadcastRecipient.update({
        where: { id: recipientId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: result?.messageId || result?.id || null,
        },
      });
    } catch (sendErr) {
      failedCount++;
      await prisma.broadcastRecipient.update({
        where: { id: recipientId },
        data: {
          status: 'failed',
          failureReason: sendErr.message,
          sentAt: new Date(),
        },
      });
    }

    // 6. Failure-rate auto-stop: check after every 10 sends and at the end
    const attempted = sentCount + failedCount;
    if (attempted > 0 && (attempted % 10 === 0 || attempted === audience.phones.length)) {
      const currentRate = (failedCount / attempted) * 100;
      if (currentRate > threshold) {
        stopped = true;
        stopReason = 'failure_rate';
        break;
      }
    }

    if (!effectiveSendFn && sendDelayMs > 0 && i < audience.phones.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, sendDelayMs));
    }
  }

  // 7. Finalisation
  const totalAttempted = sentCount + failedCount;
  const finalFailureRate =
    totalAttempted > 0 ? (failedCount / totalAttempted) * 100 : 0;

  const runStatus = stopped
    ? 'stopped'
    : failedCount === totalAttempted && totalAttempted > 0
    ? 'failed'
    : 'completed';

  await prisma.broadcastCampaignRun.update({
    where: { id: runId },
    data: {
      status: runStatus,
      finishedAt: new Date(),
      sentCount,
      deliveredCount: 0,
      failedCount,
      failureRate: finalFailureRate,
      stopReason,
    },
  });

  const campaignUpdateData = {
    sentCount: { increment: sentCount },
    failedCount: { increment: failedCount },
    runCount: { increment: 1 },
  };

  if (stopped) {
    campaignUpdateData.status = 'paused';
    campaignUpdateData.pausedReason = `Failure rate ${finalFailureRate.toFixed(1)}% exceeded threshold ${threshold}%`;
  } else if (campaign.recurrence === 'none') {
    campaignUpdateData.status = 'completed';
    campaignUpdateData.nextRunAt = null;
  }

  await prisma.broadcastCampaign.update({
    where: { id: campaign.id },
    data: campaignUpdateData,
  });

  return {
    ran: true,
    runId,
    status: runStatus,
    reason: stopped ? stopReason : undefined,
    stats: {
      audienceCount: audience.phones.length,
      sentCount,
      failedCount,
      failureRate: finalFailureRate,
    },
  };
}

module.exports = {
  runCampaign,
  sendOneTemplate,
  ensureConversation,
  resolveSessionId,
  buildSendContext,
};
