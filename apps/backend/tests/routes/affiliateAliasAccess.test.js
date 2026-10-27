const express = require('express');
const request = require('supertest');

let mockCurrentUser = {
  id: 'user-1',
  companyId: 'company-1',
  role: 'OWNER',
};

let mockCompanyRecord = null;

const mockPrisma = {
  company: {
    findUnique: jest.fn(() => Promise.resolve(mockCompanyRecord)),
  },
  marketplaceApp: {
    findMany: jest.fn(() => Promise.resolve([])),
  },
  companyApp: {
    findUnique: jest.fn(() => Promise.resolve(null)),
    upsert: jest.fn(() => Promise.resolve({})),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  executeWithRetry: jest.fn((cb) => cb()),
}));

jest.mock('../../utils/verifyToken', () => ({
  authenticateToken: (req, res, next) => {
    if (!mockCurrentUser) {
      return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    req.user = mockCurrentUser;
    return next();
  },
  requireRole: (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
    }
    return next();
  },
  requireCompanyAccess: (req, res, next) => next(),
}));

const checkAppAccess = require('../../middleware/checkAppAccess');

describe('checkAppAccess affiliate-program -> affiliate-pro alias resolution', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = {
      id: 'user-1',
      companyId: 'company-1',
      role: 'OWNER',
    };
    mockCompanyRecord = {
      id: 'company-1',
      trialModeEnabled: false,
      trialEndsAt: null,
      settings: {},
      installedApps: [],
    };
    mockPrisma.marketplaceApp.findMany.mockResolvedValue([
      { id: 'app-pro', slug: 'affiliate-pro', name: 'Affiliate Pro', monthlyPrice: 0 },
      { id: 'app-legacy', slug: 'affiliate-program', name: 'الأفليت والدروب شيبنج', monthlyPrice: 0 },
    ]);

    app = express();
    app.use(express.json());
    // Mirroring route mounting with checkAppAccess('affiliate-pro') gate
    app.get(
      '/test-affiliate-pro-gate',
      (req, res, next) => {
        req.user = mockCurrentUser;
        next();
      },
      checkAppAccess('affiliate-pro'),
      (req, res) => {
        res.status(200).json({
          success: true,
          resolvedApp: req.companyApp?.app?.slug,
          message: 'Access granted to affiliate-pro gate',
        });
      }
    );
  });

  test('resolves legacy "affiliate-program" installation to grant access to the affiliate-pro gate', async () => {
    mockCompanyRecord = {
      id: 'company-1',
      trialModeEnabled: false,
      trialEndsAt: null,
      settings: {},
      installedApps: [
        {
          id: 'ca-legacy-1',
          status: 'ACTIVE',
          settings: { installedBy: 'marketplaceSeed' },
          activePricingModel: 'SUBSCRIPTION',
          app: {
            id: 'app-legacy',
            slug: 'affiliate-program',
            name: 'الأفليت والدروب شيبنج',
            monthlyPrice: 0,
            pricingModel: 'SUBSCRIPTION',
          },
        },
      ],
    };
    mockPrisma.company.findUnique.mockResolvedValue(mockCompanyRecord);

    const response = await request(app).get('/test-affiliate-pro-gate');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.resolvedApp).toBe('affiliate-program');
  });

  test('grants access when "affiliate-pro" is directly installed', async () => {
    mockCompanyRecord = {
      id: 'company-1',
      trialModeEnabled: false,
      trialEndsAt: null,
      settings: {},
      installedApps: [
        {
          id: 'ca-pro-1',
          status: 'ACTIVE',
          settings: {},
          activePricingModel: 'SUBSCRIPTION',
          app: {
            id: 'app-pro',
            slug: 'affiliate-pro',
            name: 'Affiliate Pro',
            monthlyPrice: 0,
            pricingModel: 'SUBSCRIPTION',
          },
        },
      ],
    };
    mockPrisma.company.findUnique.mockResolvedValue(mockCompanyRecord);

    const response = await request(app).get('/test-affiliate-pro-gate');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.resolvedApp).toBe('affiliate-pro');
  });

  test('blocks access when legacy "affiliate-program" is INACTIVE', async () => {
    mockCompanyRecord = {
      id: 'company-1',
      trialModeEnabled: false,
      trialEndsAt: null,
      settings: {},
      installedApps: [
        {
          id: 'ca-legacy-inactive',
          status: 'INACTIVE',
          settings: {},
          activePricingModel: 'SUBSCRIPTION',
          app: {
            id: 'app-legacy',
            slug: 'affiliate-program',
            name: 'الأفليت والدروب شيبنج',
            monthlyPrice: 0,
            pricingModel: 'SUBSCRIPTION',
          },
        },
      ],
    };
    mockPrisma.company.findUnique.mockResolvedValue(mockCompanyRecord);

    const response = await request(app).get('/test-affiliate-pro-gate');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test('blocks access when company has neither affiliate app installed', async () => {
    mockCompanyRecord = {
      id: 'company-1',
      trialModeEnabled: false,
      trialEndsAt: null,
      settings: {},
      installedApps: [
        {
          id: 'ca-other',
          status: 'ACTIVE',
          app: {
            id: 'app-other',
            slug: 'order-core',
            name: 'Order Core',
          },
        },
      ],
    };
    mockPrisma.company.findUnique.mockResolvedValue(mockCompanyRecord);

    const response = await request(app).get('/test-affiliate-pro-gate');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
