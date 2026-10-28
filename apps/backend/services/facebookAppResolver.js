/**
 * @file facebookAppResolver.js
 * @description خدمة تحديد تطبيق فيسبوك المناسب لكل صفحة (Primary أو Growth)
 */

const sharedDatabase = require('./sharedDatabase');
const { getFacebookAppKeyConfig, getFacebookRedirectUri } = require('../config/facebookAppConfig');

/**
 * استرجاع مفتاح تطبيق فيسبوك المرتبط بصفحة معينة
 * @param {string} pageId - معرّف صفحة فيسبوك
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

module.exports = {
  resolveFacebookAppKeyForPage,
  getOAuthConfigForPage
};
