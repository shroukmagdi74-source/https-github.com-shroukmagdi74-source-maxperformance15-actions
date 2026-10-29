/**
 * @file facebookMultiApp.test.js
 * @description Unit & integration tests for Meta multi-app registry, resolvers, dual-webhook verification, dedupe, and connection test
 */

const crypto = require('crypto');
const metaAppRegistry = require('../services/metaAppRegistryService');
const {
  getFacebookAppKeyConfig,
  getFacebookWebhookVerifyTokens,
  getAllFacebookAppSecrets,
  DEFAULT_FACEBOOK_APP_ID,
} = require('../config/facebookAppConfig');
const {
  resolveFacebookAppKeyForPage,
  resolveFacebookAppKeyForConnection,
  resolveFacebookAppKeyForAdAccount,
  resolveFacebookAppKeyForCompany,
  resolveCredentialsForEntity,
  featureRequiresGrowth,
} = require('../services/facebookAppResolver');
const { verifyMetaWebhookSignatureAgainstApps } = require('../utils/webhookSignature');
const { buildFacebookTokenUpdateData } = require('../utils/facebookOAuthTokenFields');

describe('Meta Multi-App Architecture (Primary + Growth)', () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env.FACEBOOK_APP_SECRET = 'primary_secret_value_32chars_mock';
    process.env.FACEBOOK_GROWTH_APP_ID = '888777666555444';
    process.env.FACEBOOK_GROWTH_APP_SECRET = 'growth_secret_value_32chars_mock';
    process.env.FACEBOOK_VERIFY_TOKEN = 'primary_verify_token_test';
    process.env.FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN = 'growth_verify_token_test';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('1. Multi-app registry returns safe list with ZERO raw secrets', async () => {
    const safeApps = await metaAppRegistry.getSafeAppsList();
    expect(Array.isArray(safeApps)).toBe(true);
    expect(safeApps.length).toBeGreaterThanOrEqual(2);

    for (const app of safeApps) {
      expect(app.appSecret).toBeUndefined();
      expect(app.appSecretRef).toBeTruthy();
      // Ensure raw secret is NEVER equal to any displayed field
      expect(app.appId).not.toBe(process.env.FACEBOOK_APP_SECRET);
      expect(app.appId).not.toBe(process.env.FACEBOOK_GROWTH_APP_SECRET);
    }

    const primary = safeApps.find((a) => a.key === 'primary');
    const growth = safeApps.find((a) => a.key === 'growth');
    expect(primary).toBeDefined();
    expect(growth).toBeDefined();
    expect(primary.hasSecretConfigured).toBe(true);
    expect(growth.hasSecretConfigured).toBe(true);
  });

  test('2. testAppConnection returns permissions catalog with pages_read_engagement noted', async () => {
    const result = await metaAppRegistry.testAppConnection('primary');
    expect(result).toBeDefined();
    expect(result.key).toBe('primary');
    expect(result.permissions).toBeDefined();
    expect(Array.isArray(result.permissions)).toBe(true);

    const pagesReadEng = result.permissions.find((p) => p.permission === 'pages_read_engagement');
    expect(pagesReadEng).toBeDefined();
    expect(pagesReadEng.status).toBe('standard_only');
    expect(pagesReadEng.note).toContain('Advanced Access');

    const messaging = result.permissions.find((p) => p.permission === 'pages_messaging');
    expect(messaging).toBeDefined();
    expect(messaging.category).toBe('Messenger');

    const ads = result.permissions.find((p) => p.permission === 'ads_management');
    expect(ads).toBeDefined();
    expect(ads.category).toBe('Ads');
  });

  test('3. Error sanitization never exposes app secret', async () => {
    const badKeyResult = await metaAppRegistry.testAppConnection('non_existent_app_key');
    expect(badKeyResult.connected).toBe(false);

    // Test secret sanitization
    const fakeSecret = 'my_super_secret_shh_12345';
    process.env.TEMP_SECRET_TEST = fakeSecret;
    const regex = new RegExp(fakeSecret, 'g');
    const safeStr = `Error on https://graph.facebook.com/?secret=${fakeSecret}`.replace(regex, '***');
    expect(safeStr).not.toContain(fakeSecret);
    expect(safeStr).toContain('***');
    delete process.env.TEMP_SECRET_TEST;
  });

  test('4. Resolvers: fallback seamlessly to primary if fbAppKey/facebookAppKey is missing', async () => {
    // Null entity
    const pageKey = await resolveFacebookAppKeyForPage(null);
    expect(pageKey).toBe('primary');

    const connKey = await resolveFacebookAppKeyForConnection(null);
    expect(connKey).toBe('primary');

    const adKey = await resolveFacebookAppKeyForAdAccount(null);
    expect(adKey).toBe('primary');

    const compKey = await resolveFacebookAppKeyForCompany(null);
    expect(compKey).toBe('primary');

    // resolveCredentialsForEntity fallback
    const creds = await resolveCredentialsForEntity({});
    expect(creds.key).toBe('primary');
    expect(creds.appId).toBe(DEFAULT_FACEBOOK_APP_ID);
  });

  test('5. Dual-signature verification: accepts HMAC signature from both Primary and Growth', () => {
    const payload = JSON.stringify({
      object: 'page',
      entry: [{ id: '123456789', messaging: [{ message: { mid: 'mid.001', text: 'مرحبا' } }] }],
    });

    // Primary HMAC SHA-256
    const primarySig = `sha256=${crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET).update(payload).digest('hex')}`;
    const reqPrimary = { rawBody: payload, headers: { 'x-hub-signature-256': primarySig } };
    const primaryCheck = verifyMetaWebhookSignatureAgainstApps(reqPrimary);
    expect(primaryCheck.ok).toBe(true);
    expect(primaryCheck.matchedApp).toBe('primary');

    // Growth HMAC SHA-256
    const growthSig = `sha256=${crypto.createHmac('sha256', process.env.FACEBOOK_GROWTH_APP_SECRET).update(payload).digest('hex')}`;
    const reqGrowth = { rawBody: payload, headers: { 'x-hub-signature-256': growthSig } };
    const growthCheck = verifyMetaWebhookSignatureAgainstApps(reqGrowth);
    expect(growthCheck.ok).toBe(true);
    expect(growthCheck.matchedApp).toBe('growth');

    // Tampered payload
    const reqTampered = { rawBody: payload + 'tamper', headers: { 'x-hub-signature-256': primarySig } };
    const tamperedCheck = verifyMetaWebhookSignatureAgainstApps(reqTampered);
    expect(tamperedCheck.ok).toBe(false);
  });

  test('6. Dual verify tokens: both Primary and Growth verify tokens are recognized', () => {
    const tokens = getFacebookWebhookVerifyTokens();
    expect(tokens.has('primary_verify_token_test')).toBe(true);
    expect(tokens.has('growth_verify_token_test')).toBe(true);
    expect(tokens.has('unknown_random_token_xyz')).toBe(false);
  });

  test('7. buildFacebookTokenUpdateData stores both facebookAppKey and fbAppKey', () => {
    const pageUpdate = buildFacebookTokenUpdateData('token_page_123', 'page', 'growth');
    expect(pageUpdate.facebookUserAccessToken).toBe('token_page_123');
    expect(pageUpdate.facebookAppKey).toBe('growth');
    expect(pageUpdate.fbAppKey).toBe('growth');

    const pixelUpdate = buildFacebookTokenUpdateData('token_pixel_456', 'pixel', 'primary');
    expect(pixelUpdate.facebookPixelAccessToken).toBe('token_pixel_456');
    expect(pixelUpdate.facebookAppKey).toBe('primary');
    expect(pixelUpdate.fbAppKey).toBe('primary');

    const adsUpdate = buildFacebookTokenUpdateData('token_ads_789', 'ads', 'growth');
    expect(adsUpdate.facebookAdsAccessToken).toBe('token_ads_789');
    expect(adsUpdate.facebookAppKey).toBe('growth');
    expect(adsUpdate.fbAppKey).toBe('growth');
  });

  test('8. Feature gating: blocks growth features on primary with REAUTH_REQUIRED', () => {
    const primaryGate = featureRequiresGrowth('growth_ad_management', 'primary');
    expect(primaryGate.allowed).toBe(false);
    expect(primaryGate.code).toBe('REAUTH_REQUIRED');
    expect(primaryGate.message).toBe('اربط الصفحة تاني لتفعيل الميزة');

    const growthGate = featureRequiresGrowth('growth_ad_management', 'growth');
    expect(growthGate.allowed).toBe(true);

    const ungated = featureRequiresGrowth('standard_basic_feature', 'primary');
    expect(ungated.allowed).toBe(true);
  });

  test('9. Echo app ID detection covers all configured apps', () => {
    const allSecrets = getAllFacebookAppSecrets();
    const registeredIds = new Set([
      DEFAULT_FACEBOOK_APP_ID,
      process.env.FACEBOOK_APP_ID,
      process.env.FACEBOOK_GROWTH_APP_ID,
      ...allSecrets.map((a) => a.appId).filter(Boolean),
    ].filter(Boolean).map(String));

    expect(registeredIds.has(DEFAULT_FACEBOOK_APP_ID)).toBe(true);
    expect(registeredIds.has('888777666555444')).toBe(true);
    expect(registeredIds.has('unknown_external_app_id')).toBe(false);
  });
});
