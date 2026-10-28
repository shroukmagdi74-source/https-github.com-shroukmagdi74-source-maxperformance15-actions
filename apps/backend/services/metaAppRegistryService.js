/**
 * @file metaAppRegistryService.js
 * @description خدمة إدارة وسجل تطبيقات Meta (Primary + Growth)
 * تدعم جلب الإعدادات من قاعدة البيانات أو البيئة، مع تخزين مراجع الأسرار فقط (Ref)
 * وحظر طباعة أو تخزين أسرار التطبيقات كنص خام في قاعدة البيانات أو اللوج.
 */

const sharedDatabase = require('./sharedDatabase');
const {
  DEFAULT_FACEBOOK_APP_ID,
  FACEBOOK_LOGIN_CONFIG_ID,
  getFacebookOAuthConfig,
  isPlaceholderFacebookCredential
} = require('../config/facebookAppConfig');

const PRIMARY_APP_KEY = 'primary';
const GROWTH_APP_KEY = 'growth';

function getPrismaClient() {
  try {
    return sharedDatabase.getSharedPrismaClient();
  } catch {
    return null;
  }
}

/**
 * جلب السر الخاص بالتطبيق من متغيرات البيئة عبر المرجع
 * @param {string} secretRef
 * @returns {string}
 */
function resolveSecretFromRef(secretRef) {
  if (!secretRef || typeof secretRef !== 'string') return '';
  const val = process.env[secretRef.trim()];
  return typeof val === 'string' ? val.trim() : '';
}

/**
 * جلب رمز تحقق الويب هوك الخاص بالتطبيق من متغيرات البيئة عبر المرجع
 * @param {string} tokenRef
 * @returns {string}
 */
function resolveVerifyTokenFromRef(tokenRef) {
  if (!tokenRef || typeof tokenRef !== 'string') return '';
  const val = process.env[tokenRef.trim()];
  return typeof val === 'string' ? val.trim() : '';
}

/**
 * جلب قائمة التطبيقات الافتراضية المبنية على متغيرات البيئة والإعدادات الحالية
 * تُستخدم كـ fallback عندما لا تحتوي قاعدة البيانات على صفوف أو عند عدم توفرها.
 * @returns {Array<Object>}
 */
function getDefaultAppsDefinition() {
  const primaryOAuth = getFacebookOAuthConfig();

  const growthAppId = (process.env.FACEBOOK_GROWTH_APP_ID || '').trim();
  const growthConfigId = (process.env.FACEBOOK_GROWTH_LOGIN_CONFIG_ID || '').trim();

  return [
    {
      key: PRIMARY_APP_KEY,
      appId: primaryOAuth.appId || DEFAULT_FACEBOOK_APP_ID,
      appSecretRef: 'FACEBOOK_APP_SECRET',
      configId: primaryOAuth.configId || FACEBOOK_LOGIN_CONFIG_ID,
      webhookVerifyTokenRef: 'FACEBOOK_WEBHOOK_VERIFY_TOKEN',
      isActive: true,
      label: 'Primary App',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      key: GROWTH_APP_KEY,
      appId: growthAppId || 'growth-facebook-app-id',
      appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
      configId: growthConfigId || '',
      webhookVerifyTokenRef: 'FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN',
      isActive: process.env.META_GROWTH_ACTIVE !== 'false',
      label: 'Growth App',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

/**
 * جلب جميع تطبيقات Meta المسجلة (من قاعدة البيانات مع الرجوع للبيئة)
 * @returns {Promise<Array<Object>>}
 */
async function getAllApps() {
  const defaultApps = getDefaultAppsDefinition();

  try {
    const prisma = getPrismaClient();
    if (prisma?.facebookApp?.findMany) {
      const dbApps = await prisma.facebookApp.findMany({
        orderBy: { createdAt: 'asc' }
      });

      if (Array.isArray(dbApps) && dbApps.length > 0) {
        return dbApps.map((dbApp) => {
          const key = String(dbApp.key || PRIMARY_APP_KEY).trim().toLowerCase();
          const secretRef = dbApp.appSecretRef || (key === GROWTH_APP_KEY ? 'FACEBOOK_GROWTH_APP_SECRET' : 'FACEBOOK_APP_SECRET');
          const tokenRef = dbApp.webhookVerifyTokenRef || (key === GROWTH_APP_KEY ? 'FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN' : 'FACEBOOK_WEBHOOK_VERIFY_TOKEN');

          const resolvedSecret = resolveSecretFromRef(secretRef) || (key === PRIMARY_APP_KEY ? getFacebookOAuthConfig().appSecret : '');
          const resolvedVerifyToken = resolveVerifyTokenFromRef(tokenRef) || (key === PRIMARY_APP_KEY ? getFacebookOAuthConfig().facebookWebhookVerifyToken : '');

          return {
            id: dbApp.id,
            key,
            appId: dbApp.appId,
            appSecretRef: secretRef,
            appSecret: resolvedSecret,
            configId: dbApp.configId || (key === PRIMARY_APP_KEY ? FACEBOOK_LOGIN_CONFIG_ID : ''),
            webhookVerifyTokenRef: tokenRef,
            webhookVerifyToken: resolvedVerifyToken,
            isActive: Boolean(dbApp.isActive),
            createdAt: dbApp.createdAt,
            updatedAt: dbApp.updatedAt
          };
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ [META-APP-REGISTRY] تعذر قراءة facebook_apps من قاعدة البيانات، استخدام الافتراضي:', err.message);
  }

  // استخدام الافتراضي مع حل الأسرار
  return defaultApps.map((def) => {
    const resolvedSecret = resolveSecretFromRef(def.appSecretRef) || (def.key === PRIMARY_APP_KEY ? getFacebookOAuthConfig().appSecret : '');
    const resolvedVerifyToken = resolveVerifyTokenFromRef(def.webhookVerifyTokenRef) || (def.key === PRIMARY_APP_KEY ? getFacebookOAuthConfig().facebookWebhookVerifyToken : '');

    return {
      ...def,
      appSecret: resolvedSecret,
      webhookVerifyToken: resolvedVerifyToken
    };
  });
}

/**
 * جلب تطبيق محدد بواسطة المفتاح ('primary' أو 'growth')
 * في حال كان التطبيق غير مفعل أو غير موجود، يرجع fallback للتطبيق الأساسي
 * @param {string} [key='primary']
 * @returns {Promise<Object>}
 */
async function getAppByKey(key = PRIMARY_APP_KEY) {
  const normalizedKey = String(key || PRIMARY_APP_KEY).trim().toLowerCase();
  const apps = await getAllApps();

  const found = apps.find((a) => a.key === normalizedKey);
  if (found) {
    // إذا كان التطبيق معطلاً (isActive === false) وتطلب growth، ارجع fallback الأساسي
    if (!found.isActive && normalizedKey === GROWTH_APP_KEY) {
      console.warn('⚠️ [META-APP-REGISTRY] تطبيق Growth معطّل، الرجوع للتطبيق الأساسي Primary');
      const primary = apps.find((a) => a.key === PRIMARY_APP_KEY);
      return primary || found;
    }
    return found;
  }

  // التراجع للتطبيق الأساسي
  const primary = apps.find((a) => a.key === PRIMARY_APP_KEY);
  return primary || apps[0] || null;
}

/**
 * جلب قائمة التطبيقات الآمنة لشاشة الأدمن بدون كشف الأسرار
 * @returns {Promise<Array<Object>>}
 */
async function getSafeAppsList() {
  const apps = await getAllApps();

  return apps.map((app) => ({
    id: app.id || `app-${app.key}`,
    key: app.key,
    appId: app.appId,
    configId: app.configId || '',
    appSecretRef: app.appSecretRef,
    webhookVerifyTokenRef: app.webhookVerifyTokenRef,
    isActive: Boolean(app.isActive),
    hasSecretConfigured: Boolean(app.appSecret && !isPlaceholderFacebookCredential(app.appSecret)),
    hasVerifyTokenConfigured: Boolean(app.webhookVerifyToken),
    createdAt: app.createdAt,
    updatedAt: app.updatedAt
  }));
}

/**
 * حفظ أو تحديث تطبيق في السجل
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function upsertApp({ key, appId, appSecretRef, configId, webhookVerifyTokenRef, isActive = true }) {
  const normalizedKey = String(key || PRIMARY_APP_KEY).trim().toLowerCase();
  const normalizedAppId = String(appId || '').trim();
  const normalizedSecretRef = String(appSecretRef || '').trim();
  const normalizedConfigId = configId ? String(configId).trim() : null;
  const normalizedTokenRef = webhookVerifyTokenRef ? String(webhookVerifyTokenRef).trim() : null;

  const prisma = getPrismaClient();
  if (!prisma?.facebookApp?.upsert) {
    throw new Error('قاعدة البيانات غير مهيأة لسجل التطبيقات');
  }

  const result = await prisma.facebookApp.upsert({
    where: { key: normalizedKey },
    create: {
      key: normalizedKey,
      appId: normalizedAppId,
      appSecretRef: normalizedSecretRef,
      configId: normalizedConfigId,
      webhookVerifyTokenRef: normalizedTokenRef,
      isActive: Boolean(isActive)
    },
    update: {
      appId: normalizedAppId,
      appSecretRef: normalizedSecretRef,
      configId: normalizedConfigId,
      webhookVerifyTokenRef: normalizedTokenRef,
      isActive: Boolean(isActive)
    }
  });

  return result;
}

/**
 * تفعيل أو تعطيل تطبيق
 * @param {string} key
 * @param {boolean} isActive
 * @returns {Promise<Object>}
 */
async function toggleAppStatus(key, isActive) {
  const normalizedKey = String(key || PRIMARY_APP_KEY).trim().toLowerCase();
  const prisma = getPrismaClient();

  if (prisma?.facebookApp?.update) {
    const updated = await prisma.facebookApp.update({
      where: { key: normalizedKey },
      data: { isActive: Boolean(isActive) }
    });
    return updated;
  }

  throw new Error('قاعدة البيانات غير متوفرة لتعديل حالة التطبيق');
}

/**
 * التأكد من وجود التطبيقات الافتراضية في قاعدة البيانات (Seeding)
 */
async function ensureDefaultAppsSeeded() {
  try {
    const prisma = getPrismaClient();
    if (!prisma?.facebookApp?.findUnique) return;

    const existingPrimary = await prisma.facebookApp.findUnique({
      where: { key: PRIMARY_APP_KEY }
    });

    if (!existingPrimary) {
      const defaults = getDefaultAppsDefinition();
      for (const def of defaults) {
        await prisma.facebookApp.upsert({
          where: { key: def.key },
          create: {
            key: def.key,
            appId: def.appId,
            appSecretRef: def.appSecretRef,
            configId: def.configId,
            webhookVerifyTokenRef: def.webhookVerifyTokenRef,
            isActive: def.isActive
          },
          update: {}
        });
      }
      console.log('✅ [META-APP-REGISTRY] تم تسجيل التطبيقات الافتراضية (Primary + Growth) بنجاح');
    }
  } catch (err) {
    console.warn('⚠️ [META-APP-REGISTRY] خطأ أثناء فحص/زرع التطبيقات الافتراضية:', err.message);
  }
}

/**
 * فحص البوابة (Feature Gating) للميزات التي تتطلب تطبيق Growth
 * إذا كان الاتصال على Primary يرجع كود REAUTH_REQUIRED ورسالة عربية واضحة
 * @param {string} featureName
 * @param {string} currentAppKey
 * @returns {{ allowed: boolean, code?: string, message?: string }}
 */
function featureRequiresGrowth(featureName, currentAppKey = 'primary') {
  const GROWTH_FEATURES = new Set([
    'advanced_messaging_insights',
    'growth_ad_management',
    'wa_cross_copilot',
    'growth_feed_automation',
    'custom_creative_optimization'
  ]);

  if (!GROWTH_FEATURES.has(featureName)) {
    return { allowed: true };
  }

  const normalizedKey = String(currentAppKey || 'primary').trim().toLowerCase();
  if (normalizedKey === GROWTH_APP_KEY) {
    return { allowed: true };
  }

  return {
    allowed: false,
    code: 'REAUTH_REQUIRED',
    message: 'اربط الصفحة تاني لتفعيل الميزة'
  };
}

module.exports = {
  PRIMARY_APP_KEY,
  GROWTH_APP_KEY,
  getAllApps,
  getAppByKey,
  getSafeAppsList,
  upsertApp,
  toggleAppStatus,
  ensureDefaultAppsSeeded,
  featureRequiresGrowth,
  resolveSecretFromRef,
  resolveVerifyTokenFromRef
};
