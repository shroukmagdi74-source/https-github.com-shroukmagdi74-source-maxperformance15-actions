/**
 * Integration Test: Customer Lists v2 Criteria Engine
 *
 * Tests the 4 documented cases against a real database connection when available.
 * Gated on process.env.TEST_DATABASE_URL || process.env.DATABASE_URL.
 * Asserts equality between the v2 engine count and raw direct SQL count.
 * Never hardcodes expected numbers.
 */

const { getSharedPrismaClient } = require('../../services/sharedDatabase');
const {
  computeCustomerListCountV2,
  previewCustomerListCountV2,
  buildCustomerListV2Sql,
} = require('../../utils/customerListCriteriaV2');

const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const describeOrSkip = dbUrl ? describe : describe.skip;

describeOrSkip('Customer Lists v2 Integration Tests', () => {
  let prisma;
  let companyId;

  beforeAll(async () => {
    prisma = getSharedPrismaClient();
    // Resolve a real companyId from the DB to test multi-tenant scoping
    try {
      const comp = await prisma.company.findFirst({ select: { id: true } });
      companyId = comp?.id || 'cmleybpf70028juo2wwpmp8rt';
    } catch {
      companyId = 'cmleybpf70028juo2wwpmp8rt';
    }
  });

  afterAll(async () => {
    if (prisma?.$disconnect) {
      await prisma.$disconnect();
    }
  });

  // Case 1: Two rules AND
  test('Case 1: Two rules AND (customerStatus: ACTIVE AND ordersCount >= 1)', async () => {
    const criteria = {
      version: 2,
      include: {
        operator: 'AND',
        groups: [
          {
            operator: 'AND',
            rules: [
              { field: 'customerStatus', op: 'in', value: ['ACTIVE'] },
              { field: 'ordersCount', op: 'gte', value: 1 },
            ],
          },
        ],
      },
    };

    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    // Direct independent SQL assertion on the exact same logic
    const rawSql = `SELECT COUNT(*)::int AS "count"
      FROM "customers" c
      WHERE c."companyId" = $1
        AND (
          c."status"::text = ANY($2)
          AND (
            SELECT COUNT(*)::int FROM "orders" o
            WHERE o."customerId" = c."id"
              AND o."companyId" = $1
              AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')
          ) >= 1
        )`;

    const directRows = await prisma.$queryRawUnsafe(rawSql, companyId, ['ACTIVE']);
    const directCount = Number(directRows?.[0]?.count ?? 0);

    expect(engineCount).toBe(directCount);
  });

  // Case 2: Two rules OR
  test('Case 2: Two rules OR (city: القاهرة OR governorate: الجيزة)', async () => {
    const criteria = {
      version: 2,
      include: {
        operator: 'AND',
        groups: [
          {
            operator: 'OR',
            rules: [
              { field: 'city', value: 'القاهرة' },
              { field: 'governorate', value: 'الجيزة' },
            ],
          },
        ],
      },
    };

    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const rawSql = `SELECT COUNT(*)::int AS "count"
      FROM "customers" c
      WHERE c."companyId" = $1
        AND (
          EXISTS (
            SELECT 1 FROM "orders" o
            WHERE o."customerId" = c."id"
              AND o."companyId" = $1
              AND o."city" ILIKE '%القاهرة%'
          )
          OR EXISTS (
            SELECT 1 FROM "orders" o
            WHERE o."customerId" = c."id"
              AND o."companyId" = $1
              AND o."governorate" ILIKE '%الجيزة%'
          )
        )`;

    const directRows = await prisma.$queryRawUnsafe(rawSql, companyId);
    const directCount = Number(directRows?.[0]?.count ?? 0);

    expect(engineCount).toBe(directCount);
  });

  // Case 3: Rule + exclusion
  test('Case 3: Rule + exclusion (ordersCount >= 1 EXCLUDE deliveryRate < 50)', async () => {
    const criteria = {
      version: 2,
      include: {
        operator: 'AND',
        groups: [
          {
            operator: 'AND',
            rules: [{ field: 'ordersCount', op: 'gte', value: 1 }],
          },
        ],
      },
      exclude: {
        operator: 'OR',
        groups: [
          {
            operator: 'AND',
            rules: [{ field: 'deliveryRate', op: 'lt', value: 50 }],
          },
        ],
      },
    };

    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const rawSql = `SELECT COUNT(*)::int AS "count"
      FROM "customers" c
      WHERE c."companyId" = $1
        AND (
          SELECT COUNT(*)::int FROM "orders" o
          WHERE o."customerId" = c."id"
            AND o."companyId" = $1
            AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')
        ) >= 1
        AND NOT (c."deliveryRate" < 50)`;

    const directRows = await prisma.$queryRawUnsafe(rawSql, companyId);
    const directCount = Number(directRows?.[0]?.count ?? 0);

    expect(engineCount).toBe(directCount);

    // Also verify preview count dual counters (before >= after, excluded = before - after)
    const preview = await previewCustomerListCountV2(prisma, companyId, criteria);
    expect(preview.after).toBe(engineCount);
    expect(preview.before).toBeGreaterThanOrEqual(preview.after);
    expect(preview.excluded).toBe(preview.before - preview.after);
  });

  // Case 4: Real example «استلم Swan Boot (sku sw 84) آخر ٣٠ يوم»
  test('Case 4: Real example (received Swan Boot sku sw 84 in last 30 days)', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFromStr = thirtyDaysAgo.toISOString();

    const criteria = {
      version: 2,
      include: {
        operator: 'AND',
        groups: [
          {
            operator: 'AND',
            rules: [
              {
                field: 'receivedProduct',
                sku: 'sw 84',
                statuses: ['DELIVERED'],
                dateFrom: dateFromStr,
              },
            ],
          },
        ],
      },
    };

    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const rawSql = `SELECT COUNT(*)::int AS "count"
      FROM "customers" c
      WHERE c."companyId" = $1
        AND EXISTS (
          SELECT 1 FROM "orders" o
          JOIN "order_items" oi ON oi."orderId" = o."id"
          WHERE o."customerId" = c."id"
            AND o."companyId" = $1
            AND o."status"::text = ANY($2)
            AND (oi."productSku" ILIKE '%sw 84%' OR oi."productName" ILIKE '%sw 84%')
            AND o."createdAt" >= $3
        )`;

    const directRows = await prisma.$queryRawUnsafe(rawSql, companyId, ['DELIVERED'], thirtyDaysAgo);
    const directCount = Number(directRows?.[0]?.count ?? 0);

    expect(engineCount).toBe(directCount);
  });
});
