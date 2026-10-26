/**
 * Integration test for customer list product purchase condition on Live DB.
 *
 * Runs ONLY when MAXP_LIVE_DB=1 (e.g. against staging or production).
 * Compares pure Prisma where count against direct PostgreSQL query with DISTINCT customerId.
 */

const isLive = process.env.MAXP_LIVE_DB === '1';
const maybeDescribe = isLive ? describe : describe.skip;

maybeDescribe('Customer List Product Condition (Live DB Integration)', () => {
  const { getSharedPrismaClient } = require('../../services/sharedDatabase');
  const {
    buildEffectiveCustomerListWhere,
  } = require('../../utils/customerListCriteria');

  const companyId = 'cmleybpf70028juo2wwpmp8rt';
  const swanBootId = 'd1b686cc-b34a-4653-b287-a808efd77904';
  const swanAuraId = 'cmroanibs0b62ju1mgza7pxki';

  let prisma;

  beforeAll(() => {
    prisma = getSharedPrismaClient();
  });

  afterAll(async () => {
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
  });

  test('سيناريو 1: منتج واحد (Swan Boot) تم التسليم بدون حد زمني — يتطابق مع SQL ويكون >= 69', async () => {
    const criteria = {
      type: 'purchasedProduct',
      productIds: [swanBootId],
      status: 'DELIVERED',
    };

    // 1. نتيجة المحرك
    const { where } = await buildEffectiveCustomerListWhere(prisma, companyId, criteria);
    const engineCount = await prisma.customer.count({ where });

    // 2. نتيجة SQL المباشر مع DISTINCT customerId والربط بـ productId
    const rawResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT o."customerId")::int AS count
      FROM orders o
      JOIN order_items oi ON oi."orderId" = o.id
      JOIN customers c ON c.id = o."customerId"
      WHERE o."companyId" = $1
        AND o.status = 'DELIVERED'
        AND oi."productId" = $2
        AND c."companyId" = $1
    `, companyId, swanBootId);

    const sqlCount = rawResult[0]?.count ?? 0;

    console.log(`📊 [Scenario 1 - Swan Boot All Time] Engine Count: ${engineCount}, SQL Count: ${sqlCount}`);

    expect(engineCount).toBe(sqlCount);
    expect(engineCount).toBeGreaterThanOrEqual(69);
  });

  test('سيناريو 2: منتج واحد (Swan Boot) آخر 30 يوم — يتطابق مع SQL', async () => {
    const criteria = {
      type: 'purchasedProduct',
      productIds: [swanBootId],
      status: 'DELIVERED',
      days: 30,
    };

    const { where } = await buildEffectiveCustomerListWhere(prisma, companyId, criteria);
    const engineCount = await prisma.customer.count({ where });

    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    const rawResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT o."customerId")::int AS count
      FROM orders o
      JOIN order_items oi ON oi."orderId" = o.id
      JOIN customers c ON c.id = o."customerId"
      WHERE o."companyId" = $1
        AND o.status = 'DELIVERED'
        AND oi."productId" = $2
        AND o."createdAt" >= $3
        AND c."companyId" = $1
    `, companyId, swanBootId, threshold);

    const sqlCount = rawResult[0]?.count ?? 0;

    console.log(`📊 [Scenario 2 - Swan Boot Last 30 Days] Engine Count: ${engineCount}, SQL Count: ${sqlCount}`);

    expect(engineCount).toBe(sqlCount);
    expect(engineCount).toBeGreaterThan(0);
  });

  test('سيناريو 3: منتجين معاً (Swan Boot + Swan Aura) بدون تكرار للعميل', async () => {
    const criteria = {
      type: 'purchasedProduct',
      productIds: [swanBootId, swanAuraId],
      status: 'DELIVERED',
    };

    const { where } = await buildEffectiveCustomerListWhere(prisma, companyId, criteria);
    const engineCount = await prisma.customer.count({ where });

    const rawResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(DISTINCT o."customerId")::int AS count
      FROM orders o
      JOIN order_items oi ON oi."orderId" = o.id
      JOIN customers c ON c.id = o."customerId"
      WHERE o."companyId" = $1
        AND o.status = 'DELIVERED'
        AND oi."productId" IN ($2, $3)
        AND c."companyId" = $1
    `, companyId, swanBootId, swanAuraId);

    const sqlCount = rawResult[0]?.count ?? 0;

    console.log(`📊 [Scenario 3 - Swan Boot + Swan Aura] Engine Count: ${engineCount}, SQL Count: ${sqlCount}`);

    expect(engineCount).toBe(sqlCount);
    expect(engineCount).toBeGreaterThanOrEqual(400);
  });

  test('سيناريو 4: الاستثناء — كل العملاء ACTIVE ناقص مشتري Swan Boot', async () => {
    const totalActiveCustomers = await prisma.customer.count({
      where: { companyId, status: 'ACTIVE' },
    });

    const criteriaWithExclusion = {
      type: 'all',
      exclusions: [
        {
          type: 'purchasedProduct',
          productIds: [swanBootId],
          status: 'DELIVERED',
        },
      ],
    };

    const { where } = await buildEffectiveCustomerListWhere(prisma, companyId, criteriaWithExclusion);
    const excludedCount = await prisma.customer.count({ where });

    // عدد مشتري Swan Boot النشطين
    const buyersCount = await prisma.customer.count({
      where: {
        companyId,
        status: 'ACTIVE',
        orders: {
          some: {
            status: 'DELIVERED',
            orderItems: { some: { productId: swanBootId } },
          },
        },
      },
    });

    console.log(
      `📊 [Scenario 4 - Exclusion] Total Active: ${totalActiveCustomers}, Buyers: ${buyersCount}, Excluded Count: ${excludedCount}`
    );

    // التحقق الحرج: العدد المستثنى يجب أن يساوي تماماً: الإجمالي ناقص المشترين
    expect(excludedCount).toBe(totalActiveCustomers - buyersCount);
  });
});