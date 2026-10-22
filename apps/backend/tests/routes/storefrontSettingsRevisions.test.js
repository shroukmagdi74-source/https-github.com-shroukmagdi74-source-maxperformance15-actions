const express = require('express');
const request = require('supertest');

const mockCompanyA = {
  id: 'company-a',
  name: 'Store A',
  slug: 'store-a',
  currency: 'EGP',
  isActive: true,
};

const mockCompanyB = {
  id: 'company-b',
  name: 'Store B',
  slug: 'store-b',
  currency: 'EGP',
  isActive: true,
};

let mockRevisions = [];
let mockSettingsStore = {};

const mockPrisma = {
  company: {
    findUnique: jest.fn(async ({ where }) => {
      if (where.id === 'company-a') return mockCompanyA;
      if (where.id === 'company-b') return mockCompanyB;
      return null;
    }),
    findFirst: jest.fn(async ({ where }) => {
      if (where.id === 'company-a') return mockCompanyA;
      if (where.id === 'company-b') return mockCompanyB;
      return null;
    }),
  },
  storefrontSettings: {
    findUnique: jest.fn(async ({ where }) => {
      return mockSettingsStore[where.companyId] || {
        companyId: where.companyId,
        designTokens: { themeId: 'modern-minimal' },
      };
    }),
    upsert: jest.fn(async ({ where, update, create }) => {
      const current = mockSettingsStore[where.companyId] || { companyId: where.companyId };
      const next = { ...current, ...update };
      mockSettingsStore[where.companyId] = next;
      return next;
    }),
  },
  storefrontSettingsRevision: {
    findFirst: jest.fn(async ({ where, orderBy }) => {
      let filtered = mockRevisions.filter((r) => {
        if (where?.companyId && r.companyId !== where.companyId) return false;
        if (where?.id && r.id !== where.id) return false;
        return true;
      });
      if (orderBy?.revisionNumber === 'desc') {
        filtered.sort((a, b) => b.revisionNumber - a.revisionNumber);
      }
      return filtered[0] || null;
    }),
    findMany: jest.fn(async ({ where, orderBy, take, skip }) => {
      let filtered = mockRevisions.filter((r) => {
        if (where?.companyId && r.companyId !== where.companyId) return false;
        return true;
      });
      if (orderBy?.revisionNumber === 'desc') {
        filtered.sort((a, b) => b.revisionNumber - a.revisionNumber);
      }
      if (skip) filtered = filtered.slice(skip);
      if (take) filtered = filtered.slice(0, take);
      return filtered;
    }),
    create: jest.fn(async ({ data }) => {
      const record = {
        id: `rev-${mockRevisions.length + 1}-${Date.now()}`,
        companyId: data.companyId,
        revisionNumber: data.revisionNumber,
        snapshot: data.snapshot,
        createdBy: data.createdBy || null,
        note: data.note || null,
        createdAt: new Date(),
      };
      mockRevisions.push(record);
      return record;
    }),
    deleteMany: jest.fn(async ({ where }) => {
      const idsToDelete = new Set(where?.id?.in || []);
      const count = mockRevisions.filter((r) => idsToDelete.has(r.id)).length;
      mockRevisions = mockRevisions.filter((r) => !idsToDelete.has(r.id));
      return { count };
    }),
  },
  user: {
    findMany: jest.fn(async () => [
      { id: 'user-a', email: 'admin@store-a.com', name: 'المدير' },
    ]),
  },
  _runtimeDataModel: {
    models: {
      StorefrontSettings: {
        fields: [
          { name: 'id' },
          { name: 'companyId' },
          { name: 'designTokens' },
          { name: 'paymentGatewayConfig' },
          { name: 'enabledPaymentMethods' },
        ],
      },
    },
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  getSharedPrismaClientAsync: jest.fn(async () => mockPrisma),
  safeQuery: jest.fn((cb) => cb(mockPrisma)),
}));

jest.mock('../../services/tenantContext', () => ({
  run: jest.fn((id, cb) => cb()),
}));

jest.mock('../../services/storefrontThemeCatalogService', () => ({
  DEFAULT_STOREFRONT_THEME_ID: 'modern-minimal',
  storefrontThemeCatalogService: {
    getDefaultThemeId: jest.fn(async () => 'modern-minimal'),
    ensureThemeSelection: jest.fn(async () => ({ ok: true })),
  },
}));

let currentMockUser = {
  id: 'user-a',
  companyId: 'company-a',
  effectiveCompanyId: 'company-a',
  role: 'ADMIN',
};

jest.mock('../../utils/verifyToken', () => {
  const middleware = (req, res, next) => {
    req.user = currentMockUser;
    next();
  };
  middleware.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    req.user = currentMockUser;
    next();
  };
  middleware.requireCompanyAccess = (req, res, next) => {
    if (!req.user?.companyId && !req.user?.effectiveCompanyId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
  return middleware;
});

const storefrontSettingsRoutes = require('../../routes/storefrontSettingsRoutes');

describe('Ticket HIST-1: API Endpoints Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/storefront-settings', storefrontSettingsRoutes);
  });

  beforeEach(() => {
    mockRevisions = [];
    mockSettingsStore = {
      'company-a': {
        companyId: 'company-a',
        designTokens: { themeId: 'modern-minimal', pages: {} },
      },
      'company-b': {
        companyId: 'company-b',
        designTokens: { themeId: 'modern-minimal', pages: {} },
      },
    };
    currentMockUser = {
      id: 'user-a',
      companyId: 'company-a',
      effectiveCompanyId: 'company-a',
      role: 'ADMIN',
    };
  });

  test('1. GET /revisions rejects with 401 without auth token', async () => {
    const res = await request(app).get('/api/v1/storefront-settings/revisions');
    expect(res.status).toBe(401);
  });

  test('2. PUT /storefront-settings creates a new revision with revisionNumber = 1 on save', async () => {
    const savePayload = {
      designTokens: {
        themeId: 'khemet-fashion-eg',
        pages: { home: { sections: [{ type: 'hero' }] } },
      },
      note: 'إطلاق الصفحة الرئيسية',
    };

    const res = await request(app)
      .put('/api/v1/storefront-settings')
      .set('Authorization', 'Bearer valid-token')
      .send(savePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRevisions).toHaveLength(1);
    expect(mockRevisions[0].revisionNumber).toBe(1);
    expect(mockRevisions[0].companyId).toBe('company-a');
    expect(mockRevisions[0].createdBy).toBe('user-a');
  });

  test('3. PUT /storefront-settings with identical payload ignores duplicate revision', async () => {
    const savePayload = {
      designTokens: {
        themeId: 'khemet-fashion-eg',
        pages: { home: { sections: [{ type: 'hero' }] } },
      },
    };

    // First save
    await request(app)
      .put('/api/v1/storefront-settings')
      .set('Authorization', 'Bearer valid-token')
      .send(savePayload);

    expect(mockRevisions).toHaveLength(1);

    // Second identical save
    const res2 = await request(app)
      .put('/api/v1/storefront-settings')
      .set('Authorization', 'Bearer valid-token')
      .send(savePayload);

    expect(res2.status).toBe(200);
    expect(mockRevisions).toHaveLength(1); // Still 1!
  });

  test('4. GET /revisions returns list ordered descending with lightweight summaries', async () => {
    // Populate two revisions
    mockRevisions.push(
      {
        id: 'rev-1',
        companyId: 'company-a',
        revisionNumber: 1,
        snapshot: { designTokens: { v: 1 } },
        createdBy: 'user-a',
        note: 'إصدار قديم',
        createdAt: new Date('2026-10-22T10:00:00Z'),
      },
      {
        id: 'rev-2',
        companyId: 'company-a',
        revisionNumber: 2,
        snapshot: { designTokens: { v: 2 } },
        createdBy: 'user-a',
        note: 'إصدار حديث',
        createdAt: new Date('2026-10-22T12:00:00Z'),
      }
    );

    const res = await request(app)
      .get('/api/v1/storefront-settings/revisions?limit=10')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].revisionNumber).toBe(2);
    expect(res.body.data[0].createdByEmail).toBe('admin@store-a.com');
    expect(res.body.data[0]).not.toHaveProperty('snapshot'); // lightweight
    expect(res.body.data[1].revisionNumber).toBe(1);
  });

  test('5. GET /revisions/:id returns full revision with snapshot', async () => {
    mockRevisions.push({
      id: 'rev-target-1',
      companyId: 'company-a',
      revisionNumber: 1,
      snapshot: { themeId: 'khemet-fashion-eg', designTokens: { colors: { primary: '#000' } } },
      createdBy: 'user-a',
      note: 'تفاصيل المعاينة',
      createdAt: new Date(),
    });

    const res = await request(app)
      .get('/api/v1/storefront-settings/revisions/rev-target-1')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('rev-target-1');
    expect(res.body.data.snapshot).toBeDefined();
    expect(res.body.data.snapshot.themeId).toBe('khemet-fashion-eg');
  });

  test('6. GET /revisions/:id returns 404 (not 403) for revision belonging to another company', async () => {
    // Revision belongs to company-b
    mockRevisions.push({
      id: 'rev-other-company',
      companyId: 'company-b',
      revisionNumber: 1,
      snapshot: { designTokens: { secret: 'company-b-tokens' } },
      createdBy: 'user-b',
      createdAt: new Date(),
    });

    // Request made as user of company-a
    const res = await request(app)
      .get('/api/v1/storefront-settings/revisions/rev-other-company')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('7. POST /revisions/:id/restore restores snapshot and creates new revision with note="restore of #N"', async () => {
    const originalTokens = { themeId: 'khemet', header: 'Original Header' };
    mockRevisions.push({
      id: 'rev-target-restore',
      companyId: 'company-a',
      revisionNumber: 1,
      snapshot: { themeId: 'khemet', designTokens: originalTokens },
      createdBy: 'user-a',
      note: 'حفظ أصلي',
      createdAt: new Date(),
    });

    // Current state is different
    mockSettingsStore['company-a'] = {
      companyId: 'company-a',
      designTokens: { themeId: 'broken', header: 'Corrupted Header' },
    };

    const res = await request(app)
      .post('/api/v1/storefront-settings/revisions/rev-target-restore/restore')
      .set('Authorization', 'Bearer valid-token')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.revision).toBeDefined();
    expect(res.body.revision.note).toBe('restore of #1');
    expect(res.body.revision.revisionNumber).toBe(2);

    // Current store settings in database updated to restored designTokens
    expect(mockSettingsStore['company-a'].designTokens).toEqual(originalTokens);
  });

  test('8. POST /revisions/:id/restore returns 404 for cross-company restore attempt', async () => {
    mockRevisions.push({
      id: 'rev-b-secret',
      companyId: 'company-b',
      revisionNumber: 1,
      snapshot: { designTokens: {} },
      createdBy: 'user-b',
      createdAt: new Date(),
    });

    // Company A attempts to restore Company B's revision
    const res = await request(app)
      .post('/api/v1/storefront-settings/revisions/rev-b-secret/restore')
      .set('Authorization', 'Bearer valid-token')
      .send({});

    expect(res.status).toBe(404);
  });
});
