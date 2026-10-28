const { resolveFacebookAppKeyForPage, getOAuthConfigForPage } = require('../../services/facebookAppResolver');
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
});
