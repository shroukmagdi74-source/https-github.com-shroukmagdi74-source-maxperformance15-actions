const {
  buildCustomerListWhere,
  buildEffectiveCustomerListWhere,
  buildPurchasedProductOrderFilter,
  applyExclusionConditions,
  applyContactExclusion,
  criteriaToSummary,
} = require('../../utils/customerListCriteria');

describe('Customer List Product Condition (Unit Tests)', () => {
  const companyId = 'comp_swan_test';
  const swanBootId = 'd1b686cc-b34a-4653-b287-a808efd77904';
  const swanAuraId = 'cmroanibs0b62ju1mgza7pxki';

  describe('buildPurchasedProductOrderFilter', () => {
    test('منتج واحد → fragment صحيح بـ items.some.productId.in', () => {
      const fragment = buildPurchasedProductOrderFilter({
        type: 'purchasedProduct',
        productIds: [swanBootId],
        status: 'DELIVERED',
        days: 30,
      });

      expect(fragment).toBeDefined();
      expect(fragment.orders.some.status).toBe('DELIVERED');
      expect(fragment.orders.some.orderItems.some.productId.in).toEqual([swanBootId]);
      expect(fragment.orders.some.createdAt.gte).toBeInstanceOf(Date);
    });

    test('يدعم استخراج المعرفات من criteria.products إذا لم تكن productIds متوفرة', () => {
      const fragment = buildPurchasedProductOrderFilter({
        type: 'purchasedProduct',
        products: [{ id: swanBootId, name: 'Swan Boot', sku: 'sw 84' }],
      });

      expect(fragment).toBeDefined();
      expect(fragment.orders.some.orderItems.some.productId.in).toEqual([swanBootId]);
      expect(fragment.orders.some.status).toBe('DELIVERED');
    });

    test('productIds فارغة أو غير متوفرة → يعيد null', () => {
      expect(buildPurchasedProductOrderFilter({ type: 'purchasedProduct', productIds: [] })).toBeNull();
      expect(buildPurchasedProductOrderFilter({ type: 'purchasedProduct' })).toBeNull();
      expect(buildPurchasedProductOrderFilter(null)).toBeNull();
    });
  });

  describe('buildCustomerListWhere — الشرط الأساسي', () => {
    test('منتج واحد مع حالة افتراضية DELIVERED وفترة 30 يوم', () => {
      const { where } = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [swanBootId],
        days: 30,
      });

      expect(where.companyId).toBe(companyId);
      expect(where.orders.some.status).toBe('DELIVERED');
      expect(where.orders.some.orderItems.some.productId.in).toEqual([swanBootId]);
      expect(where.orders.some.createdAt.gte).toBeInstanceOf(Date);
    });

    test('منتجين (أو) → كلا المنتجين في نفس مصفوفة in', () => {
      const { where } = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [swanBootId, swanAuraId],
        status: 'DELIVERED',
      });

      expect(where.companyId).toBe(companyId);
      expect(where.orders.some.orderItems.some.productId.in).toEqual([swanBootId, swanAuraId]);
    });

    test('بدون فترة زمنية (days = null / 0 / غير محدد) → لا يوجد قيد createdAt', () => {
      const resNull = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [swanBootId],
        days: null,
      });
      expect(resNull.where.orders.some.createdAt).toBeUndefined();

      const resZero = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [swanBootId],
        days: 0,
      });
      expect(resZero.where.orders.some.createdAt).toBeUndefined();

      const resOmit = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [swanBootId],
      });
      expect(resOmit.where.orders.some.createdAt).toBeUndefined();
    });

    test('تغيير حالة الأوردر (مثلاً RETURNED أو CONFIRMED) → تنتقل للفلتر بدقة', () => {
      const { where } = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [swanBootId],
        status: 'RETURNED',
        days: 14,
      });

      expect(where.orders.some.status).toBe('RETURNED');
    });

    test('productIds فارغ أو ليس مصفوفة → مفيش نتائج (id in []) لعدم إرجاع كل الشركة', () => {
      const emptyArr = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: [],
      });
      expect(emptyArr.where).toEqual({ companyId, id: { in: [] } });

      const notArr = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
        productIds: null,
      });
      expect(notArr.where).toEqual({ companyId, id: { in: [] } });

      const missing = buildCustomerListWhere(companyId, {
        type: 'purchasedProduct',
      });
      expect(missing.where).toEqual({ companyId, id: { in: [] } });
    });
  });

  describe('applyExclusionConditions — الاستثناء', () => {
    test('استثناء منتج يضيف NOT مع fragment نظيف خالي من companyId و status', () => {
      const baseWhere = { companyId, status: 'ACTIVE' };
      const out = applyExclusionConditions(baseWhere, {
        exclusions: [
          {
            type: 'purchasedProduct',
            productIds: [swanBootId],
            status: 'DELIVERED',
            days: 30,
          },
        ],
      });

      expect(out.companyId).toBe(companyId);
      expect(out.status).toBe('ACTIVE');
      expect(out.NOT).toBeDefined();

      const notItem = Array.isArray(out.NOT) ? out.NOT[0] : out.NOT;
      expect(notItem.orders.some.status).toBe('DELIVERED');
      expect(notItem.orders.some.orderItems.some.productId.in).toEqual([swanBootId]);
      // تأكيد حرج: لا يوجد companyId ولا status داخل NOT
      expect(notItem.companyId).toBeUndefined();
      expect(notItem.status).toBeUndefined();
    });

    test('استثناء منتج يندمج مع NOT الخاصة بـ excludeContactedInDays دون تدميرها', () => {
      const baseWhere = { companyId, status: 'ACTIVE' };
      // 1. تطبيق استثناء التواصل
      const afterContact = applyContactExclusion(baseWhere, { excludeContactedInDays: 7 });
      expect(afterContact.NOT).toBeDefined();

      // 2. تطبيق استثناء المنتج
      const afterBoth = applyExclusionConditions(afterContact, {
        exclusions: [
          {
            type: 'purchasedProduct',
            productIds: [swanBootId],
            status: 'DELIVERED',
          },
        ],
      });

      expect(Array.isArray(afterBoth.NOT)).toBe(true);
      expect(afterBoth.NOT.length).toBe(2);

      // أول عنصر هو استثناء التواصل
      expect(afterBoth.NOT[0].conversations.some.messages.some.createdAt.gte).toBeInstanceOf(Date);
      // ثاني عنصر هو استثناء شراء المنتج
      expect(afterBoth.NOT[1].orders.some.orderItems.some.productId.in).toEqual([swanBootId]);
    });

    test('بدون استثناءات أو استثناء فارغ → يعيد where الأصلية دون تعديل', () => {
      const baseWhere = { companyId, status: 'ACTIVE' };
      expect(applyExclusionConditions(baseWhere, {})).toEqual(baseWhere);
      expect(applyExclusionConditions(baseWhere, { exclusions: [] })).toEqual(baseWhere);
      expect(
        applyExclusionConditions(baseWhere, {
          exclusions: [{ type: 'purchasedProduct', productIds: [] }],
        })
      ).toEqual(baseWhere);
    });
  });

  describe('buildEffectiveCustomerListWhere مع الاستثناءات', () => {
    test('يطبق الشرط الأساسي واستثناء المشتريات معاً في pure where', async () => {
      const prismaMock = { order: { groupBy: jest.fn().mockResolvedValue([]) } };
      const { where } = await buildEffectiveCustomerListWhere(prismaMock, companyId, {
        type: 'all',
        excludeContactedInDays: 7,
        exclusions: [
          {
            type: 'purchasedProduct',
            productIds: [swanBootId],
            status: 'DELIVERED',
          },
        ],
      });

      expect(where.companyId).toBe(companyId);
      expect(where.status).toBe('ACTIVE');
      expect(Array.isArray(where.NOT)).toBe(true);
      expect(where.NOT.length).toBe(2);
    });
  });

  describe('criteriaToSummary — وصف الشرط بالعربي والإنجليزي', () => {
    test('عربي: منتج واحد مع فترة 30 يوم', () => {
      const summary = criteriaToSummary({
        type: 'purchasedProduct',
        productIds: [swanBootId],
        products: [{ id: swanBootId, name: 'Swan Boot', sku: 'sw 84' }],
        status: 'DELIVERED',
        days: 30,
      });

      expect(summary).toBe('اشترى: Swan Boot (sw 84) — تم التسليم · آخر 30 يوم');
    });

    test('عربي: أكثر من منتج بدون حد زمني', () => {
      const summary = criteriaToSummary({
        type: 'purchasedProduct',
        productIds: [swanBootId, swanAuraId],
        products: [
          { id: swanBootId, name: 'Swan Boot', sku: 'sw 84' },
          { id: swanAuraId, name: 'Swan Aura', sku: 'sw209' },
        ],
        status: 'DELIVERED',
      });

      expect(summary).toBe('اشترى: Swan Boot (sw 84) أو Swan Aura (sw209) — تم التسليم · بدون حد زمني');
    });

    test('إنجليزي: منتج واحد مع فترة 30 يوم', () => {
      const summary = criteriaToSummary(
        {
          type: 'purchasedProduct',
          productIds: [swanBootId],
          products: [{ id: swanBootId, name: 'Swan Boot', sku: 'sw 84' }],
          status: 'DELIVERED',
          days: 30,
        },
        'en'
      );

      expect(summary).toBe('Purchased: Swan Boot (sw 84) — Delivered · last 30 days');
    });

    test('إنجليزي: أكثر من منتج بدون حد زمني', () => {
      const summary = criteriaToSummary(
        {
          type: 'purchasedProduct',
          productIds: [swanBootId, swanAuraId],
          products: [
            { id: swanBootId, name: 'Swan Boot', sku: 'sw 84' },
            { id: swanAuraId, name: 'Swan Aura', sku: 'sw209' },
          ],
          status: 'DELIVERED',
        },
        'en'
      );

      expect(summary).toBe('Purchased: Swan Boot (sw 84) or Swan Aura (sw209) — Delivered · no time limit');
    });

    test('عربي: مع استثناء يضاف في النهاية', () => {
      const summary = criteriaToSummary({
        type: 'all',
        exclusions: [
          {
            type: 'purchasedProduct',
            productIds: [swanBootId],
            products: [{ id: swanBootId, name: 'Swan Boot', sku: 'sw 84' }],
            status: 'DELIVERED',
            days: 30,
          },
        ],
      });

      expect(summary).toBe(
        'جميع العملاء النشطين | استثناء: اشترى: Swan Boot (sw 84) — تم التسليم · آخر 30 يوم'
      );
    });

    test('إنجليزي: مع استثناء يضاف في النهاية', () => {
      const summary = criteriaToSummary(
        {
          type: 'all',
          exclusions: [
            {
              type: 'purchasedProduct',
              productIds: [swanBootId],
              products: [{ id: swanBootId, name: 'Swan Boot', sku: 'sw 84' }],
              status: 'DELIVERED',
              days: 30,
            },
          ],
        },
        'en'
      );

      expect(summary).toBe(
        'All active customers | Excluding: Purchased: Swan Boot (sw 84) — Delivered · last 30 days'
      );
    });

    test('التوافق للخلف: استدعاء بمعامل واحد يعيد النص العربي الأصلي', () => {
      expect(criteriaToSummary({ type: 'all' })).toBe('جميع العملاء النشطين');
    });
  });
});