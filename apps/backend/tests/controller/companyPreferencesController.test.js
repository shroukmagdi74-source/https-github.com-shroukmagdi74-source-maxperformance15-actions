const { getSidebarPreferences, updateSidebarPreferences, MAX_SIDEBAR_ITEMS } = require('../../controller/companyPreferencesController');
const sharedDatabase = require('../../services/sharedDatabase');

describe('companyPreferencesController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSidebarPreferences', () => {
    test('returns 401 if user is not authenticated or lacks companyId', async () => {
      const req = { user: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getSidebarPreferences(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('returns stored sidebar preferences for company', async () => {
      const req = { user: { companyId: 'comp-123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockPrisma = {
        company: {
          findUnique: jest.fn().mockResolvedValue({
            sidebarPreferences: {
              hidden: ['marketing', 'crm'],
              order: ['orders', 'inventory']
            }
          })
        }
      };
      jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

      await getSidebarPreferences(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          hidden: ['marketing', 'crm'],
          order: ['orders', 'inventory']
        }
      });
    });

    test('returns empty arrays if company has null sidebarPreferences', async () => {
      const req = { user: { companyId: 'comp-123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockPrisma = {
        company: {
          findUnique: jest.fn().mockResolvedValue({
            sidebarPreferences: null
          })
        }
      };
      jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

      await getSidebarPreferences(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          hidden: [],
          order: []
        }
      });
    });
  });

  describe('updateSidebarPreferences', () => {
    test('rejects non-array hidden or order', async () => {
      const req = {
        user: { companyId: 'comp-123' },
        body: { hidden: 'not-an-array', order: [] }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateSidebarPreferences(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('rejects non-string items in hidden or order', async () => {
      const req = {
        user: { companyId: 'comp-123' },
        body: { hidden: ['valid-id', 12345], order: [] }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateSidebarPreferences(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('rejects arrays exceeding MAX_SIDEBAR_ITEMS (60 items)', async () => {
      const tooMany = Array.from({ length: 61 }, (_, i) => `item-${i}`);
      const req = {
        user: { companyId: 'comp-123' },
        body: { hidden: tooMany, order: [] }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateSidebarPreferences(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('successfully validates, sanitizes, and updates preferences', async () => {
      const req = {
        user: { companyId: 'comp-123' },
        body: {
          hidden: ['orders', 'orders', ' marketing '],
          order: ['inventory', 'orders']
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockPrisma = {
        company: {
          update: jest.fn().mockResolvedValue({})
        }
      };
      jest.spyOn(sharedDatabase, 'getSharedPrismaClient').mockReturnValue(mockPrisma);

      await updateSidebarPreferences(req, res);
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
        data: {
          sidebarPreferences: {
            hidden: ['orders', 'marketing'],
            order: ['inventory', 'orders']
          }
        }
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            hidden: ['orders', 'marketing'],
            order: ['inventory', 'orders']
          }
        })
      );
    });
  });
});
