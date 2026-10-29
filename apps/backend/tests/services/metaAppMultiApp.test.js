const crypto = require('crypto');
const metaAppRegistry = require('../../services/metaAppRegistryService');
const {
  getFacebookAppKeyConfig,
  getFacebookWebhookVerifyTokens,
  getAllFacebookAppSecrets,
  isGrowthActive,
  DEFAULT_FACEBOOK_APP_ID
} = require('../../config/facebookAppConfig');
const {
  verifyMetaWebhookSignature,
  verifyMetaWebhookSignatureAgainstApps
} = require('../../utils/webhookSignature');
const {
  resolveFacebookAppKeyForPage,
  resolveFacebookAppKeyForConnection,
  resolveFacebookAppKeyForAdAccount,
  resolveCredentialsForEntity,
  featureRequiresGrowth
} = require('../../services/facebookAppResolver');
const {
  buildFacebookOAuthState,
  decodeFacebookOAuthState,
  buildAdsOAuthState,
  decodeAdsOAuthState
} = require('../../routes/facebookOAuthRoutes');

describe('T13 — Meta Multi-App Architecture (Primary + Growth)', () => {
  const PRIMARY_SECRET = 'test_primary_secret_32chars_mock';
  const GROWTH_SECRET = 'test_growth_secret_32chars_mock';
  const PRIMARY_VERIFY = 'primary_verify_token_123';
  const GROWTH_VERIFY = 'growth_verify_token_456';

  beforeEach(() => {
    process.env.FACEBOOK_APP_SECRET = PRIMARY_SECRET;
    process.env.FACEBOOK_GROWTH_APP_ID = 'growth-app-id-777888';
    process.env.FACEBOOK_GROWTH_APP_SECRET = GROWTH_SECRET;
    process.env.FACEBOOK_VERIFY_TOKEN = PRIMARY_VERIFY;
    process.env.FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN = GROWTH_VERIFY;
    delete process.env.META_GROWTH_ACTIVE;
  });

  afterEach(() => {
    delete process.env.FACEBOOK_GROWTH_APP_ID;
    delete process.env.FACEBOOK_GROWTH_APP_SECRET;
    delete process.env.FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN;
    delete process.env.META_GROWTH_ACTIVE;
  });

  describe('1) App Registry & Vault Secret Refs (Zero raw secret leak)', () => {
    test('resolves apps without returning raw app secrets in getSafeAppsList', async () => {
      const safeApps = await metaAppRegistry.getSafeAppsList();
      expect(Array.isArray(safeApps)).toBe(true);

      const primary = safeApps.find((a) => a.key === 'primary');
      const growth = safeApps.find((a) => a.key === 'growth');

      expect(primary).toBeDefined();
      expect(growth).toBeDefined();

      // Zero raw secrets returned!
      expect(primary.appSecret).toBeUndefined();
      expect(growth.appSecret).toBeUndefined();

      // Env refs are maintained
      expect(primary.appSecretRef).toBe('FACEBOOK_APP_SECRET');
      expect(growth.appSecretRef).toBe('FACEBOOK_GROWTH_APP_SECRET');
      expect(primary.hasSecretConfigured).toBe(true);
      expect(growth.hasSecretConfigured).toBe(true);
    });

    test('getAppByKey resolves app details and secret from env ref internally', async () => {
      const primaryApp = await metaAppRegistry.getAppByKey('primary');
      expect(primaryApp.appId).toBe(DEFAULT_FACEBOOK_APP_ID);
      expect(primaryApp.appSecret).toBe(PRIMARY_SECRET);

      const growthApp = await metaAppRegistry.getAppByKey('growth');
      expect(growthApp.appId).toBe('growth-app-id-777888');
      expect(growthApp.appSecret).toBe(GROWTH_SECRET);
    });
  });

  describe('2) OAuth State Building & App Resolution', () => {
    test('buildFacebookOAuthState embeds app=growth and signs with growth secret', () => {
      const state = buildFacebookOAuthState({
        companyId: 'company-test-1',
        userId: 'user-test-1',
        type: 'page',
        appKey: 'growth'
      });

      expect(typeof state).toBe('string');
      const decoded = decodeFacebookOAuthState(state, 'page');
      expect(decoded.stateData.appKey).toBe('growth');
      expect(decoded.stateData.cid).toBe('company-test-1');
      expect(decoded.hmacValid).toBe(true);
    });

    test('buildFacebookOAuthState defaults to primary when appKey is omitted', () => {
      const state = buildFacebookOAuthState({
        companyId: 'company-test-1',
        userId: 'user-test-1',
        type: 'page'
      });

      const decoded = decodeFacebookOAuthState(state, 'page');
      expect(decoded.stateData.appKey).toBe('primary');
      expect(decoded.hmacValid).toBe(true);
    });

    test('buildAdsOAuthState encodes appKey in signed payload', () => {
      const state = buildAdsOAuthState({
        companyId: 'company-test-1',
        userId: 'user-test-1',
        appKey: 'growth'
      });

      const decoded = decodeAdsOAuthState(state);
      expect(decoded.ok).toBe(true);
      expect(decoded.stateData.appKey).toBe('growth');
    });
  });

  describe('3) Webhook Dual-Signature Verification (Primary & Growth)', () => {
    const payload = JSON.stringify({
      object: 'page',
      entry: [{ id: 'page-101', messaging: [{ message: { mid: 'mid_001', text: 'hello' } }] }]
    });

    test('accepts webhook payload signed with Primary secret', () => {
      const hash = crypto.createHmac('sha256', PRIMARY_SECRET).update(payload).digest('hex');
      const req = {
        rawBody: payload,
        headers: {
          'x-hub-signature-256': `sha256=${hash}`
        }
      };

      const result = verifyMetaWebhookSignatureAgainstApps(req);
      expect(result.ok).toBe(true);
      expect(result.matchedApp).toBe('primary');
    });

    test('accepts webhook payload signed with Growth secret', () => {
      const hash = crypto.createHmac('sha256', GROWTH_SECRET).update(payload).digest('hex');
      const req = {
        rawBody: payload,
        headers: {
          'x-hub-signature-256': `sha256=${hash}`
        }
      };

      const result = verifyMetaWebhookSignatureAgainstApps(req);
      expect(result.ok).toBe(true);
      expect(result.matchedApp).toBe('growth');
    });

    test('rejects webhook payload with invalid signature', () => {
      const hash = crypto.createHmac('sha256', 'wrong_secret_entirely').update(payload).digest('hex');
      const req = {
        rawBody: payload,
        headers: {
          'x-hub-signature-256': `sha256=${hash}`
        }
      };

      const result = verifyMetaWebhookSignatureAgainstApps(req);
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('invalid_signature');
    });
  });

  describe('4) Webhook Verify Tokens Check (Dual GET Verification)', () => {
    test('contains verify tokens for both Primary and Growth', () => {
      const tokens = getFacebookWebhookVerifyTokens();
      expect(tokens.has(PRIMARY_VERIFY)).toBe(true);
      expect(tokens.has(GROWTH_VERIFY)).toBe(true);
      expect(tokens.has('non_existent_token')).toBe(false);
    });
  });

  describe('5) Feature Gating (Growth vs Primary)', () => {
    test('requires re-auth on Growth when feature demands growth and current key is primary', () => {
      const check = featureRequiresGrowth('growth_ad_management', 'primary');
      expect(check.allowed).toBe(false);
      expect(check.code).toBe('REAUTH_REQUIRED');
      expect(check.message).toContain('اربط الصفحة تاني لتفعيل الميزة');
    });

    test('allows growth features when current key is growth', () => {
      const check = featureRequiresGrowth('growth_ad_management', 'growth');
      expect(check.allowed).toBe(true);
    });

    test('allows standard features regardless of app key', () => {
      expect(featureRequiresGrowth('basic_chat', 'primary').allowed).toBe(true);
      expect(featureRequiresGrowth('basic_chat', 'growth').allowed).toBe(true);
    });
  });

  describe('6) Isolation & Rollback Safeguard', () => {
    test('disabling Growth falls back automatically to Primary without error', () => {
      process.env.META_GROWTH_ACTIVE = 'false';
      expect(isGrowthActive()).toBe(false);

      const config = getFacebookAppKeyConfig('growth');
      // When growth is disabled, it transparently returns primary config as fallback!
      expect(config.appId).toBe(DEFAULT_FACEBOOK_APP_ID);
      expect(config.appSecret).toBe(PRIMARY_SECRET);
    });

    test('Primary calls remain 100% operational when Growth is absent or disabled', () => {
      process.env.META_GROWTH_ACTIVE = 'false';
      const primaryConfig = getFacebookAppKeyConfig('primary');
      expect(primaryConfig.appId).toBe(DEFAULT_FACEBOOK_APP_ID);
      expect(primaryConfig.appSecret).toBe(PRIMARY_SECRET);
    });
  });
});
