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
        facebookAppKey: true,
        fbAppKey: true
      }
    });

    const rawKey = page?.fbAppKey || page?.facebookAppKey;
    const appKey = rawKey ? String(rawKey).trim().toLowerCase() : null;
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
        facebookAppKey: true,
        fbAppKey: true
      }
    });

    const rawKey = connection?.fbAppKey || connection?.facebookAppKey;
    const appKey = rawKey ? String(rawKey).trim().toLowerCase() : null;
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
        facebookAppKey: true,
        fbAppKey: true
      }
    });

    const rawKey = adAccount?.fbAppKey || adAccount?.facebookAppKey;
    const appKey = rawKey ? String(rawKey).trim().toLowerCase() : null;
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
 * استرجاع مفتاح تطبيق فيسبوك المرتبط بشركة معينة
 * @param {string} companyId - معرّف الشركة
 * @returns {Promise<string>} مفتاح التطبيق ('primary' كافتراضي)
 */
async function resolveFacebookAppKeyForCompany(companyId) {
  if (!companyId) {
    return 'primary';
  }

  try {
    const prisma = sharedDatabase.getSharedPrismaClient();
    if (!prisma?.company?.findUnique && !prisma?.company?.findFirst) {
      return 'primary';
    }

    const company = await prisma.company.findUnique({
      where: { id: String(companyId) },
      select: {
        facebookAppKey: true,
        fbAppKey: true
      }
    });

    const rawKey = company?.fbAppKey || company?.facebookAppKey;
    const appKey = rawKey ? String(rawKey).trim().toLowerCase() : null;
    return appKey || 'primary';
  } catch (error) {
    console.warn(`[FACEBOOK-APP-RESOLVER] تعذر قراءة facebookAppKey للشركة ${companyId}:`, error.message);
    return 'primary';
  }
}

/**
 * جلب إعدادات تطبيق فيسبوك بحسب المفتاح الصريح أو المورد
 * @param {{ pageId?: string, connectionId?: string, adAccountId?: string, companyId?: string, appKey?: string }} params
 * @returns {Promise<{ key: string, appId: string, appSecret: string, loginConfigId: string, redirectUri: string }>}
 */
async function resolveCredentialsForEntity({ pageId, connectionId, adAccountId, companyId, appKey }) {
  let resolvedKey = appKey;

  if (!resolvedKey && pageId) {
    resolvedKey = await resolveFacebookAppKeyForPage(pageId);
  } else if (!resolvedKey && connectionId) {
    resolvedKey = await resolveFacebookAppKeyForConnection(connectionId);
  } else if (!resolvedKey && adAccountId) {
    resolvedKey = await resolveFacebookAppKeyForAdAccount(adAccountId);
  } else if (!resolvedKey && companyId) {
    resolvedKey = await resolveFacebookAppKeyForCompany(companyId);
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
  resolveFacebookAppKeyForCompany,
  getOAuthConfigForPage,
  resolveCredentialsForEntity,
  featureRequiresGrowth
};
