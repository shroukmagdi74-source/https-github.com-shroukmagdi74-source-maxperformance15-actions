# تقرير إنجاز التيكت — TPL-2: تصدير/استيراد + نسخة قبل النشر + Theme Builder

**التاريخ:** 2026-10-28 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🟠 P1 · **المصدر:** backlog بند 15 · 16 · ن12 · ن17 · **الحالة:** تم بنجاح ✅

---

## 1. ملخص التنفيذ الفني

1. **نظام تصدير واستيراد الصفحات (Page Export/Import):**
   - إنشاء محرك التصدير والاستيراد في `apps/frontend/src/storefront/studio/utils/studioPageExportImport.ts`.
   - توفير دالة `exportPage(pageKey, options)`: تصدير هيكل الصفحة كاملاً بصيغة JSON معيارية تتضمن:
     - رقم الإصدار المعياري `version: "1.0"`.
     - معرف واسم الصفحة المستهدفة `page`.
     - مصفوفة الأقسام بكافة إعداداتها ومحتوياتها `sections`.
     - طابع وتنسيق الصفحة البصري `styles` (PageStyleScope: الخطوط، الألوان، الكثافة، الانحناءات).
     - بيانات وصفية دقيقة للتوثيق `metadata` (عدد الأقسام، الثيم المصدر، وتاريخ التصدير).
   - توفير دالة `importPage(jsonInput, options)`:
     - **تحقق صارم من الـ Schema:** التحقق من وجود وصحة حقل `version`، رفض أي إصدار مختلف مثل `"unknown"` برسالة واضحة دون أي تعديل على الصفحة الحالية (Strict Negative Guard).
     - **فحص صحة الأقسام:** التحقق الإلزامي من وجود مصفوفة `sections` صالحة.
     - **حساب الفروقات التلقائي (Diff Preview):** حساب عدد الأقسام الحالية مقابل المستوردة، وبيان ما إذا كان هناك تعديل في طابع الصفحة البصري قبل التطبيق عبر `computePageDiff`.
     - **التطبيق المشروط بتأكيد المستخدم:** عدم تطبيق أي تغييرات إلا بعد التأكيد الصريح `confirm: true`.
   - توفير دالة `downloadJSON(filename, data)` لدعم التنزيل المباشر للملفات داخل المتصفح مع تحرير الروابط بأمان.
   - بناء نافذة حوارية احترافية `apps/frontend/src/storefront/studio/StudioExportImportModal.tsx` تدعم تبويبي التصدير (معاينة ونسخ وتنزيل JSON) والاستيراد (رفع ملف أو لصق، فحص فوري للأخطاء، معاينة الفروقات، وزر تأكيد الاستيراد).

2. **شبكة أمان النسخة قبل النشر (Pre-Publish Snapshot & Rollback):**
   - دعم إنشاء لقطة فورية للحالة الحالية باسم `pre-publish` **قبل** تطبيق وحفظ التعديلات المنشورة في `useStorefrontStudioState.ts`.
   - حفظ اللقطة ضمن `designTokens.snapshots` (سجل اللقطات المحلي المحتفظ بآخر 30 نسخة) وبالتوافق التام مع سجل إصدارات HIST-1.
   - إطلاق إشعار Toast فوري بالنص المحدد في التيكت: `«تم حفظ نسخة — استرجاع»` متضمناً زراً تفاعلياً للاسترجاع الفوري.
   - دعم الاسترجاع الكامل للحالة السابقة عبر دالة `handleRestorePrePublishSnapshot()`.
   - ربط زر النشر في `StudioTopBar.tsx` عبر خاصية `onPublish` وإضافة السمة المعيارية `data-testid="studio-publish-button"`.

3. **محرك باني القوالب (Theme Builder Engine):**
   - بناء محرك القوالب في `apps/frontend/src/storefront/studio/utils/themeBuilder.ts`.
   - دعم القوالب للأرشيف (`archive`: عرض كل المنتجات والكتالوج والمجموعات) والقوالب المفردة (`single`: منتج واحد أو مقال).
   - دوال التوليد المعيارية: `archiveTemplate` و `singleTemplate` و كائن الواجهة الموحد `themeBuilder`.
   - نظام شروط متقدم `ThemeBuilderCondition`:
     - تطبيق عام على الكل (`applyTo: "all"`).
     - تطبيق مشروط بمجموعة أو تصنيف محدد (`applyTo: "group"` عبر `groupId` أو `categoryIds` أو `productIds`).
   - دالة مطابقة الراوتر المعيارية `resolveThemeBuilderTemplate`:
     - الأولوية الأولى: مطابقة المجموعة المحددة (Group X).
     - الأولوية الثانية: القالب العام (`applyTo: "all"`).
     - التراجع التلقائي (Fallback): إرجاع `null` عند عدم وجود مطابقة ليعتمد الراوتر على الصفحة الافتراضية للثيم.
   - تكامل الراوتر العام في `StorefrontShell.tsx`:
     - دعم قوالب المنتج المفرد في `StorefrontThemeBuilderPdpWrapper` مع فحص تصنيف المنتج وإرجاع القالب المخصص أو الافتراضي `theme.pages.pdp`.
     - دعم قوالب الأرشيف في `shopPageElement` للكتالوج مع التراجع لـ `theme.pages.shop`.
   - تكامل `DynamicStorefrontPage.tsx` لقوالب المقالات المفردة.
   - بناء لوحة تحكم Theme Builder المخصصة `apps/frontend/src/storefront/studio/StudioThemeBuilderPanel.tsx` ودمجها كتبويب داخل `StudioTemplateGalleryPanel.tsx`.

---

## 2. جدول نتائج معايير القبول (Acceptance Criteria)

| # | معيار القبول | المتطلب | النتيجة المحققة | الحالة |
|---|---|---|---|---|
| **1** | اختبار vitest | تشغيل الاختبارات ونجاح ≥9 حالات | نجاح 12 حالة اختبار في `studioTemplatesExports.test.tsx` + 56 حالة في باقي ملفات الاستوديو (إجمالي 68 حالة) | ✅ مرت |
| **2** | التصدير والاستيراد التام (Round-trip) | صفحة 4 أقسام → تصدير → مسح → استيراد = نفس 4 أقسام ونفس الستايل (deep-equal) | تم التحقق في الاختبار 2: مطابقة عميقة تامة للأقسام الأربعة وطابع الصفحة البصري | ✅ مرت |
| **3** | الاختبار السلبي (Negative Test) | JSON بـ `version: "unknown"` يترفض برسالة والصفحة لا تتغير | تم التحقق في الاختبار 3: رفض العملية مع رسالة الخطورة وتأكيد بقاء محتوى الصفحة دون مساس | ✅ مرت |
| **4** | نسخة قبل النشر (Pre-publish Snapshot) | النشر ينشئ snapshot باسم `pre-publish` والاسترجاع يرجع الحالة السابقة | تم التحقق في الاختبار 6: اللقطة موجودة باسم `pre-publish`، والإشعار يظهر، والاسترجاع يعيد الصفحة بدقة | ✅ مرت |
| **5** | باني الثيم (Theme Builder Conditions) | قالب `single` مربوط بمجموعة X يستخدمه منتج من X ومنتج خارجها يرجع للافتراضي | تم التحقق في الاختبار 7: منتج X يستخدم قوالب X المخصصة ومنتج خارج X يرجع لصفحة PDP الافتراضية | ✅ مرت |
| **6** | فحص TypeScript والباك إند | `tsc --noEmit` صفر أخطاء على ملفات التيكت وصفر تعديل على الباك إند/الاسكيما | صفر أخطاء نوعية على كافة الملفات الجديدة والمعدلة، وتخزين كامل داخل settings blob | ✅ مرت |
| **7** | بوابة Oxlint الإلزامية | فحص كافة الملفات المعدلة بـ `oxlint` مع صفر أخطاء | `Found 0 warnings and 0 errors` عبر 11 ملفاً في 23ms | ✅ مرت |

---

## 3. قائمة الملفات المنفذة

1. `apps/frontend/src/storefront/studio/utils/studioPageExportImport.ts` (جديد — محرك التصدير والاستيراد وحساب الفروقات والتحقق)
2. `apps/frontend/src/storefront/studio/utils/themeBuilder.ts` (جديد — محرك Theme Builder وشروط العرض والراوتر)
3. `apps/frontend/src/storefront/studio/StudioExportImportModal.tsx` (جديد — نافذة التصدير والاستيراد التفاعلية)
4. `apps/frontend/src/storefront/studio/StudioThemeBuilderPanel.tsx` (جديد — لوحة إدارة قوالب Theme Builder)
5. `apps/frontend/src/storefront/studio/StudioTypes.ts` (تعديل — تصدير أنواع Theme Builder و PrePublishSnapshot و Export/Import)
6. `apps/frontend/src/storefront/studio/hooks/useStorefrontStudioState.ts` (تعديل — دوال exportPage و importPage و handlePublish و createPrePublishSnapshot وحفظ القوالب)
7. `apps/frontend/src/storefront/studio/StudioTopBar.tsx` (تعديل — زر التصدير/الاستيراد وزر النشر المزود بـ pre-publish)
8. `apps/frontend/src/storefront/studio/StudioTemplateGalleryPanel.tsx` (تعديل — تبويب Theme Builder داخل لوحة القوالب)
9. `apps/frontend/src/storefront/studio/StorefrontStudioShell.tsx` (تعديل — ربط نوافذ التصدير والاستيراد وحقن القوالب)
10. `apps/frontend/src/storefront/StorefrontShell.tsx` (تعديل — دعم قوالب Theme Builder في راوتر المنتجات والكتالوج)
11. `apps/frontend/src/storefront/pages/DynamicStorefrontPage.tsx` (تعديل — دعم قوالب المقالات المخصصة)
12. `apps/frontend/src/storefront/__tests__/studioTemplatesExports.test.tsx` (جديد — 12 حالة اختبار شاملة)
13. `_reports/2026-10-27-agy-tpl2-status.md` (تقرير الإنجاز)
