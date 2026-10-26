const {
  validateCreateApp,
  validateUpdateApp,
  validateCreateBundle,
  validateUpdateBundle,
} = require('../../validators/marketplaceManagementValidator');

function mockReqRes(body = {}) {
  const req = { body };
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };
  return { req, res, next, wasNextCalled: () => nextCalled };
}

describe('marketplaceManagementValidator', () => {
  describe('validateUpdateApp', () => {
    it('accepts valid app with structured features object (like in apps.json catalog)', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'تكامل WooCommerce',
        slug: 'woocommerce-pro',
        description: 'مزامنة المنتجات والطلبات والمخزون',
        category: 'INTEGRATION',
        pricingModel: 'SUBSCRIPTION',
        monthlyPrice: 79,
        yearlyPrice: 790,
        trialDays: 14,
        requiredApps: ['store'],
        features: {
          productSync: {
            enabled: true,
            name: 'مزامنة المنتجات',
            access: 'PAID',
          },
          orderSync: {
            enabled: true,
            name: 'مزامنة الطلبات',
            access: 'PAID',
          },
        },
        isActive: true,
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(req.body.name).toBe('تكامل WooCommerce');
      expect(req.body.slug).toBe('woocommerce-pro');
      expect(req.body.requiredApps).toEqual(['store']);
      expect(typeof req.body.features).toBe('object');
    });

    it('normalizes stringified JSON in requiredApps', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'WooCommerce',
        requiredApps: '["store", "orders"]',
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(req.body.requiredApps).toEqual(['store', 'orders']);
    });

    it('normalizes comma-separated string in requiredApps', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'WooCommerce',
        requiredApps: 'store, orders',
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(req.body.requiredApps).toEqual(['store', 'orders']);
    });

    it('normalizes lowercase pricingModel and ppuBillingMethod', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'Pay App',
        pricingModel: 'pay_per_use',
        ppuBillingMethod: 'per_order',
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(req.body.pricingModel).toBe('PAY_PER_USE');
      expect(req.body.ppuBillingMethod).toBe('PER_ORDER');
    });

    it('normalizes uppercase slug', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'Woo App',
        slug: 'WOO-COMMERCE-PRO',
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(req.body.slug).toBe('woo-commerce-pro');
    });

    it('accepts array of objects in features', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'Custom App',
        features: [
          { name: 'Feature 1', description: 'Desc 1' },
          { name: 'Feature 2', description: 'Desc 2' },
        ],
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(req.body.features).toHaveLength(2);
    });

    it('rejects invalid slug format', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'Test App',
        slug: 'invalid_slug_with_underscores!',
      });

      validateUpdateApp(req, res, next);

      expect(wasNextCalled()).toBe(false);
      expect(res.statusCode).toBe(400);
      expect(res.payload.success).toBe(false);
      expect(res.payload.errors.slug).toBeDefined();
    });
  });

  describe('validateUpdateBundle', () => {
    it('normalizes stringified appIds into array', () => {
      const { req, res, next, wasNextCalled } = mockReqRes({
        name: 'Starter Bundle',
        appIds: '["app-1", "app-2"]',
      });

      validateUpdateBundle(req, res, next);

      expect(wasNextCalled()).toBe(true);
      expect(req.body.appIds).toEqual(['app-1', 'app-2']);
    });
  });
});
