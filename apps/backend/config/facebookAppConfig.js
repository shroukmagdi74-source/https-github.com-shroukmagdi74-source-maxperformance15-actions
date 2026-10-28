const fs = require("fs");
const path = require("path");

const envConfig = require("./environment");

const DEFAULT_FACEBOOK_APP_ID = "762328696481583";
const DEFAULT_FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const FACEBOOK_LOGIN_CONFIG_ID = "2158986791329815";
// NOTE: Hardcoded fallback removed — single source of truth is facebook-oauth-config.json (managed via /super-admin/facebook-oauth)
const FACEBOOK_OAUTH_CONFIG_PATH = path.resolve(
  __dirname,
  "../data/facebook-oauth-config.json",
);

const PLACEHOLDER_PATTERNS = [
  /^$/,
  /^configured$/i,
  /^your[-_]/i,
  /^your-production-facebook-app-/i,
  /^your-facebook-app-/i,
];

const normalizeCredential = (value) =>
  typeof value === "string" ? value.trim() : "";

const isPlaceholderFacebookCredential = (value) => {
  const normalized = normalizeCredential(value);
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized));
};

const chooseCredential = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = normalizeCredential(candidate);
    if (normalized && !isPlaceholderFacebookCredential(normalized)) {
      return normalized;
    }
  }
  return "";
};

const buildFacebookBackendCallbackUrl = (type = "page") =>
  new URL(
    type === "pixel"
      ? "/api/v1/facebook-oauth/pixel-callback"
      : "/api/v1/facebook-oauth/callback",
    `${envConfig.backendUrl}/`,
  ).toString();

const getStoredFacebookOAuthConfig = () => {
  try {
    if (!fs.existsSync(FACEBOOK_OAUTH_CONFIG_PATH)) {
      return null;
    }

    const raw = fs.readFileSync(FACEBOOK_OAUTH_CONFIG_PATH, "utf8");
    if (!raw.trim()) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.error("❌ Failed to read Facebook OAuth config:", error.message);
    return null;
  }
};

const saveFacebookOAuthConfig = (config) => {
  const payload = {
    appId: normalizeCredential(config?.appId),
    appSecret: normalizeCredential(config?.appSecret),
    redirectUri: normalizeCredential(config?.redirectUri),
    facebookWebhookVerifyToken: normalizeCredential(
      config?.facebookWebhookVerifyToken || config?.webhookVerifyToken
    ),
    whatsappAppId: normalizeCredential(config?.whatsappAppId),
    whatsappAppSecret: normalizeCredential(config?.whatsappAppSecret),
    whatsappConfigId: normalizeCredential(config?.whatsappConfigId),
    whatsappWebhookVerifyToken: normalizeCredential(config?.whatsappWebhookVerifyToken),
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(FACEBOOK_OAUTH_CONFIG_PATH), { recursive: true });
  fs.writeFileSync(
    FACEBOOK_OAUTH_CONFIG_PATH,
    JSON.stringify(payload, null, 2),
    "utf8",
  );

  return payload;
};

const getFacebookOAuthConfig = () => {
  const stored = getStoredFacebookOAuthConfig() || {};

  return {
    appId: chooseCredential(stored.appId, process.env.FACEBOOK_APP_ID),
    appSecret: chooseCredential(stored.appSecret, process.env.FACEBOOK_APP_SECRET),
    redirectUri:
      normalizeCredential(stored.redirectUri) ||
      buildFacebookBackendCallbackUrl("page"),
    configId: normalizeCredential(stored.configId || FACEBOOK_LOGIN_CONFIG_ID),
    facebookWebhookVerifyToken:
      normalizeCredential(stored.facebookWebhookVerifyToken) ||
      normalizeCredential(process.env.FACEBOOK_VERIFY_TOKEN) ||
      normalizeCredential(process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) ||
      "61d94df61ed00ab77e2a7e2c15458d7ce9ec8abc4520a6a83f0b483829617314",
    whatsappAppId: chooseCredential(stored.whatsappAppId),
    whatsappAppSecret: chooseCredential(stored.whatsappAppSecret),
    whatsappConfigId: normalizeCredential(stored.whatsappConfigId),
    whatsappWebhookVerifyToken: normalizeCredential(stored.whatsappWebhookVerifyToken),
  };
};

const getFacebookRedirectUri = (type = "page") =>
  type === "pixel"
    ? buildFacebookBackendCallbackUrl("pixel")
    : getFacebookOAuthConfig().redirectUri;

const getFacebookAppSecret = () =>
  getFacebookOAuthConfig().appSecret;

const getFacebookConfigId = () =>
  getFacebookOAuthConfig().configId;

/**
 * جلب إعدادات تطبيق فيسبوك بحسب المفتاح ('primary' أو 'growth')
 * مع التراجع التلقائي إلى primary إذا لم يكن growth مضبوطاً
 * @param {string} [key='primary']
 * @returns {{ appId: string, appSecret: string, loginConfigId: string }}
 */
const getFacebookAppKeyConfig = (key = "primary") => {
  const normalizedKey = String(key || "primary").trim().toLowerCase();
  const primaryOAuth = getFacebookOAuthConfig();
  const primaryConfig = {
    appId: primaryOAuth.appId,
    appSecret: primaryOAuth.appSecret,
    loginConfigId: primaryOAuth.configId,
  };

  if (normalizedKey === "growth") {
    const growthAppId = chooseCredential(process.env.FACEBOOK_GROWTH_APP_ID);
    const growthAppSecret = chooseCredential(process.env.FACEBOOK_GROWTH_APP_SECRET);
    const growthLoginConfigId = normalizeCredential(process.env.FACEBOOK_GROWTH_LOGIN_CONFIG_ID);

    // الرجوع إلى primary كـ fallback إذا لم يكن معرف تطبيق النمو مضبوطاً
    if (!growthAppId || isPlaceholderFacebookCredential(growthAppId)) {
      return primaryConfig;
    }

    return {
      appId: growthAppId,
      appSecret: growthAppSecret || primaryConfig.appSecret,
      loginConfigId: growthLoginConfigId || primaryConfig.loginConfigId,
    };
  }

  return primaryConfig;
};

module.exports = {
  DEFAULT_FACEBOOK_APP_ID,
  FACEBOOK_OAUTH_CONFIG_PATH,
  FACEBOOK_LOGIN_CONFIG_ID,
  buildFacebookBackendCallbackUrl,
  getFacebookAppKeyConfig,
  getFacebookAppSecret,
  getFacebookConfigId,
  getFacebookOAuthConfig,
  getFacebookRedirectUri,
  getStoredFacebookOAuthConfig,
  isPlaceholderFacebookCredential,
  saveFacebookOAuthConfig,
};
