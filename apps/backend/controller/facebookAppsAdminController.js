/**
 * @file facebookAppsAdminController.js
 * @description وحدة تحكم Super Admin لإدارة تطبيقات فيسبوك (Primary + Growth)
 * تضمن سرية أسرار التطبيقات وعدم إرجاعها كنص خام أبدًا
 */

const metaAppRegistry = require('../services/metaAppRegistryService');

/**
 * جلب قائمة التطبيقات المسجلة بصيغة آمنة
 * GET /api/v1/super-admin/platform/facebook-apps
 */
async function getAppsList(req, res) {
  try {
    await metaAppRegistry.ensureDefaultAppsSeeded();
    const apps = await metaAppRegistry.getSafeAppsList();
    return res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    console.error('❌ [FACEBOOK-APPS-ADMIN] Failed to get apps list:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل استرجاع قائمة تطبيقات فيسبوك',
      message: error.message
    });
  }
}

/**
 * تسجيل أو تحديث تطبيق في السجل
 * POST /api/v1/super-admin/platform/facebook-apps
 */
async function saveApp(req, res) {
  try {
    const { key, appId, appSecretRef, configId, webhookVerifyTokenRef, isActive } = req.body;

    if (!key || !appId || !appSecretRef) {
      return res.status(400).json({
        success: false,
        error: 'الحقول المطلوبة غير مكتملة (key, appId, appSecretRef)'
      });
    }

    if (/^[a-f0-9]{32}$/i.test(String(appSecretRef).trim())) {
      return res.status(400).json({
        success: false,
        error: 'ممنوع إدخال سر التطبيق الفعلي كنص خام! يجب إدخال اسم مرجع متغير البيئة (مثل FACEBOOK_APP_SECRET)'
      });
    }

    const normalizedKey = String(key).trim().toLowerCase();
    if (!['primary', 'growth'].includes(normalizedKey)) {
      return res.status(400).json({
        success: false,
        error: 'مفتاح التطبيق يجب أن يكون إما primary أو growth'
      });
    }

    const result = await metaAppRegistry.upsertApp({
      key: normalizedKey,
      appId,
      appSecretRef,
      configId,
      webhookVerifyTokenRef,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return res.json({
      success: true,
      data: {
        id: result.id,
        key: result.key,
        appId: result.appId,
        appSecretRef: result.appSecretRef,
        configId: result.configId,
        webhookVerifyTokenRef: result.webhookVerifyTokenRef,
        isActive: result.isActive,
        updatedAt: result.updatedAt
      },
      message: 'تم حفظ إعدادات التطبيق بنجاح'
    });
  } catch (error) {
    console.error('❌ [FACEBOOK-APPS-ADMIN] Failed to save app:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل حفظ التطبيق',
      message: error.message
    });
  }
}

/**
 * تبديل حالة تفعيل التطبيق
 * PATCH /api/v1/super-admin/platform/facebook-apps/:key/toggle
 */
async function toggleApp(req, res) {
  try {
    const { key } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: 'حقل isActive مطلوب'
      });
    }

    const normalizedKey = String(key).trim().toLowerCase();
    const result = await metaAppRegistry.toggleAppStatus(normalizedKey, Boolean(isActive));

    return res.json({
      success: true,
      data: {
        key: result.key,
        isActive: result.isActive
      },
      message: `تم ${result.isActive ? 'تفعيل' : 'تعطيل'} تطبيق ${result.key} بنجاح`
    });
  } catch (error) {
    console.error('❌ [FACEBOOK-APPS-ADMIN] Failed to toggle app:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل تغيير حالة التطبيق',
      message: error.message
    });
  }
}

/**
 * جلب حالة جاهزية التطبيقات والصلاحيات
 * GET /api/v1/super-admin/platform/facebook-apps/status
 */
async function getAppsStatus(req, res) {
  try {
    const apps = await metaAppRegistry.getAllApps();
    const statusData = apps.map((app) => ({
      key: app.key,
      appId: app.appId,
      isActive: Boolean(app.isActive),
      hasSecret: Boolean(app.appSecret && app.appSecret.trim().length > 0),
      hasVerifyToken: Boolean(app.webhookVerifyToken && app.webhookVerifyToken.trim().length > 0),
      hasConfigId: Boolean(app.configId && app.configId.trim().length > 0)
    }));

    return res.json({
      success: true,
      data: {
        apps: statusData,
        dualAppsReady: statusData.length >= 2 && statusData.every(a => a.hasSecret)
      }
    });
  } catch (error) {
    console.error('❌ [FACEBOOK-APPS-ADMIN] Failed to get apps status:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل جلب حالة التطبيقات',
      message: error.message
    });
  }
}

module.exports = {
  getAppsList,
  saveApp,
  toggleApp,
  getAppsStatus
};
