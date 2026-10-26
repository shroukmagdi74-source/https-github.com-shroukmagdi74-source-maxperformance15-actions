# 🔄 خطة التراجع (Rollback Plan) — مرحلة طبقة المتجر Shadow

## 1. ملخص التغيير وطبيعته (Additive Only)
تم تصميم مرحلة **Stores Shadow Phase** لتكون إضافية بنسبة 100% (Additive-only) ودون أي أثر جانبي على العمليات الإنتاجية الحالية:
- **الموديل الجديد**: جدول `stores` جديد بالكامل لا يتعارض مع أي جداول قديمة (`store_pages`, `store_visits`, إلخ).
- **الأعمدة الجديدة**: عمود `storeId String?` (قابل للقيمة الفارغة Nullable) تمت إضافته على 6 جداول فقط:
  1. `orders`
  2. `guest_orders`
  3. `products`
  4. `categories`
  5. `storefront_settings`
  6. `product_landing_pages`
- **بدون قيود Foreign Key معقدة**: تم اختيار عمود بدون FK مباشر في مرحلة الـ shadow لضمان أن عملية التراجع (Rollback) تكون فورية وغير مقيدة باختناقات فحص الـ Constraints.
- **عزل سلوك الميدل وير**: الميدل وير يقوم فقط بحساب المتجر في الخلفية وطباعة سطر لوج بمعدل محدود (Rate-limited إلى سطر واحد لكل host كل 60 ثانية)، دون تعديل `req.company` أو `tenantContext` أو مسار الطلب بأي شكل.
- **بيانات الشركات محمية تماماً**: تم الحفاظ على أعمدة `companies.slug` و `companies.customDomain` كأعمدة قراءة فقط (Read-only)؛ لم يمسها سكربت الترحيل ولا الميدل وير بأي تعديل أو حذف.

---

## 2. خطوات التراجع المنهجية (Step-by-Step Rollback)

### الخطوة 1: التحقق وتأكيد تعطيل الفلاج
تأكد من أن فلاج الاعتماد معطل في البيئة:
```bash
STORES_ENABLED=false
```
(هذا يضمن عدم وجود أي كود يحاول قراءة المتجر في أي استعلامات لاحقة).

### الخطوة 2: التراجع عن تعديلات الكود (Code Revert)
إذا كان الكود منشوراً في بيئة التشغيل، يتم التراجع عن فرع `feat/stores-shadow` أو عمل Git revert للـ commit:
```bash
git revert <commit-hash> --no-edit
# أو العودة للفرع السابق
```
هذا يعيد `subdomainMiddleware.js`، وملفات الـ schema، وملفات الـ environment إلى حالتها الأصلية قبل إضافة المتجر.

### الخطوة 3: حذف أعمدة `storeId` من الجداول الستة (Postgres DDL)
تنفيذ أوامر DDL التالية مباشرة عبر `psql` لحذف الأعمدة والـ indexes المنشأة معها:
```sql
-- حذف عمود storeId من الجداول الستة
ALTER TABLE "orders" DROP COLUMN IF EXISTS "storeId";
ALTER TABLE "guest_orders" DROP COLUMN IF EXISTS "storeId";
ALTER TABLE "products" DROP COLUMN IF EXISTS "storeId";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "storeId";
ALTER TABLE "storefront_settings" DROP COLUMN IF EXISTS "storeId";
ALTER TABLE "product_landing_pages" DROP COLUMN IF EXISTS "storeId";
```
*ملاحظة: حذف العمود في PostgreSQL يحذف تلقائياً الـ indexes المرتبطة به (`@@index([storeId])`).*

### الخطوة 4: حذف جدول المتاجر
```sql
DROP TABLE IF EXISTS "stores" CASCADE;
```

### الخطوة 5: مزامنة Prisma مع قاعدة البيانات
بعد إزالة الموديلات من الكود وحذف الأعمدة من الداتابيز، يتم التحقق بمزامنة Prisma:
```bash
npx prisma db push
```

### الخطوة 6: استعلامات التحقق بعد التراجع
تنفيذ استعلام SQL للتأكد من عدم وجود أي بقايا للأعمدة أو الجدول:
```sql
-- التحقق من اختفاء عمود storeId من الجداول
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('orders', 'guest_orders', 'products', 'categories', 'storefront_settings', 'product_landing_pages')
  AND column_name = 'storeId';
-- النتيجة المتوقعة: 0 صفوف

-- التحقق من اختفاء جدول stores
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'stores';
-- النتيجة المتوقعة: 0 صفوف
```

---

## 3. سلامة بيانات الشركات (Data Integrity Guarantee)
- **بيانات الشركة لم تُمَس إطلاقاً**:
  - `companies.slug` و `companies.customDomain` لم يتم تعديل أي حرف منهما أثناء تشغيل سكربت الترحيل (كان مجرد SELECT لقراءتهما ونسخهما إلى جدول stores الجديد).
  - عملية الـ Rollback تحذف فقط الأعمدة والجداول المضافة حديثاً (`storeId` و `stores`)، ولا تجري أي مساس بجدول `companies`.

---

## 4. مدة وأثر التنفيذ (Execution Impact & Downtime)
- **وقت التوقف (Downtime)**: **صفر ثانية (Zero Downtime)**.
- **سرعة التنفيذ**:
  - في PostgreSQL، `DROP COLUMN` و `DROP TABLE` هي عمليات metadata سريعة جداً تستغرق أقل من ثانية واحدة (أقل من 500ms).
- **أثر الأداء**:
  - لا توجد عمليات lock طويلة على الجداول لأن الأعمدة لا تحوي قيود Foreign Key أو Check معقدة.

---

## 5. خطوات ما بعد التراجع (Post-Rollback Verification)
1. إعادة تشغيل خدمات التطبيق الخلفي (`pm2 reload maxp-backend` أو ما يماثلها).
2. مراقبة سجلات الـ PM2 لضمان اختفاء أسطر `[STORE-SHADOW]` وعدم وجود أي أخطاء:
   ```bash
   pm2 logs maxp-backend --lines 50
   ```
3. التحقق من سلامة طلبات الـ Subdomain والتأكد من استمرار عمل المتاجر بصورة طبيعية عبر الـ customDomain و subdomain كما كانت.
