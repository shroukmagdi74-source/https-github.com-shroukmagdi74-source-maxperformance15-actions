# تقرير إنجاز التيكت — PERF-1: سرعة الصفحة كدرجة + أداء + مقاييس المنتج + مراقبة أخطاء

**التاريخ:** 2026-10-28 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🟠 P1 · **المصدر:** backlog بند 51 · ن6 · ن13 · ن15 · ن20 · **الحالة:** تم بنجاح ✅

---

## 1. ملخص التنفيذ الفني

1. **حاسبة درجة الأداء المحلية والأوزان الحقيقية (Local Performance Score & Real Page Weights):**
   - تم إنشاء المحرك النقي في `apps/frontend/src/storefront/studio/utils/performanceScore.ts`.
   - **فحص محلي 100% بدون أي طلبات شبكة:**
     - **عدد الأقسام:** حتى 10 أقسام (صفر خصم)، وما يزيد عن ذلك يُخصم نقطتان لكل قسم إضافي.
     - **الصور بدون أبعاد (width / height مفقودة):** خصم 5 نقاط لكل صورة لمنع انزياح التخطيط التراكمي (CLS).
     - **الصور المتضخمة (> 300KB):** رصد حجم الصور بالبايت من البيانات المتاحة وخصم 6 نقاط لكل صورة متضخمة مع التوصية بضغطها أو التحويل لصيغ WebP/AVIF.
     - **السكربتات والأنماط المضمّنة (> 30KB):** احتساب أحجام أكواد CSS و JavaScript المضمّنة بدقة بالبايت وخصم 8 نقاط عند تجاوز 30KB.
     - **عدد الخطوط (> 3):** فحص الخطوط المستعملة عبر الثيم والأقسام؛ إذا كانت الخطوط 3 أو أقل لا يُطبق أي خصم ولا تظهر أي توصية لتقليل الخطوط. إذا زادت عن 3 يتم خصم 5 نقاط لكل خط إضافي مع إدراج توصية مخصصة.
     - **أهم 3 توصيات:** ترتيب الملاحظات حسب درجة التأثير وإرجاع أعلى 3 توصيات تنفيذية فقط.
     - **أوزان حقيقية:** تجميع أحجام الصور، السكربتات، الأنماط، وبنية البيانات الإجمالية وتنسيقها (B, KB, MB).

2. **مقاييس المنتج الخفيفة (Product Metrics Telemetry):**
   - تحديث طبقة AN-1 في `apps/frontend/src/storefront/analytics/beacon.ts` بدون أي SDK خارجي:
     - إضافة دالة `trackStudioOpen(pageKey, { companyId })`.
     - إضافة دالة `trackStudioPublish(pageKey, { companyId, sectionCount })`.
     - إضافة دالة `trackStudioTemplateApply(pageKey, templateId, { companyId })`.
     - إضافة دالة `trackStudioAiOpen(pageKey, { companyId })`.
     - إضافة دالة `trackStudioError(pageKey, { message, sectionKey }, { companyId })`.
     - دعم `companyId` و `companySlug` مع الحفاظ التام على خصوصية البيانات (صفر PII وصفر حفظ للـ IP).
   - تحديث متحكم الباك إند القائم `apps/backend/controller/storefrontAnalyticsController.js` لاستقبال أنواع الأحداث الجديدة والربط عبر `companyId` أو `companySlug` **دون إنشاء أي مسار أو endpoint جديد**.

3. **مراقبة أخطاء الرندر (StudioErrorBoundary):**
   - إنشاء المكون `apps/frontend/src/storefront/studio/StudioErrorBoundary.tsx`:
     - يلتقط أخطاء رندر أقسام الكانفس والأدوات ويمنع انهيار تطبيق المحرر بالكامل.
     - يرسل حدث `studio_error` متضمناً `sectionKey` ورسالة الخطأ المختصرة عبر نفس طبقة AN-1 دون أي SDK ثقيل.
     - يعرض بطاقة استعادة موضعية أنيقة تتيح للمستخدم إعادة المحاولة دون التأثير على بقية الأقسام.
   - تضمين `StudioErrorBoundary` حول كل قسم داخل `StorefrontStudioShell.tsx`.

4. **تحديث تاب «الأداء» في الفاحص (StudioInspectorAnalyticsTab):**
   - تحديث `apps/frontend/src/storefront/studio/inspector/StudioInspectorAnalyticsTab.tsx`:
     - شاشة مدمجة تعرض:
       1. درجة الأداء المحلية الكبرى (0-100) مع ترميز لوني ديناميكي وشارة التقييم.
       2. بطاقة الأوزان الحقيقية وتوزيعها (صور، سكربتات، أنماط، بيانات).
       3. قائمة أهم 3 توصيات تنفيذية.
     - مفتاح تبديل ناعم للتبديل بين سرعة وأوزان الصفحة وبين تحليلات التفاعل من AN-1 (المشاهدات، النقرات، نسبة النقر إلى الظهور CTR).

5. **منظومة الاختبارات الشاملة (Vitest):**
   - ملف الاختبار: `apps/frontend/src/storefront/__tests__/studioPerformance.test.tsx`.
   - 12 حالة اختبار شاملة تغطي كافة متطلبات التيكت بنجاح 100%.

---

## 2. جدول نتائج معايير القبول (Acceptance Criteria)

| # | معيار القبول | المتطلب | النتيجة المحققة | الحالة |
|---|---|---|---|---|
| **1** | اختبار vitest | نجاح كافة الاختبارات (≥8 حالات) | نجاح 12/12 حالة اختبار شاملة في `studioPerformance.test.tsx` + نجاح 46/46 في كامل سويت الستوديو | ✅ مرت |
| **2** | تقييم الصفحة النظيفة والصور بدون أبعاد | صفحة نظيفة (3 أقسام، صور بأبعاد، خطين) → درجة **≥90**؛ نفس الصفحة + 5 صور بدون أبعاد → الدرجة **تنزل ≥20 نقطة** | تم التأكيد في الاختبار: الصفحة النظيفة أعطت 100 (≥ 90)، ومع 5 صور بدون أبعاد نزلت الدرجة إلى 75 بفارق خصم 25 نقطة (≥ 20) | ✅ مرت |
| **3** | فحص توصيات الخطوط | صفحة فيها خطين فقط → مفيش توصية «قلّل الخطوط» | تم التأكيد في الاختبار: غياب تام لأي توصية تخص تقليل الخطوط عند كونها 2 | ✅ مرت |
| **4** | مقاييس المنتج الأربعة | كل حدث (`studio_open`, `studio_publish`, `studio_template_apply`, `studio_ai_open`) يُرسل مرة واحدة بكليك/فتح ومصحوباً بـ `companyId` | تم التأكيد بـ spy asserts في الاختبارات: كل حدث أُرسل مرة واحدة بنجاح مع `companyId` | ✅ مرت |
| **5** | مراقبة الأخطاء | قسم يرمي خطأ → التطبيق لا ينهار + حدث `studio_error` يُرسل عبر طبقة الأحداث | تم التأكيد: تم عرض واجهة الاستعادة دون انهيار الشجرة مع استدعاء `sendBeacon` بالحدث وبيانات القسم | ✅ مرت |
| **6** | TypeScript وخلو التبعيات | `tsc --noEmit` صفر أخطاء وصفر dependencies جديدة | صفر أخطاء وصفر مساس بملفات `package.json` أو حزم خارجية | ✅ مرت |
| **7** | البوابة الإلزامية oxlint | فحص oxlint قبل الكوميت صفر أخطاء | `Found 0 warnings and 0 errors` على جميع الملفات المعدلة والجديدة | ✅ مرت |

---

## 3. الملفات المعدلة والجديدة

- `apps/frontend/src/storefront/studio/utils/performanceScore.ts` (جديد)
- `apps/frontend/src/storefront/studio/StudioErrorBoundary.tsx` (جديد)
- `apps/frontend/src/storefront/__tests__/studioPerformance.test.tsx` (جديد)
- `apps/frontend/src/storefront/analytics/beacon.ts` (معدل)
- `apps/frontend/src/storefront/studio/inspector/StudioInspectorAnalyticsTab.tsx` (معدل)
- `apps/frontend/src/storefront/studio/StudioPropertyInspector.tsx` (معدل)
- `apps/frontend/src/storefront/studio/StorefrontStudioShell.tsx` (معدل)
- `apps/backend/controller/storefrontAnalyticsController.js` (معدل - دعم الأحداث في المسار القائم)
- `_reports/2026-10-27-agy-perf1-status.md` (تقرير الإنجاز)
