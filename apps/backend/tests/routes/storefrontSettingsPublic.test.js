const express = require('express');
const request = require('supertest');

const mockCompany = {
  id: 'company-maxp-1',
  name: 'Max-P Store',
  slug: 'max-p',
  customDomain: null,
  currency: 'EGP',
  isActive: true,
  settings: JSON.stringify({ description: 'المتجر الرسمي لعلامة ماكس بي' }),
  facebookPixelAccessToken: 'SECRET_FB_TOKEN_DO_NOT_LEAK',
  facebookAdsAccessToken: 'SECRET_ADS_TOKEN_DO_NOT_LEAK',
};

const mockStorefrontSettings = {
  id: 'settings-1',
  companyId: 'company-maxp-1',
  themeId: 'khemet-fashion-eg',
  paymentGatewayConfig: JSON.stringify({ apiKey: 'SECRET_API_KEY', secretKey: 'SUPER_SECRET_KEY' }),
  enabledPaymentMethods: '["cod","card"]',
  designTokens: {
    themeId: 'khemet-fashion-eg',
    global: {
      header: {
        logoText: 'Max-P Fashion',
        sticky: true,
        showSearch: true,
        announcement: {
          enabled: true,
          text: 'شحن مجاني للطلبات فوق 1000 ج.م',
          bg: '#000000',
          fg: '#ffffff',
        },
        menu: [
          { id: 'm1', label: 'تسوق الآن', href: '/shop' },
          { id: 'm2', label: 'العروض', href: '/sale' },
        ],
      },
      footer: {
        copyright: '© 2026 Max-P. جميع الحقوق محفوظة.',
        columns: [
          { id: 'col1', title: 'عن المتجر', links: [{ label: 'قصتنا', href: '/about' }] },
        ],
        social: [
          { platform: 'facebook', href: 'https://facebook.com/maxp' },
        ],
        showPaymentBadges: true,
      },
    },
    pages: {
      home: { sections: [{ type: 'hero-banner' }] },
    },
    pageOverrides: {
      shop: { sections: [{ type: 'product-grid' }] },
    },
    pageStyles: {
      home: { accent: '#2563eb', density: 'normal' },
    },
    i18n: {
      locale: 'ar',
      translations: { shopNow: 'تسوق الآن' },
    },
    theme: {
      direction: 'rtl',
    },
    // Secret/internal token that should NOT be in safe tokens
    internalSecretKey: 'SENSITIVE_INTERNAL_TOKEN_VALUE',
  },
};

const mockPrisma = {
  company: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  storefrontSettings: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
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
  },
}));

jest.mock('../../utils/verifyToken', () => {
  const middleware = (req, res, next) => {
    req.user = { id: 'user-admin', companyId: 'company-maxp-1', role: 'ADMIN' };
    next();
  };
  middleware.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer valid-token')) {
      return res.status(401).json({ success: false, code: 'AUTHENTICATION_REQUIRED' });
    }
    req.user = { id: 'user-admin', companyId: 'company-maxp-1', role: 'ADMIN' };
    next();
  };
  middleware.requireCompanyAccess = (req, res, next) => {
    req.user.effectiveCompanyId = req.user.companyId || 'company-maxp-1';
    next();
  };
  return middleware;
});

const storefrontSettingsRoutes = require('../../routes/storefrontSettingsRoutes');

describe('Ticket HF-1.1: Public Storefront Settings Endpoint & Header/Footer Binding', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany);
    mockPrisma.company.findUnique.mockResolvedValue(mockCompany);
    mockPrisma.storefrontSettings.findUnique.mockResolvedValue(mockStorefrontSettings);
    mockPrisma.storefrontSettings.upsert.mockResolvedValue(mockStorefrontSettings);

    app = express();
    app.use(express.json());
    app.use('/api/v1/storefront-settings', storefrontSettingsRoutes);
    app.get('/api/v1/storefront/public-settings', (req, res, next) =>
      require('../../controller/storefrontSettingsController').getPublicSettings(req, res, next)
    );
  });

  // Test 1: Public endpoint returns 200 without token
  test('1. GET /api/v1/storefront-settings/public returns 200 without auth token (via ?company=slug)', async () => {
    const res = await request(app)
      .get('/api/v1/storefront-settings/public?company=max-p');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.themeId).toBe('khemet-fashion-eg');
    expect(res.body.data.companySlug).toBe('max-p');
  });

  // Test 2: Public endpoint resolves company from Host subdomain or x-company-slug
  test('2. GET /api/v1/storefront-settings/public resolves company from host header or x-company-slug', async () => {
    const hostRes = await request(app)
      .get('/api/v1/storefront-settings/public')
      .set('Host', 'max-p.maxp.online');

    expect(hostRes.status).toBe(200);
    expect(hostRes.body.success).toBe(true);

    const headerRes = await request(app)
      .get('/api/v1/storefront-settings/public')
      .set('x-company-slug', 'max-p');

    expect(headerRes.status).toBe(200);
    expect(headerRes.body.success).toBe(true);
  });

  // Test 3: Public endpoint returns ONLY safe fields and zero secrets
  test('3. Returns safe tokens (pages, pageOverrides, pageStyles, global, i18n, theme) and NO secrets', async () => {
    const res = await request(app)
      .get('/api/v1/storefront-settings/public?company=max-p');

    expect(res.status).toBe(200);
    const data = res.body.data;

    // Verify safe fields exist
    expect(data.designTokens).toBeDefined();
    expect(data.designTokens.global).toBeDefined();
    expect(data.designTokens.global.header.menu[0].label).toBe('تسوق الآن');
    expect(data.designTokens.global.header.announcement.text).toBe('شحن مجاني للطلبات فوق 1000 ج.م');
    expect(data.designTokens.global.footer.copyright).toBe('© 2026 Max-P. جميع الحقوق محفوظة.');
    expect(data.designTokens.pages).toBeDefined();
    expect(data.designTokens.pageOverrides).toBeDefined();
    expect(data.designTokens.pageStyles).toBeDefined();
    expect(data.designTokens.i18n).toBeDefined();
    expect(data.designTokens.theme).toBeDefined();

    // Verify ZERO secrets leaked
    expect(data.paymentGatewayConfig).toBeUndefined();
    expect(data.facebookPixelAccessToken).toBeUndefined();
    expect(data.facebookAdsAccessToken).toBeUndefined();
    expect(data.designTokens.internalSecretKey).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('SECRET_API_KEY');
    expect(JSON.stringify(res.body)).not.toContain('SUPER_SECRET_KEY');
    expect(JSON.stringify(res.body)).not.toContain('SECRET_FB_TOKEN');
  });

  // Test 4: Caching headers
  test('4. Sets Cache-Control: public, max-age=60 header', async () => {
    const res = await request(app)
      .get('/api/v1/storefront-settings/public?company=max-p');

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=60');
  });

  // Test 5: Alias endpoint /api/v1/storefront/public-settings works identically
  test('5. Alias endpoint GET /api/v1/storefront/public-settings returns 200 with same safe payload', async () => {
    const res = await request(app)
      .get('/api/v1/storefront/public-settings?company=max-p');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.designTokens.global.header.menu[0].label).toBe('تسوق الآن');
  });

  // Test 6: Authenticated endpoint still protected and functional
  test('6. Authenticated endpoint GET /api/v1/storefront-settings rejects 401 without token, succeeds with token', async () => {
    // Without token: 401
    const unauthedRes = await request(app).get('/api/v1/storefront-settings');
    expect(unauthedRes.status).toBe(401);

    // With valid token: 200
    const authedRes = await request(app)
      .get('/api/v1/storefront-settings')
      .set('Authorization', 'Bearer valid-token-123');

    expect(authedRes.status).toBe(200);
    expect(authedRes.body.success).toBe(true);
  });

  // Test 7: Rate limiter returns 429 when threshold exceeded
  test('7. Rate limiter rejects with 429 when request limit is exceeded', async () => {
    const ip = '203.0.113.199';
    let rateLimited = false;

    for (let i = 0; i < 115; i++) {
      const res = await request(app)
        .get('/api/v1/storefront-settings/public?company=max-p')
        .set('x-forwarded-for', ip);

      if (res.status === 429) {
        rateLimited = true;
        expect(res.body.success).toBe(false);
        break;
      }
    }

    expect(rateLimited).toBe(true);
  });

  // Test 8: Non-existent company returns 404
  test('8. Returns 404 when company cannot be resolved', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(null);
    mockPrisma.company.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/storefront-settings/public?company=unknown-non-existent-store');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Company not found');
  });
});
