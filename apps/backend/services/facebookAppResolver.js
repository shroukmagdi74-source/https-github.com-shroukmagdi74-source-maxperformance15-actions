/**
 * @file facebookAppResolver.js
 * @description خدمة تحديد تطبيق فيسبوك المناسب لكل مورد (Primary أو Growth)
 * تدعم الصفحات، اتصالات الحسابات، وحسابات الإعلانات، مع منع استدعاء getFacebookAppSecret مباشرة.
 */

const sharedDatabase = require('./sharedDatabase');
const { getFacebookAppKeyConfig, getFacebookRedirectUri } = require('../config/facebookAppConfig');
const { featureRequiresGrowth } = require('./metaAppRegistryService');

/**
 * استرجاع مفتاح تطبيق فيسبوك المرتبط بصفحة معينة
 * @param {string} pageId - معرّف صفحة فيسبوك أو معرّف السجل
 * @returns {Promise<string>} مفتاح التطبيق ('primary' كافتراضي)
 */
async function resolveFacebookAppKeyForPage(pageId) {
  if (!pageId) {
    return 'primary';
  }

  try {
    const prisma = sharedDatabase.getSharedPrismaClient();
    if (!prisma?.facebookPage?.findFirst && !prisma?.facebookPage?.findUnique) {
      return 'primary';
    }

    const page = await prisma.facebookPage.findFirst({
      where: {
        OR: [
          { pageId: String(pageId) },
          { id: String(pageId) }
        ]
      },
      select: {
        facebookAppKey: true
      }
    });

    const appKey = page?.facebookAppKey ? String(page.facebookAppKey).trim().toLowerCase() : null;
    return appKey || 'primary';
  } catch (error) {
    console.warn(`[FACEBOOK-APP-RESOLVER] تعذر قراءة facebookAppKey للصفحة ${pageId}:`, error.message);
    return 'primary';
  }
}

/**
 * استرجاع مفتاح تطبيق فيسبوك المرتبط باتصال حساب شخصي
 * @param {string} connectionId - معرّف اتصال الحساب
 * @returns {Promise<string>} مفتاح التطبيق ('primary' كافتراضي)
 */
async function resolveFacebookAppKeyForConnection(connectionId) {
  if (!connectionId) {
    return 'primary';
  }

  try {
    const prisma = sharedDatabase.getSharedPrismaClient();
    if (!prisma?.facebookAccountConnection?.findFirst && !prisma?.facebookAccountConnection?.findUnique) {
      return 'primary';
    }

    const connection = await prisma.facebookAccountConnection.findFirst({
      where: {
        OR: [
          { id: String(connectionId) },
          { facebookUserId: String(connectionId) }
        ]
      },
      select: {
        facebookAppKey: true
      }
    });

    const appKey = connection?.facebookAppKey ? String(connection.facebookAppKey).trim().toLowerCase() : null;
    return appKey || 'primary';
  } catch (error) {
    console.warn(`[FACEBOOK-APP-RESOLVER] تعذر قراءة facebookAppKey للاتصال ${connectionId}:`, error.message);
    return 'primary';
  }
}

/**
 * استرجاع مفتاح تطبيق فيسبوك المرتبط بحساب إعلاني
 * @param {string} adAccountId - معرّف الحساب الإعلاني
 * @returns {Promise<string>} مفتاح التطبيق ('primary' كافتراضي)
 */
async function resolveFacebookAppKeyForAdAccount(adAccountId) {
  if (!adAccountId) {
    return 'primary';
  }

  try {
    const prisma = sharedDatabase.getSharedPrismaClient();
    if (!prisma?.facebookAdAccount?.findFirst && !prisma?.facebookAdAccount?.findUnique) {
      return 'primary';
    }

    const adAccount = await prisma.facebookAdAccount.findFirst({
      where: {
        OR: [
          { id: String(adAccountId) },
          { accountId: String(adAccountId) }
        ]
      },
      select: {
        facebookAppKey: true
      }
    });

    const appKey = adAccount?.facebookAppKey ? String(adAccount.facebookAppKey).trim().toLowerCase() : null;
    return appKey || 'primary';
  } catch (error) {
    console.warn(`[FACEBOOK-APP-RESOLVER] تعذر قراءة facebookAppKey للحساب الإعلاني ${adAccountId}:`, error.message);
    return 'primary';
  }
}

/**
 * جلب إعدادات OAuth الكاملة لتطبيق فيسبوك المرتبط بصفحة معينة
 * @param {string} pageId - معرّف صفحة فيسبوك
 * @returns {Promise<{ appId: string, appSecret: string, loginConfigId: string, key: string, redirectUri: string }>}
 */
async function getOAuthConfigForPage(pageId) {
  const key = await resolveFacebookAppKeyForPage(pageId);
  const appConfig = getFacebookAppKeyConfig(key);

  return {
    ...appConfig,
    key,
    redirectUri: getFacebookRedirectUri('page')
  };
}

/**
 * جلب إعدادات التطبيق الموحدة لمورد معين (صفحة، اتصال، أو حساب إعلاني)
 * هذا هو الممر المعتمد الوحيد لكافة استدعاءات Graph API
 * @param {{ pageId?: string, connectionId?: string, adAccountId?: string, appKey?: string }} params
 * @returns {Promise<{ key: string, appId: string, appSecret: string, loginConfigId: string, redirectUri: string }>}
 */
async function resolveCredentialsForEntity({ pageId, connectionId, adAccountId, appKey }) {
  let resolvedKey = appKey;

  if (!resolvedKey && pageId) {
    resolvedKey = await resolveFacebookAppKeyForPage(pageId);
  } else if (!resolvedKey && connectionId) {
    resolvedKey = await resolveFacebookAppKeyForConnection(connectionId);
  } else if (!resolvedKey && adAccountId) {
    resolvedKey = await resolveFacebookAppKeyForAdAccount(adAccountId);
  }

  const key = String(resolvedKey || 'primary').trim().toLowerCase();
  const config = getFacebookAppKeyConfig(key);

  return {
    ...config,
    key,
    redirectUri: getFacebookRedirectUri('page')
  };
}

module.exports = {
  resolveFacebookAppKeyForPage,
  resolveFacebookAppKeyForConnection,
  resolveFacebookAppKeyForAdAccount,
  getOAuthConfigForPage,
  resolveCredentialsForEntity,
  featureRequiresGrowth
};
