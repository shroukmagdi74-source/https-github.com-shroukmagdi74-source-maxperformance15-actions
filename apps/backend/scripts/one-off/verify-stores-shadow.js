/**
 * 🧪 Verify Stores Shadow Phase
 * مسار: apps/backend/scripts/one-off/verify-stores-shadow.js
 *
 * معايير القبول الأربعة:
 * 1. storeId IS NULL في الست جداول = 0
 * 2. كل شركة عندها متجر واحد isDefault=true بالظبط (count <> 1 ينتج 0 صفوف)
 * 3. تطابق تام بين slug و customDomain في Company و Store (mismatch = 0)
 * 4. عدد المتاجر = عدد الشركات
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_TABLES = [
  'orders',
  'guest_orders',
  'products',
  'categories',
  'storefront_settings',
  'product_landing_pages',
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 [VERIFY-STORES-SHADOW] فحص معايير القبول لمرحلة Shadow');
  console.log('════════════════════════════════════════════════════════════════\n');

  let allPassed = true;

  // 1️⃣ المعيار 1: storeId IS NULL في الست جداول = 0
  console.log('--- 1️⃣ المعيار 1: فحص storeId IS NULL في الجداول الستة ---');
  const nullChecks = [];
  for (const table of TARGET_TABLES) {
    try {
      const res = await prisma.$queryRawUnsafe(
        `SELECT count(*)::bigint AS count FROM "${table}" WHERE "storeId" IS NULL`
      );
      const nullCount = Number(res[0]?.count || 0);
      nullChecks.push({ table, nullCount, status: nullCount === 0 ? '✅ PASSED' : '❌ FAILED' });
      if (nullCount !== 0) allPassed = false;
    } catch (err) {
      nullChecks.push({ table, nullCount: -1, status: `⚠️ Error (${err.message})` });
      allPassed = false;
    }
  }
  console.table(nullChecks);

  // 2️⃣ المعيار 2: كل شركة عندها متجر واحد isDefault=true بالظبط
  console.log('\n--- 2️⃣ المعيار 2: كل شركة لديها متجر افتراضي واحد بالضبط ---');
  try {
    const defaultViolations = await prisma.$queryRaw`
      SELECT "companyId", count(*)::bigint AS count
      FROM stores
      WHERE "isDefault" = true
      GROUP BY "companyId"
      HAVING count(*) <> 1
    `;
    const violationCount = defaultViolations.length;
    console.log(`عدد الشركات التي لديها أكثر أو أقل من متجر افتراضي واحد: ${violationCount}`);
    if (violationCount > 0) {
      console.error('❌ المخالفات:', defaultViolations);
      allPassed = false;
    } else {
      console.log('✅ PASSED: كل شركة لديها متجر افتراضي واحد بالضبط (0 مخالفات).');
    }
  } catch (err) {
    console.warn('⚠️ خطأ في فحص المتاجر الافتراضية:', err.message);
    allPassed = false;
  }

  // 3️⃣ المعيار 3: companies.slug و customDomain = نفس القيم في المتاجر الافتراضية (mismatch = 0)
  console.log('\n--- 3️⃣ المعيار 3: تطابق slug و customDomain بين Company و Store ---');
  try {
    const mismatches = await prisma.$queryRaw`
      SELECT c.id AS "companyId", c.slug AS "companySlug", s.slug AS "storeSlug",
             c."customDomain" AS "companyDomain", s."customDomain" AS "storeDomain"
      FROM companies c
      JOIN stores s ON s."companyId" = c.id AND s."isDefault" = true
      WHERE (c.slug IS DISTINCT FROM s.slug)
         OR (c."customDomain" IS DISTINCT FROM s."customDomain")
    `;
    const mismatchCount = mismatches.length;
    console.log(`عدد حالات عدم التطابق (Mismatches): ${mismatchCount}`);
    if (mismatchCount > 0) {
      console.error('❌ حالات عدم التطابق:', mismatches);
      allPassed = false;
    } else {
      console.log('✅ PASSED: تطابق تام 100% بين slug و customDomain (0 mismatch).');
    }
  } catch (err) {
    console.warn('⚠️ خطأ في فحص التطابق:', err.message);
    allPassed = false;
  }

  // 4️⃣ المعيار 4: عدد المتاجر = عدد الشركات
  console.log('\n--- 4️⃣ المعيار 4: عدد المتاجر مقارنة بعدد الشركات ---');
  try {
    const companiesCountRes = await prisma.company.count();
    const storesCountRes = await prisma.store.count();
    console.log(`إجمالي الشركات: ${companiesCountRes}`);
    console.log(`إجمالي المتاجر: ${storesCountRes}`);

    if (companiesCountRes === storesCountRes) {
      console.log('✅ PASSED: عدد المتاجر يطابق تماماً عدد الشركات.');
    } else {
      console.warn(`⚠️ FAILED: عدد المتاجر (${storesCountRes}) لا يساوي عدد الشركات (${companiesCountRes}).`);
      allPassed = false;
    }
  } catch (err) {
    console.warn('⚠️ خطأ في مقارنة الأعداد:', err.message);
    allPassed = false;
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 النتيجة النهائية: ${allPassed ? '✅ جميع معايير القبول ناجحة!' : '⚠️ توجد معايير لم تتحقق بعد (راجع اللوج أعلاه)'}`);
  console.log('════════════════════════════════════════════════════════════════');
}

main()
  .catch(async (error) => {
    console.error('❌ فشل تشغيل سكربت التحقق:', error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });