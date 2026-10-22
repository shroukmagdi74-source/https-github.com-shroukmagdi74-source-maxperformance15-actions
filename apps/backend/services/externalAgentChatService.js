/**
 * @module externalAgentChatService
 * @description Merchant Developer Hub — External AI Agent Chat Service.
 * Allows external systems (CRM, WhatsApp bots, custom backends, mobile apps)
 * to interact directly with the company's AI agents using Developer Hub API keys.
 *
 * Isolation contract:
 *  - Company scope is strictly bound to req.merchantCredential.companyId
 *  - Conversations are persisted in PostgreSQL via aiSessionService
 *  - Multi-turn conversation history is maintained per sessionId
 */
const { resolveDefaultCopilotAgent } = require('../utils/resolveDefaultCopilotAgent');
const aiSessionService = require('./aiSessionService');

// Baseline specialists with rich Arabic metadata & prompts
const BASE_SPECIALISTS = [
  {
    id: 'executive-assistant-agent',
    slug: 'executive-assistant-agent',
    name: 'سليم — المساعد التنفيذي',
    role: 'EXECUTIVE_ASSISTANT',
    title: 'المساعد التنفيذي للمنصة وإدارة العمليات',
    description: 'المتابعة التنفيذية الشاملة، مؤشرات الأداء، الأوردرات والمخزون، وتفويض المهام.',
    badge: 'المساعد التنفيذي',
    allowedChannels: ['DASHBOARD', 'WHATSAPP', 'EXTERNAL_API'],
    suggestedPrompts: [
      'أعطني ملخصاً تنفيذياً لحالة البيزنس والمبيعات اليوم',
      'ما هي أهم النواقص أو العمليات المعلقة التي تحتاج تدخلاً فوري؟',
      'فحص إعدادات المتجر وأدوات التحويل وطرق الدفع والشحن',
    ],
  },
  {
    id: 'facebook-media-buyer-agent',
    slug: 'facebook-media-buyer-agent',
    name: 'الميديا باير المحترف',
    role: 'MEDIA_BUYER',
    title: 'خبير إعلانات ميتا وفيسبوك',
    description: 'إدارة الميزانيات، صياغة زوايا البيع، مراقبة الـ CPA وقرارات SCALE و KILL.',
    badge: 'إعلانات وتسويق',
    allowedChannels: ['DASHBOARD', 'EXTERNAL_API'],
    suggestedPrompts: [
      'افحص الحملات الإعلانية الحالية وقارن CPA بهامش الربح',
      'اقترح 3 زوايا بيع وهوكات إعلانية جديدة للمنتج الأكثر مبيعاً',
    ],
  },
  {
    id: 'order-confirmation-agent',
    slug: 'order-confirmation-agent',
    name: 'منى — تأكيد الطلبات',
    role: 'ORDER_CONFIRMATION',
    title: 'مسؤولة تأكيد ومتابعة الشحن',
    description: 'متابعة أوردرات الدفع عند الاستلام COD المعلقة، تتبع بوالص الشحن ورفع نسب التسليم.',
    badge: 'الطلبات والشحن',
    allowedChannels: ['DASHBOARD', 'WHATSAPP', 'EXTERNAL_API'],
    suggestedPrompts: [
      'لخص لي كل أوردرات COD المعلقة اليوم التي تحتاج تأكيد شحن فوري',
      'ما هو معدل تسليم الشحنات الفعلي هذا الأسبوع؟',
    ],
  },
  {
    id: 'inventory-pricing-agent',
    slug: 'inventory-pricing-agent',
    name: 'مساعد المخزون والتسعير',
    role: 'INVENTORY_PRICING',
    title: 'خبير المستودعات والتسعير',
    description: 'تحليل المخزون وحساب نقطة التعادل وهوامش الربح وإعادة الطلب في الوقت المناسب.',
    badge: 'المخزون والتسعير',
    allowedChannels: ['DASHBOARD', 'EXTERNAL_API'],
    suggestedPrompts: [
      'ما هي المنتجات التي أوشكت على النفاد في المخزن؟',
      'احسب هامش الربح ونقطة التعادل للمنتج الأكثر مبيعاً',
    ],
  },
  {
    id: 'customer-service-agent',
    slug: 'customer-service-agent',
    name: 'سارة — خدمة العملاء',
    role: 'CUSTOMER_SERVICE',
    title: 'أخصائية تجربة ورضا العملاء',
    description: 'متابعة استفسارات وشكاوى العملاء وتحسين تجربة الشراء ومعدلات الرد.',
    badge: 'خدمة العملاء',
    allowedChannels: ['DASHBOARD', 'WHATSAPP', 'EXTERNAL_API'],
    suggestedPrompts: [
      'ما هي أبرز استفسارات العملاء المتكررة اليوم؟',
      'لخص لي المحادثات التي تحتاج متابعة بشرية أو تصعيد',
    ],
  },
];

/**
 * List available company AI agents including the default copilot agent.
 */
async function listCompanyAgents(companyId) {
  const defaultAgentSlug = await resolveDefaultCopilotAgent(companyId);

  let companyAgents = [];
  try {
    const aiServiceAdminClient = require('./aiServiceAdminClient');
    companyAgents = await aiServiceAdminClient.listAgents(companyId, 'ACTIVE');
    if (!Array.isArray(companyAgents)) companyAgents = [];
  } catch (err) {
    console.warn('[externalAgentChatService] listAgents warning:', err?.message || err);
  }

  let finalAgents = [];

  if (companyAgents.length > 0) {
    finalAgents = companyAgents.map((a) => {
      const isDefault =
        a.id === defaultAgentSlug ||
        a.slug === defaultAgentSlug ||
        a.templateSlug === defaultAgentSlug ||
        a.template_slug === defaultAgentSlug;

      const baseMatch = BASE_SPECIALISTS.find(
        (b) => b.slug === a.templateSlug || b.slug === a.template_slug || b.role === a.role,
      );

      return {
        id: a.id,
        slug: a.slug || a.templateSlug || a.template_slug || a.id,
        name: a.name || baseMatch?.name || a.role || 'وكيل ذكاء اصطناعي',
        role: a.role || baseMatch?.role || 'SPECIALIST',
        title: a.description || baseMatch?.title || a.name || 'وكيل متخصص',
        description: a.description || baseMatch?.description || 'وكيل ذكاء اصطناعي ضمن فريق عمل الشركة.',
        badge: isDefault ? 'المساعد التنفيذي' : (a.departmentName || baseMatch?.badge || a.role || 'متخصص'),
        isDefault,
        allowedChannels: a.allowedChannels || a.allowed_channels || ['DASHBOARD', 'EXTERNAL_API'],
        suggestedPrompts: baseMatch?.suggestedPrompts || [
          `أعطني ملخصاً عن أداء ${a.name || a.role}`,
          'ما هي أهم النواقص أو العمليات المعلقة لديك الآن؟',
        ],
      };
    });
  }

  // Ensure baseline specialists exist if not already present
  for (const base of BASE_SPECIALISTS) {
    if (!finalAgents.some((item) => item.slug === base.slug || item.id === base.id)) {
      const isDefault = base.slug === defaultAgentSlug || base.id === defaultAgentSlug;
      finalAgents.push({
        ...base,
        isDefault,
      });
    }
  }

  // Sort default copilot to top
  finalAgents.sort((x, y) => (y.isDefault ? 1 : 0) - (x.isDefault ? 1 : 0));

  return {
    defaultAgentSlug,
    agents: finalAgents,
  };
}

/**
 * Send a message directly to the company's AI agent.
 */
async function sendAgentMessage({
  companyId,
  credential,
  message,
  agentId,
  sessionId,
  context,
  attachments,
  images,
}) {
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';
  const rawImages = images || attachments || [];
  const incomingImages = Array.isArray(rawImages) ? rawImages : (rawImages ? [rawImages] : []);
  const hasImages = incomingImages.length > 0;

  if (!trimmedMessage && !hasImages) {
    const error = new Error('الرسالة أو المرفقات مطلوبة (message or images is required)');
    error.statusCode = 400;
    error.code = 'MESSAGE_REQUIRED';
    throw error;
  }

  const effectiveMessage = trimmedMessage || 'يرجى فحص وتحليل الصورة المرفقة والإفادة بالمطلوب.';
  const defaultAgentSlug = await resolveDefaultCopilotAgent(companyId);
  const targetAgentId = agentId || defaultAgentSlug;
  const activeSessionId = sessionId || `ext_sess_${credential?.id ? credential.id.slice(-6) : 'key'}_${Date.now()}`;

  // Normalize image attachments
  const normalizedAttachments = incomingImages.map((img) => {
    if (typeof img === 'string') {
      const isDataUrl = img.startsWith('data:');
      return {
        type: 'image',
        url: img,
        data_url: isDataUrl ? img : undefined,
      };
    }
    return {
      type: img?.type || 'image',
      url: img?.url || (typeof img?.data_url === 'string' ? img.data_url : ''),
      data_url: img?.data_url || (typeof img?.url === 'string' && img.url.startsWith('data:') ? img.url : undefined),
      ...img,
    };
  });

  // 1. Persist user turn in PostgreSQL
  try {
    await aiSessionService.appendMessage(companyId, activeSessionId, {
      sender: 'user',
      text: trimmedMessage,
      role: 'user',
      attachments: normalizedAttachments,
      metadata: {
        via: 'developer_api',
        credentialId: credential?.id,
        credentialName: credential?.name,
      },
    });
  } catch (err) {
    console.warn('[externalAgentChatService] appendMessage user turn warning:', err?.message || err);
  }

  // 2. Retrieve recent history for conversational continuity
  let sessionRecentMessages = [];
  try {
    const sessionData = await aiSessionService.getHistory(companyId, null, activeSessionId);
    if (sessionData && Array.isArray(sessionData.messages) && sessionData.messages.length > 1) {
      sessionRecentMessages = sessionData.messages
        .filter((m) => !m.isDeleted)
        .slice(0, -1)
        .slice(-20)
        .map((m) => ({
          role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
          content: m.content || m.text || '',
        }))
        .filter((m) => m.content);
    }
  } catch (histErr) {
    console.warn('[externalAgentChatService] history retrieval warning:', histErr?.message || histErr);
  }

  // 3. Prepare memory context
  const combinedMemoryContext = {
    source: 'developer_api',
    credentialId: credential?.id,
    credentialName: credential?.name,
    ...(sessionRecentMessages.length > 0 ? { recentMessages: sessionRecentMessages } : {}),
    ...(context || {}),
  };

  // 4. Invoke agent
  let result = null;
  if (targetAgentId && targetAgentId !== 'CEO' && targetAgentId !== 'ceo-agent') {
    try {
      const aiServiceAdminClient = require('./aiServiceAdminClient');
      const agentChatResult = await aiServiceAdminClient.chatWithAgent({
        companyId,
        agentId: targetAgentId,
        message: effectiveMessage,
        threadId: activeSessionId,
        customerId: `ext_dev_${credential?.id || 'key'}`,
        channel: 'external_api',
        memoryContext: combinedMemoryContext,
        attachments: normalizedAttachments.length > 0 ? normalizedAttachments : undefined,
      });

      if (agentChatResult && (agentChatResult.reply || agentChatResult.tool_calls || agentChatResult.status === 'ok')) {
        result = {
          reply: agentChatResult.reply || 'تم استلام الرد بنجاح.',
          toolCalls: agentChatResult.tool_calls || [],
          status: agentChatResult.status || 'ok',
          model: agentChatResult.model || null,
        };
      }
    } catch (agentErr) {
      console.warn('[externalAgentChatService] chatWithAgent fallback to sendChatMessage:', agentErr?.message || agentErr);
    }
  }

  if (!result) {
    try {
      const aiSdkClient = require('./aiSdkClient');
      const fallbackResult = await aiSdkClient.sendChatMessage({
        companyId,
        customerId: `ext_dev_${credential?.id || 'key'}`,
        message: effectiveMessage,
        threadId: activeSessionId,
        channel: 'external_api',
        agentId: targetAgentId,
        memoryContext: combinedMemoryContext,
        attachments: normalizedAttachments.length > 0 ? normalizedAttachments : undefined,
      });

      result = {
        reply: fallbackResult?.reply || 'تم استلام الرسالة بنجاح.',
        toolCalls: fallbackResult?.toolCalls || fallbackResult?.tool_calls || [],
        status: 'ok',
        model: fallbackResult?.modelSelection?.model || null,
      };
    } catch (fallbackErr) {
      console.error('[externalAgentChatService] fallback error:', fallbackErr?.message || fallbackErr);
      throw fallbackErr;
    }
  }

  // 5. Persist assistant response in PostgreSQL
  try {
    await aiSessionService.appendMessage(companyId, activeSessionId, {
      sender: 'agent',
      text: result.reply,
      role: 'assistant',
      toolCalls: result.toolCalls,
      metadata: {
        agentId: targetAgentId,
        model: result.model,
      },
    });
  } catch (err) {
    console.warn('[externalAgentChatService] appendMessage agent turn warning:', err?.message || err);
  }

  return {
    reply: result.reply,
    agent: {
      id: targetAgentId,
      name: BASE_SPECIALISTS.find((s) => s.slug === targetAgentId || s.id === targetAgentId)?.name || targetAgentId,
    },
    sessionId: activeSessionId,
    toolCalls: result.toolCalls,
    model: result.model,
  };
}

/**
 * Get recent message history for a conversation session.
 */
async function getSessionHistory({ companyId, sessionId }) {
  if (!sessionId) {
    return { sessionId: null, messages: [] };
  }

  const sessionData = await aiSessionService.getHistory(companyId, null, sessionId);
  const rawMessages = sessionData?.messages || [];

  const formattedMessages = rawMessages
    .filter((m) => !m.isDeleted)
    .map((m) => ({
      id: m.id,
      role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
      text: m.text || m.content || '',
      toolCalls: m.toolCalls || m.tool_calls || [],
      createdAt: m.createdAt,
    }));

  return {
    sessionId,
    messages: formattedMessages,
  };
}

module.exports = {
  listCompanyAgents,
  sendAgentMessage,
  getSessionHistory,
  BASE_SPECIALISTS,
};
