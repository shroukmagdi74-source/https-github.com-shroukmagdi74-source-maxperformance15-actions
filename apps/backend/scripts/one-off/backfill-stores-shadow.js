/**
 * 📦 Backfill Stores - Phase 1: Shadow Stage
 * مسار: apps/backend/scripts/one-off/backfill-stores-shadow.js
 *
 * الغرض:
 * 1. إنشاء متجر افتراضي واحد (isDefault=true) لكل شركة ليس لديها متجر.
 *    (slug = Company.slug, customDomain = Company.customDomain, name = Company.name, isDefault = true, isActive = true)
 * 2. تعبئة عمود storeId الجديد في 6 جداول:
 *    - orders
 *    - guest_orders
 *    - products
 *    - categories
 *    - storefront_settings
 *    - product_landing_pages
 *
 * الخصائص:
 * - آمن ضد التكرار (Idempotent): إعادة التشغيل لا تنشئ أي متاجر جديدة ولا تعدل أي صفوف إضافية.
 * - افتراضياً: DRY-RUN (يطبع فقط ولا يعدل أي شيء في الداتابيز).
 * - لتنفيذ التعديل الفعلي (Apply): قم بتمرير الفلاج --apply أو متغير APPLY=true.
 * - تحديث بدفعات (Batched) بحد أقصى 5,000 صف لكل دفعة لمنع إجهاد قاعدة البيانات والـ locks.
 * - استعلامات PostgreSQL Raw لتحقيق أعلى أداء وسرعة في التحديث.
 *
 * طريقة التشغيل:
 *   DRY-RUN (معاينة فقط):
 *     node apps/backend/scripts/one-off/backfill-stores-shadow.js
 *   APPLY (تنفيذ فعلي):
 *     node apps/backend/scripts/one-off/backfill-stores-shadow.js --apply
 */

const { getSharedPrismaClient } = require('../../services/sharedDatabase');

let prisma;

const BATCH_SIZE = 5000;
const IS_APPLY = process.argv.includes('--apply') || process.env.APPLY === 'true';

const TARGET_TABLES = [
  { model: 'orders', table: 'orders' },
  { model: 'guest_orders', table: 'guest_orders' },
  { model: 'products', table: 'products' },
  { model: 'categories', table: 'categories' },
  { model: 'storefront_settings', table: 'storefront_settings' },
  { model: 'product_landing_pages', table: 'product_landing_pages' },
];

async function main() {
  prisma = await getSharedPrismaClient();
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`📦 [STORES-SHADOW-BACKFILL] Mode: ${IS_APPLY ? '🚀 LIVE APPLY' : '🔍 DRY-RUN (No writes)'}`);
  console.log('════════════════════════════════════════════════════════════════\n');

  // =========================================================================
  // خطوة أ: التحقق وإنشاء متجر افتراضي لكل شركة مالهاش متجر
  // =========================================================================
  console.log('--- خطوة أ: فحص الشركات والمتاجر الافتراضية ---');

  // جلب جميع الشركات
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📊 إجمالي عدد الشركات الموجودة: ${companies.length}`);

  // فحص المتاجر الافتراضية الحالية
  let existingStores = [];
  try {
    existingStores = await prisma.$queryRaw`
      SELECT id, "companyId", slug, "customDomain", "isDefault"
      FROM stores
      WHERE "isDefault" = true
    `;
  } catch (err) {
    console.warn('⚠️ تعذر الاستعلام من جدول stores (ربما الجدول لم ينشأ بعد):', err.message);
  }

  const companyStoreMap = new Map();
  for (const store of existingStores) {
    companyStoreMap.set(store.companyId, store);
  }

  const companiesNeedingStore = companies.filter((c) => !companyStoreMap.has(c.id));
  console.log(`🏢 شركات لديها متجر افتراضي: ${existingStores.length}`);
  console.log(`🆕 شركات تحتاج إنشاء متجر افتراضي: ${companiesNeedingStore.length}`);

  let createdStoresCount = 0;

  if (companiesNeedingStore.length > 0) {
    if (IS_APPLY) {
      for (const comp of companiesNeedingStore) {
        if (!comp.slug) {
          console.warn(`⚠️ تخطي شركة ${comp.name} (${comp.id}) لعدم وجود slug`);
          continue;
        }

        // إنشاء المتجر الافتراضي بأمان (upsert على slug لضمان عدم حدوث تضارب)
        await prisma.store.upsert({
          where: { slug: comp.slug },
          update: {
            // إذا كان المتجر موجوداً بالفعل بنفس الـ slug، نربطه بالشركة ونجعله افتراضياً
            companyId: comp.id,
            isDefault: true,
          },
          create: {
            companyId: comp.id,
            name: comp.name || comp.slug,
            slug: comp.slug,
            customDomain: comp.customDomain || null,
            isDefault: true,
            isActive: true,
            settings: null,
            whatsappSessionId: null,
          },
        });
        createdStoresCount++;
      }
      console.log(`✅ تم إنشاء/تحديث ${createdStoresCount} متجر افتراضي بنجاح.`);
    } else {
      console.log(`[DRY-RUN] سيتم إنشاء ${companiesNeedingStore.length} متجر افتراضي للشركات التالية (عينة):`);
      companiesNeedingStore.slice(0, 5).forEach((c) => {
        console.log(`  - ${c.name} | slug: ${c.slug} | domain: ${c.customDomain || 'none'}`);
      });
      if (companiesNeedingStore.length > 5) {
        console.log(`  ... وباقي ${companiesNeedingStore.length - 5} شركة`);
      }
    }
  } else {
    console.log('✅ جميع الشركات لديها متجر افتراضي بالفعل (Idempotent: 0 متاجر جديدة مطلوبة).');
  }

  console.log('\n--- خطوة ب: فحص وتعبئة storeId في الجداول الستة ---');

  const summary = [];

  for (const { model, table } of TARGET_TABLES) {
    // حساب عدد الصفوف التي تحتاج تحديث (storeId IS NULL)
    let initialNullCount = 0;
    try {
      const countRes = await prisma.$queryRawUnsafe(
        `SELECT count(*)::bigint AS count FROM "${table}" WHERE "storeId" IS NULL`
      );
      initialNullCount = Number(countRes[0]?.count || 0);
    } catch (err) {
      console.warn(`⚠️ تعذر الاستعلام من جدول ${table} (قد لا يحتوي عمود storeId بعد): ${err.message}`);
      summary.push({ table, updated: 0, remainingNull: 'N/A (Column missing)' });
      continue;
    }

    console.log(`\n📋 جدول [${table}]: الصفوف التي تحتاج storeId = ${initialNullCount}`);

    let totalUpdatedForTable = 0;

    if (initialNullCount > 0 && IS_APPLY) {
      let batchNumber = 1;
      let remaining = initialNullCount;

      while (remaining > 0) {
        // تحديث بدفعة 5,000 صف
        // يتم التحديث فقط للصفوف التي تنتمي لشركة لها متجر افتراضي
        const updateResult = await prisma.$executeRawUnsafe(`
          UPDATE "${table}" t
          SET "storeId" = s.id
          FROM stores s
          WHERE s."companyId" = t."companyId"
            AND s."isDefault" = true
            AND t."storeId" IS NULL
            AND t.id IN (
              SELECT t2.id
              FROM "${table}" t2
              JOIN stores s2 ON s2."companyId" = t2."companyId" AND s2."isDefault" = true
              WHERE t2."storeId" IS NULL
              LIMIT ${BATCH_SIZE}
            )
        `);

        totalUpdatedForTable += updateResult;

        const checkRes = await prisma.$queryRawUnsafe(
          `SELECT count(*)::bigint AS count FROM "${table}" WHERE "storeId" IS NULL`
        );
        remaining = Number(checkRes[0]?.count || 0);

        console.log(`  🔄 [${table}] دفعة #${batchNumber}: تم تحديث ${updateResult} صف | المتبقي: ${remaining}`);
        batchNumber++;

        // أمان لمنع التكرار اللانهائي إذا وجدت صفوف يتيمة لشركات غير موجودة
        if (updateResult === 0) {
          if (remaining > 0) {
            console.warn(`  ⚠️ توقف التحديث في جدول [${table}]: متبقي ${remaining} صف لا يطابق أي متجر افتراضي (بيانات يتيمة).`);
          }
          break;
        }
      }
    } else if (initialNullCount > 0) {
      console.log(`  [DRY-RUN] سيتم تحديث ${initialNullCount} صف في جدول [${table}] عبر دفعات بسقف ${BATCH_SIZE}.`);
    } else {
      console.log(`  ✅ جدول [${table}] مكتمل ومُحدّث بالكامل (0 صفوف null).`);
    }

    let finalRemaining = initialNullCount;
    if (IS_APPLY) {
      try {
        const checkFinal = await prisma.$queryRawUnsafe(
          `SELECT count(*)::bigint AS count FROM "${table}" WHERE "storeId" IS NULL`
        );
        finalRemaining = Number(checkFinal[0]?.count || 0);
      } catch (_) {}
    }

    summary.push({
      table,
      initialNull: initialNullCount,
      updated: totalUpdatedForTable,
      remainingNull: IS_APPLY ? finalRemaining : initialNullCount,
    });
  }

  // =========================================================================
  // ملخص التقرير النهائي
  // =========================================================================
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`📊 ملخص الترحيل ${IS_APPLY ? '(LIVE APPLY)' : '(DRY RUN)'}`);
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`🏢 المتاجر الافتراضية المنشأة: ${IS_APPLY ? createdStoresCount : `(0 منفذ - ${companiesNeedingStore.length} مرشح)`}`);
  console.table(summary);

  if (!IS_APPLY) {
    console.log('\nℹ️ [تنبيه] هذا التشغيل كان وضع معاينة (DRY-RUN) فقط.');
    console.log('   لم يتم إجراء أي كتابة أو تعديل على قاعدة البيانات.');
    console.log('   للتطبيق الفعلي بعد تجهيز الـ schema: شغّل السكربت بإضافة --apply');
  }
}

main()
  .catch(async (error) => {
    console.error('❌ خطأ أثناء تشغيل سكربت الترحيل:', error);
    if (prisma) await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
