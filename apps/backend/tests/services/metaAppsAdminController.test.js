const superAdminPlatformController = require('../../controller/superAdminPlatformController');
const metaAppRegistry = require('../../services/metaAppRegistryService');

describe('Super Admin Meta Apps Controller', () => {
  test('getMetaApps returns list of safe apps', async () => {
    jest.spyOn(metaAppRegistry, 'getSafeAppsList').mockResolvedValue([
      { key: 'primary', appId: '762328696481583', isActive: true, hasSecretConfigured: true },
      { key: 'growth', appId: 'growth_id', isActive: true, hasSecretConfigured: false },
    ]);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await superAdminPlatformController.getMetaApps(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ key: 'primary' }),
          expect.objectContaining({ key: 'growth' }),
        ]),
      })
    );
  });

  test('upsertMetaApp validates key and fields before saving', async () => {
    // 1. Invalid key
    const reqInvalid = {
      body: { key: 'invalid_key', appId: '123', appSecretRef: 'REF' },
    };
    const resInvalid = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await superAdminPlatformController.upsertMetaApp(reqInvalid, resInvalid);
    expect(resInvalid.status).toHaveBeenCalledWith(400);

    // 2. Valid upsert
    jest.spyOn(metaAppRegistry, 'upsertApp').mockResolvedValue({
      key: 'growth',
      appId: 'new_growth_id',
      appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
    });

    const reqValid = {
      body: {
        key: 'growth',
        appId: 'new_growth_id',
        appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
        isActive: true,
      },
    };
    const resValid = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await superAdminPlatformController.upsertMetaApp(reqValid, resValid);
    expect(resValid.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ key: 'growth' }),
      })
    );
  });

  test('toggleMetaAppStatus updates app status', async () => {
    jest.spyOn(metaAppRegistry, 'toggleAppStatus').mockResolvedValue({
      key: 'growth',
      isActive: false,
    });

    const req = {
      params: { key: 'growth' },
      body: { isActive: false },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await superAdminPlatformController.toggleMetaAppStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ key: 'growth', isActive: false }),
      })
    );
  });
});
