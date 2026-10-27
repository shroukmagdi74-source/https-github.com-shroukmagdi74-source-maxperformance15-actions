const { getSharedPrismaClient, executeWithRetry } = require('../services/sharedDatabase');
const { computeFirstRunAt, computeNextRunAt } = require('../utils/broadcastRecurrence');
const { toCanonicalE164 } = require('../utils/phoneNormalization');
// const prisma = getSharedPrismaClient(); // ❌ Removed to prevent early loading issues
const { sendFacebookMessage } = require('../utils/allFunctions');
const WhatsAppMessageHandler = require('../services/whatsapp').WhatsAppMessageHandler;
const MetaCloudProvider = require('../services/whatsapp/providers/MetaCloudProvider');
const socketService = require('../services/socketService');
const { prepareCampaignRecipients, executeCampaignSendInBackground } = require('../services/broadcastCampaignExecutionService');
const { recordSentMessageStat } = require('../utils/statsRecorder');
const { buildBroadcastBodyParams, countTemplateParams, hasOrderVariables, getTemplateHeaderFormat, buildBroadcastHeaderParams } = require('../utils/broadcastTemplateParams');
const { isUnsubscribed } = require('../services/botUnsubscribeService');
const {
  buildEffectiveCustomerListWhere,
  resolveAggregateCustomerIds,
  criteriaToSummary,
} = require('../utils/customerListCriteria');

console.log('🚀 [BROADCAST CONTROLLER] تم تحميل وحدة تحكم البرودكاست بنجاح');

// ==================== HELPER FUNCTIONS ====================

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

// ==================== CAMPAIGN MANAGEMENT ====================

/**
 * إنشاء حملة برودكاست جديدة
 */
exports.createCampaign = async (req, res) => {
  try {
    console.log('🚀 [CREATE CAMPAIGN] بدء إنشاء حملة جديدة');
    const companyId = req.user.companyId;
    const userId = req.user.id;
    console.log(`📊 [CREATE CAMPAIGN] معرف الشركة: ${companyId}, معرف المستخدم: ${userId}`);


    let {
      name,
      channel,
      message,
      targetAudience,
      waTemplateName,
      waLanguageCode,
      waHeaderMedia,
      whatsAppSessionId,
      leadCategoryId,
      scheduledAt,
      tags,
      priority,
      includeImages,
      trackClicks,
      autoResend,
      sendNow,
      audienceMode = 'fixed',
      audienceListId,
      audienceCriteria,
      onlyNew,
      recurrence = 'none',
      recurrenceInterval = 1,
      sendHour,
      sendMinute = 0,
      maxRecipientsPerRun = 500,
      failureRateThreshold = 5,
      manualPhones,
    } = req.body;

    // Validation for audienceMode
    if (!['fixed', 'dynamic'].includes(audienceMode)) {
      audienceMode = 'fixed';
    }

    if (audienceMode === 'dynamic') {
      const hasList = Boolean(audienceListId);
      let parsedCriteria = null;
      if (audienceCriteria) {
        try {
          parsedCriteria = typeof audienceCriteria === 'string' ? JSON.parse(audienceCriteria) : audienceCriteria;
        } catch {
          return res.status(400).json({ success: false, message: 'معايير الجمهور غير صالحة (JSON غير صحيح)' });
        }
      }
      if ((hasList && parsedCriteria) || (!hasList && !parsedCriteria)) {
        return res.status(400).json({ success: false, message: 'الوضع الديناميكي يتطلب إما قائمة عملاء أو معايير محددة' });
      }
    }

    // Validation for recurrence
    if (!['none', 'daily', 'weekly', 'monthly'].includes(recurrence)) {
      recurrence = 'none';
    }
    const intervalNum = Math.max(1, Math.min(12, parseInt(recurrenceInterval, 10) || 1));
    const isRecurring = recurrence && recurrence !== 'none';
    let hourNum = 0;
    let minNum = 0;
    if (isRecurring) {
      hourNum = parseInt(sendHour, 10);
      if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
        return res.status(400).json({ success: false, message: 'ساعة الإرسال يجب أن تكون بين 0 و 23' });
      }
      minNum = parseInt(sendMinute || 0, 10);
      if (isNaN(minNum) || minNum < 0 || minNum > 59) {
        return res.status(400).json({ success: false, message: 'دقيقة الإرسال يجب أن تكون بين 0 و 59' });
      }
    } else if (sendHour !== undefined && sendHour !== null) {
      hourNum = Math.max(0, Math.min(23, parseInt(sendHour, 10) || 0));
      minNum = Math.max(0, Math.min(59, parseInt(sendMinute, 10) || 0));
    }

    const maxRecNum = Math.max(1, Math.min(5000, parseInt(maxRecipientsPerRun, 10) || 500));
    const failThresholdNum = Number(failureRateThreshold) >= 0 ? Number(failureRateThreshold) : 5;
    const onlyNewBool = onlyNew !== undefined ? (onlyNew === true || onlyNew === 'true') : (audienceMode === 'dynamic');

    // استقبال الصور من req.files
    let images = [];
    if (req.files && req.files.length > 0) {
      // بناء رابط URL للصورة بناءً على اسم الملف
      const baseUrl = req.protocol + '://' + req.get('host');
      images = req.files.map(file => baseUrl + '/uploads/broadcast_images/' + file.filename);
    }

    console.log('📝 [CREATE CAMPAIGN] بيانات الحملة المستلمة:', {
      name,
      targetAudience,
      scheduledAt,
      priority,
      sendNow,
      messageLength: message?.length || 0,
      imagesCount: images.length
    });

    // ⚠️ تحقق: إذا كان sendNow و scheduledAt موجودين معاً، نتجاهل sendNow
    if (sendNow && scheduledAt) {
      console.log('⚠️ [CREATE CAMPAIGN] تم تجاهل sendNow لأن هناك وقت مجدول');
      sendNow = false;
    }

    // 🛡️ PROTECTION: إذا كان هناك scheduledAt في المستقبل، لا يمكن إرسال فوري
    if (scheduledAt) {
      const scheduledTime = new Date(scheduledAt);
      const now = new Date();

      // تحويل للتوقيت المحلي للعرض
      const scheduledLocal = new Date(scheduledTime.getTime());
      const nowLocal = new Date(now.getTime());

      if (scheduledTime > now) {
        const diffMinutes = Math.round((scheduledTime - now) / 1000 / 60);
        console.log(`⏰ [CREATE CAMPAIGN] الحملة مجدولة للمستقبل:`);
        console.log(`   📅 الوقت المجدول (UTC): ${scheduledTime.toISOString()}`);
        console.log(`   📅 الوقت المجدول (محلي): ${scheduledLocal.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);
        console.log(`   🕐 الوقت الحالي (UTC): ${now.toISOString()}`);
        console.log(`   🕐 الوقت الحالي (محلي): ${nowLocal.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);
        console.log(`   ⏱️  الفرق: ${diffMinutes} دقيقة`);

        // تأكد أن sendNow = false للحملات المجدولة
        if (sendNow) {
          console.log('🛑 [CREATE CAMPAIGN] إجبار sendNow = false لأن الحملة مجدولة للمستقبل');
          sendNow = false;
        }
      } else {
        console.log(`⚠️ [CREATE CAMPAIGN] تحذير: الوقت المجدول في الماضي! سيتم الإرسال فوراً`);
        console.log(`   📅 الوقت المجدول (UTC): ${scheduledTime.toISOString()}`);
        console.log(`   📅 الوقت المجدول (محلي): ${scheduledLocal.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);
        console.log(`   🕐 الوقت الحالي (UTC): ${now.toISOString()}`);
        console.log(`   🕐 الوقت الحالي (محلي): ${nowLocal.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);
      }
    }

    // التحقق من الحقول المطلوبة
    if (!name || !message || !targetAudience) {
      console.log('❌ [CREATE CAMPAIGN] بيانات مفقودة - فشل التحقق من الحقول المطلوبة');
      return res.status(400).json({
        success: false,
        message: 'الاسم والرسالة والجمهور المستهدف مطلوبة'
      });
    }

    // 🔄 لا نحسب المستلمين الآن - سيتم الحساب وقت الإرسال
    // حساب المستلمين النشطاء (آخر 24 ساعة) سيتم في sendCampaign أو scheduler
    console.log('💡 [CREATE CAMPAIGN] سيتم حساب المستلمين النشطاء تلقائياً وقت الإرسال (آخر 24 ساعة)');

    console.log('💾 [CREATE CAMPAIGN] إنشاء الحملة في قاعدة البيانات');
    // تحويل tags و images إلى JSON strings أو null
    let tagsString = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsString = tags.length > 0 ? JSON.stringify(tags) : null;
      } else if (typeof tags === 'string' && tags.trim() !== '') {
        tagsString = tags;
      }
    }

    let imagesString = null;
    if (images && Array.isArray(images) && images.length > 0) {
      imagesString = JSON.stringify(images);
    } else if (req.body.headerMediaUrl) {
      imagesString = JSON.stringify([req.body.headerMediaUrl]);
    }

    // إنشاء الحملة
    // Generate ID for BroadcastCampaign (no default in schema)
    const generateId = () => 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);

    const campaign = await getSharedPrismaClient().broadcastCampaign.create({
      data: {
        id: generateId(),
        name,
        channel: channel || 'facebook',
        message,
        targetAudience,
        waTemplateName: waTemplateName || null,
        waLanguageCode: waLanguageCode || 'en',
        waHeaderMedia: waHeaderMedia || null,
        whatsAppSessionId: whatsAppSessionId || null,
        leadCategoryId: leadCategoryId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        tags: tagsString,
        priority: priority || 'medium',
        includeImages: (includeImages === true || includeImages === 'true'),
        trackClicks: trackClicks !== false,
        autoResend: (autoResend === true || autoResend === 'true'),
        images: imagesString,
        status: isRecurring ? 'active' : (scheduledAt ? 'scheduled' : 'draft'),
        audienceMode,
        audienceListId: audienceListId || null,
        audienceCriteria: audienceCriteria ? (typeof audienceCriteria === 'string' ? audienceCriteria : JSON.stringify(audienceCriteria)) : null,
        onlyNew: onlyNewBool,
        recurrence,
        recurrenceInterval: intervalNum,
        sendHour: (sendHour !== undefined && sendHour !== null) ? hourNum : null,
        sendMinute: minNum,
        nextRunAt: isRecurring ? computeFirstRunAt({
          recurrence,
          recurrenceInterval: intervalNum,
          sendHour: hourNum,
          sendMinute: minNum,
          startAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        }) : null,
        maxRecipientsPerRun: maxRecNum,
        failureRateThreshold: failThresholdNum,
        recipientCount: 0,
        companyId,
        creatorId: userId,
        updatedAt: new Date()
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
      }
    });

    // إنشاء لقطة الجمهور للوضع الثابت server-side
    if (audienceMode === 'fixed') {
      const snapshotsToCreate = [];
      const seenPhones = new Set();

      // 1) من الأرقام اليدوية (manualPhones)
      if (manualPhones) {
        let phoneArr = [];
        if (Array.isArray(manualPhones)) {
          phoneArr = manualPhones;
        } else if (typeof manualPhones === 'string') {
          try {
            const parsed = JSON.parse(manualPhones);
            phoneArr = Array.isArray(parsed) ? parsed : [manualPhones];
          } catch {
            phoneArr = manualPhones.split(/[\r\n,]+/).map(p => p.trim()).filter(Boolean);
          }
        }
        for (const p of phoneArr) {
          const raw = String(p || '').trim();
          if (!raw) continue;
          const canonical = toCanonicalE164(raw);
          if (canonical && !seenPhones.has(canonical)) {
            seenPhones.add(canonical);
            snapshotsToCreate.push({
              id: generateId(),
              campaignId: campaign.id,
              phone: raw,
              phoneNormalized: canonical,
              customerName: null,
              customerId: null,
            });
          }
        }
      }

      // 2) من قائمة العملاء (audienceListId أو targetAudience المطابق لقائمة)
      const listIdToFetch = audienceListId || (targetAudience !== 'manual' && targetAudience !== 'all' ? targetAudience : null);
      if (listIdToFetch) {
        try {
          const list = await getSharedPrismaClient().customerList.findFirst({
            where: { id: listIdToFetch, companyId },
          });
          if (list) {
            const criteriaRes = await buildEffectiveCustomerListWhere(getSharedPrismaClient(), companyId, list.criteria);
            const listWhere = criteriaRes.where || criteriaRes;
            const customers = await getSharedPrismaClient().customer.findMany({
              where: { ...listWhere, companyId, phone: { not: null } },
              select: { id: true, phone: true, phoneNormalized: true, firstName: true, lastName: true },
              take: maxRecNum || 5000,
            });
            for (const c of customers) {
              const raw = String(c.phone || '').trim();
              if (!raw) continue;
              const canonical = toCanonicalE164(raw);
              if (canonical && !seenPhones.has(canonical)) {
                seenPhones.add(canonical);
                const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ') || null;
                snapshotsToCreate.push({
                  id: generateId(),
                  campaignId: campaign.id,
                  customerId: c.id,
                  phone: raw,
                  phoneNormalized: c.phoneNormalized || canonical,
                  customerName: fullName,
                });
              }
            }
          }
        } catch (listErr) {
          console.warn('⚠️ [CREATE CAMPAIGN] Failed to snapshot list:', listErr.message);
        }
      }

      if (snapshotsToCreate.length > 0) {
        await getSharedPrismaClient().broadcastCampaignSnapshot.createMany({
          data: snapshotsToCreate,
        });
        console.log(`📸 [CREATE CAMPAIGN] Created ${snapshotsToCreate.length} snapshot rows for fixed audience`);
      }
    }

    console.log(`✅ [CREATE CAMPAIGN] تم إنشاء الحملة بنجاح - معرف الحملة: ${campaign.id}, الحالة: ${campaign.status}`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحملة بنجاح',
      data: campaign
    });

  } catch (error) {
    console.error('❌ [CREATE CAMPAIGN] خطأ في إنشاء الحملة:', error.message);
    console.error('🔍 [CREATE CAMPAIGN] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الحملة',
      error: error.message
    });
  }
};

/**
 * الحصول على جميع الحملات
 */
exports.getCampaigns = async (req, res) => {
  try {
    console.log('📋 [GET CAMPAIGNS] بدء جلب قائمة الحملات');
    const companyId = req.user.companyId;
    const { status, channel, page = 1, limit = 10 } = req.query;
    console.log(`🔍 [GET CAMPAIGNS] معايير البحث - الشركة: ${companyId}, الحالة: ${status || 'الكل'}, الصفحة: ${page}, الحد: ${limit}`);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      companyId,
      ...(status && { status }),
      ...(channel && { channel })
    };

    console.log('🔄 [GET CAMPAIGNS] تنفيذ استعلام قاعدة البيانات');
    const [campaigns, total] = await Promise.all([
      getSharedPrismaClient().broadcastCampaign.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          company: {
            select: {
              name: true
            }
          },
          broadcastRecipients: {
            where: {
              status: 'failed'
            },
            take: 1,
            select: {
              failureReason: true
            }
          }
        }
      }),
      getSharedPrismaClient().broadcastCampaign.count({ where })
    ]);

    const formattedCampaigns = campaigns.map(c => {
      const failureReason = c.broadcastRecipients?.[0]?.failureReason || null;
      const { broadcastRecipients, ...rest } = c;
      return {
        ...rest,
        failureReason
      };
    });

    console.log(`✅ [GET CAMPAIGNS] تم جلب ${campaigns.length} حملة من أصل ${total} حملة`);

    res.json({
      success: true,
      campaigns: formattedCampaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ [GET CAMPAIGNS] خطأ في جلب الحملات:', error.message);
    console.error('🔍 [GET CAMPAIGNS] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الحملات',
      error: error.message
    });
  }
};

/**
 * الحصول على حملة واحدة
 */
exports.getCampaign = async (req, res) => {
  try {
    console.log('📋 [GET CAMPAIGN] بدء جلب تفاصيل الحملة');
    const companyId = req.user.companyId;
    const { campaignId } = req.params;
    console.log(`🔍 [GET CAMPAIGN] معرف الشركة: ${companyId}, معرف الحملة: ${campaignId}`);

    console.log('🔍 [GET CAMPAIGN] البحث عن الحملة مع التفاصيل');
    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        broadcastRecipients: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!campaign) {
      console.log('❌ [GET CAMPAIGN] الحملة غير موجودة');
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    console.log(`✅ [GET CAMPAIGN] تم العثور على الحملة - الاسم: ${campaign.name}, الحالة: ${campaign.status}, المستلمين: ${campaign.broadcastRecipients?.length || 0}`);

    const failureReason = campaign.broadcastRecipients?.find(r => r.failureReason)?.failureReason || null;

    res.json({
      success: true,
      data: {
        ...campaign,
        failureReason
      }
    });

  } catch (error) {
    console.error('❌ [GET CAMPAIGN] خطأ في جلب الحملة:', error.message);
    console.error('🔍 [GET CAMPAIGN] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الحملة',
      error: error.message
    });
  }
};

/**
 * تحديث حملة
 */
exports.updateCampaign = async (req, res) => {
  try {
    console.log('✏️ [UPDATE CAMPAIGN] بدء تحديث الحملة');
    const companyId = req.user.companyId;
    const { campaignId } = req.params;
    const updateData = req.body;
    console.log(`🔍 [UPDATE CAMPAIGN] معرف الشركة: ${companyId}, معرف الحملة: ${campaignId}`);
    console.log('📝 [UPDATE CAMPAIGN] بيانات التحديث:', Object.keys(updateData));

    console.log('🔍 [UPDATE CAMPAIGN] التحقق من وجود الحملة');
    // التحقق من وجود الحملة
    const existingCampaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!existingCampaign) {
      console.log('❌ [UPDATE CAMPAIGN] الحملة غير موجودة');
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    console.log(`📋 [UPDATE CAMPAIGN] تم العثور على الحملة - الاسم: ${existingCampaign.name}, الحالة: ${existingCampaign.status}`);

    // لا يمكن تعديل الحملات المرسلة
    if (existingCampaign.status === 'sent') {
      console.log('⚠️ [UPDATE CAMPAIGN] لا يمكن تعديل حملة تم إرسالها');
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل حملة تم إرسالها'
      });
    }

    console.log('🔄 [UPDATE CAMPAIGN] تحديث بيانات الحملة في قاعدة البيانات');

    // تحويل tags و images إلى JSON strings أو null إذا كانت موجودة
    const processedData = { ...updateData };

    if ('tags' in processedData) {
      if (Array.isArray(processedData.tags)) {
        processedData.tags = processedData.tags.length > 0 ? JSON.stringify(processedData.tags) : null;
      } else if (typeof processedData.tags === 'string' && processedData.tags.trim() === '') {
        processedData.tags = null;
      }
      // إذا كان string غير فارغ، نتركه كما هو
    }

    if ('images' in processedData) {
      if (Array.isArray(processedData.images)) {
        processedData.images = processedData.images.length > 0 ? JSON.stringify(processedData.images) : null;
      } else if (typeof processedData.images === 'string' && processedData.images.trim() === '') {
        processedData.images = null;
      }
      // إذا كان string غير فارغ، نتركه كما هو
    }

    if (processedData.scheduledAt) {
      processedData.scheduledAt = new Date(processedData.scheduledAt);
    } else if ('scheduledAt' in processedData && processedData.scheduledAt === null) {
      processedData.scheduledAt = null;
    } else {
      delete processedData.scheduledAt;
    }

    // Recompute nextRunAt if recurrence fields change; never leave nextRunAt in the past for active campaign
    const recurrenceChanged = 'recurrence' in processedData || 'sendHour' in processedData || 'sendMinute' in processedData || 'recurrenceInterval' in processedData;
    const effRecurrence = processedData.recurrence !== undefined ? processedData.recurrence : existingCampaign.recurrence;
    if (effRecurrence && effRecurrence !== 'none' && (recurrenceChanged || existingCampaign.status === 'active')) {
      const effHour = processedData.sendHour !== undefined ? processedData.sendHour : existingCampaign.sendHour;
      const effMinute = processedData.sendMinute !== undefined ? processedData.sendMinute : existingCampaign.sendMinute;
      const effInterval = processedData.recurrenceInterval !== undefined ? processedData.recurrenceInterval : existingCampaign.recurrenceInterval;
      processedData.nextRunAt = computeNextRunAt({
        recurrence: effRecurrence,
        recurrenceInterval: effInterval,
        sendHour: effHour,
        sendMinute: effMinute,
        from: new Date(),
      });
    }

    const campaign = await getSharedPrismaClient().broadcastCampaign.update({
      where: { id: campaignId },
      data: processedData
    });

    console.log(`✅ [UPDATE CAMPAIGN] تم تحديث الحملة بنجاح`);

    res.json({
      success: true,
      message: 'تم تحديث الحملة بنجاح',
      data: campaign
    });

  } catch (error) {
    console.error('❌ [UPDATE CAMPAIGN] خطأ في تحديث الحملة:', error.message);
    console.error('🔍 [UPDATE CAMPAIGN] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الحملة',
      error: error.message
    });
  }
};

/**
 * حذف/إلغاء حملة
 */
exports.cancelCampaign = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { campaignId } = req.params;

    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    // إذا كانت الحملة ملغية بالفعل، إرجاع نجاح بدون تعديل (idempotent)
    if (campaign.status === 'cancelled') {
      return res.status(200).json({
        success: true,
        message: 'الحملة ملغية بالفعل',
        data: campaign
      });
    }

    const updatedCampaign = await getSharedPrismaClient().broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'cancelled',
        pausedReason: 'تم الإلغاء يدوياً من المستخدم'
      }
    });

    res.json({
      success: true,
      message: 'تم إلغاء الحملة بنجاح',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('❌ Error cancelling campaign:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إلغاء الحملة',
      error: error.message
    });
  }
};

/**
 * إيقاف حملة مؤقتاً
 */
exports.pauseCampaign = async (req, res) => {
  try {
    console.log('⏸️ [PAUSE CAMPAIGN] بدء إيقاف الحملة مؤقتاً');
    const companyId = req.user.companyId;
    const { campaignId } = req.params;
    console.log(`🔍 [PAUSE CAMPAIGN] معرف الشركة: ${companyId}, معرف الحملة: ${campaignId}`);

    console.log('🔍 [PAUSE CAMPAIGN] البحث عن الحملة');
    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      console.log('❌ [PAUSE CAMPAIGN] الحملة غير موجودة');
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    console.log(`📋 [PAUSE CAMPAIGN] تم العثور على الحملة - الاسم: ${campaign.name}, الحالة: ${campaign.status}`);

    if (campaign.status === 'paused') {
      console.log(`ℹ️ [PAUSE CAMPAIGN] الحملة متوقفة بالفعل - الاسم: ${campaign.name}`);
      return res.status(200).json({
        success: true,
        message: 'تم إيقاف الحملة مؤقتاً',
        data: campaign
      });
    }

    if (campaign.status !== 'sending' && campaign.status !== 'scheduled' && campaign.status !== 'active') {
      console.log(`⚠️ [PAUSE CAMPAIGN] لا يمكن إيقاف الحملة - الحالة الحالية: ${campaign.status}`);
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إيقاف هذه الحملة'
      });
    }

    console.log('🔄 [PAUSE CAMPAIGN] تحديث حالة الحملة إلى "paused"');
    const updatedCampaign = await getSharedPrismaClient().broadcastCampaign.update({
      where: { id: campaignId },
      data: { status: 'paused' }
    });

    console.log(`✅ [PAUSE CAMPAIGN] تم إيقاف الحملة مؤقتاً بنجاح`);

    res.json({
      success: true,
      message: 'تم إيقاف الحملة مؤقتاً',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('❌ [PAUSE CAMPAIGN] خطأ في إيقاف الحملة:', error.message);
    console.error('🔍 [PAUSE CAMPAIGN] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إيقاف الحملة',
      error: error.message
    });
  }
};

/**
 * استئناف حملة متوقفة
 */
exports.resumeCampaign = async (req, res) => {
  try {
    console.log('▶️ [RESUME CAMPAIGN] بدء استئناف الحملة');
    const companyId = req.user.companyId;
    const { campaignId } = req.params;
    console.log(`🔍 [RESUME CAMPAIGN] معرف الشركة: ${companyId}, معرف الحملة: ${campaignId}`);

    console.log('🔍 [RESUME CAMPAIGN] البحث عن الحملة');
    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      console.log('❌ [RESUME CAMPAIGN] الحملة غير موجودة');
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    console.log(`📋 [RESUME CAMPAIGN] تم العثور على الحملة - الاسم: ${campaign.name}, الحالة: ${campaign.status}`);

    if (campaign.status !== 'paused') {
      console.log(`⚠️ [RESUME CAMPAIGN] الحملة ليست متوقفة - الحالة الحالية: ${campaign.status}`);
      return res.status(400).json({
        success: false,
        message: 'الحملة ليست متوقفة'
      });
    }

    const isRecurring = campaign.recurrence && campaign.recurrence !== 'none';
    const newStatus = isRecurring ? 'active' : 'scheduled';
    console.log(`🔄 [RESUME CAMPAIGN] تحديث حالة الحملة إلى "${newStatus}"`);

    const updateData = { status: newStatus, pausedReason: null };
    if (isRecurring) {
      if (!campaign.nextRunAt || new Date(campaign.nextRunAt) <= new Date()) {
        updateData.nextRunAt = computeFirstRunAt({
          recurrence: campaign.recurrence,
          recurrenceInterval: campaign.recurrenceInterval || 1,
          sendHour: campaign.sendHour,
          sendMinute: campaign.sendMinute || 0,
          startAt: new Date(),
        });
      }
    } else {
      updateData.scheduledAt = new Date();
    }

    const updatedCampaign = await getSharedPrismaClient().broadcastCampaign.update({
      where: { id: campaignId },
      data: updateData
    });

    console.log(`✅ [RESUME CAMPAIGN] تم استئناف الحملة بنجاح`);

    res.json({
      success: true,
      message: 'تم استئناف الحملة',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('❌ [RESUME CAMPAIGN] خطأ في استئناف الحملة:', error.message);
    console.error('🔍 [RESUME CAMPAIGN] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في استئناف الحملة',
      error: error.message
    });
  }
};

/**
 * إرسال حملة
 */
exports.sendCampaign = async (req, res) => {
  try {
    console.log('🚀 [SEND CAMPAIGN] بدء عملية إرسال الحملة');
    const companyId = req.user.companyId;
    const { campaignId } = req.params;
    console.log(`📊 [SEND CAMPAIGN] معرف الشركة: ${companyId}, معرف الحملة: ${campaignId}`);

    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      console.log('❌ [SEND CAMPAIGN] الحملة غير موجودة');
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    if (campaign.status === 'sent') {
      console.log('⚠️ [SEND CAMPAIGN] الحملة تم إرسالها بالفعل');
      return res.status(400).json({
        success: false,
        message: 'تم إرسال هذه الحملة بالفعل'
      });
    }

    // 🛡️ Guard: إذا كانت الحملة في حالة "sending" وتحديثها خلال آخر 15 دقيقة -> 409 Conflict
    if (campaign.status === 'sending') {
      const fifteenMinutesMs = 15 * 60 * 1000;
      const lastUpdated = campaign.updatedAt ? new Date(campaign.updatedAt).getTime() : 0;
      if (Date.now() - lastUpdated < fifteenMinutesMs) {
        console.log('⚠️ [SEND CAMPAIGN] الحملة قيد الإرسال بالفعل');
        return res.status(409).json({
          success: false,
          message: 'الحملة قيد الإرسال بالفعل'
        });
      }
    }

    let campaignImages = [];
    if (campaign.images) {
      try {
        campaignImages = typeof campaign.images === 'string' ? JSON.parse(campaign.images) : campaign.images;
        if (!Array.isArray(campaignImages)) {
          campaignImages = [];
        }
      } catch (error) {
        console.error('❌ [SEND CAMPAIGN] خطأ في تحليل صور الحملة:', error);
        campaignImages = [];
      }
    }
    campaign.images = campaignImages;

    const isWhatsApp = campaign.channel === 'whatsapp';
    let waSessionId = campaign.whatsAppSessionId;

    if (isWhatsApp) {
      if (!waSessionId) {
        console.log(`🔍 [SEND CAMPAIGN] البحث عن جلسة واتساب للشركة`);
        const metaSession = await getSharedPrismaClient().whatsAppSession.findFirst({
          where: { companyId, provider: 'META_CLOUD' }
        });
        if (metaSession) {
          waSessionId = metaSession.id;
        } else {
          const defaultSession = await getSharedPrismaClient().whatsAppSession.findFirst({
            where: { companyId, isDefault: true }
          }) || await getSharedPrismaClient().whatsAppSession.findFirst({
            where: { companyId }
          });
          waSessionId = defaultSession?.id || null;
        }
      }

      if (!waSessionId) {
        return res.status(400).json({
          success: false,
          message: 'لا توجد جلسة واتساب نشطة متاحة لهذه الحملة'
        });
      }
    }

    const generateId = () => 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);

    // 🛡️ فحص المستلمين الحاليين: إعادة استخدام المستلمين (resume-safe) وتفادي إنشاء تكرارات
    const existingRecipients = await getSharedPrismaClient().broadcastRecipient.findMany({
      where: { campaignId: campaign.id },
      include: {
        conversation: {
          include: { customer: true }
        }
      }
    });

    let conversations = [];
    let recipientsToRun = [];
    const isResuming = existingRecipients && existingRecipients.length > 0;

    if (isResuming) {
      console.log(`♻️ [SEND CAMPAIGN] الحملة تحتوي على ${existingRecipients.length} مستلم سابق — إعادة استخدام المستلمين المعلقين (resume-safe)`);
      const pendingRecipients = existingRecipients.filter(r => r.status === 'pending');

      if (pendingRecipients.length === 0) {
        console.log('⚠️ [SEND CAMPAIGN] جميع المستلمين تم إرسالهم أو فشلوا بالفعل');
        return res.status(400).json({
          success: false,
          message: 'تمت معالجة جميع مستلمي هذه الحملة بالفعل'
        });
      }

      const convMap = new Map();
      const missingConvIds = [];
      for (const rec of pendingRecipients) {
        if (rec.conversation) {
          if (!rec.conversation.customer && rec.customerPhone) {
            rec.conversation.customer = {
              phone: rec.customerPhone,
              firstName: rec.customerName || '',
              lastName: ''
            };
          }
          convMap.set(rec.conversation.id, rec.conversation);
        } else if (rec.conversationId) {
          missingConvIds.push(rec.conversationId);
        }
      }

      if (missingConvIds.length > 0) {
        const fetchedConvs = await getSharedPrismaClient().conversation.findMany({
          where: { id: { in: missingConvIds } },
          include: { customer: true }
        });
        for (const conv of fetchedConvs) {
          convMap.set(conv.id, conv);
        }
      }

      conversations = Array.from(convMap.values());
      recipientsToRun = pendingRecipients;
    } else {
      // 🛡️ منع الإرسال لكافة عملاء الشركة إذا كانت الحملة ذات استهداف محدد/ثابت ولكن بدون لقطة محفوظة
      const isFixedTargeting = campaign.audienceMode === 'fixed' || (campaign.targetAudience && campaign.targetAudience !== 'all' && campaign.targetAudience !== 'manual');
      if (isFixedTargeting) {
        const snapshotCount = await getSharedPrismaClient().broadcastCampaignSnapshot.count({
          where: { campaignId: campaign.id }
        });
        const hasManualPhones = req.body?.manualPhones && (Array.isArray(req.body.manualPhones) ? req.body.manualPhones.length > 0 : String(req.body.manualPhones).trim().length > 0);
        if (snapshotCount === 0 && !hasManualPhones) {
          console.log('⚠️ [SEND CAMPAIGN] قائمة الحملة غير محفوظة — أعد اختيار القائمة');
          return res.status(400).json({
            success: false,
            message: 'قائمة الحملة غير محفوظة — أعد اختيار القائمة'
          });
        }
      }

      // ⚡ تجهيز المستلمين سريعاً بالدفعات (Batch Optimization) لمنع 502 وتجميد السيرفر
      conversations = await prepareCampaignRecipients({
        companyId,
        campaign,
        manualPhonesFromBody: req.body.manualPhones,
        isWhatsApp
      });

      if (!conversations || conversations.length === 0) {
        console.log('⚠️ [SEND CAMPAIGN] لا توجد محادثات صالحة للإرسال');
        return res.status(400).json({
          success: false,
          message: 'لا توجد أرقام هواتف أو محادثات صالحة للإرسال'
        });
      }

      console.log(`📝 [SEND CAMPAIGN] إنشاء سجلات المستلمين لعدد ${conversations.length}`);
      const newRecipients = conversations.map(conv => ({
        id: generateId(),
        campaignId: campaign.id,
        conversationId: conv.id,
        customerPhone: conv.customer?.phone || '',
        customerName: `${conv.customer?.firstName || ''} ${conv.customer?.lastName || ''}`.trim(),
        messengerUserId: conv.customer?.facebookId || null,
        status: 'pending',
        updatedAt: new Date()
      }));

      await getSharedPrismaClient().broadcastRecipient.createMany({
        data: newRecipients,
        skipDuplicates: true
      });

      recipientsToRun = newRecipients;
    }

    const totalRecipientCount = isResuming ? existingRecipients.length : recipientsToRun.length;

    await getSharedPrismaClient().broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sending',
        recipientCount: totalRecipientCount,
        sentAt: campaign.sentAt || new Date(),
        updatedAt: new Date()
      }
    });

    let perMessageDelayMs = 50;
    try {
      const bs = await getSharedPrismaClient().broadcastSettings.findUnique({ where: { companyId } });
      const mpm = bs?.messagesPerMinute ? Number(bs.messagesPerMinute) : 60;
      if (mpm > 0) {
        perMessageDelayMs = Math.max(200, Math.round(60000 / mpm));
      }
    } catch (bsErr) {
      console.warn(`⚠️ [SEND CAMPAIGN] فشل جلب إعدادات البث:`, bsErr.message);
    }

    const io = socketService.getIO();
    if (io) {
      io.emit('campaign:progress', {
        campaignId: campaign.id,
        status: 'started',
        total: totalRecipientCount,
        sent: isResuming ? existingRecipients.filter(r => r.status === 'sent').length : 0,
        failed: isResuming ? existingRecipients.filter(r => r.status === 'failed').length : 0,
        progress: 0
      });
    }

    // 🚀 استجابة فورية سريعة للـ Client لتفادي مهلة الـ HTTP وتجنب أخطاء 502/504
    res.json({
      success: true,
      message: 'بدأ إرسال الحملة بنجاح في الخلفية',
      campaignId: campaign.id,
      recipientCount: totalRecipientCount,
      sentCount: isResuming ? existingRecipients.filter(r => r.status === 'sent').length : 0,
      failedCount: isResuming ? existingRecipients.filter(r => r.status === 'failed').length : 0,
      status: 'sending',
      isAsync: true
    });

    // 🔄 تشغيل مسار الإرسال الفعلي في الخلفية دون حجب الخادم
    setImmediate(() => {
      executeCampaignSendInBackground({
        campaign,
        conversations,
        recipients: recipientsToRun,
        companyId,
        campaignId,
        isWhatsApp,
        waSessionId,
        io,
        perMessageDelayMs,
        reqBody: req.body
      }).catch(err => {
        console.error('❌ [SEND CAMPAIGN BACKGROUND] Error running campaign pipeline:', err);
      });
    });

  } catch (error) {
    console.error('❌ [SEND CAMPAIGN] خطأ في بدء الحملة:', error.message);
    res.status(500).json({
      success: false,
      message: 'فشل في بدء إرسال الحملة',
      error: error.message
    });
  }
};
// ==================== ANALYTICS ====================

/**
 * الحصول على إحصائيات البرودكاست
 */
exports.getAnalytics = async (req, res) => {
  try {
    console.log('📊 [GET ANALYTICS] بدء جلب إحصائيات البرودكاست');
    const companyId = req.user.companyId;
    const { period = '30d' } = req.query;
    console.log(`🔍 [GET ANALYTICS] معرف الشركة: ${companyId}, الفترة: ${period}`);

    // حساب التاريخ بناءً على الفترة
    const now = new Date();
    let startDate = new Date();

    if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(now.getDate() - 90);
    }

    console.log(`📅 [GET ANALYTICS] نطاق التاريخ: من ${startDate.toISOString()} إلى ${now.toISOString()}`);

    console.log('🔄 [GET ANALYTICS] تنفيذ استعلامات الإحصائيات');
    // إحصائيات الحملات
    const [
      totalCampaigns,
      activeCampaigns,
      campaignsThisMonth,
      allCampaigns
    ] = await Promise.all([
      getSharedPrismaClient().broadcastCampaign.count({
        where: { companyId }
      }),
      getSharedPrismaClient().broadcastCampaign.count({
        where: {
          companyId,
          status: { in: ['sending', 'scheduled'] }
        }
      }),
      getSharedPrismaClient().broadcastCampaign.count({
        where: {
          companyId,
          createdAt: { gte: startDate }
        }
      }),
      getSharedPrismaClient().broadcastCampaign.findMany({
        where: {
          companyId,
          status: 'sent'
        },
        select: {
          recipientCount: true,
          sentCount: true,
          deliveredCount: true,
          openedCount: true,
          clickedCount: true
        }
      })
    ]);

    console.log(`📈 [GET ANALYTICS] إحصائيات أولية - إجمالي الحملات: ${totalCampaigns}, النشطة: ${activeCampaigns}, هذا الشهر: ${campaignsThisMonth}`);

    // حساب الإحصائيات
    const totalRecipients = allCampaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0);
    const totalSent = allCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalDelivered = allCampaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
    const totalOpened = allCampaigns.reduce((sum, c) => sum + (c.openedCount || 0), 0);
    const totalClicked = allCampaigns.reduce((sum, c) => sum + (c.clickedCount || 0), 0);

    const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const averageClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const averageDeliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    console.log(`📊 [GET ANALYTICS] إحصائيات محسوبة - المرسل: ${totalSent}, المسلم: ${totalDelivered}, المفتوح: ${totalOpened}, النقرات: ${totalClicked}`);

    // أفضل وقت للإرسال (مبسط)
    const bestPerformingTime = '10:00 AM';

    console.log(`✅ [GET ANALYTICS] تم حساب الإحصائيات بنجاح - معدل التسليم: ${averageDeliveryRate.toFixed(1)}%, معدل الفتح: ${averageOpenRate.toFixed(1)}%, معدل النقر: ${averageClickRate.toFixed(1)}%`);

    res.json({
      success: true,
      totalCampaigns,
      activeCampaigns,
      campaignsThisMonth,
      totalRecipients,
      averageOpenRate: Math.round(averageOpenRate * 10) / 10,
      averageClickRate: Math.round(averageClickRate * 10) / 10,
      averageDeliveryRate: Math.round(averageDeliveryRate * 10) / 10,
      totalRevenue: 0,
      bestPerformingTime,
      campaignMetrics: []
    });

  } catch (error) {
    console.error('❌ [GET ANALYTICS] خطأ في جلب الإحصائيات:', error.message);
    console.error('🔍 [GET ANALYTICS] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات حملة محددة
 */
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { campaignId } = req.params;

    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: {
        id: campaignId,
        companyId
      },
      include: {
        broadcastRecipients: {
          select: {
            status: true,
            sentAt: true,
            deliveredAt: true,
            openedAt: true,
            clickedAt: true
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة'
      });
    }

    const deliveryRate = campaign.recipientCount > 0
      ? (campaign.deliveredCount / campaign.recipientCount) * 100
      : 0;

    const openRate = campaign.sentCount > 0
      ? (campaign.openedCount / campaign.sentCount) * 100
      : 0;

    const clickRate = campaign.sentCount > 0
      ? (campaign.clickedCount / campaign.sentCount) * 100
      : 0;

    res.json({
      success: true,
      data: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        sentAt: campaign.sentAt,
        recipientCount: campaign.recipientCount,
        deliveredCount: campaign.deliveredCount,
        openedCount: campaign.openedCount,
        clickedCount: campaign.clickedCount,
        failedCount: campaign.failedCount,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10
      }
    });

  } catch (error) {
    console.error('❌ Error fetching campaign analytics:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إحصائيات الحملة',
      error: error.message
    });
  }
};

// ==================== CUSTOMER LISTS ====================

/**
 * إنشاء قائمة عملاء جديدة
 */
async function computeCustomerListCount(prisma, companyId, criteria) {
  const { where, take } = await buildEffectiveCustomerListWhere(prisma, companyId, criteria);
  if (take) {
    const rows = await prisma.customer.findMany({ where, take, select: { id: true } });
    return rows.length;
  }
  return prisma.customer.count({ where });
}

/**
 * درجة RFM مبسطة (0–100) من الإنفاق والتكرار والحداثة.
 * تقريب عملي لنماذج 2026 دون الحاجة لبيانات تاريخية ضخمة.
 */
function computeRfmScore(totalSpent, ordersCount, lastActivity) {
  let score = 0;
  // Monetary (0–40)
  const m = Number(totalSpent) || 0;
  if (m >= 20000) score += 40;
  else if (m >= 10000) score += 34;
  else if (m >= 5000) score += 28;
  else if (m >= 2000) score += 22;
  else if (m >= 1000) score += 16;
  else if (m >= 500) score += 10;
  else if (m > 0) score += 5;

  // Frequency (0–30)
  const f = Number(ordersCount) || 0;
  if (f >= 20) score += 30;
  else if (f >= 10) score += 24;
  else if (f >= 5) score += 18;
  else if (f >= 3) score += 12;
  else if (f >= 1) score += 6;

  // Recency (0–30)
  const days = lastActivity
    ? Math.max(0, (Date.now() - new Date(lastActivity).getTime()) / 86400000)
    : 999;
  if (days <= 3) score += 30;
  else if (days <= 7) score += 26;
  else if (days <= 14) score += 22;
  else if (days <= 30) score += 16;
  else if (days <= 60) score += 10;
  else if (days <= 90) score += 5;

  return Math.min(100, Math.round(score));
}

function rfmTierFor(score) {
  if (score >= 70) return 'gold';
  if (score >= 45) return 'silver';
  if (score >= 25) return 'bronze';
  return 'lead';
}

exports.createCustomerList = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { name, description, criteria } = req.body;

    if (!name || !criteria) {
      return res.status(400).json({
        success: false,
        message: 'الاسم والمعايير مطلوبة'
      });
    }

    const prisma = getSharedPrismaClient();

    const existing = await prisma.customerList.findFirst({
      where: { companyId, name: name.trim() }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'يوجد قائمة بهذا الاسم بالفعل' });
    }

    const count = await computeCustomerListCount(prisma, companyId, criteria);

    const list = await prisma.customerList.create({
      data: {
        name: name.trim(),
        description: description || '',
        criteria: JSON.stringify(criteria),
        count,
        companyId
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء القائمة بنجاح',
      data: list
    });

  } catch (error) {
    console.error('❌ [CREATE CUSTOMER LIST] خطأ في إنشاء القائمة:', error.message);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء القائمة',
      error: error.message
    });
  }
};

exports.updateCustomerList = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { listId } = req.params;
    const { name, description, criteria } = req.body;

    if (!name || !criteria) {
      return res.status(400).json({ success: false, message: 'الاسم والمعايير مطلوبة' });
    }

    const prisma = getSharedPrismaClient();

    const list = await prisma.customerList.findFirst({ where: { id: listId, companyId } });
    if (!list) {
      return res.status(404).json({ success: false, message: 'القائمة غير موجودة' });
    }
    if (list.isDefault) {
      return res.status(400).json({ success: false, message: 'لا يمكن تعديل قائمة افتراضية' });
    }

    const duplicate = await prisma.customerList.findFirst({
      where: { companyId, name: name.trim(), id: { not: listId } }
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'يوجد قائمة بهذا الاسم بالفعل' });
    }

    const count = await computeCustomerListCount(prisma, companyId, criteria);

    const updated = await prisma.customerList.update({
      where: { id: listId },
      data: {
        name: name.trim(),
        description: description || '',
        criteria: JSON.stringify(criteria),
        count
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث القائمة بنجاح',
      data: updated
    });

  } catch (error) {
    console.error('❌ [UPDATE CUSTOMER LIST] خطأ في تحديث القائمة:', error.message);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث القائمة',
      error: error.message
    });
  }
};

exports.refreshCustomerListCount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { listId } = req.params;

    const prisma = getSharedPrismaClient();
    const list = await prisma.customerList.findFirst({ where: { id: listId, companyId } });
    if (!list) {
      return res.status(404).json({ success: false, message: 'القائمة غير موجودة' });
    }

    const criteria = typeof list.criteria === 'string' ? JSON.parse(list.criteria) : list.criteria;
    const count = await computeCustomerListCount(prisma, companyId, criteria);

    const updated = await prisma.customerList.update({
      where: { id: listId },
      data: { count }
    });

    res.json({
      success: true,
      message: 'تم تحديث عدد العملاء',
      data: { id: listId, count }
    });

  } catch (error) {
    console.error('❌ [REFRESH CUSTOMER LIST] خطأ في تحديث العدد:', error.message);
    res.status(500).json({ success: false, message: 'فشل في تحديث عدد العملاء', error: error.message });
  }
};

exports.previewCustomerListCount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { criteria } = req.body;

    if (!criteria) {
      return res.status(400).json({ success: false, message: 'المعايير مطلوبة' });
    }

    const count = await computeCustomerListCount(getSharedPrismaClient(), companyId, criteria);

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('❌ [PREVIEW CUSTOMER LIST] خطأ في معاينة العدد:', error.message);
    res.status(500).json({ success: false, message: 'فشل في معاينة عدد العملاء', error: error.message });
  }
};

/**
 * بحث المنتجات للاختيار المتعدد في قوائم العملاء
 */
exports.searchCustomerListProducts = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const q = (req.query.q || '').trim();
    const limitParam = parseInt(req.query.limit, 10);
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 20;

    const where = { companyId };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    const prisma = getSharedPrismaClient();
    const products = await prisma.product.findMany({
      where,
      select: { id: true, name: true, sku: true },
      orderBy: { name: 'asc' },
      take: limit,
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('❌ [SEARCH CUSTOMER LIST PRODUCTS] خطأ في بحث المنتجات:', error.message);
    res.status(500).json({ success: false, message: 'فشل في بحث المنتجات', error: error.message });
  }
};

/**
 * الحصول على قوائم العملاء
 */
exports.getCustomerLists = async (req, res) => {
  try {
    console.log('📋 [GET CUSTOMER LISTS] بدء جلب قوائم العملاء');
    const companyId = req.user.companyId;
    console.log(`🔍 [GET CUSTOMER LISTS] معرف الشركة: ${companyId}`);

    console.log('👥 [GET CUSTOMER LISTS] حساب إجمالي العملاء النشطين');
    // Get total customer count
    const totalCustomers = await getSharedPrismaClient().conversation.count({
      where: {
        companyId,
        status: 'ACTIVE'
      }
    });

    console.log(`📊 [GET CUSTOMER LISTS] إجمالي العملاء النشطين: ${totalCustomers}`);

    // حساب العملاء النشطين في آخر 24 ساعة
    console.log('⏰ [GET CUSTOMER LISTS] حساب العملاء النشطين في آخر 24 ساعة');
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const activeIn24Hours = await getSharedPrismaClient().conversation.count({
      where: {
        companyId,
        status: 'ACTIVE',
        messages: {
          some: {
            isFromCustomer: true,
            createdAt: {
              gte: last24Hours
            }
          }
        }
      }
    });

    console.log(`📊 [GET CUSTOMER LISTS] العملاء النشطين في آخر 24 ساعة: ${activeIn24Hours}`);

    console.log('📋 [GET CUSTOMER LISTS] جلب القوائم المخصصة');
    const lists = await getSharedPrismaClient().customerList.findMany({
      where: { companyId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const staleAfterDays = 7;
    const now = Date.now();
    const listsWithStale = lists.map((l) => ({
      ...l,
      criteria: typeof l.criteria === 'string' ? JSON.parse(l.criteria) : l.criteria,
      isStale: now - new Date(l.updatedAt).getTime() > staleAfterDays * 86400000,
    }));

    console.log(`📝 [GET CUSTOMER LISTS] تم جلب ${lists.length} قائمة مخصصة`);

    // Add default lists
    const allLists = [
      {
        id: 'all',
        name: 'جميع العملاء',
        description: 'جميع العملاء النشطين',
        count: totalCustomers,
        criteria: { type: 'all' },
        isDefault: true,
        companyId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'active-24h',
        name: 'نشطين في آخر 24 ساعة',
        description: 'العملاء الذين تواصلوا معك في آخر 24 ساعة',
        count: activeIn24Hours,
        criteria: { type: 'active', lastActivity: '24' },
        isDefault: true,
        companyId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ...listsWithStale
    ];

    console.log(`✅ [GET CUSTOMER LISTS] تم إرجاع ${allLists.length} قائمة (شاملة القائمة الافتراضية)`);

    res.json({
      success: true,
      data: allLists
    });

  } catch (error) {
    console.error('❌ [GET CUSTOMER LISTS] خطأ في جلب قوائم العملاء:', error.message);
    console.error('🔍 [GET CUSTOMER LISTS] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب قوائم العملاء',
      error: error.message
    });
  }
};

/**
 * الحصول على العملاء في قائمة محددة
 */
/**
 * الحصول على العملاء في قائمة محددة
 */
const DEFAULT_LIST_CRITERIA = {
  all: { type: 'all' },
  'active-24h': { type: 'active', hours: 24 },
};

exports.getCustomersInList = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { listId } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 200);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const skip = (page - 1) * limit;

    const prisma = getSharedPrismaClient();

    let criteria;
    let isDefault = false;

    if (DEFAULT_LIST_CRITERIA[listId]) {
      criteria = DEFAULT_LIST_CRITERIA[listId];
      isDefault = true;
    } else {
      const list = await prisma.customerList.findFirst({
        where: { id: listId, companyId }
      });
      if (!list) {
        return res.status(404).json({ success: false, message: 'القائمة غير موجودة' });
      }
      criteria = typeof list.criteria === 'string' ? JSON.parse(list.criteria) : list.criteria;
    }

    const { where, orderBy, take } = await buildEffectiveCustomerListWhere(prisma, companyId, criteria);

    const effectiveWhere = { ...where };
    if (search) {
      effectiveWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    let effectiveOrderBy = orderBy || { updatedAt: 'desc' };
    let effectiveTake = take || undefined;

    const total = await prisma.customer.count({ where: effectiveWhere });

    const customers = await prisma.customer.findMany({
      where: effectiveWhere,
      skip,
      take: effectiveTake ?? limit,
      orderBy: effectiveOrderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        tags: true,
        customerRating: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // إجمالي الإنفاق وعدد الطلبات الحقيقيين لكل عميل في هذه الصفحة
    const ids = customers.map((c) => c.id);
    let spendMap = new Map();
    if (ids.length > 0) {
      const orders = await prisma.order.groupBy({
        by: ['customerId'],
        where: {
          companyId,
          customerId: { in: ids },
          status: { notIn: ['CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER'] },
        },
        _sum: { total: true },
        _count: { customerId: true },
      });
      orders.forEach((o) => {
        spendMap.set(o.customerId, {
          totalSpent: Number(o._sum?.total ?? 0),
          ordersCount: o._count?.customerId ?? 0,
        });
      });
    }

    const data = customers.map((c) => {
      const spend = spendMap.get(c.id) || { totalSpent: 0, ordersCount: 0 };
      const rfmScore = computeRfmScore(spend.totalSpent, spend.ordersCount, c.updatedAt);
      return {
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'عميل بدون اسم',
        email: c.email || '',
        phone: c.phone || '',
        lastActivity: c.updatedAt,
        createdAt: c.createdAt,
        totalSpent: spend.totalSpent,
        ordersCount: spend.ordersCount,
        rfmScore,
        rfmTier: rfmTierFor(rfmScore),
        location: 'غير محدد',
        status: c.status === 'ACTIVE' ? 'active' : 'inactive',
        rating: c.customerRating || 'UNKNOWN',
        tags: c.tags || '',
      };
    });

    res.json({
      success: true,
      data,
      total,
      page,
      limit: limit,
      hasMore: page * limit < total,
    });

  } catch (error) {
    console.error('❌ [GET CUSTOMERS IN LIST] خطأ في جلب العملاء:', error.message);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب العملاء',
      error: error.message
    });
  }
};

exports.deleteCustomerList = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { listId } = req.params;
    const list = await getSharedPrismaClient().customerList.findFirst({
      where: { id: listId, companyId }
    });
    if (!list) return res.status(404).json({ success: false, message: 'القائمة غير موجودة' });
    if (list.isDefault) return res.status(400).json({ success: false, message: 'لا يمكن حذف قائمة افتراضية' });
    await getSharedPrismaClient().customerList.delete({ where: { id: listId } });
    res.json({ success: true, message: 'تم حذف القائمة' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل في حذف القائمة', error: error.message });
  }
};

// ==================== SETTINGS ====================

/**
 * الحصول على إعدادات البرودكاست
 */
exports.getSettings = async (req, res) => {
  try {
    console.log('⚙️ [GET SETTINGS] بدء جلب إعدادات البرودكاست');
    const companyId = req.user.companyId;
    console.log(`🔍 [GET SETTINGS] معرف الشركة: ${companyId}`);

    console.log('🔍 [GET SETTINGS] البحث عن الإعدادات الحالية');
    let settings = await getSharedPrismaClient().broadcastSettings.findUnique({
      where: { companyId }
    });

    // إنشاء إعدادات افتراضية إذا لم تكن موجودة
    if (!settings) {
      console.log('📝 [GET SETTINGS] لم يتم العثور على إعدادات، إنشاء إعدادات افتراضية');
      settings = await getSharedPrismaClient().broadcastSettings.create({
        data: {
          companyId,
          defaultSendTime: '10:00',
          timezone: 'Asia/Riyadh',
          maxRecipientsPerCampaign: 5000,
          maxCampaignsPerDay: 10,
          enableDeliveryReports: true,
          enableOpenTracking: true,
          enableClickTracking: true,
          enableUnsubscribeTracking: true,
          notifyOnCampaignSent: true,
          notifyOnHighUnsubscribeRate: true,
          notifyOnLowDeliveryRate: true,
          requireApprovalForHighVolume: false,
          highVolumeThreshold: 1000,
          enableContentFiltering: false,
          blockedWords: [],
          messagesPerMinute: 60,
          messagesPerHour: 1000,
          messagesPerDay: 10000,
          unsubscribeText: 'للإلغاء اكتب STOP'
        }
      });
      console.log('✅ [GET SETTINGS] تم إنشاء الإعدادات الافتراضية بنجاح');
    } else {
      console.log('📋 [GET SETTINGS] تم العثور على الإعدادات الحالية');
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('❌ [GET SETTINGS] خطأ في جلب الإعدادات:', error.message);
    console.error('🔍 [GET SETTINGS] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإعدادات',
      error: error.message
    });
  }
};

/**
 * تحديث إعدادات البرودكاست
 */
exports.updateSettings = async (req, res) => {
  try {
    console.log('🔧 [UPDATE SETTINGS] بدء تحديث إعدادات البرودكاست');
    const companyId = req.user.companyId;
    const updateData = req.body;
    console.log(`🔍 [UPDATE SETTINGS] معرف الشركة: ${companyId}`);
    console.log('📝 [UPDATE SETTINGS] بيانات التحديث:', Object.keys(updateData));

    console.log('🔍 [UPDATE SETTINGS] التحقق من وجود الإعدادات');
    // التحقق من وجود الإعدادات
    let settings = await getSharedPrismaClient().broadcastSettings.findUnique({
      where: { companyId }
    });

    if (!settings) {
      console.log('📝 [UPDATE SETTINGS] إنشاء إعدادات جديدة');
      // إنشاء إعدادات جديدة
      settings = await getSharedPrismaClient().broadcastSettings.create({
        data: {
          companyId,
          ...updateData
        }
      });
      console.log('✅ [UPDATE SETTINGS] تم إنشاء الإعدادات الجديدة بنجاح');
    } else {
      console.log('🔄 [UPDATE SETTINGS] تحديث الإعدادات الموجودة');
      // تحديث الإعدادات الموجودة
      settings = await getSharedPrismaClient().broadcastSettings.update({
        where: { companyId },
        data: updateData
      });
      console.log('✅ [UPDATE SETTINGS] تم تحديث الإعدادات بنجاح');
    }

    res.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      data: settings
    });

  } catch (error) {
    console.error('❌ [UPDATE SETTINGS] خطأ في تحديث الإعدادات:', error.message);
    console.error('🔍 [UPDATE SETTINGS] تفاصيل الخطأ:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الإعدادات',
      error: error.message
    });
  }
};

/**
 * معاينة حجم الجمهور المحسوب للحملة
 */
exports.previewCampaignAudience = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const {
      audienceMode = 'fixed',
      audienceListId,
      audienceCriteria,
      manualPhones,
      onlyNew = false,
      maxRecipients = 500,
      campaignId,
    } = req.body;

    const { previewAudience } = require('../services/broadcastAudienceResolver');
    const preview = await previewAudience({
      prisma: getSharedPrismaClient(),
      companyId,
      audienceMode,
      audienceListId,
      audienceCriteria,
      manualPhones,
      onlyNew: onlyNew === true || onlyNew === 'true',
      maxRecipients: Number(maxRecipients) || 500,
      campaignId,
    });

    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    console.error('❌ [PREVIEW AUDIENCE] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'فشل في حساب معاينة الجمهور',
      error: error.message,
    });
  }
};

/**
 * الحصول على سجل تشغيلات الحملة (Run Log)
 */
exports.getCampaignRuns = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { campaignId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const campaign = await getSharedPrismaClient().broadcastCampaign.findFirst({
      where: { id: campaignId, companyId },
      select: { id: true },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'الحملة غير موجودة',
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [runs, total] = await Promise.all([
      getSharedPrismaClient().broadcastCampaignRun.findMany({
        where: { campaignId },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      getSharedPrismaClient().broadcastCampaignRun.count({
        where: { campaignId },
      }),
    ]);

    // "وصل" is tracked per recipient: the Meta status callbacks stamp
    // BroadcastRecipient.deliveredAt and do NOT flip status, so count on deliveredAt.
    const runIds = runs.map((r) => r.id);
    const deliveryByRun = {};
    const ensure = (id) => {
      if (!deliveryByRun[id]) deliveryByRun[id] = { total: 0, delivered: 0, failed: 0 };
      return deliveryByRun[id];
    };

    if (runIds.length > 0) {
      const [allByRun, deliveredByRunRows, failedByRunRows] = await Promise.all([
        getSharedPrismaClient().broadcastRecipient.groupBy({
          by: ['runId'],
          where: { campaignId, runId: { in: runIds } },
          _count: { _all: true },
        }),
        getSharedPrismaClient().broadcastRecipient.groupBy({
          by: ['runId'],
          where: { campaignId, runId: { in: runIds }, deliveredAt: { not: null } },
          _count: { _all: true },
        }),
        getSharedPrismaClient().broadcastRecipient.groupBy({
          by: ['runId'],
          where: { campaignId, runId: { in: runIds }, status: 'failed' },
          _count: { _all: true },
        }),
      ]);

      (allByRun || []).forEach((g) => {
        if (g.runId) ensure(g.runId).total = g._count?._all || 0;
      });
      (deliveredByRunRows || []).forEach((g) => {
        if (g.runId) ensure(g.runId).delivered = g._count?._all || 0;
      });
      (failedByRunRows || []).forEach((g) => {
        if (g.runId) ensure(g.runId).failed = g._count?._all || 0;
      });
    }

    const enrichedRuns = runs.map((r) => {
      const agg = deliveryByRun[r.id];
      if (!agg) return r;
      return {
        ...r,
        audienceCount: agg.total || r.audienceCount,
        sentCount: Math.max(0, agg.total - agg.failed),
        deliveredCount: agg.delivered,
        failedCount: agg.failed,
      };
    });

    res.json({
      success: true,
      data: {
        runs: enrichedRuns,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('❌ [GET CAMPAIGN RUNS] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب سجل تشغيلات الحملة',
      error: error.message,
    });
  }
};
