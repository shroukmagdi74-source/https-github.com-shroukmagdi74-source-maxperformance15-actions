const express = require('express');
const request = require('supertest');

const mockPrisma = {
  company: { findUnique: jest.fn() },
  storefrontAnalyticsEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
}));

// Mock verifyToken middleware to simulate authenticated merchant
jest.mock('../../utils/verifyToken', () => {
  const middleware = (req, res, next) => {
    req.user = { id: 'user-1', companyId: 'company-123', role: 'ADMIN' };
    next();
  };
  middleware.authenticateToken = (req, res, next) => {
    req.user = { id: 'user-1', companyId: 'company-123', role: 'ADMIN' };
    next();
  };
  middleware.requireCompanyAccess = (req, res, next) => {
    req.user = req.user || { id: 'user-1', companyId: 'company-123', role: 'ADMIN' };
    req.user.effectiveCompanyId = req.query.companyId || req.user.companyId || 'company-123';
    next();
  };
  return middleware;
});

const storefrontAnalyticsRoutes = require('../../routes/storefrontAnalyticsRoutes');
const { resetRateLimits } = require('../../controller/storefrontAnalyticsController');

describe('Storefront Analytics Routes & Controller (AN-1)', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimits();
    app = express();
    app.use(express.json());
    app.use('/api/v1/storefront-analytics', storefrontAnalyticsRoutes);
  });

  describe('POST /api/v1/storefront-analytics/event (Public Beacon)', () => {
    test('successfully records a valid view event without auth or personal info', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-123', isActive: true });
      mockPrisma.storefrontAnalyticsEvent.create.mockResolvedValue({ id: 'event-1' });

      const res = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .send({
          companySlug: 'swan-store',
          pageKey: 'home',
          sectionType: 'hero-banner',
          eventType: 'view',
          sessionId: 'sf_session_12345',
          path: '/store/swan-store',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify Prisma call — ZERO IP stored, ZERO personal data stored
      expect(mockPrisma.storefrontAnalyticsEvent.create).toHaveBeenCalledTimes(1);
      const callData = mockPrisma.storefrontAnalyticsEvent.create.mock.calls[0][0].data;

      expect(callData).toEqual({
        companyId: 'company-123',
        pageKey: 'home',
        sectionType: 'hero-banner',
        eventType: 'view',
        sessionId: 'sf_session_12345',
        path: '/store/swan-store',
      });
      expect(callData.ip).toBeUndefined();
      expect(callData.clientIp).toBeUndefined();
    });

    test('successfully records a valid click event', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-123', isActive: true });
      mockPrisma.storefrontAnalyticsEvent.create.mockResolvedValue({ id: 'event-2' });

      const res = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .send({
          companySlug: 'swan-store',
          pageKey: 'product-detail',
          sectionType: 'cta-button',
          eventType: 'click',
          sessionId: 'sf_session_12345',
          path: '/product/shoes',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.storefrontAnalyticsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'company-123',
            pageKey: 'product-detail',
            sectionType: 'cta-button',
            eventType: 'click',
          }),
        })
      );
    });

    test('rejects missing or empty companySlug with 400', async () => {
      const res = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .send({
          pageKey: 'home',
          eventType: 'view',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('companySlug');
      expect(mockPrisma.storefrontAnalyticsEvent.create).not.toHaveBeenCalled();
    });

    test('rejects invalid eventType with 400', async () => {
      const res = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .send({
          companySlug: 'swan-store',
          pageKey: 'home',
          eventType: 'hover',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('eventType');
      expect(mockPrisma.storefrontAnalyticsEvent.create).not.toHaveBeenCalled();
    });

    test('rejects missing or oversized pageKey (> 64 chars) with 400', async () => {
      const longKey = 'a'.repeat(65);
      const res = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .send({
          companySlug: 'swan-store',
          pageKey: longKey,
          eventType: 'view',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('pageKey');
      expect(mockPrisma.storefrontAnalyticsEvent.create).not.toHaveBeenCalled();
    });

    test('returns 404 if companySlug does not exist in DB', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .send({
          companySlug: 'unknown-merchant-xyz',
          pageKey: 'home',
          eventType: 'view',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(mockPrisma.storefrontAnalyticsEvent.create).not.toHaveBeenCalled();
    });

    test('enforces in-memory rate limiting (max 60 events/minute/IP)', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ id: 'company-123', isActive: true });
      mockPrisma.storefrontAnalyticsEvent.create.mockResolvedValue({ id: 'event-x' });

      // Send 60 requests successfully
      for (let i = 0; i < 60; i++) {
        const res = await request(app)
          .post('/api/v1/storefront-analytics/event')
          .set('X-Forwarded-For', '198.51.100.42')
          .send({
            companySlug: 'swan-store',
            pageKey: 'home',
            eventType: 'view',
          });
        expect(res.status).toBe(201);
      }

      // 61st request from same IP must be rejected with 429
      const rateLimitedRes = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .set('X-Forwarded-For', '198.51.100.42')
        .send({
          companySlug: 'swan-store',
          pageKey: 'home',
          eventType: 'view',
        });

      expect(rateLimitedRes.status).toBe(429);
      expect(rateLimitedRes.body.success).toBe(false);
      expect(rateLimitedRes.body.message).toContain('Rate limit exceeded');

      // A different IP is still permitted
      const diffIpRes = await request(app)
        .post('/api/v1/storefront-analytics/event')
        .set('X-Forwarded-For', '198.51.100.99')
        .send({
          companySlug: 'swan-store',
          pageKey: 'home',
          eventType: 'view',
        });
      expect(diffIpRes.status).toBe(201);
    });
  });

  describe('GET /api/v1/storefront-analytics/summary (Editor Dashboard)', () => {
    test('returns empty summary with zero fake numbers when no data exists', async () => {
      mockPrisma.storefrontAnalyticsEvent.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/storefront-analytics/summary?days=7')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totals: {
          views: 0,
          clicks: 0,
          ctr: 0,
        },
        pages: [],
        sections: [],
      });
    });

    test('accurately calculates views, clicks, CTR, and groups sorted pages and sections', async () => {
      const mockEvents = [
        // home page
        { pageKey: 'home', sectionType: 'hero-banner', eventType: 'view' },
        { pageKey: 'home', sectionType: 'hero-banner', eventType: 'view' },
        { pageKey: 'home', sectionType: 'hero-banner', eventType: 'click' },
        { pageKey: 'home', sectionType: 'product-grid', eventType: 'view' },
        { pageKey: 'home', sectionType: 'product-grid', eventType: 'click' },

        // shop page
        { pageKey: 'shop', sectionType: 'product-grid', eventType: 'view' },
        { pageKey: 'shop', sectionType: 'filters', eventType: 'view' },
      ];

      mockPrisma.storefrontAnalyticsEvent.findMany.mockResolvedValue(mockEvents);

      const res = await request(app)
        .get('/api/v1/storefront-analytics/summary?days=7')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.totals.views).toBe(5);
      expect(res.body.totals.clicks).toBe(2);
      // CTR: 2 / 5 = 0.4
      expect(res.body.totals.ctr).toBe(0.4);

      // Pages: home (views: 3, clicks: 2) > shop (views: 2, clicks: 0)
      expect(res.body.pages).toHaveLength(2);
      expect(res.body.pages[0]).toEqual({ pageKey: 'home', views: 3, clicks: 2 });
      expect(res.body.pages[1]).toEqual({ pageKey: 'shop', views: 2, clicks: 0 });

      // Sections sorted by views desc
      expect(res.body.sections).toHaveLength(3);
      expect(res.body.sections[0]).toEqual({ sectionType: 'hero-banner', views: 2, clicks: 1 });
      expect(res.body.sections[1]).toEqual({ sectionType: 'product-grid', views: 2, clicks: 1 });
      expect(res.body.sections[2]).toEqual({ sectionType: 'filters', views: 1, clicks: 0 });
    });

    test('respects days parameter in cutoff date query', async () => {
      mockPrisma.storefrontAnalyticsEvent.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/v1/storefront-analytics/summary?days=14')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPrisma.storefrontAnalyticsEvent.findMany).toHaveBeenCalledTimes(1);
      const whereClause = mockPrisma.storefrontAnalyticsEvent.findMany.mock.calls[0][0].where;

      expect(whereClause.companyId).toBe('company-123');
      expect(whereClause.createdAt.gte).toBeInstanceOf(Date);

      // Cutoff should be approximately 14 days ago
      const diffDays = (Date.now() - whereClause.createdAt.gte.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(diffDays)).toBe(14);
    });
  });
});
