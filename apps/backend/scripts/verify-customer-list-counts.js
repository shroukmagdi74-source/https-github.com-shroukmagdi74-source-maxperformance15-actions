/**
 * Verification Script: Customer Lists v2 Counts Verification
 *
 * Runs 4 verification cases against the database:
 * 1. Two rules AND: customerStatus: ACTIVE AND ordersCount >= 1
 * 2. Two rules OR: city: القاهرة OR governorate: الجيزة
 * 3. Rule + exclusion: ordersCount >= 1 EXCLUDE deliveryRate < 50
 * 4. Real example: received Swan Boot (sku "sw 84") in the last 30 days
 *
 * Usage:
 *   node scripts/verify-customer-list-counts.js [--company-id <id>]
 */

const { getSharedPrismaClient } = require('../services/sharedDatabase');
const {
  computeCustomerListCountV2,
  previewCustomerListCountV2,
  buildCustomerListV2Sql,
} = require('../utils/customerListCriteriaV2');

function parseArgs() {
  const args = process.argv.slice(2);
  let companyId = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--company-id' && args[i + 1]) {
      companyId = args[i + 1].trim();
      i++;
    }
  }
  return { companyId };
}

async function run() {
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log('   Customer Lists v2: Multi-Group Rules Engine Verification Script (MaxP)   ');
  console.log('══════════════════════════════════════════════════════════════════════════════\n');

  const prisma = getSharedPrismaClient();
  const { companyId: cliCompanyId } = parseArgs();

  let companyId = cliCompanyId;
  if (!companyId) {
    const comp = await prisma.company.findFirst({ select: { id: true, name: true } });
    if (!comp) {
      console.error('❌ No company found in database to verify.');
      process.exit(1);
    }
    companyId = comp.id;
    console.log(`ℹ️ [INIT] Auto-detected company: ${comp.name || comp.id} (${companyId})\n`);
  } else {
    console.log(`ℹ️ [INIT] Target companyId: ${companyId}\n`);
  }

  const results = [];

  // ─────────────────────────────────────────────────────────────────────────────
  // Case 1: Two rules AND
  // ─────────────────────────────────────────────────────────────────────────────
  {
    console.log('▶ Case 1: Two rules AND (customerStatus: ACTIVE AND ordersCount >= 1)');
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

    const { countSql, params } = buildCustomerListV2Sql(companyId, criteria);
    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const directSql = `SELECT COUNT(*)::int AS "count"
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

    const directRows = await prisma.$queryRawUnsafe(directSql, companyId, ['ACTIVE']);
    const directCount = Number(directRows?.[0]?.count ?? 0);
    const pass = engineCount === directCount;

    console.log(`  Engine Generated SQL:\n    ${countSql}`);
    console.log(`  Engine Params: ${JSON.stringify(params)}`);
    console.log(`  Engine Count:  ${engineCount}`);
    console.log(`  Raw SQL Count: ${directCount}`);
    console.log(`  Status:        ${pass ? '✅ PASS' : '❌ FAIL'}\n`);

    results.push({ case: 'Case 1 (Two rules AND)', engineCount, directCount, pass });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Case 2: Two rules OR
  // ─────────────────────────────────────────────────────────────────────────────
  {
    console.log('▶ Case 2: Two rules OR (city: القاهرة OR governorate: الجيزة)');
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

    const { countSql, params } = buildCustomerListV2Sql(companyId, criteria);
    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const directSql = `SELECT COUNT(*)::int AS "count"
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

    const directRows = await prisma.$queryRawUnsafe(directSql, companyId);
    const directCount = Number(directRows?.[0]?.count ?? 0);
    const pass = engineCount === directCount;

    console.log(`  Engine Generated SQL:\n    ${countSql}`);
    console.log(`  Engine Params: ${JSON.stringify(params)}`);
    console.log(`  Engine Count:  ${engineCount}`);
    console.log(`  Raw SQL Count: ${directCount}`);
    console.log(`  Status:        ${pass ? '✅ PASS' : '❌ FAIL'}\n`);

    results.push({ case: 'Case 2 (Two rules OR)', engineCount, directCount, pass });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Case 3: Rule + exclusion
  // ─────────────────────────────────────────────────────────────────────────────
  {
    console.log('▶ Case 3: Rule + exclusion (ordersCount >= 1 EXCLUDE deliveryRate < 50)');
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

    const { countSql, params } = buildCustomerListV2Sql(companyId, criteria);
    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const directSql = `SELECT COUNT(*)::int AS "count"
      FROM "customers" c
      WHERE c."companyId" = $1
        AND (
          SELECT COUNT(*)::int FROM "orders" o
          WHERE o."customerId" = c."id"
            AND o."companyId" = $1
            AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')
        ) >= 1
        AND NOT (c."deliveryRate" < 50)`;

    const directRows = await prisma.$queryRawUnsafe(directSql, companyId);
    const directCount = Number(directRows?.[0]?.count ?? 0);
    const pass = engineCount === directCount;

    console.log(`  Engine Generated SQL:\n    ${countSql}`);
    console.log(`  Engine Params: ${JSON.stringify(params)}`);
    console.log(`  Engine Count:  ${engineCount}`);
    console.log(`  Raw SQL Count: ${directCount}`);
    console.log(`  Status:        ${pass ? '✅ PASS' : '❌ FAIL'}\n`);

    results.push({ case: 'Case 3 (Rule + exclusion)', engineCount, directCount, pass });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Case 4: Real example «استلم Swan Boot (sku sw 84) آخر ٣٠ يوم»
  // ─────────────────────────────────────────────────────────────────────────────
  {
    console.log('▶ Case 4: Real Example (Swan Boot sku "sw 84" delivered in last 30 days)');
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

    const { countSql, params } = buildCustomerListV2Sql(companyId, criteria);
    const engineCount = await computeCustomerListCountV2(prisma, companyId, criteria);

    const directSql = `SELECT COUNT(*)::int AS "count"
      FROM "customers" c
      WHERE c."companyId" = $1
        AND EXISTS (
          SELECT 1 FROM "orders" o
          JOIN "order_items" oi ON oi."orderId" = o."id"
          LEFT JOIN "products" p ON p."id" = oi."productId" AND p."companyId" = $1
          WHERE o."customerId" = c."id"
            AND o."companyId" = $1
            AND o."status"::text = ANY($2)
            AND (oi."productSku" ILIKE '%sw 84%' OR oi."productName" ILIKE '%sw 84%' OR p."sku" ILIKE '%sw 84%' OR p."name" ILIKE '%sw 84%')
            AND o."createdAt" >= $3
        )`;

    const directRows = await prisma.$queryRawUnsafe(directSql, companyId, ['DELIVERED'], thirtyDaysAgo);
    const directCount = Number(directRows?.[0]?.count ?? 0);
    const pass = engineCount === directCount;

    console.log(`  Engine Generated SQL:\n    ${countSql}`);
    console.log(`  Engine Params: ${JSON.stringify(params)}`);
    console.log(`  Engine Count:  ${engineCount}`);
    console.log(`  Raw SQL Count: ${directCount}`);
    console.log(`  Status:        ${pass ? '✅ PASS' : '❌ FAIL'}\n`);

    results.push({ case: 'Case 4 (Swan Boot sw 84)', engineCount, directCount, pass });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary Table
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log('   Verification Summary Table   ');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.table(
    results.map((r) => ({
      'Test Case': r.case,
      'Engine Count': r.engineCount,
      'Direct SQL Count': r.directCount,
      Verdict: r.pass ? 'PASS' : 'FAIL',
    }))
  );

  const allPassed = results.every((r) => r.pass);
  console.log(allPassed ? '🎉 ALL 4 CASES PASSED!\n' : '⚠️ SOME CASES FAILED!\n');

  if (prisma?.$disconnect) {
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error('❌ Verification script error:', err);
  process.exit(1);
});
