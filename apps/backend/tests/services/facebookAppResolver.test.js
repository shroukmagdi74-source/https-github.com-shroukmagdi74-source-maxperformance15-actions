const {
  resolveFacebookAppKeyForPage,
  resolveFacebookAppKeyForConnection,
  resolveFacebookAppKeyForAdAccount,
  getOAuthConfigForPage
} = require('../../services/facebookAppResolver');
const facebookAppConfig = require('../../config/facebookAppConfig');
const sharedDatabase = require('../../services/sharedDatabase');

describe('facebookAppResolver', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.FACEBOOK_GROWTH_APP_ID;
    delete process.env.FACEBOOK_GROWTH_APP_SECRET;
  });

  test('resolveFacebookAppKeyForPage returns primary when pageId is empty or not found', async () => {
    const mockPrisma = {
      facebookPage: {
        findFirst: jest.fn().mockResolvedValue(null)
      }
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const emptyResult = await resolveFacebookAppKeyForPage(null);
    expect(emptyResult).toBe('primary');

    const notFoundResult = await resolveFacebookAppKeyForPage('non-existent-page');
    expect(notFoundResult).toBe('primary');
  });

  test('resolveFacebookAppKeyForPage returns stored facebookAppKey when present', async () => {
    const mockPrisma = {
      facebookPage: {
        findFirst: jest.fn().mockResolvedValue({ facebookAppKey: 'growth' })
      }
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const result = await resolveFacebookAppKeyForPage('growth-page-123');
    expect(result).toBe('growth');
  });

  test('getOAuthConfigForPage returns growth config when page is assigned to growth', async () => {
    process.env.FACEBOOK_GROWTH_APP_ID = 'growth-app-111';
    process.env.FACEBOOK_GROWTH_APP_SECRET = 'growth-secret-222';

    const mockPrisma = {
      facebookPage: {
        findFirst: jest.fn().mockResolvedValue({ facebookAppKey: 'growth' })
      }
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const config = await getOAuthConfigForPage('growth-page-123');
    expect(config.key).toBe('growth');
    expect(config.appId).toBe('growth-app-111');
    expect(config.appSecret).toBe('growth-secret-222');
  });

  test('resolveFacebookAppKeyForConnection returns stored app key or primary fallback', async () => {
    const mockPrisma = {
      facebookAccountConnection: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ facebookAppKey: 'growth' })
      }
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const fallback = await resolveFacebookAppKeyForConnection('conn-1');
    expect(fallback).toBe('primary');

    const growth = await resolveFacebookAppKeyForConnection('conn-2');
    expect(growth).toBe('growth');
  });

  test('resolveFacebookAppKeyForAdAccount returns stored app key or primary fallback', async () => {
    const mockPrisma = {
      facebookAdAccount: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ facebookAppKey: 'growth' })
      }
    };
    jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

    const fallback = await resolveFacebookAppKeyForAdAccount('ad-1');
    expect(fallback).toBe('primary');

    const growth = await resolveFacebookAppKeyForAdAccount('ad-2');
    expect(growth).toBe('growth');
  });

  test('featureRequiresGrowth gates features requiring growth with arabic message and REAUTH_REQUIRED', () => {
    const { featureRequiresGrowth } = require('../../services/facebookAppResolver');
    
    // Normal feature allowed for any key
    expect(featureRequiresGrowth('basic_messaging', 'primary')).toEqual({ allowed: true });

    // Growth feature blocked on primary
    const blocked = featureRequiresGrowth('growth_ad_management', 'primary');
    expect(blocked.allowed).toBe(false);
    expect(blocked.code).toBe('REAUTH_REQUIRED');
    expect(blocked.message).toContain('اربط الصفحة تاني لتفعيل الميزة');

    // Growth feature allowed on growth
    const allowed = featureRequiresGrowth('growth_ad_management', 'growth');
    expect(allowed.allowed).toBe(true);
  });
});
