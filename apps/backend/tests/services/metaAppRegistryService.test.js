const metaAppRegistry = require('../../services/metaAppRegistryService');
const sharedDatabase = require('../../services/sharedDatabase');

describe('metaAppRegistryService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('resolveSecretFromRef and resolveVerifyTokenFromRef read env vars safely', () => {
    process.env.TEST_SECRET_REF = 'secret_val_123';
    process.env.TEST_TOKEN_REF = 'token_val_456';

    expect(metaAppRegistry.resolveSecretFromRef('TEST_SECRET_REF')).toBe('secret_val_123');
    expect(metaAppRegistry.resolveSecretFromRef('NON_EXISTENT_REF')).toBe('');
    expect(metaAppRegistry.resolveSecretFromRef(null)).toBe('');

    expect(metaAppRegistry.resolveVerifyTokenFromRef('TEST_TOKEN_REF')).toBe('token_val_456');
    expect(metaAppRegistry.resolveVerifyTokenFromRef(undefined)).toBe('');
  });

  test('getAllApps returns primary and growth apps with references and resolved credentials', async () => {
    process.env.FACEBOOK_GROWTH_APP_ID = 'growth_app_999';
    process.env.FACEBOOK_GROWTH_APP_SECRET = 'growth_secret_888';
    process.env.FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN = 'growth_token_777';

    // Mock prisma to return empty list so it falls back to default env definitions
    const mockPrisma = {
      facebookApp: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const apps = await metaAppRegistry.getAllApps();
    expect(apps).toHaveLength(2);

    const primary = apps.find((a) => a.key === 'primary');
    const growth = apps.find((a) => a.key === 'growth');

    expect(primary).toBeDefined();
    expect(primary.appSecretRef).toBe('FACEBOOK_APP_SECRET');

    expect(growth).toBeDefined();
    expect(growth.appId).toBe('growth_app_999');
    expect(growth.appSecret).toBe('growth_secret_888');
    expect(growth.webhookVerifyToken).toBe('growth_token_777');
  });

  test('getAppByKey falls back to primary when growth is inactive', async () => {
    process.env.META_GROWTH_ACTIVE = 'false';

    const mockPrisma = {
      facebookApp: {
        findMany: jest.fn().mockResolvedValue([
          {
            key: 'primary',
            appId: 'primary_123',
            appSecretRef: 'FACEBOOK_APP_SECRET',
            isActive: true,
          },
          {
            key: 'growth',
            appId: 'growth_456',
            appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
            isActive: false, // Disabled
          },
        ]),
      },
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const app = await metaAppRegistry.getAppByKey('growth');
    expect(app.key).toBe('primary');
  });

  test('getSafeAppsList hides raw secrets and reports configuration flags', async () => {
    process.env.FACEBOOK_GROWTH_APP_SECRET = 'real_secret_token';

    const mockPrisma = {
      facebookApp: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'app-primary',
            key: 'primary',
            appId: '762328696481583',
            appSecretRef: 'FACEBOOK_APP_SECRET',
            webhookVerifyTokenRef: 'FACEBOOK_WEBHOOK_VERIFY_TOKEN',
            isActive: true,
          },
          {
            id: 'app-growth',
            key: 'growth',
            appId: 'growth_123',
            appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
            webhookVerifyTokenRef: 'FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN',
            isActive: true,
          },
        ]),
      },
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const safeList = await metaAppRegistry.getSafeAppsList();
    expect(safeList).toHaveLength(2);

    for (const item of safeList) {
      // Must not expose appSecret
      expect(item.appSecret).toBeUndefined();
      expect(item.appSecretRef).toBeDefined();
      expect(typeof item.hasSecretConfigured).toBe('boolean');
    }

    const growthItem = safeList.find((s) => s.key === 'growth');
    expect(growthItem.hasSecretConfigured).toBe(true);
  });

  test('upsertApp and toggleAppStatus interact with Prisma correctly', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ key: 'growth', appId: 'new_app_id' });
    const mockUpdate = jest.fn().mockResolvedValue({ key: 'growth', isActive: false });

    const mockPrisma = {
      facebookApp: {
        upsert: mockUpsert,
        update: mockUpdate,
      },
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const upserted = await metaAppRegistry.upsertApp({
      key: 'growth',
      appId: 'new_app_id',
      appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
      isActive: true,
    });
    expect(upserted.key).toBe('growth');
    expect(mockUpsert).toHaveBeenCalled();

    const toggled = await metaAppRegistry.toggleAppStatus('growth', false);
    expect(toggled.isActive).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { key: 'growth' },
      data: { isActive: false },
    });
  });

  test('featureRequiresGrowth gates features with Arabic message and REAUTH_REQUIRED', () => {
    const gated = metaAppRegistry.featureRequiresGrowth('growth_ad_management', 'primary');
    expect(gated.allowed).toBe(false);
    expect(gated.code).toBe('REAUTH_REQUIRED');
    expect(gated.message).toBe('اربط الصفحة تاني لتفعيل الميزة');

    const allowedOnGrowth = metaAppRegistry.featureRequiresGrowth('growth_ad_management', 'growth');
    expect(allowedOnGrowth.allowed).toBe(true);

    const normalFeature = metaAppRegistry.featureRequiresGrowth('standard_messaging', 'primary');
    expect(normalFeature.allowed).toBe(true);
  });
});
