-- =========================================================================
-- 🧪 استعلامات إثبات معايير القبول — مرحلة Shadow (Stores Architecture)
-- مسار: apps/backend/scripts/one-off/verify-stores-shadow.sql
-- =========================================================================

-- 1️⃣ المعيار 1: التأكد من أن storeId IS NULL في الجداول الستة = 0
SELECT 'orders' AS table_name, count(*) AS null_store_ids FROM "orders" WHERE "storeId" IS NULL
UNION ALL
SELECT 'guest_orders', count(*) FROM "guest_orders" WHERE "storeId" IS NULL
UNION ALL
SELECT 'products', count(*) FROM "products" WHERE "storeId" IS NULL
UNION ALL
SELECT 'categories', count(*) FROM "categories" WHERE "storeId" IS NULL
UNION ALL
SELECT 'storefront_settings', count(*) FROM "storefront_settings" WHERE "storeId" IS NULL
UNION ALL
SELECT 'product_landing_pages', count(*) FROM "product_landing_pages" WHERE "storeId" IS NULL;

-- النتيجة المتوقعة للمعيار 1: جميع الصفوف 0


-- 2️⃣ المعيار 2: كل شركة لديها متجر افتراضي واحد فقط بالضبط (isDefault = true)
SELECT "companyId", count(*) AS default_store_count
FROM "stores"
WHERE "isDefault" = true
GROUP BY "companyId"
HAVING count(*) <> 1;

-- النتيجة المتوقعة للمعيار 2: 0 صفوف (Empty result)


-- 3️⃣ المعيار 3: companies.slug و customDomain يطابقان تماماً قيم المتجر الافتراضي
SELECT 
    c.id AS company_id, 
    c.slug AS company_slug, 
    s.slug AS store_slug,
    c."customDomain" AS company_custom_domain, 
    s."customDomain" AS store_custom_domain
FROM "companies" c
JOIN "stores" s ON s."companyId" = c.id AND s."isDefault" = true
WHERE (c.slug IS DISTINCT FROM s.slug)
   OR (c."customDomain" IS DISTINCT FROM s."customDomain");

-- النتيجة المتوقعة للمعيار 3: 0 صفوف (Empty result)


-- 4️⃣ المعيار 4: إجمالي عدد المتاجر = إجمالي عدد الشركات
SELECT 
    (SELECT count(*) FROM "companies") AS total_companies,
    (SELECT count(*) FROM "stores") AS total_stores,
    CASE 
        WHEN (SELECT count(*) FROM "companies") = (SELECT count(*) FROM "stores") THEN 'MATCH ✅'
        ELSE 'MISMATCH ❌'
    END AS status;

-- النتيجة المتوقعة للمعيار 4: total_companies == total_stores و MATCH