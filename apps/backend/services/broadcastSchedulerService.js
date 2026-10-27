/**
 * خدمة جدولة البرودكاست
 * Broadcast Scheduler Service
 * 
 * تقوم بفحص الحملات المجدولة وإرسالها تلقائياً في الموعد المحدد
 */

const cron = require('node-cron');
const { getSharedPrismaClient, safeQuery, isInConnectionLimitCooldown, getCooldownInfo } = require('./sharedDatabase');
const { runCampaign } = require('./broadcastCampaignRunner');
const { resolveAudience } = require('./broadcastAudienceResolver');
// const prisma = getSharedPrismaClient(); // ❌ Removed to prevent early loading issues

/**
 * استبدال المتغيرات في الرسالة بالبيانات الفعلية للعميل
 * @param {string} message - نص الرسالة الذي يحتوي على متغيرات
 * @param {Object} customer - بيانات العميل
 * @returns {string} - الرسالة بعد استبدال المتغيرات
 */
const replaceMessageVariables = (message, customer) => {
  if (!message || !customer) return message;
  
  let personalizedMessage = message;
  
  // استبدال متغير اسم العميل الكامل
  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'عزيزي العميل';
  personalizedMessage = personalizedMessage.replace(/{customerName}/g, fullName);
  
  // استبدال متغير الاسم الأول
  const firstName = customer.firstName || 'عزيزي العميل';
  personalizedMessage = personalizedMessage.replace(/{firstName}/g, firstName);
  
  // استبدال متغير الاسم الأخير
  const lastName = customer.lastName || '';
  personalizedMessage = personalizedMessage.replace(/{lastName}/g, lastName);
  
  return personalizedMessage;
};

class BroadcastSchedulerService {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
    this.lastCooldownLog = null; // Track last cooldown log to reduce spam
    this.stats = {
      totalChecks: 0,
      campaignsSent: 0,
      lastCheck: null,
      errors: 0
    };
    
    console.log('📡 [BroadcastScheduler] Service initialized');
  }

  /**
   * بدء خدمة الجدولة
   */
  start() {
    if (this.isStarted || this.cronJob) {
      console.log('⚠️ [BroadcastScheduler] Service already running');
      return;
    }
    this.isStarted = true;

    console.log('🚀 [BroadcastScheduler] Starting broadcast scheduler...');

    // معالجة الحملات المنقطعة عند الإقلاع (تعليمها كـ failed بدون إرسال)
    this.resumeInterruptedCampaigns().catch(err =>
      console.error('❌ [BroadcastScheduler] Recovery of interrupted campaigns failed:', err.message)
    );

    // فحص كل 5 دقائق للحملات المجدولة وكنس الحملات العالقة
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.reapStuckCampaigns();
      } catch (reapErr) {
        console.error('❌ [BroadcastScheduler] Periodic reaper error:', reapErr.message);
      }
      await this.checkScheduledCampaigns();
    });

    console.log('✅ [BroadcastScheduler] Scheduler started - checking every 5 minutes');
  }

  /**
   * معالجة الحملات العالقة في حالة 'sending' عند بدء تشغيل الخادم
   * — تعليمها كـ 'failed' مع سبب توقف آمن لمنع الإرسال التلقائي غير المقصود
   */
  async resumeInterruptedCampaigns() {
    const ARABIC_STOP_REASON = 'توقف غير مكتمل — أعد الإرسال من سجل الحملات';
    try {
      const stuckCampaigns = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastCampaign.findMany({
          where: { status: 'sending' },
          select: { id: true, name: true }
        });
      }, 5);

      if (!stuckCampaigns || stuckCampaigns.length === 0) {
        console.log('✅ [BroadcastScheduler] No interrupted campaigns to recover');
        return;
      }

      console.log(`🛑 [BroadcastScheduler] Found ${stuckCampaigns.length} interrupted sending campaign(s) at boot -> marking failed`);
      for (const campaign of stuckCampaigns) {
        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastCampaign.update({
            where: { id: campaign.id },
            data: {
              status: 'failed',
              pausedReason: ARABIC_STOP_REASON,
              updatedAt: new Date()
            }
          });
        }, 5);

        // إغلاق أي سجل تشغيل نشط إن وُجد
        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastCampaignRun.updateMany({
            where: {
              campaignId: campaign.id,
              status: 'running'
            },
            data: {
              status: 'stopped',
              finishedAt: new Date(),
              stopReason: ARABIC_STOP_REASON
            }
          });
        }, 5);

        console.log(`🛑 [BroadcastScheduler] Campaign ${campaign.id} (${campaign.name}) marked failed after interruption`);
      }
    } catch (error) {
      console.error('❌ [BroadcastScheduler] Error recovering interrupted campaigns:', error.message);
    }
  }

  /**
   * كنس الحملات العالقة في حالة 'sending' لأكثر من 15 دقيقة
   * @param {Date} [now]
   * @returns {Promise<number>}
   */
  async reapStuckCampaigns(now = new Date()) {
    const ARABIC_STOP_REASON = 'توقف غير مكتمل — أعد الإرسال من سجل الحملات';
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    try {
      const stuckCampaigns = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastCampaign.findMany({
          where: {
            status: 'sending',
            updatedAt: { lt: fifteenMinutesAgo }
          },
          select: { id: true, name: true, updatedAt: true }
        });
      }, 5);

      if (!stuckCampaigns || stuckCampaigns.length === 0) {
        return 0;
      }

      console.log(`🧹 [BroadcastScheduler] Reaping ${stuckCampaigns.length} stuck sending campaign(s) older than 15 minutes`);
      for (const campaign of stuckCampaigns) {
        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastCampaign.update({
            where: { id: campaign.id },
            data: {
              status: 'failed',
              pausedReason: ARABIC_STOP_REASON,
              updatedAt: new Date()
            }
          });
        }, 5);

        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastCampaignRun.updateMany({
            where: {
              campaignId: campaign.id,
              status: 'running'
            },
            data: {
              status: 'stopped',
              finishedAt: new Date(),
              stopReason: ARABIC_STOP_REASON
            }
          });
        }, 5);

        console.log(`🧹 [BroadcastScheduler] Campaign ${campaign.id} (${campaign.name}) reaped -> failed`);
      }
      return stuckCampaigns.length;
    } catch (error) {
      console.error('❌ [BroadcastScheduler] Error reaping stuck campaigns:', error.message);
      return 0;
    }
  }

  /**
   * إيقاف خدمة الجدولة
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isStarted = false;
    console.log('🛑 [BroadcastScheduler] Scheduler stopped');
  }

  /**
   * فحص الحملات المجدولة وإرسالها
   */
  async checkScheduledCampaigns() {
    if (this.isRunning) {
      console.log('⏳ [BroadcastScheduler] Previous check still running, skipping...');
      return;
    }

    // 🔥 Check if database is in cooldown mode
    if (isInConnectionLimitCooldown()) {
      const cooldownInfo = getCooldownInfo();
      // Only log once every 5 minutes to reduce spam
      if (!this.lastCooldownLog || Date.now() - this.lastCooldownLog > 5 * 60 * 1000) {
        console.log(`⏳ [BroadcastScheduler] Database in cooldown mode. Skipping check. Retry in ${cooldownInfo.remainingMinutes} minutes.`);
        this.lastCooldownLog = Date.now();
      }
      return;
    }

    try {
      this.isRunning = true;
      this.stats.totalChecks++;
      this.stats.lastCheck = new Date();

      const now = new Date();
      console.log(`🔍 [BroadcastScheduler] Checking for scheduled campaigns at ${now.toISOString()}`);

      // فحص الحملات المتكررة النشطة التي حان وقت إرسالها
      const recurringCampaigns = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastCampaign.findMany({
          where: {
            status: 'active',
            recurrence: { not: 'none' },
            nextRunAt: { lte: now }
          },
          select: { id: true, name: true, companyId: true }
        });
      }, 5);

      if (recurringCampaigns && recurringCampaigns.length > 0) {
        console.log(`🔁 [BroadcastScheduler] Found ${recurringCampaigns.length} recurring campaign(s) ready to run`);
        for (const recCamp of recurringCampaigns) {
          try {
            await runCampaign({ campaignId: recCamp.id, trigger: 'cron', now });
            this.stats.campaignsSent++;
          } catch (recErr) {
            this.stats.errors++;
            console.error(`❌ [BroadcastScheduler] Error running recurring campaign ${recCamp.id}:`, recErr.message);
          }
        }
      }

      // البحث عن الحملات المجدولة التي حان وقت إرسالها
      const scheduledCampaigns = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastCampaign.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: {
            lte: now // الوقت المحدد <= الآن
          }
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          }
        }
      });
      }, 5);

      if (scheduledCampaigns.length === 0) {
        console.log('✅ [BroadcastScheduler] No campaigns to send');
        return;
      }

      console.log(`📨 [BroadcastScheduler] Found ${scheduledCampaigns.length} campaign(s) ready to send`);

      // إرسال كل حملة
      for (const campaign of scheduledCampaigns) {
        // تحقق من أن الشركة نشطة
        if (!campaign.company.isActive) {
          console.log(`⚠️ [BroadcastScheduler] Skipping campaign ${campaign.id} - Company inactive`);
          
          // تحديث حالة الحملة إلى failed
          await safeQuery(async () => {
            return await getSharedPrismaClient().broadcastCampaign.update({
              where: { id: campaign.id },
              data: {
                status: 'failed',
                pausedReason: 'Company is inactive'
              }
            });
          }, 5);
          
          continue;
        }

        console.log(`🚀 [BroadcastScheduler] Sending campaign: ${campaign.name} (${campaign.id}) for company ${campaign.company.name}`);
        
        try {
          await this.sendScheduledCampaign(campaign);
          this.stats.campaignsSent++;
          console.log(`✅ [BroadcastScheduler] Campaign ${campaign.id} sent successfully`);
        } catch (error) {
          this.stats.errors++;
          console.error(`❌ [BroadcastScheduler] Error sending campaign ${campaign.id}:`, error.message);
          
          // تحديث حالة الحملة إلى failed
          await safeQuery(async () => {
            return await getSharedPrismaClient().broadcastCampaign.update({
              where: { id: campaign.id },
              data: {
                status: 'failed',
                pausedReason: error.message
              }
            });
          }, 5).catch(err => console.error('Error updating campaign status:', err));
        }
      }
    } catch (error) {
      console.error('❌ [BroadcastScheduler] Error in scheduler:', error.message);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
    }
  }

  async sendScheduledCampaign(campaign) {
    const { sendFacebookMessage } = require('../utils/allFunctions');
    const socketService = require('./socketService');
    const WhatsAppMessageHandler = require('./whatsapp').WhatsAppMessageHandler;
    const MetaCloudProvider = require('./whatsapp/providers/MetaCloudProvider');
    const { buildBroadcastBodyParams, hasOrderVariables, getTemplateHeaderFormat, buildBroadcastHeaderParams } = require('../utils/broadcastTemplateParams');
    console.log(`📊 [BroadcastScheduler] Starting to send campaign ${campaign.id}`);

    // تحديث حالة الحملة إلى "sending"
    await safeQuery(async () => {
      return await getSharedPrismaClient().broadcastCampaign.update({
        where: { id: campaign.id },
        data: {
          status: 'sending',
          sentAt: new Date()
        }
      });
    }, 5);

    const isWhatsApp = campaign.channel === 'whatsapp';
    let conversations = [];

    if (isWhatsApp) {
      // 🎯 Fix Bug A: Resolve audience via snapshot / customer list before falling back to all conversations
      const snapshotCount = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastCampaignSnapshot.count({
          where: { campaignId: campaign.id }
        });
      }, 3);

      let resolvedPhones = null;
      if (snapshotCount > 0) {
        console.log(`📸 [BroadcastScheduler] Using frozen snapshot (${snapshotCount} phones) for campaign ${campaign.id}`);
        const resolved = await resolveAudience({
          prisma: getSharedPrismaClient(),
          campaign,
          companyId: campaign.companyId,
          maxRecipients: campaign.maxRecipientsPerRun || 5000
        });
        resolvedPhones = resolved.phones;
      } else if (campaign.targetAudience && campaign.targetAudience !== 'all' && campaign.targetAudience !== 'manual') {
        const matchedList = await safeQuery(async () => {
          return await getSharedPrismaClient().customerList.findFirst({
            where: { id: campaign.targetAudience, companyId: campaign.companyId }
          });
        }, 3);
        if (matchedList) {
          console.log(`📋 [BroadcastScheduler] Resolving list "${matchedList.name}" (${matchedList.id}) for campaign ${campaign.id}`);
          const dummyCampaign = {
            ...campaign,
            audienceMode: 'dynamic',
            audienceListId: matchedList.id
          };
          const resolved = await resolveAudience({
            prisma: getSharedPrismaClient(),
            campaign: dummyCampaign,
            companyId: campaign.companyId,
            maxRecipients: campaign.maxRecipientsPerRun || 5000
          });
          resolvedPhones = resolved.phones;
        }
      }

      if (resolvedPhones && resolvedPhones.length > 0) {
        const customerIds = resolvedPhones.map(p => p.customerId).filter(Boolean);
        const phonesList = resolvedPhones.map(p => p.phone);
        const existingConvs = await safeQuery(async () => {
          return await getSharedPrismaClient().conversation.findMany({
            where: {
              companyId: campaign.companyId,
              OR: [
                { customerId: { in: customerIds } },
                { customer: { phone: { in: phonesList } } }
              ]
            },
            include: { customer: true }
          });
        }, 4) || [];

        const convByCustomerId = new Map(existingConvs.filter(c => c.customerId).map(c => [c.customerId, c]));
        const convByPhone = new Map(existingConvs.filter(c => c.customer?.phone).map(c => [c.customer.phone, c]));

        conversations = [];
        for (const item of resolvedPhones) {
          let conv = (item.customerId ? convByCustomerId.get(item.customerId) : null) || convByPhone.get(item.phone);
          if (!conv) {
            try {
              conv = await safeQuery(async () => {
                return await getSharedPrismaClient().conversation.create({
                  data: {
                    id: 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9),
                    companyId: campaign.companyId,
                    customerId: item.customerId || undefined,
                    status: 'ACTIVE',
                    channel: 'whatsapp'
                  },
                  include: { customer: true }
                });
              }, 4);
            } catch (err) {
              console.error(`❌ [BroadcastScheduler] Error creating conversation for ${item.phone}:`, err.message);
            }
          }
          if (conv) {
            if (!conv.customer) {
              conv.customer = { id: item.customerId, phone: item.phone, firstName: item.name || '', lastName: '' };
            }
            conversations.push(conv);
          }
        }
      } else if (snapshotCount > 0 && (!resolvedPhones || resolvedPhones.length === 0)) {
        conversations = [];
      } else if (campaign.audienceMode === 'fixed' || (campaign.targetAudience && campaign.targetAudience !== 'all' && campaign.targetAudience !== 'manual')) {
        console.warn(`⚠️ [BroadcastScheduler] Campaign ${campaign.id} has fixed targeting but no snapshot found`);
        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastCampaign.update({
            where: { id: campaign.id },
            data: {
              status: 'failed',
              pausedReason: 'قائمة الحملة غير محفوظة — أعد اختيار القائمة',
              updatedAt: new Date()
            }
          });
        }, 5);
        return;
      } else {
        console.log('🌐 [BroadcastScheduler] Fetching all WhatsApp conversations/customers (no 24h limit)');
      conversations = await safeQuery(async () => {
        return await getSharedPrismaClient().conversation.findMany({
          where: {
            companyId: campaign.companyId,
            customer: {
              phone: { not: null }
            }
          },
          include: {
            customer: true
          }
        });
      }, 4);

      // إنشاء محادثات للعملاء الذين لديهم أرقام هواتف ولكن ليس لديهم سجلات محادثات بعد
      const existingCustomerIds = new Set(conversations.map(c => c.customerId).filter(Boolean));
      const customersWithoutConv = await safeQuery(async () => {
        return await getSharedPrismaClient().customer.findMany({
          where: {
            companyId: campaign.companyId,
            phone: { not: null, not: '' },
            id: { notIn: Array.from(existingCustomerIds) }
          }
        });
      }, 4);

      if (customersWithoutConv && customersWithoutConv.length > 0) {
        console.log(`➕ [BroadcastScheduler] Creating conversations for ${customersWithoutConv.length} customers without prior conversations`);
        for (const cust of customersWithoutConv) {
          try {
            const newConv = await safeQuery(async () => {
              return await getSharedPrismaClient().conversation.create({
                data: {
                  id: 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9),
                  companyId: campaign.companyId,
                  customerId: cust.id,
                  status: 'ACTIVE',
                  channel: 'whatsapp'
                },
                include: { customer: true }
              });
            }, 4);
            if (newConv) conversations.push(newConv);
          } catch (err) {
            console.error(`❌ [BroadcastScheduler] Error creating conversation for customer ${cust.id}:`, err.message);
          }
        }
      }

      conversations = conversations.filter(c => c.customer?.phone && c.customer.phone.trim() !== '');
      } // End legacy else branch

      // تصفية تصنيف العملاء إذا تم تحديده
      if (campaign.leadCategoryId) {
        console.log(`🏷️ [BroadcastScheduler] Filtering by lead category: ${campaign.leadCategoryId}`);
        const validContacts = await safeQuery(async () => {
          return await getSharedPrismaClient().whatsAppContact.findMany({
            where: { leadCategoryId: campaign.leadCategoryId, companyId: campaign.companyId },
            select: { customerId: true }
          });
        }, 3);
        const validCustomerIds = new Set(validContacts.map(c => c.customerId).filter(Boolean));
        conversations = conversations.filter(c => validCustomerIds.has(c.customer?.id));
      }

    } else {
      // Facebook Messenger: 24h active window policy
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      console.log(`⏰ [BroadcastScheduler] Filtering active Messenger conversations with activity after: ${twentyFourHoursAgo.toISOString()}`);
      conversations = await safeQuery(async () => {
        return await getSharedPrismaClient().conversation.findMany({
          where: {
            companyId: campaign.companyId,
            status: 'ACTIVE',
            messages: {
              some: {
                isFromCustomer: true,
                createdAt: {
                  gte: twentyFourHoursAgo
                }
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
      }, 4);
    }

    console.log(`📊 [BroadcastScheduler] Found ${conversations.length} target conversations`);

    // تحديث عدد المستلمين في الحملة
    await safeQuery(async () => {
      return await getSharedPrismaClient().broadcastCampaign.update({
      where: { id: campaign.id },
      data: {
        recipientCount: conversations.length
      }
      });
    }, 5);

    // Resume-safe: إذا كانت الحملة انقطعت (status 'sending' عند crash) يكون المستلمين موجودين
    // — نعيد استخدامهم ونكمل الـ pending بس من غير تكرار الإرسال
    const existingRecipients = await safeQuery(async () => {
      return await getSharedPrismaClient().broadcastRecipient.findMany({
        where: { campaignId: campaign.id },
        select: { conversationId: true, status: true }
      });
    }, 5);

    const resuming = existingRecipients && existingRecipients.length > 0;

    let recipients;
    if (resuming) {
      const statusByConv = new Map(existingRecipients.map(r => [r.conversationId, r.status]));
      const pendingConvs = conversations.filter(c => statusByConv.get(c.id) === 'pending');
      console.log(`♻️ [BroadcastScheduler] Campaign ${campaign.id} resuming — ${pendingConvs.length} pending of ${existingRecipients.length} existing recipients`);
      recipients = pendingConvs.map(conv => ({
        campaignId: campaign.id,
        conversationId: conv.id,
        customerPhone: conv.customer.phone || '',
        customerName: `${conv.customer.firstName} ${conv.customer.lastName}`,
        messengerUserId: conv.customer.facebookId,
        status: 'pending'
      }));
      conversations = pendingConvs;
    } else {
      recipients = conversations.map(conv => ({
        campaignId: campaign.id,
        conversationId: conv.id,
        customerPhone: conv.customer.phone || '',
        customerName: `${conv.customer.firstName} ${conv.customer.lastName}`,
        messengerUserId: conv.customer.facebookId,
        status: 'pending'
      }));
    }

    if (recipients.length > 0) {
      if (!resuming) {
        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastRecipient.createMany({
          data: recipients
          });
        }, 5);
      }
    } else {
      const hadAnySent = resuming && existingRecipients.some(r => r.status === 'sent');
      const hadAnyPendingOrSent = resuming && existingRecipients.some(r => r.status === 'pending' || r.status === 'sent');
      console.log('✅ [BroadcastScheduler] No pending recipients left — campaign already fully processed');
      const currentCampaign = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastCampaign.findUnique({
          where: { id: campaign.id },
          select: { status: true }
        });
      }, 5);
      const isPausedOrCancelled = currentCampaign && (currentCampaign.status === 'paused' || currentCampaign.status === 'cancelled');

      await safeQuery(async () => {
        const updateData = {
          pausedReason: hadAnyPendingOrSent ? null : 'All recipients failed during interrupted send'
        };
        if (!isPausedOrCancelled) {
          updateData.status = hadAnySent ? 'sent' : 'failed';
        }
        return await getSharedPrismaClient().broadcastCampaign.update({
          where: { id: campaign.id },
          data: updateData
        });
      }, 5);
      return;
    }

    let waSessionId = null;

    if (isWhatsApp) {
      waSessionId = campaign.whatsAppSessionId;
      if (!waSessionId) {
        console.log(`🔍 [BroadcastScheduler] whatsAppSessionId not found on campaign, searching for default Meta session`);
        const metaSession = await safeQuery(async () => {
          return await getSharedPrismaClient().whatsAppSession.findFirst({
            where: { companyId: campaign.companyId, provider: 'META_CLOUD' }
          });
        }, 3);
        if (metaSession) {
          waSessionId = metaSession.id;
        } else {
          const defaultSession = await safeQuery(async () => {
            return await getSharedPrismaClient().whatsAppSession.findFirst({
              where: { companyId: campaign.companyId, isDefault: true }
            }) || await getSharedPrismaClient().whatsAppSession.findFirst({
              where: { companyId: campaign.companyId }
            });
          }, 3);
          waSessionId = defaultSession?.id || null;
        }
      }
      console.log(`📞 [BroadcastScheduler] Using WhatsApp session ID: ${waSessionId}`);
      if (!waSessionId) {
        throw new Error('لا توجد جلسة واتساب نشطة متاحة لإرسال هذه الحملة المجدولة');
      }
    }

    // Fetch template body text from Meta API so body params match the template's
    // expected variable count (Meta rejects mismatches with #132000).
    let templateBodyText = '';
    let templateHeaderFormat = null;
    let boundLocalVariables = null;
    let needOrderForCustomer = false;
    if (isWhatsApp) {
      try {
        const metaTemplates = await MetaCloudProvider.listTemplates(waSessionId);
        const targetMetaTemplate = metaTemplates.find(t => t.name === campaign.waTemplateName);
        if (targetMetaTemplate) {
          templateBodyText = targetMetaTemplate.components?.find(c => c.type === 'BODY')?.text || '';
          templateHeaderFormat = getTemplateHeaderFormat(targetMetaTemplate);
        }
      } catch (tmplErr) {
        console.warn(`⚠️ [BroadcastScheduler] Could not fetch template body text: ${tmplErr.message}`);
      }

      // 🚨 PRODUCTION-FIX (broadcast semantics): ترتيب متغيرات القالب المحلي المربوط
      // ({position, name}) حتى لا يُرسل firstName/lastName في خانة رقم الطلب
      // (مشكلة قالب deliveredmsj72rwc وقت البث الجماعي).
      try {
        const boundLocal = await getSharedPrismaClient().whatsAppNotificationTemplate.findFirst({
          where: { companyId: campaign.companyId, metaTemplateName: campaign.waTemplateName },
          select: { variables: true }
        });
        if (boundLocal?.variables) {
          const parsed = JSON.parse(boundLocal.variables);
          if (Array.isArray(parsed)) boundLocalVariables = parsed;
        }
      } catch (e) {
        console.warn(`⚠️ [BroadcastScheduler] Could not load bound local template variables: ${e?.message || e}`);
      }
      needOrderForCustomer = hasOrderVariables(boundLocalVariables);
    }

    // إرسال الرسائل
    let sentCount = resuming ? existingRecipients.filter(r => r.status === 'sent').length : 0;
    let failedCount = resuming ? existingRecipients.filter(r => r.status === 'failed').length : 0;
    const totalRecipients = conversations.length;

    // 🐢 Pacing حسب إعدادات الشركة (messagesPerMinute) — بيحمي من حظر Meta
    // ويحترم الـ config الفعلي بدل التأخير الثابت 100ms
    let sendDelayMs = 100;
    try {
      const bcastSettings = await safeQuery(async () => {
        return await getSharedPrismaClient().broadcastSettings.findUnique({
          where: { companyId: campaign.companyId },
          select: { messagesPerMinute: true }
        });
      }, 3);
      const mpm = Number(bcastSettings?.messagesPerMinute);
      if (mpm && mpm > 0) {
        sendDelayMs = Math.max(100, Math.floor(60000 / mpm));
        console.log(`🐢 [BroadcastScheduler] Campaign ${campaign.id} paced at ${mpm} msg/min → ${sendDelayMs}ms between sends`);
      } else {
        console.log(`🐢 [BroadcastScheduler] Campaign ${campaign.id} no messagesPerMinute configured — using default ${sendDelayMs}ms`);
      }
    } catch (settingsErr) {
      console.warn(`⚠️ [BroadcastScheduler] Could not load broadcast settings for pacing: ${settingsErr.message}`);
    }

    const io = socketService.getIO();
    
    // إرسال إشعار بدء الحملة
    if (io) {
      io.emit('campaign:progress', {
        campaignId: campaign.id,
        status: 'started',
        total: totalRecipients,
        sent: 0,
        failed: 0,
        progress: 0
      });
    }

    // إرسال رسالة لكل عميل
    for (let i = 0; i < conversations.length; i++) {
      const conv = conversations[i];

      const currentCampaign = await safeQuery(async () => getSharedPrismaClient().broadcastCampaign.findUnique({
        where: { id: campaign.id }, select: { status: true }
      }), 5);
      if (currentCampaign && (currentCampaign.status === 'paused' || currentCampaign.status === 'cancelled')) {
        console.log(`⏹️ [BroadcastScheduler] تم إيقاف الحملة (${currentCampaign.status}) بعد إرسال ${sentCount} رسالة`);
        break;
      }
      
      try {
        if (isWhatsApp) {
          const phone = conv.customer.phone;
          if (!phone) {
            console.log(`⚠️ [BroadcastScheduler] Skipping customer ${conv.customer.firstName} - No phone number`);
            failedCount++;

            await safeQuery(async () => {
              return await getSharedPrismaClient().broadcastRecipient.updateMany({
                where: {
                  campaignId: campaign.id,
                  conversationId: conv.id
                },
                data: {
                  status: 'failed',
                  failureReason: 'No phone number',
                  sentAt: new Date()
                }
              });
            }, 4);

            continue;
          }

          const to = phone.startsWith('+') ? phone.slice(1) : phone;

          // Build template body parameters to MATCH the template's expected variable count.
          // Meta rejects with (#132000) if the count differs.
          // 🆕 لو القالب فيه متغيرات طلب → نجلب أحدث طلب للعميل لملء قيمها الصحيحة.
          let orderForCustomer = null;
          if (needOrderForCustomer) {
            try {
              orderForCustomer = await getSharedPrismaClient().order.findFirst({
                where: { companyId: campaign.companyId, customerId: conv.customer.id },
                orderBy: { createdAt: 'desc' },
                select: {
                  orderNumber: true, total: true, subtotal: true, shipping: true,
                  currency: true, turboTrackingNumber: true, status: true
                }
              });
            } catch (orderErr) {
              console.warn(`⚠️ [BroadcastScheduler] Could not fetch latest order for ${conv.customer.firstName}: ${orderErr?.message || orderErr}`);
            }
          }
          const bodyParams = buildBroadcastBodyParams(templateBodyText, conv.customer, boundLocalVariables, orderForCustomer);

          // header يأتي أولاً في components (إن كان قالب الحملة هيدره وسائط ولها وسيط)
          const components = [];
          if (templateHeaderFormat?.hasMedia) {
            if (!campaign.waHeaderMedia) {
              throw new Error(`القالب "${campaign.waTemplateName}" يتطلب صورة أو وسيط (${templateHeaderFormat.format}) في الترويسة، ولم يتم تحديد وسيط للحملة`);
            }
            if (String(campaign.waHeaderMedia).startsWith('4:')) {
              throw new Error('مقبض الوسائط هذا غير صالح للإرسال (خاص بإنشاء القوالب فقط). يُرجى إعادة رفع الصورة كصورة حملة');
            }
            const headerParam = buildBroadcastHeaderParams(campaign.waHeaderMedia, templateHeaderFormat.format.toLowerCase());
            if (headerParam) components.push(headerParam);
          }
          if (bodyParams.length > 0) {
            components.push({ type: 'body', parameters: bodyParams });
          }

          let result;
          try {
            result = await WhatsAppMessageHandler.sendTemplateMessage(
              waSessionId, to, campaign.waTemplateName,
              { name: campaign.waTemplateName, language: campaign.waLanguageCode, languageCode: campaign.waLanguageCode, components },
              { metadata: { isBroadcast: true, campaignId: campaign.id }, templateBody: templateBodyText, senderId: campaign.creatorId }
            );
          } catch (sendErr) {
            // Parameters now always match the template's variable count, so no
            // params-less retry: it would re-fail with (#132000) for variable templates.
            throw sendErr;
          }

          sentCount++;
          const waMessageId = result?.messages?.[0]?.id || result?.messageId || null;

          await safeQuery(async () => {
            return await getSharedPrismaClient().broadcastRecipient.updateMany({
              where: {
                campaignId: campaign.id,
                conversationId: conv.id
              },
              data: {
                status: 'sent',
                sentAt: new Date(),
                messageId: waMessageId
              }
            });
          }, 4);
        } else {
          // Facebook Messenger
          if (!conv.customer.facebookId) {
            console.log(`⚠️ [BroadcastScheduler] Skipping customer ${conv.customer.firstName} - No Facebook ID`);
            failedCount++;

            await safeQuery(async () => {
              return await getSharedPrismaClient().broadcastRecipient.updateMany({
                where: {
                  campaignId: campaign.id,
                  conversationId: conv.id
                },
                data: {
                  status: 'failed',
                  failureReason: 'No Facebook ID',
                  sentAt: new Date()
                }
              });
            }, 4);

            continue;
          }

          // جلب Page ID من metadata المحادثة
          let conversationPageId = null;
          if (conv.metadata) {
            try {
              const metadata = JSON.parse(conv.metadata);
              if (metadata.pageId) {
                conversationPageId = metadata.pageId;
              }
            } catch (error) {
              console.log(`⚠️ [BroadcastScheduler] Error parsing metadata: ${error.message}`);
            }
          }

          // إذا لم يتم العثور على Page ID، استخدم أول صفحة متصلة
          if (!conversationPageId) {
            const defaultPage = await safeQuery(async () => {
              return await getSharedPrismaClient().facebookPage.findFirst({
                where: {
                  companyId: campaign.companyId,
                  status: 'connected'
                },
                orderBy: {
                  connectedAt: 'desc'
                }
              });
            }, 3);

            if (defaultPage) {
              conversationPageId = defaultPage.pageId;
            } else {
              console.log(`❌ [BroadcastScheduler] No connected Facebook page for customer ${conv.customer.firstName}`);
              failedCount++;

              await safeQuery(async () => {
                return await getSharedPrismaClient().broadcastRecipient.updateMany({
                  where: {
                    campaignId: campaign.id,
                    conversationId: conv.id
                  },
                  data: {
                    status: 'failed',
                    failureReason: 'No connected Facebook page',
                    sentAt: new Date()
                  }
                });
              }, 4);

              continue;
            }
          }

          // حفظ الرسائل في database قبل الإرسال
          const savedMessages = [];
          
          // ✨ استبدال المتغيرات بالبيانات الفعلية للعميل
          const personalizedMessage = replaceMessageVariables(campaign.message, conv.customer);
          console.log(`✨ [SCHEDULER PERSONALIZATION] Original: "${campaign.message}" => Personalized: "${personalizedMessage}"`);
          
          if (personalizedMessage && personalizedMessage.trim().length > 0) {
            const textMessage = await safeQuery(async () => {
              return await getSharedPrismaClient().message.create({
                data: {
                  conversationId: conv.id,
                  content: personalizedMessage,
                  isFromCustomer: false,
                  type: 'TEXT',
                  senderId: null,
                  metadata: JSON.stringify({
                    isBroadcast: true,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    sentAt: new Date().toISOString(),
                    originalMessage: campaign.message,
                    hasVariables: campaign.message !== personalizedMessage
                  })
                }
              });
            }, 6);
            savedMessages.push(textMessage);
          }

          let sendResult;
          
          // إرسال الصور إن وجدت
          if (campaign.images && Array.isArray(campaign.images) && campaign.images.length > 0) {
            for (const imageUrl of campaign.images) {
              const imageMessage = await safeQuery(async () => {
                return await getSharedPrismaClient().message.create({
                  data: {
                    conversationId: conv.id,
                    content: imageUrl,
                    isFromCustomer: false,
                    type: 'IMAGE',
                    senderId: null,
                    metadata: JSON.stringify({
                      isBroadcast: true,
                      campaignId: campaign.id,
                      campaignName: campaign.name,
                      sentAt: new Date().toISOString()
                    })
                  }
                });
              }, 6);
              savedMessages.push(imageMessage);
            }

            // إرسال النص المخصص أولاً
            if (personalizedMessage && personalizedMessage.trim().length > 0) {
              sendResult = await sendFacebookMessage(
                conv.customer.facebookId,
                personalizedMessage,
                'TEXT',
                conversationPageId
              );
            }
            
            // إرسال الصور
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
            // إرسال النص المخصص فقط
            sendResult = await sendFacebookMessage(
              conv.customer.facebookId,
              personalizedMessage,
              'TEXT',
              conversationPageId
            );
          }

          if (sendResult.success) {
            sentCount++;

            await safeQuery(async () => {
              return await getSharedPrismaClient().broadcastRecipient.updateMany({
                where: {
                  campaignId: campaign.id,
                  conversationId: conv.id
                },
                data: {
                  status: 'sent',
                  sentAt: new Date()
                }
              });
            }, 5);
          } else {
            failedCount++;

            // حذف الرسائل المحفوظة لأن الإرسال فشل
            for (const msg of savedMessages) {
              await safeQuery(async () => {
                return await getSharedPrismaClient().message.delete({
                  where: { id: msg.id }
                });
              }, 4);
            }

            await safeQuery(async () => {
              return await getSharedPrismaClient().broadcastRecipient.updateMany({
                where: {
                  campaignId: campaign.id,
                  conversationId: conv.id
                },
                data: {
                  status: 'failed',
                  failureReason: sendResult.error || sendResult.message || 'Unknown error',
                  sentAt: new Date()
                }
              });
            }, 4);
          }
        }

        // إرسال تحديث التقدم
        if (io) {
          const progress = Math.round(((i + 1) / totalRecipients) * 100);
          io.emit('campaign:progress', {
            campaignId: campaign.id,
            status: 'sending',
            total: totalRecipients,
            sent: sentCount,
            failed: failedCount,
            progress: progress,
            currentRecipient: `${conv.customer.firstName} ${conv.customer.lastName}`
          });
        }

        // تأخير وفق pacing الشركة لتجنب rate limiting
        await new Promise(resolve => setTimeout(resolve, sendDelayMs));

      } catch (error) {
        console.error(`❌ [BroadcastScheduler] Error sending to ${conv.customer.firstName}:`, error.message);
        failedCount++;

        await safeQuery(async () => {
          return await getSharedPrismaClient().broadcastRecipient.updateMany({
          where: {
            campaignId: campaign.id,
            conversationId: conv.id
          },
          data: {
            status: 'failed',
            failureReason: error.message,
            sentAt: new Date()
          }
          });
        }, 3).catch(err => console.error('Error updating recipient status:', err));
      }
    }

    console.log(`📊 [BroadcastScheduler] Campaign results - Sent: ${sentCount}, Failed: ${failedCount}`);

    const finalCampaignCheck = await safeQuery(async () => {
      return await getSharedPrismaClient().broadcastCampaign.findUnique({
        where: { id: campaign.id },
        select: { status: true }
      });
    }, 5);
    const isPausedOrCancelled = finalCampaignCheck && (finalCampaignCheck.status === 'paused' || finalCampaignCheck.status === 'cancelled');

    // إرسال إشعار الإتمام
    if (io) {
      io.emit('campaign:progress', {
        campaignId: campaign.id,
        status: isPausedOrCancelled ? finalCampaignCheck.status : 'completed',
        total: totalRecipients,
        sent: sentCount,
        failed: failedCount,
        progress: 100
      });
    }

    // تحديث إحصائيات الحملة
    const finalRecipientCount = resuming ? existingRecipients.length : recipients.length;
    await safeQuery(async () => {
      const updateData = {
        recipientCount: finalRecipientCount,
        sentCount: sentCount,
        failedCount: failedCount,
        deliveredCount: 0, // ponytail: starts at 0, updated by webhooks on actual delivery
      };
      if (!isPausedOrCancelled) {
        updateData.status = sentCount > 0 ? 'sent' : 'failed';
      }
      return await getSharedPrismaClient().broadcastCampaign.update({
        where: { id: campaign.id },
        data: updateData
      });
    }, 6);

    console.log(`✅ [BroadcastScheduler] Campaign ${campaign.id} completed - Recipients: ${recipients.length}, Sent: ${sentCount}, Failed: ${failedCount}`);
  }

  /**
   * الحصول على إحصائيات الخدمة
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      schedulerActive: this.cronJob !== null
    };
  }
}

// إنشاء instance واحد للخدمة
const broadcastScheduler = new BroadcastSchedulerService();

module.exports = broadcastScheduler;

