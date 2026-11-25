const express = require('express');
const request = require('supertest');

const seededCustomers = [
  {
    id: 'cust-wa-hot',
    companyId: 'comp-1',
    firstName: 'أحمد',
    lastName: 'واتساب',
    email: 'ahmed@example.com',
    phone: '01011111111',
    status: 'LEAD',
    leadSource: 'WHATSAPP',
    leadStage: 'NEW_LEAD',
    leadPriority: 'HOT',
    assignedToId: null,
    tags: JSON.stringify(['leads-batch-2026-11']),
    createdAt: new Date('2026-11-10T10:00:00.000Z'),
    updatedAt: new Date('2026-11-10T10:00:00.000Z'),
    _count: { conversations: 1, orders: 0 },
  },
  {
    id: 'cust-fb-warm',
    companyId: 'comp-1',
    firstName: 'سارة',
    lastName: 'فيسبوك',
    email: 'sara@example.com',
    phone: '01022222222',
    status: 'LEAD',
    leadSource: 'FACEBOOK',
    leadStage: 'CONTACTED',
    leadPriority: 'WARM',
    assignedToId: 'agent-1',
    tags: JSON.stringify(['fb-ads']),
    createdAt: new Date('2026-11-15T12:00:00.000Z'),
    updatedAt: new Date('2026-11-15T12:00:00.000Z'),
    _count: { conversations: 2, orders: 0 },
  },
  {
    id: 'cust-web-cold',
    companyId: 'comp-1',
    firstName: 'كريم',
    lastName: 'موقع',
    email: 'kareem@example.com',
    phone: '01033333333',
    status: 'ACTIVE',
    leadSource: 'WEBSITE',
    leadStage: 'PROPOSAL_SENT',
    leadPriority: 'COLD',
    assignedToId: null,
    tags: JSON.stringify(['landing']),
    createdAt: new Date('2026-11-20T18:30:00.000Z'),
    updatedAt: new Date('2026-11-20T18:30:00.000Z'),
    _count: { conversations: 0, orders: 1 },
  },
];

function applyCustomerWhere(rows, where = {}) {
  return rows.filter((row) => {
    if (where.companyId !== undefined && row.companyId !== where.companyId) return false;
    if (where.status !== undefined && row.status !== where.status) return false;
    if (where.leadSource !== undefined && row.leadSource !== where.leadSource) return false;
    if (where.leadStage !== undefined && row.leadStage !== where.leadStage) return false;
    if (where.leadPriority !== undefined && row.leadPriority !== where.leadPriority) return false;
    if (Object.prototype.hasOwnProperty.call(where, 'assignedToId')) {
      if (row.assignedToId !== where.assignedToId) return false;
    }
    if (where.tags?.contains && !String(row.tags || '').includes(where.tags.contains)) {
      return false;
    }
    if (where.createdAt) {
      const created = new Date(row.createdAt).getTime();
      if (where.createdAt.gte && created < new Date(where.createdAt.gte).getTime()) return false;
      if (where.createdAt.lte && created > new Date(where.createdAt.lte).getTime()) return false;
    }
    if (Array.isArray(where.OR) && where.OR.length > 0) {
      const matched = where.OR.some((clause) => {
        const [field, condition] = Object.entries(clause)[0] || [];
        if (!field || !condition?.contains) return false;
        return String(row[field] || '').includes(condition.contains);
      });
      if (!matched) return false;
    }
    return true;
  });
}

const mockPrisma = {
  customer: {
    findMany: jest.fn(async ({ where, skip = 0, take = 10 } = {}) => {
      const filtered = applyCustomerWhere(seededCustomers, where);
      return filtered.slice(skip, skip + take);
    }),
    count: jest.fn(async ({ where } = {}) => {
      return applyCustomerWhere(seededCustomers, where).length;
    }),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  initializeSharedDatabase: jest.fn(),
  executeWithRetry: jest.fn(async (op) => op()),
}));

jest.mock('../../utils/verifyToken', () => ({
  authenticateToken: (req, _res, next) => {
    req.user = { id: 'admin-1', role: 'COMPANY_ADMIN', companyId: 'comp-1' };
    next();
  },
  requireRole: () => (_req, _res, next) => next(),
  requireCompanyAccess: (_req, _res, next) => next(),
}));

jest.mock('../../middleware/rbacMiddleware', () => ({
  requireDbPermission: () => (_req, _res, next) => next(),
  requirePermission: () => (_req, _res, next) => next(),
  hasPermission: () => true,
}));

jest.mock('../../middleware/checkAppAccess', () => ({
  checkAppAccess: () => (_req, _res, next) => next(),
}));

jest.mock('../../services/autoDiscountService', () => ({
  enrichCustomersWithAutoDiscountStatus: jest.fn(async (_companyId, customers) => customers),
  isTiersActive: jest.fn(async () => false),
}));

jest.mock('../../services/hr/customerLoyaltyService', () => ({
  enrichCustomersWithTier: jest.fn(async (_companyId, customers) => customers),
}));

jest.mock('../../services/walletService', () => ({}));
jest.mock('../../services/customerBlocklistService', () => ({}));
jest.mock('../../services/socketService', () => ({}));

const customerRoutes = require('../../routes/customerRoutes');

describe('GET /api/v1/customers - lead CRM filters', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/v1/customers', customerRoutes);
  });

  test('returns all seeded customers when no lead filters are provided', async () => {
    const res = await request(app).get('/api/v1/customers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.data).toHaveLength(3);
  });

  test('filters by leadSource=WHATSAPP and excludes FACEBOOK/WEBSITE', async () => {
    const res = await request(app).get('/api/v1/customers?leadSource=WHATSAPP');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data.map((c) => c.id)).toEqual(['cust-wa-hot']);
    expect(res.body.data.every((c) => c.leadSource === 'WHATSAPP')).toBe(true);
  });

  test('filters by leadStage=CONVERTED and returns 0 when none match', async () => {
    const res = await request(app).get('/api/v1/customers?leadStage=CONVERTED');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  test('filters by leadStage=CONTACTED case-insensitively', async () => {
    const res = await request(app).get('/api/v1/customers?leadStage=contacted');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data.map((c) => c.id)).toEqual(['cust-fb-warm']);
  });

  test('filters by leadPriority=COLD', async () => {
    const res = await request(app).get('/api/v1/customers?leadPriority=COLD');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data.map((c) => c.id)).toEqual(['cust-web-cold']);
  });

  test('filters by assignedToId=unassigned and assignedToId=null to return unassigned only', async () => {
    const resUnassigned = await request(app).get('/api/v1/customers?assignedToId=unassigned');
    expect(resUnassigned.status).toBe(200);
    expect(resUnassigned.body.pagination.total).toBe(2);
    expect(resUnassigned.body.data.map((c) => c.id)).toEqual(['cust-wa-hot', 'cust-web-cold']);

    const resNull = await request(app).get('/api/v1/customers?assignedToId=null');
    expect(resNull.status).toBe(200);
    expect(resNull.body.pagination.total).toBe(2);
    expect(resNull.body.data.map((c) => c.id)).toEqual(['cust-wa-hot', 'cust-web-cold']);
  });

  test('filters by specific assignedToId', async () => {
    const res = await request(app).get('/api/v1/customers?assignedToId=agent-1');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data.map((c) => c.id)).toEqual(['cust-fb-warm']);
  });

  test('filters by inclusive dateFrom and dateTo on createdAt', async () => {
    const resRange = await request(app).get(
      '/api/v1/customers?dateFrom=2026-11-12&dateTo=2026-11-18'
    );
    expect(resRange.status).toBe(200);
    expect(resRange.body.pagination.total).toBe(1);
    expect(resRange.body.data.map((c) => c.id)).toEqual(['cust-fb-warm']);

    const resSameDay = await request(app).get(
      '/api/v1/customers?dateFrom=2026-11-20&dateTo=2026-11-20'
    );
    expect(resSameDay.status).toBe(200);
    expect(resSameDay.body.pagination.total).toBe(1);
    expect(resSameDay.body.data.map((c) => c.id)).toEqual(['cust-web-cold']);
  });

  test('ignores invalid enum and date filter values without returning 500', async () => {
    const res = await request(app).get(
      '/api/v1/customers?leadSource=BOGUS&leadStage=UNKNOWN&leadPriority=ULTRA&dateFrom=not-a-date&dateTo=invalid'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.total).toBe(3);
  });

  test('preserves legacy status, tag, and search filters alongside new filters', async () => {
    const statusRes = await request(app).get('/api/v1/customers?status=LEAD');
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.pagination.total).toBe(2);

    const tagRes = await request(app).get('/api/v1/customers?tag=leads-batch-2026-11');
    expect(tagRes.status).toBe(200);
    expect(tagRes.body.pagination.total).toBe(1);
    expect(tagRes.body.data[0].id).toBe('cust-wa-hot');

    const searchRes = await request(app)
      .get('/api/v1/customers')
      .query({ search: 'سارة' });
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.pagination.total).toBe(1);
    expect(searchRes.body.data[0].id).toBe('cust-fb-warm');

    const combinedRes = await request(app)
      .get('/api/v1/customers')
      .query({ status: 'LEAD', leadSource: 'WHATSAPP' });
    expect(combinedRes.status).toBe(200);
    expect(combinedRes.body.pagination.total).toBe(1);
    expect(combinedRes.body.data[0].id).toBe('cust-wa-hot');
  });
});
