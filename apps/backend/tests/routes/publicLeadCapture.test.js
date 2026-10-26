const express = require('express');
const request = require('supertest');

const mockGetCompanyFromSubdomain = jest.fn((req, _res, next) => next());

const mockPrisma = {
  company: {
    findFirst: jest.fn(),
  },
  customer: {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  landingPage: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
  whatsAppNotificationSettings: {
    findUnique: jest.fn(),
  },
  whatsAppSession: {
    findFirst: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../middleware/companyMiddleware', () => ({
  getCompanyFromSubdomain: (...args) => mockGetCompanyFromSubdomain(...args),
}));

jest.mock('../../services/walletService', () => ({
  createWallet: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../services/whatsapp/WhatsAppNotificationService', () => ({
  sendNewSignupWelcomeNotification: jest.fn().mockResolvedValue({}),
  sendNewSignupAdminAlertNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../services/whatsapp/WhatsAppManager', () => ({
  getSession: jest.fn(),
  createSession: jest.fn(),
}));

jest.mock('../../services/whatsapp/WhatsAppMessageHandler', () => ({
  sendText: jest.fn().mockResolvedValue({ messageId: 'msg-123' }),
}));

const publicCustomerRoutes = require('../../routes/publicCustomerRoutes');

describe('publicCustomerRoutes - lead-capture & platform company fallback', () => {
  let app;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.PLATFORM_COMPANY_ID;
    delete process.env.PLATFORM_COMPANY_SLUG;
    delete process.env.OPERATOR_COMPANY_ID;
    delete process.env.OPERATOR_COMPANY_SLUG;
    delete process.env.WHATSAPP_PLATFORM_SENDER_COMPANY_ID;
    delete process.env.WHATSAPP_PLATFORM_SENDER_COMPANY_SLUG;

    if (publicCustomerRoutes._resetPlatformCompanyCache) {
      publicCustomerRoutes._resetPlatformCompanyCache();
    }

    mockGetCompanyFromSubdomain.mockImplementation((req, _res, next) => next());
    mockPrisma.company.findFirst.mockResolvedValue(null);
    mockPrisma.customer.findFirst.mockResolvedValue(null);
    mockPrisma.customer.create.mockImplementation(({ data, select }) => {
      const companyId = data.company?.connect?.id || data.companyId;
      return Promise.resolve({
        id: 'cust-new-1',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyId,
        status: data.status,
        tags: data.tags,
        metadata: data.metadata,
      });
    });
    mockPrisma.customer.update.mockImplementation(({ where, data, select }) => {
      return Promise.resolve({
        id: where.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyId: 'company-platform-1',
        status: data.status,
        tags: data.tags,
        metadata: data.metadata,
      });
    });

    app = express();
    app.use(express.json());
    app.use('/api/v1/public/customers', publicCustomerRoutes);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Validation before resolution', () => {
    test('missing firstName returns 400 with "الاسم الأول مطلوب" (not 503)', async () => {
      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: '',
          phone: '01012345678',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('الاسم الأول مطلوب');
    });

    test('missing phone and email returns 400 with "رقم الهاتف أو البريد الإلكتروني مطلوب" (not 503)', async () => {
      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'محمود',
          phone: '',
          email: '',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('رقم الهاتف أو البريد الإلكتروني مطلوب');
    });

    test('honeypot filled (nickname) returns 400 with "تعذر إرسال البيانات"', async () => {
      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'محمود',
          phone: '01012345678',
          nickname: 'spambot',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('تعذر إرسال البيانات');
    });
  });

  describe('Platform fallback resolution and 503 handling', () => {
    test('returns 503 when platform company is not configured and logs error', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'محمود',
          phone: '01012345678',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('خدمة تسجيل البيانات غير متاحة حالياً');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('lead-capture: platform company not configured')
      );

      errorSpy.mockRestore();
    });

    test('resolves company via PLATFORM_COMPANY_ID env and returns 200', async () => {
      process.env.PLATFORM_COMPANY_ID = 'company-platform-env';

      mockPrisma.company.findFirst.mockImplementation(({ where }) => {
        if (where?.id === 'company-platform-env' || where?.OR?.some(o => o.id === 'company-platform-env')) {
          return Promise.resolve({ id: 'company-platform-env', isActive: true });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'محمود',
          phone: '01012345678',
          companyName: 'م store',
          source: 'store-complete-bundle',
          pageSlug: 'store-complete-bundle',
          landingPath: '/lp/store-complete-bundle',
          referrer: 'https://facebook.com',
          utm: { utm_source: 'fb', utm_campaign: 'spring' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.firstName).toBe('محمود');
      expect(res.body.data.customer.companyId).toBe('company-platform-env');

      // Verify safeCreateCustomer arguments (metadata and tags)
      expect(mockPrisma.customer.create).toHaveBeenCalled();
      const createArgs = mockPrisma.customer.create.mock.calls[0][0];
      expect(createArgs.data.status).toBe('LEAD');
      expect(createArgs.data.company?.connect?.id || createArgs.data.companyId).toBe('company-platform-env');

      const tags = JSON.parse(createArgs.data.tags);
      expect(tags).toContain('landing');
      expect(tags).toContain('store-complete-bundle');

      const meta = JSON.parse(createArgs.data.metadata);
      expect(meta.source).toBe('store-complete-bundle');
      expect(meta.landingPath).toBe('/lp/store-complete-bundle');
      expect(meta.pageSlug).toBe('store-complete-bundle');
      expect(meta.referrer).toBe('https://facebook.com');
      expect(meta.utm).toEqual({ utm_source: 'fb', utm_campaign: 'spring' });
      expect(meta.submittedAt).toBeDefined();
    });

    test('deduplicates when same phone number is submitted again', async () => {
      process.env.PLATFORM_COMPANY_ID = 'company-platform-1';

      mockPrisma.company.findFirst.mockResolvedValue({ id: 'company-platform-1', isActive: true });

      // Existing customer in DB
      mockPrisma.customer.findFirst.mockResolvedValue({
        id: 'cust-existing-1',
        firstName: 'محمود',
        lastName: '',
        email: null,
        phone: '01012345678',
        notes: 'Initial note',
        metadata: JSON.stringify({ previousVisit: true }),
        tags: JSON.stringify(['lead']),
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'محمود معدل',
          phone: '01012345678',
          source: 'store-complete-bundle',
          pageSlug: 'store-complete-bundle',
          landingPath: '/lp/store-complete-bundle',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify customer was updated, not created
      expect(mockPrisma.customer.create).not.toHaveBeenCalled();
      expect(mockPrisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cust-existing-1' },
          data: expect.objectContaining({
            status: 'LEAD',
          }),
        })
      );

      const updateData = mockPrisma.customer.update.mock.calls[0][0].data;
      const updatedMeta = JSON.parse(updateData.metadata);
      expect(updatedMeta.source).toBe('store-complete-bundle');
      expect(updatedMeta.previousVisit).toBe(true);

      const updatedTags = JSON.parse(updateData.tags);
      expect(updatedTags).toContain('landing');
      expect(updatedTags).toContain('store-complete-bundle');
      expect(updatedTags).toContain('lead');
    });

    test('resolves platform company from database settings marker (isPlatform: true)', async () => {
      mockPrisma.company.findFirst.mockImplementation(({ where }) => {
        if (where?.OR?.some(cond => cond.settings?.contains?.includes('isPlatform'))) {
          return Promise.resolve({ id: 'company-from-db-settings', isActive: true });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'علي',
          phone: '01123456789',
          source: 'messaging-landing',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.companyId).toBe('company-from-db-settings');
    });

    test('resolves platform company via PLATFORM_COMPANY_SLUG env', async () => {
      process.env.PLATFORM_COMPANY_SLUG = 'platform-slug-env';

      mockPrisma.company.findFirst.mockImplementation(({ where }) => {
        if (where?.slug === 'platform-slug-env') {
          return Promise.resolve({ id: 'company-from-slug', isActive: true });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'أحمد',
          phone: '01198765432',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.companyId).toBe('company-from-slug');
    });

    test('resolves platform company via customDomain matching maxp.online', async () => {
      process.env.MAIN_DOMAIN = 'maxp.online';

      mockPrisma.company.findFirst.mockImplementation(({ where }) => {
        if (where?.OR?.some(cond => cond.customDomain === 'maxp.online')) {
          return Promise.resolve({ id: 'company-from-custom-domain', isActive: true });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'سامح',
          phone: '01055554444',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.companyId).toBe('company-from-custom-domain');
    });

    test('resolves explicit companyId passed in body', async () => {
      mockPrisma.company.findFirst.mockImplementation(({ where }) => {
        if (where?.OR?.some(cond => cond.id === 'explicit-company-123')) {
          return Promise.resolve({ id: 'explicit-company-123', isActive: true });
        }
        return Promise.resolve(null);
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          companyId: 'explicit-company-123',
          firstName: 'كريم',
          phone: '01066667777',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.companyId).toBe('explicit-company-123');
    });

    test('resolves platform company from SUPER_ADMIN user company in DB', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(null);
      mockPrisma.user.findFirst.mockResolvedValue({
        companyId: 'company-superadmin-bound',
        company: { id: 'company-superadmin-bound', isActive: true },
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'سارة',
          phone: '01234567890',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.companyId).toBe('company-superadmin-bound');
    });

    test('subdomain request uses req.company.id directly', async () => {
      mockGetCompanyFromSubdomain.mockImplementation((req, _res, next) => {
        req.company = { id: 'subdomain-company-123' };
        next();
      });

      const res = await request(app)
        .post('/api/v1/public/customers/lead-capture')
        .send({
          firstName: 'طارق',
          phone: '01512345678',
          source: 'store-complete-bundle',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            company: { connect: { id: 'subdomain-company-123' } },
          }),
        })
      );
    });
  });
});
