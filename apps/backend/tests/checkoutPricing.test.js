/**
 * Checkout Pricing Unit & Regression Tests
 * Tests unified pricing resolution across /public/orders and /kashier/checkout
 * (Task 8: Single source of truth & electronic payment discount parity)
 */

const {
  resolveCheckoutPricing,
  buildCompositeDiscountReason,
  resolveDiscountReason,
} = require('../utils/orderDiscountUtils');

describe('Unified Checkout Pricing Engine (resolveCheckoutPricing)', () => {
  const mockCompanyId = 'comp-test-swan-1031';

  // Mock StorefrontSettings with 10% electronic discount for card
  const createMockPrisma = (options = {}) => {
    const {
      discountEnabled = true,
      discountPercent = 10,
      isWalletEnabled = false,
      coupon = null,
      companySettings = { disableAutoDiscountsWithoutApproval: true },
      existingOrder = null,
    } = options;

    return {
      storefrontSettings: {
        findUnique: jest.fn().mockResolvedValue({
          walletPaymentSettings: JSON.stringify({
            enabled: isWalletEnabled,
            discountEnabled,
            discountPercent,
            showDiscountBadge: true,
          }),
          enabledPaymentMethods: JSON.stringify(['cod', 'card']),
        }),
      },
      company: {
        findUnique: jest.fn().mockResolvedValue({
          settings: JSON.stringify(companySettings),
        }),
      },
      coupon: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (coupon && coupon.code.toUpperCase() === where.code.toUpperCase()) {
            return Promise.resolve(coupon);
          }
          return Promise.resolve(null);
        }),
      },
      order: {
        findFirst: jest.fn().mockResolvedValue(existingOrder || null),
      },
      customer: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      customerLoyaltyTier: {
        count: jest.fn().mockResolvedValue(0),
      },
      storePromotion: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
  };

  test('Criteria 1: Card checkout subtotal 600 with 10% discount setting -> discount 60, total 610', async () => {
    const prisma = createMockPrisma({ discountEnabled: true, discountPercent: 10 });

    const result = await resolveCheckoutPricing({
      prisma,
      companyId: mockCompanyId,
      subtotal: 600,
      shippingCost: 70,
      paymentMethod: 'card',
    });

    expect(result.subtotal).toBe(600);
    expect(result.electronicDiscount).toBe(60);
    expect(result.totalDiscount).toBe(60);
    expect(result.shipping).toBe(70);
    expect(result.total).toBe(610);
    expect(result.reasons).toContain('خصم الدفع الإلكتروني (10%)');
    expect(result.orderMetadata.walletDiscount).toEqual({
      percent: 10,
      discountAmount: 60,
    });
  });

  test('Criteria 2: Same cart on COD pathway -> discount 0, total 670', async () => {
    const prisma = createMockPrisma({ discountEnabled: true, discountPercent: 10 });

    const result = await resolveCheckoutPricing({
      prisma,
      companyId: mockCompanyId,
      subtotal: 600,
      shippingCost: 70,
      paymentMethod: 'cod',
    });

    expect(result.subtotal).toBe(600);
    expect(result.electronicDiscount).toBe(0);
    expect(result.totalDiscount).toBe(0);
    expect(result.shipping).toBe(70);
    expect(result.total).toBe(670);
    expect(result.reasons).toBeNull();
  });

  test('Criteria 3: Coupon (10%) + Electronic discount (10%) together -> correct total without duplication', async () => {
    const mockCoupon = {
      id: 'cpn-10',
      code: 'SAVE10',
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
      usageCount: 0,
      usageLimit: 100,
      minOrderAmount: 100,
    };

    const prisma = createMockPrisma({
      discountEnabled: true,
      discountPercent: 10,
      coupon: mockCoupon,
    });

    const result = await resolveCheckoutPricing({
      prisma,
      companyId: mockCompanyId,
      subtotal: 600,
      shippingCost: 70,
      couponCode: 'SAVE10',
      paymentMethod: 'card',
    });

    expect(result.subtotal).toBe(600);
    expect(result.couponDiscount).toBe(60);
    expect(result.electronicDiscount).toBe(60);
    expect(result.totalDiscount).toBe(120);
    expect(result.shipping).toBe(70);
    expect(result.total).toBe(550); // 600 - 120 + 70
    expect(result.reasons).toContain('كوبون: SAVE10');
    expect(result.reasons).toContain('خصم الدفع الإلكتروني (10%)');
  });

  test('Criteria 4: Same cart on both routes yields identical totals to the penny', async () => {
    const prisma = createMockPrisma({ discountEnabled: true, discountPercent: 10 });
    const items = [
      { productId: 'p1', quantity: 2, price: 150 },
      { productId: 'p2', quantity: 1, price: 300 },
    ]; // Subtotal = 600

    // Evaluating as Kashier card
    const kashierPricing = await resolveCheckoutPricing({
      prisma,
      companyId: mockCompanyId,
      items,
      shippingCost: 70,
      paymentMethod: 'card',
    });

    // Evaluating as PublicOrders card
    const publicPricing = await resolveCheckoutPricing({
      prisma,
      companyId: mockCompanyId,
      items,
      shippingCost: 70,
      paymentMethod: 'card',
    });

    expect(kashierPricing.subtotal).toBe(publicPricing.subtotal);
    expect(kashierPricing.totalDiscount).toBe(publicPricing.totalDiscount);
    expect(kashierPricing.shipping).toBe(publicPricing.shipping);
    expect(kashierPricing.total).toBe(publicPricing.total);
    expect(kashierPricing.reasons).toBe(publicPricing.reasons);
    expect(kashierPricing.total).toBe(610);
  });

  test('Criteria 5: Free shipping coupon zeroes shipping and maintains discount', async () => {
    const mockFreeShipCoupon = {
      id: 'cpn-free-ship',
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 0,
      isActive: true,
      usageCount: 0,
      usageLimit: 100,
      minOrderAmount: 200,
    };

    const prisma = createMockPrisma({
      discountEnabled: true,
      discountPercent: 10,
      coupon: mockFreeShipCoupon,
    });

    const result = await resolveCheckoutPricing({
      prisma,
      companyId: mockCompanyId,
      subtotal: 600,
      shippingCost: 70,
      couponCode: 'FREESHIP',
      paymentMethod: 'card',
    });

    expect(result.subtotal).toBe(600);
    expect(result.shipping).toBe(0);
    expect(result.freeShippingAdjustment).toBeDefined();
    expect(result.freeShippingAdjustment.source).toBe('coupon-free-shipping');
    expect(result.electronicDiscount).toBe(60);
    expect(result.totalDiscount).toBe(60);
    expect(result.total).toBe(540); // 600 - 60 + 0
  });

  test('Criteria 6: Idempotent order discount reason formatting', () => {
    const mockOrder = {
      discount: 60,
      metadata: JSON.stringify({
        walletDiscount: { percent: 10, discountAmount: 60 },
      }),
    };

    const reason = resolveDiscountReason(mockOrder);
    expect(reason).toBe('خصم الدفع الإلكتروني (10%)');
  });
});
