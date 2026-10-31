# تقرير إنجاز التيكت — MANAGE-PAGES: إدارة صفحات المتجر (حذف · إعادة تسمية · تكرار) + تأكيد تطبيق القالب

**التاريخ:** 31/10/2026 · **المصدر:** تجربة حقيقية على استوديو `max-p` (بناء 10+ صفحات من المتصفح)  
**الأولوية:** عالية · **الحالة:** تم بنجاح ✅  
**الريبو:** `C:\maxp-platform-13` · **الفرع:** `main` (HEAD: `29ae3c907`)  
**البيئة:** Node v26.7.0 (`C:/Users/hp/AppData/Local/hermes/tools/node-26.7.0-win32-x64/node.exe`)  

---

## 1. ملخص المشكلة وحلول التيكت

| المشكلة المرصودة | الحل المنفذ |
|---|---|
| **غياب أزرار إدارة الصفحات في القائمة** (`btns: []` في قائمة صفحات المتجر) | إضافة أزرار كاملة في كل من `StudioPageSelector` (القائمة العلوية) و`StudioPagesPanel` (اللوحة الجانبية): زر حذف، زر إعادة تسمية وتعديل slug، وزر تكرار. |
| **ممنوع حذف الصفحات الأساسية** | الصفحات الأساسية الـ12 لا يظهر بها زر الحذف في الواجهة، ويتم رفض محاولة حذفها عبر `handleDeletePage` مع إرجاع `false` ورسالة تنبيه واضحة. |
| **حذف الصفحة لا ينظف الـ Navigation** | عند حذف أي صفحة مخصصة يتم مسح الرابط الخاص بها تلقائياً من مصفوفة `navigation.menu` داخل `designTokens`. |
| **تعديل الـ Slug وإعادة التسمية** | دعم تعديل العنوان ورابط الـ Slug مع تطبيع لاتيني وفحص صارم للتفرد لمنع أي تصادم مع الصفحات الأساسية أو الصفحات المخصصة الأخرى. |
| **تكرار الصفحة** | زر تكرار (`duplicate`) ينشئ نسخة مطابقة للأقسام مع توليد مفاتيح فريدة وslug ينتهي بـ `-copy` ونسخ الإعدادات. |
| **تأكيد اختيار القالب** | تمييز بصري صريح للكارت المحدد (ring + border + شارة «محدد»)، وتعطيل زر الإنشاء (`disabled`) عند عدم اختيار أي قالب. |
| **حظر إنشاء صفحات فارغة (0 سيكشن)** | توليد الأقسام وفحصها **أولاً** قبل أي اتصال بقاعدة البيانات أو كتابة التوكنز؛ لو `sections.length === 0` يتم إلغاء الإنشاء فوراً وتنبيه «لم يتم تطبيق القالب — أعد المحاولة». |
| **فحص القوالب العشرة** | التحقق من أن جميع قوالب `STUDIO_PAGE_PRESETS` الـ10 تنتج ما لا يقل عن 4 أقسام لكل صفحة (`sections.length >= 4`). |

---

## 2. تفاصيل الملفات المعدلة والمضافة

1. **`apps/frontend/src/storefront/studio/hooks/useStorefrontStudioState.ts`**:
   - تحديث `handleDeletePage`: تنظيف روابط الصفحة من `designTokens.navigation.menu` ومسح الستايلات الخاصة بها وتعيين الصفحة النشطة إلى `home`.
   - تحديث `handleRenamePage`: قبول `newSlug?: string` مع تطبيع الرابط وفحص التفرد وتحديث المفاتيح في `pages` و`pageOverrides` و`pageStyles` وتحديث رابط وعنوان الصفحة في الـ navigation menu.
   - تحديث واجهة `StudioBridgeState` لتعكس توقيع `handleRenamePage`.

2. **`apps/frontend/src/storefront/studio/StudioPageSelector.tsx`**:
   - إضافة واجهات الحذف مع نافذة التأكيد التي تظهر اسم الصفحة «هل أنت متأكد من حذف صفحة «...»؟».
   - إضافة واجهة إعادة التسمية وتعديل الـ slug المضمنة مع التحقق من التفرد.
   - إضافة زر التكرار لكل من الصفحات الأساسية والمخصصة.
   - حجب زر الحذف عن الصفحات الأساسية.

3. **`apps/frontend/src/storefront/studio/StudioPagesPanel.tsx`**:
   - دعم تعديل الـ slug والعنوان مع التحقق من التفرد.
   - توفير `data-testid` المتوافقة لجميع الحقول والأزرار.

4. **`apps/frontend/src/storefront/studio/StudioCreatePageModal.tsx`**:
   - شرط `canSubmit` يلزم وجود `selectedPresetId`.
   - إمكانية إلغاء التحديد وتحديث حالة الكارت المحدد بعلامة «محدد».
   - فحص توليد الأقسام قبل الاستدعاء مع رسالة «لم يتم تطبيق القالب — أعد المحاولة».

5. **`apps/frontend/src/storefront/studio/StorefrontStudioShell.tsx`**:
   - توليد وفحص أقسام القالب في مقدمة `handleCreateCustomPage` وحظر حفظ أي صفحة بـ 0 أقسام.
   - تمرير دوال الحذف، التكرار، والتسمية إلى `StudioTopBar` و`StudioPagesPanel`.
   - مزامنة `dbCustomPages` عند الحذف وإعادة التسمية.

6. **`apps/frontend/src/storefront/studio/StudioTopBar.tsx`**:
   - تمرير معالجات الإدارة (`onDeletePage`, `onDuplicatePage`, `onRenamePage`, `existingSlugs`) إلى `StudioPageSelector`.

7. **`apps/frontend/src/storefront/__tests__/studioPageManagement.test.tsx`** *(جديد)*:
   - 13 حالة اختبار شاملة تغطي جميع متطلبات التيكت.

---

## 3. نتائج البوابات الإجبارية

### البوابة 1: فحص الكود الثابت (oxlint)
```bash
oxlint --config .oxlintrc.json src/storefront/studio/hooks/useStorefrontStudioState.ts src/storefront/studio/StorefrontStudioShell.tsx src/storefront/studio/StudioTopBar.tsx src/storefront/studio/StudioPageSelector.tsx src/storefront/studio/StudioPagesPanel.tsx src/storefront/studio/StudioCreatePageModal.tsx src/storefront/__tests__/studioPageManagement.test.tsx
```
- **النتيجة:** `0 errors and 0 warnings` (خلو تام من الأخطاء) ✅

### البوابة 2: اختبارات Vitest المباشرة
- `src/storefront/__tests__/studioPageManagement.test.tsx`: 13/13 حالة ناجحة ✅
- `src/storefront/__tests__/customPagesStudioTicket2B.test.tsx`: 12/12 حالة ناجحة ✅

### البوابة 3: حرس تراجع الاستوديو الشامل (`scripts/run-studio-tests.mjs`)
```
──────────── studio-tests summary ────────────
files  : 25 run · 0 with failures · 0 crashed
excl.  : 0
cases  : 284 total · 284 passed · 0 failed
guard  : storefrontProStudio.test.tsx → 18 case(s)

✔ studio-tests PASSED.
```
- **النتيجة:** 25 ملف سويت، 284 حالة اختبار ناجحة، 0 فاشل، 0 كراش ✅

### البوابة 4: الالتزام الصارم بقواعد الكوميت
- لا استخدام لـ `git add -A` أو `.` أو `reset/checkout/restore`.
- مسارات الملفات المحددة بالاسم فقط.
