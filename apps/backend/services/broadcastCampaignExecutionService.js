const { getSharedPrismaClient } = require('./sharedDatabase');
const { sendFacebookMessage } = require('../utils/allFunctions');
const WhatsAppMessageHandler = require('./whatsapp').WhatsAppMessageHandler;
const MetaCloudProvider = require('./whatsapp/providers/MetaCloudProvider');
const socketService = require('./socketService');
const { recordSentMessageStat } = require('../utils/statsRecorder');
const {
  buildBroadcastBodyParams,
  countTemplateParams,
  hasOrderVariables,
  getTemplateHeaderFormat,
  buildBroadcastHeaderParams
} = require('../utils/broadcastTemplateParams');
const { isUnsubscribed } = require('./botUnsubscribeService');
const { toCanonicalE164 } = require('../utils/phoneNormalization');

const generateId = () => 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);

/**
 * استبدال المتغيرات في الرسالة بالبيانات الفعلية للعميل
 */
function replaceMessageVariables(message, customer) {
  if (!message || !customer) return message;
  let personalizedMessage = message;
  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'عزيزي العميل';
  personalizedMessage = personalizedMessage.replace(/{customerName}/g, fullName);
  const firstName = customer.firstName || 'عزيزي العميل';
  personalizedMessage = personalizedMessage.replace(/{firstName}/g, firstName);
  const lastName = customer.lastName || '';
  personalizedMessage = personalizedMessage.replace(/{lastName}/g, lastName);
  return personalizedMessage;
}

/**
 * تجهيز المستلمين بسرعة فائقة بالدفعات (Batch Optimization)
 * يحول 4,000+ استعلام متسلسل إلى 3-4 استعلامات مجمعة لمنع تجميد الخادم وتفادي 502
 */
async function prepareCampaignRecipients({
  companyId,
  campaign,
  manualPhonesFromBody,
  isWhatsApp
}) {
  let manualPhonesList = [];
  if (manualPhonesFromBody) {
    if (typeof manualPhonesFromBody === 'string') {
      try { manualPhonesList = JSON.parse(manualPhonesFromBody); } catch { manualPhonesList = [manualPhonesFromBody]; }
    } else if (Array.isArray(manualPhonesFromBody)) {
      manualPhonesList = manualPhonesFromBody;
    }
    manualPhonesList = manualPhonesList.filter(p => p && String(p).replace(/[^0-9]/g, '').length > 0);
  }

  const hasManualPhones = manualPhonesList.length > 0;
  let conversations = [];

  if (hasManualPhones) {
    console.log(`📱 [BROADCAST-SERVICE] تم استلام ${manualPhonesList.length} رقم يدوي - جاري التجهيز الدفعي`);

    const seenClean = new Set();
    const uniqueCleanPhones = [];
    for (const phone of manualPhonesList) {
      const clean = String(phone).replace(/[^0-9]/g, '');
      if (clean && !seenClean.has(clean)) {
        seenClean.add(clean);
        uniqueCleanPhones.push(clean);
      }
    }

    const phoneToCanonical = new Map();
    for (const clean of uniqueCleanPhones) {
      const canon = toCanonicalE164(clean);
      if (canon) phoneToCanonical.set(clean, canon);
    }

    const customerMapByPhone = new Map();
    const CHUNK_SIZE = 500;
    for (let i = 0; i < uniqueCleanPhones.length; i += CHUNK_SIZE) {
      const chunkClean = uniqueCleanPhones.slice(i, i + CHUNK_SIZE);
      const chunkCanonical = chunkClean.map(c => phoneToCanonical.get(c)).filter(Boolean);

      const existingCustomers = await getSharedPrismaClient().customer.findMany({
        where: {
          companyId,
          OR: [
            { phone: { in: chunkClean } },
            { phoneNormalized: { in: chunkCanonical } }
          ]
        }
      });

      for (const cust of existingCustomers) {
        if (cust.phone) customerMapByPhone.set(cust.phone.replace(/[^0-9]/g, ''), cust);
        if (cust.phoneNormalized) customerMapByPhone.set(cust.phoneNormalized.replace(/[^0-9]/g, ''), cust);
      }
    }

    const customersToCreate = [];
    for (const clean of uniqueCleanPhones) {
      const canon = phoneToCanonical.get(clean);
      const cleanCanon = canon ? canon.replace(/[^0-9]/g, '') : null;
      if (!customerMapByPhone.has(clean) && (!cleanCanon || !customerMapByPhone.has(cleanCanon))) {
        customersToCreate.push({
          id: generateId(),
          companyId,
          phone: clean,
          phoneNormalized: canon || null,
          firstName: clean,
          lastName: '',
          metadata: JSON.stringify({ source: 'manual_campaign' })
        });
      }
    }

    if (customersToCreate.length > 0) {
      console.log(`➕ [BROADCAST-SERVICE] إنشاء ${customersToCreate.length} عميل جديد للأرقام اليدوية`);
      try {
        await getSharedPrismaClient().customer.createMany({
          data: customersToCreate,
          skipDuplicates: true
        });
        for (const c of customersToCreate) {
          customerMapByPhone.set(c.phone, c);
        }
      } catch (createErr) {
        for (const c of customersToCreate) {
          try {
            const created = await getSharedPrismaClient().customer.create({ data: c });
            customerMapByPhone.set(c.phone, created);
          } catch (singleErr) {
            const existing = await getSharedPrismaClient().customer.findFirst({
              where: { companyId, OR: [{ phone: c.phone }, { phoneNormalized: c.phoneNormalized }] }
            });
            if (existing) customerMapByPhone.set(c.phone, existing);
          }
        }
      }
    }

    const customerByPhone = [];
    const customerIdsSet = new Set();
    for (const clean of uniqueCleanPhones) {
      const canon = phoneToCanonical.get(clean);
      const cleanCanon = canon ? canon.replace(/[^0-9]/g, '') : null;
      const cust = customerMapByPhone.get(clean) || (cleanCanon ? customerMapByPhone.get(cleanCanon) : null);
      if (cust) {
        customerByPhone.push(cust);
        customerIdsSet.add(cust.id);
      }
    }

    const customerIdList = Array.from(customerIdsSet);
    const convMapByCustomerId = new Map();
    for (let i = 0; i < customerIdList.length; i += CHUNK_SIZE) {
      const chunkIds = customerIdList.slice(i, i + CHUNK_SIZE);
      const existingConvs = await getSharedPrismaClient().conversation.findMany({
        where: {
          companyId,
          channel: 'whatsapp',
          customerId: { in: chunkIds }
        },
        include: { customer: true }
      });
      for (const conv of existingConvs) {
        if (conv.customerId) convMapByCustomerId.set(conv.customerId, conv);
      }
    }

    const convsToCreate = [];
    for (const cust of customerByPhone) {
      if (!convMapByCustomerId.has(cust.id)) {
        convsToCreate.push({
          id: generateId(),
          companyId,
          customerId: cust.id,
          status: 'ACTIVE',
          channel: 'whatsapp'
        });
      }
    }

    if (convsToCreate.length > 0) {
      console.log(`➕ [BROADCAST-SERVICE] إنشاء ${convsToCreate.length} محادثة جديدة للأرقام اليدوية`);
      try {
        await getSharedPrismaClient().conversation.createMany({
          data: convsToCreate,
          skipDuplicates: true
        });
        const createdIds = convsToCreate.map(c => c.id);
        for (let i = 0; i < createdIds.length; i += CHUNK_SIZE) {
          const chunkIds = createdIds.slice(i, i + CHUNK_SIZE);
          const fetched = await getSharedPrismaClient().conversation.findMany({
            where: { id: { in: chunkIds } },
            include: { customer: true }
          });
          for (const conv of fetched) {
            if (conv.customerId) convMapByCustomerId.set(conv.customerId, conv);
          }
        }
      } catch (convErr) {
        for (const c of convsToCreate) {
          try {
            const newConv = await getSharedPrismaClient().conversation.create({
              data: c,
              include: { customer: true }
            });
            convMapByCustomerId.set(c.customerId, newConv);
          } catch (err) {}
        }
      }
    }

    const seenConvIds = new Set();
    for (const cust of customerByPhone) {
      const conv = convMapByCustomerId.get(cust.id);
      if (conv && !seenConvIds.has(conv.id)) {
        seenConvIds.add(conv.id);
        if (!conv.customer) conv.customer = cust;
        conversations.push(conv);
      }
    }
    console.log(`📊 [BROADCAST-SERVICE] تم تجهيز ${conversations.length} محادثة للأرقام اليدوية`);
  } else if (isWhatsApp) {
    console.log('🌐 [BROADCAST-SERVICE] جلب محادثات الواتساب');
    conversations = await getSharedPrismaClient().conversation.findMany({
      where: {
        companyId,
        customer: { phone: { not: null } }
      },
      include: { customer: true }
    });
    conversations = conversations.filter(c => c.customer?.phone && c.customer.phone.trim() !== '');
  } else {
    // Facebook
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    conversations = await getSharedPrismaClient().conversation.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
        messages: {
          some: {
            isFromCustomer: true,
            createdAt: { gte: twentyFourHoursAgo }
          }
        }
      },
      include: {
        customer: true,
        messages: {
          where: { isFromCustomer: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  if (isWhatsApp && campaign.leadCategoryId) {
    const validContacts = await getSharedPrismaClient().whatsAppContact.findMany({
      where: { leadCategoryId: campaign.leadCategoryId, companyId },
      select: { customerId: true }
    });
    const validCustomerIds = new Set(validContacts.map(c => c.customerId).filter(Boolean));
    conversations = conversations.filter(c => validCustomerIds.has(c.customer?.id));
  }

  return conversations;
}

/**
 * تنفيذ إرسال رسائل الحملة في الخلفية (Async Background Pipeline)
 * يحافظ على استقرار السيرفر، يمنع أخطاء 502 Bad Gateway، ويبث التقدم لحظياً عبر Socket.IO
 */
async function executeCampaignSendInBackground({
  campaign,
  conversations,
  recipients,
  companyId,
  campaignId,
  isWhatsApp,
  waSessionId,
  io,
  perMessageDelayMs,
  reqBody = {}
}) {
  let sentCount = 0;
  let failedCount = 0;
  const sendResults = [];
  const totalRecipients = conversations.length;

  console.log(`🚀 [SEND CAMPAIGN BG] بدء معالجة الحملة في الخلفية لعدد ${totalRecipients} مستلم`);

  try {
    if (isWhatsApp) {
      let templateBodyText = '';
      let templateHeaderFormat = null;
      try {
        const metaTemplates = await MetaCloudProvider.listTemplates(waSessionId);
        const targetMetaTemplate = metaTemplates.find(t => t.name === campaign.waTemplateName);
        if (targetMetaTemplate) {
          templateBodyText = targetMetaTemplate.components?.find(c => c.type === 'BODY')?.text || '';
          templateHeaderFormat = getTemplateHeaderFormat(targetMetaTemplate);
        }
      } catch (tmplErr) {
        console.warn('⚠️ [SEND CAMPAIGN BG] Could not fetch template body text:', tmplErr.message);
      }

      let boundLocalVariables = null;
      try {
        const boundLocal = await getSharedPrismaClient().whatsAppNotificationTemplate.findFirst({
          where: { companyId, metaTemplateName: campaign.waTemplateName },
          select: { variables: true }
        });
        if (boundLocal?.variables) {
          const parsed = JSON.parse(boundLocal.variables);
          if (Array.isArray(parsed)) boundLocalVariables = parsed;
        }
      } catch (e) {
        console.warn('⚠️ [SEND CAMPAIGN BG] Could not load bound local template variables:', e?.message || e);
      }
      const needOrderForCustomer = hasOrderVariables(boundLocalVariables);

      let targetConvs = conversations;
      const maxRecipients = parseInt(reqBody?.limit) || 0;
      if (maxRecipients > 0 && targetConvs.length > maxRecipients) {
        console.log(`📊 [SEND CAMPAIGN BG] تطبيق الحد الأقصى: إرسال لـ ${maxRecipients} من أصل ${targetConvs.length} مستلم`);
        targetConvs = targetConvs.slice(0, maxRecipients);
      }

      let lastProgressDbUpdate = Date.now();

      for (let i = 0; i < targetConvs.length; i++) {
        const conv = targetConvs[i];

        try {
          const cid = conv?.customer?.id;
          if (cid && await isUnsubscribed(companyId, cid, 'WHATSAPP')) {
            console.log(`🚫 [SEND CAMPAIGN BG] تخطي ${conv.customer?.firstName || cid} - الغى اشتراكه (unsubscribed)`);
            failedCount++;
            await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: { campaignId: campaign.id, conversationId: conv.id },
              data: { status: 'skipped', failureReason: 'Unsubscribed', sentAt: new Date() }
            }).catch(() => {});
            continue;
          }
        } catch (unsubErr) {
          console.warn(`⚠️ [SEND CAMPAIGN BG] فحص unsubscribe فشل:`, unsubErr.message);
        }

        try {
          const currentCampaign = await getSharedPrismaClient().broadcastCampaign.findUnique({
            where: { id: campaignId },
            select: { status: true }
          });
          if (currentCampaign && (currentCampaign.status === 'paused' || currentCampaign.status === 'cancelled')) {
            console.log(`⏹️ [SEND CAMPAIGN BG] تم إيقاف الحملة (${currentCampaign.status}) بعد إرسال ${sentCount} رسالة`);
            break;
          }
        } catch (statusErr) {
          console.error(`⚠️ [SEND CAMPAIGN BG] فشل التحقق من حالة الحملة:`, statusErr.message);
        }

        try {
          const phone = conv.customer?.phone;
          if (!phone) {
            console.log(`⚠️ [SEND CAMPAIGN BG] تخطي ${conv.customer?.firstName || 'بدون اسم'} - لا يوجد رقم هاتف`);
            failedCount++;
            await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: { campaignId: campaign.id, conversationId: conv.id },
              data: { status: 'failed', failureReason: 'No phone number', sentAt: new Date() }
            });
            continue;
          }

          const to = phone.startsWith('+') ? phone.slice(1) : phone;

          let orderForCustomer = null;
          if (needOrderForCustomer && conv.customer?.id) {
            try {
              orderForCustomer = await getSharedPrismaClient().order.findFirst({
                where: { companyId, customerId: conv.customer.id },
                orderBy: { createdAt: 'desc' },
                select: {
                  orderNumber: true, total: true, subtotal: true, shipping: true,
                  currency: true, turboTrackingNumber: true, status: true
                }
              });
            } catch (orderErr) {
              console.warn(`⚠️ [SEND CAMPAIGN BG] Could not fetch latest order for ${conv.customer?.firstName}:`, orderErr?.message || orderErr);
            }
          }
          const bodyParams = buildBroadcastBodyParams(templateBodyText, conv.customer, boundLocalVariables, orderForCustomer);

          const components = [];
          const headerMedia = campaign.waHeaderMedia || (Array.isArray(campaign.images) && campaign.images[0]) || null;
          if (templateHeaderFormat?.hasMedia) {
            if (!headerMedia) {
              throw new Error(`القالب "${campaign.waTemplateName}" يتطلب صورة أو وسيط (${templateHeaderFormat.format}) في الترويسة، ولم يتم تحديد وسيط للحملة`);
            }
            if (String(headerMedia).startsWith('4:')) {
              throw new Error('مقبض الوسائط هذا غير صالح للإرسال (خاص بإنشاء القوالب فقط). يُرجى إعادة رفع الصورة كصورة حملة');
            }
            const headerParam = buildBroadcastHeaderParams(headerMedia, templateHeaderFormat.format.toLowerCase());
            if (headerParam) components.push(headerParam);
          }
          if (bodyParams.length > 0) {
            components.push({ type: 'body', parameters: bodyParams });
          }

          let resolvedBody = templateBodyText;
          if (resolvedBody && bodyParams.length > 0) {
            bodyParams.forEach((param, idx) => {
              if (param.text) {
                resolvedBody = resolvedBody.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), param.text);
              }
            });
          }

          const result = await WhatsAppMessageHandler.sendTemplateMessage(
            waSessionId, to, campaign.waTemplateName,
            { name: campaign.waTemplateName, language: campaign.waLanguageCode, languageCode: campaign.waLanguageCode, components },
            {
              metadata: { isBroadcast: true, campaignId: campaign.id },
              templateBody: resolvedBody,
              senderId: campaign.creatorId,
              headerMediaUrl: headerMedia
            }
          );

          sentCount++;
          const waMessageId = result?.messages?.[0]?.id || result?.messageId || null;
          await getSharedPrismaClient().broadcastRecipient.updateMany({
            where: { campaignId: campaign.id, conversationId: conv.id },
            data: { status: 'sent', sentAt: new Date(), messageId: waMessageId }
          });

          sendResults.push({
            customerId: conv.customer?.id,
            customerName: `${conv.customer?.firstName || ''} ${conv.customer?.lastName || ''}`.trim(),
            status: 'sent',
            success: true
          });

          const progress = Math.round(((i + 1) / totalRecipients) * 100);
          if (io) {
            io.emit('campaign:progress', {
              campaignId: campaign.id,
              status: 'sending',
              total: totalRecipients,
              sent: sentCount,
              failed: failedCount,
              progress
            });
          }
          await new Promise(resolve => setTimeout(resolve, perMessageDelayMs));
        } catch (err) {
          console.error(`❌ [SEND CAMPAIGN BG] فشل إرسال واتساب لـ ${conv.customer?.firstName || conv.id}:`, err.message);
          failedCount++;
          await getSharedPrismaClient().broadcastRecipient.updateMany({
            where: { campaignId: campaign.id, conversationId: conv.id },
            data: { status: 'failed', failureReason: err.message, sentAt: new Date() }
          });
          sendResults.push({
            customerId: conv.customer?.id,
            customerName: `${conv.customer?.firstName || ''} ${conv.customer?.lastName || ''}`.trim(),
            status: 'failed',
            success: false,
            error: err.message
          });

          const progress = Math.round(((i + 1) / totalRecipients) * 100);
          if (io) {
            io.emit('campaign:progress', {
              campaignId: campaign.id,
              status: 'sending',
              total: totalRecipients,
              sent: sentCount,
              failed: failedCount,
              progress
            });
          }
        }

        const now = Date.now();
        if ((i + 1) % 10 === 0 || (now - lastProgressDbUpdate >= 5000) || (i + 1) === targetConvs.length) {
          lastProgressDbUpdate = now;
          await getSharedPrismaClient().broadcastCampaign.update({
            where: { id: campaignId },
            data: { sentCount, failedCount }
          }).catch(e => console.warn('⚠️ [SEND CAMPAIGN BG] فشل تحديث التقدم في قاعدة البيانات:', e.message));
        }
      }
    } else {
      // ==================== إرسال عبر Facebook Messenger ====================
      let targetConvs = conversations;
      const fbMaxRecipients = parseInt(reqBody?.limit) || 0;
      if (fbMaxRecipients > 0 && targetConvs.length > fbMaxRecipients) {
        console.log(`📊 [SEND CAMPAIGN BG] تطبيق الحد الأقصى: إرسال لـ ${fbMaxRecipients} من أصل ${targetConvs.length} مستلم (فيسبوك)`);
        targetConvs = targetConvs.slice(0, fbMaxRecipients);
      }

      for (let i = 0; i < targetConvs.length; i++) {
        const conv = targetConvs[i];

        try {
          const cid = conv?.customer?.id;
          if (cid && await isUnsubscribed(companyId, cid, 'FACEBOOK')) {
            console.log(`🚫 [SEND CAMPAIGN-FB BG] تخطي ${conv.customer?.firstName || cid} - الغى اشتراكه (unsubscribed)`);
            failedCount++;
            await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: { campaignId: campaign.id, conversationId: conv.id },
              data: { status: 'skipped', failureReason: 'Unsubscribed', sentAt: new Date() }
            }).catch(() => {});
            continue;
          }
        } catch (unsubErr) {
          console.warn(`⚠️ [SEND CAMPAIGN-FB BG] فحص unsubscribe فشل:`, unsubErr.message);
        }

        try {
          const currentCampaign = await getSharedPrismaClient().broadcastCampaign.findUnique({
            where: { id: campaignId },
            select: { status: true }
          });
          if (currentCampaign && (currentCampaign.status === 'paused' || currentCampaign.status === 'cancelled')) {
            console.log(`⏹️ [SEND CAMPAIGN BG] تم إيقاف حملة الفيسبوك (${currentCampaign.status}) بعد إرسال ${sentCount} رسالة`);
            break;
          }
        } catch (statusErr) {
          console.error(`⚠️ [SEND CAMPAIGN BG] فشل التحقق من حالة الحملة:`, statusErr.message);
        }

        try {
          if (!conv.customer?.facebookId) {
            console.log(`⚠️ [SEND CAMPAIGN BG] تخطي العميل ${conv.customer?.firstName || 'بدون اسم'} - لا يوجد Facebook ID`);
            failedCount++;
            await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: { campaignId: campaign.id, conversationId: conv.id },
              data: { status: 'failed', failureReason: 'No Facebook ID', sentAt: new Date() }
            });
            continue;
          }

          let conversationPageId = null;
          if (conv.metadata) {
            try {
              const metadata = JSON.parse(conv.metadata);
              if (metadata.pageId) conversationPageId = metadata.pageId;
            } catch (error) {}
          }

          if (!conversationPageId) {
            const defaultPage = await getSharedPrismaClient().facebookPage.findFirst({
              where: { companyId: companyId, status: 'connected' },
              orderBy: { connectedAt: 'desc' }
            });
            if (defaultPage) {
              conversationPageId = defaultPage.pageId;
            } else {
              failedCount++;
              await getSharedPrismaClient().broadcastRecipient.updateMany({
                where: { campaignId: campaign.id, conversationId: conv.id },
                data: { status: 'failed', failureReason: 'No connected Facebook page', sentAt: new Date() }
              });
              continue;
            }
          }

          const savedMessages = [];
          const personalizedMessage = replaceMessageVariables(campaign.message, conv.customer);

          const genId = () => 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);

          if (personalizedMessage && personalizedMessage.trim().length > 0) {
            const textMessage = await getSharedPrismaClient().message.create({
              data: {
                id: genId(),
                conversationId: conv.id,
                content: personalizedMessage,
                isFromCustomer: false,
                type: 'TEXT',
                senderId: campaign.creatorId,
                metadata: JSON.stringify({
                  isBroadcast: true,
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  sentAt: new Date().toISOString()
                })
              }
            });
            savedMessages.push(textMessage);
          }

          let sendResult;
          if (campaign.images && Array.isArray(campaign.images) && campaign.images.length > 0) {
            for (const imageUrl of campaign.images) {
              const imageMessage = await getSharedPrismaClient().message.create({
                data: {
                  id: genId(),
                  conversationId: conv.id,
                  content: imageUrl,
                  isFromCustomer: false,
                  type: 'IMAGE',
                  senderId: campaign.creatorId,
                  metadata: JSON.stringify({
                    isBroadcast: true,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    sentAt: new Date().toISOString()
                  })
                }
              });
              savedMessages.push(imageMessage);
            }

            if (personalizedMessage && personalizedMessage.trim().length > 0) {
              sendResult = await sendFacebookMessage(
                conv.customer.facebookId,
                personalizedMessage,
                'TEXT',
                conversationPageId
              );
            }

            for (const imageUrl of campaign.images) {
              const imageResult = await sendFacebookMessage(
                conv.customer.facebookId,
                imageUrl,
                'IMAGE',
                conversationPageId
              );
              if (!imageResult.success) {
                sendResult = imageResult;
                break;
              }
              sendResult = imageResult;
            }
          } else {
            sendResult = await sendFacebookMessage(
              conv.customer.facebookId,
              personalizedMessage,
              'TEXT',
              conversationPageId
            );
          }

          if (sendResult?.success) {
            sentCount++;
            await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: { campaignId: campaign.id, conversationId: conv.id },
              data: { status: 'sent', sentAt: new Date() }
            });

            sendResults.push({
              customerId: conv.customer?.id,
              customerName: `${conv.customer?.firstName || ''} ${conv.customer?.lastName || ''}`.trim(),
              status: 'sent',
              success: true
            });
          } else {
            failedCount++;
            for (const msg of savedMessages) {
              await getSharedPrismaClient().message.delete({ where: { id: msg.id } }).catch(() => {});
            }
            await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: { campaignId: campaign.id, conversationId: conv.id },
              data: { status: 'failed', failureReason: sendResult?.error || sendResult?.message || 'Facebook API Error', sentAt: new Date() }
            });
            sendResults.push({
              customerId: conv.customer?.id,
              customerName: `${conv.customer?.firstName || ''} ${conv.customer?.lastName || ''}`.trim(),
              status: 'failed',
              success: false,
              error: sendResult?.error || sendResult?.message
            });
          }

          const progress = Math.round(((i + 1) / totalRecipients) * 100);
          if (io) {
            io.emit('campaign:progress', {
              campaignId: campaign.id,
              status: 'sending',
              total: totalRecipients,
              sent: sentCount,
              failed: failedCount,
              progress
            });
          }
          await new Promise(resolve => setTimeout(resolve, perMessageDelayMs));
        } catch (fbErr) {
          console.error(`❌ [SEND CAMPAIGN-FB BG] خطأ لـ ${conv.customer?.firstName || conv.id}:`, fbErr.message);
          failedCount++;
          await getSharedPrismaClient().broadcastRecipient.updateMany({
            where: { campaignId: campaign.id, conversationId: conv.id },
            data: { status: 'failed', failureReason: fbErr.message, sentAt: new Date() }
          }).catch(() => {});
        }
      }
    }

    console.log(`📊 [SEND CAMPAIGN BG] اكتمل الإرسال - نجح: ${sentCount}, فشل: ${failedCount}`);

    try {
      const currentCampaign = await getSharedPrismaClient().broadcastCampaign.findUnique({
        where: { id: campaignId },
        select: { status: true }
      });

      const isPausedOrCancelled = currentCampaign && (currentCampaign.status === 'paused' || currentCampaign.status === 'cancelled');

      const updateData = {
        recipientCount: recipients.length,
        sentCount: sentCount,
        failedCount: failedCount,
        deliveredCount: 0
      };

      if (!isPausedOrCancelled) {
        updateData.status = sentCount > 0 ? 'sent' : 'failed';
      }

      await getSharedPrismaClient().broadcastCampaign.update({
        where: { id: campaignId },
        data: updateData
      });
      console.log('✅ [SEND CAMPAIGN BG] تم تحديث إحصائيات الحملة في قاعدة البيانات بنجاح');

      if (io) {
        io.emit('campaign:progress', {
          campaignId: campaign.id,
          status: isPausedOrCancelled ? currentCampaign.status : 'completed',
          total: totalRecipients,
          sent: sentCount,
          failed: failedCount,
          progress: 100
        });
      }
    } catch (updateError) {
      console.error('❌ [SEND CAMPAIGN BG] خطأ في تحديث إحصائيات الحملة:', updateError);
    }

  } catch (error) {
    console.error('❌ [SEND CAMPAIGN BG] خطأ غير متوقع في معالجة الحملة:', error);
    try {
      const finalStatusCheck = await getSharedPrismaClient().broadcastCampaign.findUnique({
        where: { id: campaignId },
        select: { status: true }
      });
      if (!finalStatusCheck || (finalStatusCheck.status !== 'paused' && finalStatusCheck.status !== 'cancelled')) {
        await getSharedPrismaClient().broadcastCampaign.update({
          where: { id: campaignId },
          data: { status: 'failed' }
        });
      }
    } catch (e) {}

    if (io) {
      io.emit('campaign:progress', {
        campaignId: campaign.id,
        status: 'failed',
        total: totalRecipients,
        sent: sentCount,
        failed: failedCount,
        progress: 0,
        error: error.message
      });
    }
  }
}

module.exports = {
  prepareCampaignRecipients,
  executeCampaignSendInBackground,
  replaceMessageVariables
};
