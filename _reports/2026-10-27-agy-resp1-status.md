# تقرير تنفيذ تيكت — RESP-1: إخفاء بالجهاز + clamp + بريكبوينت مخصصة

**التاريخ:** 2026-10-27 / 2026-10-28 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🟠 P1 · **الوكيل:** Antigravity

---

## 1. المشكلة (الدليل قبل التنفيذ)
| # | المشكلة | المصدر | التحقق |
|---|---|---|---|
| 1 | عدم وجود أي دعم لـ `clamp(` في الاستوديو أو المحرك (`grep -rl "clamp("` = 0) | كود استوديو ومحرك المتجر | تم الإصلاح |
| 2 | `@media` ثابتة ومشفرة في 4 ملفات بدون إمكانية تخصيص نقاط التوقف | كود CSS والمحرك | تم الإصلاح |
| 3 | غياب خيار صريح لإخفاء القسم/العنصر على أجهزة محددة (موبايل، تابلت، سطح مكتب) | `StudioResponsiveControls.tsx` | تم الإصلاح |

---

## 2. ما تم إنجازه تفصيلياً

### أ. إخفاء بالجهاز (Device Hide via `hiddenOn`)
- إضافة كائن إعدادات `hiddenOn: { mobile?: boolean, tablet?: boolean, desktop?: boolean }` للأقسام والحاويات والعناصر.
- توليد قواعد CSS موجهة حصراً لـ media query المقابل:
  - عند `hiddenOn.mobile = true`: ينتج `@media (max-width: 767px) { selector { display: none !important; } }`.
  - عند `hiddenOn.tablet = true`: ينتج `@media (min-width: 768px) and (max-width: 1024px) { selector { display: none !important; } }`.
  - عند `hiddenOn.desktop = true`: ينتج `@media (min-width: 1024px) { selector { display: none !important; } }`.
- **منع Inline Bleed:** تم التأكد بنسبة 100% أن `display: none` لا يتم حقنه كـ inline style عام على الديسكتوب، بل يتم تطبيقه حصرياً عبر الـ media queries داخل ستايل السيكشن السكوب.
- إضافة مكوّن `StudioDeviceVisibilityControl` في `StudioResponsiveControls.tsx` وإدراجه في `StudioInspectorLayoutTab.tsx` مع أزرار تبديل تفاعلية لكل جهاز وأيقونات وحالات نشطة.

### ب. حجم خط مرن عبر `clamp(min, vw, max)`
- توفير دوال التحويل القياسية:
  - `formatClampFontSize({ min, vw, max })`: تحويل كائن القيم إلى صيغة `clamp(18px, 2.5vw, 32px)`.
  - `resolveFontSizeValue(value)`: دعم الأرقام الصريحة، السلاسل النصية، وكائنات clamp.
- دمج دعم clamp في:
  - `buildSectionStyle` (الاستوديو والمتجر الحي).
  - `styleObjectToCssDeclarations` (كلاسات وحالات CSS).
  - `generateResponsiveCss` (تخصيصات التجاوب per-breakpoint).
  - `buildElementTypographyStyle` (`elementTypography.ts` لعناصر النصوص والأزرار).
- توفير واجهة تفاعلية في `StudioInspectorDesignTab.tsx`:
  - تبديل بين «حجم ثابت (Fixed)» و«حجم مرن (Clamp)».
  - حقول إدخال لـ `min (px)`، `vw (%)`، و`max (px)`.
  - معاينة حية مباشرة لمعادلة الـ clamp.

### ج. نقاط توقف مخصصة (Custom Breakpoints via `settings.breakpoints`)
- دعم كائن `settings.breakpoints = { mobile, tablet, desktop }` (بالبكسل).
- **حدود آمنة وترتيب تصاعدي صارم:**
  - الحدود الآمنة: `320px` إلى `1920px`.
  - الترتيب الإلزامي: `mobile < tablet < desktop`.
  - رفض قاطع للقيم المتقاطعة (مثل `mobile=900, tablet=700`) مع رسالة خطأ واضحة باللغة العربية واحتفاظ بالقيمة القديمة السليمة.
- استخدام البريكبوينت في الـ media queries المولدة (مثل `mobile=600` ينتج `@media (max-width: 600px)`).
- إضافة مكوّن تحكم `StudioBreakpointsControl` في تاب التخطيط مع مدخلات لكل جهاز وزر «استعادة الافتراضي» وتنبيه أخطاء فوري.

### د. دعم التراجع وسجل التعديلات (Undo / Redo History)
- جميع تحديثات `hiddenOn`، `breakpoints`، و`fontSize` مدمجة ضمن `handleBatchUpdateSectionFields` و`useStudioHistory` وتدعم Ctrl+Z وCtrl+Y بسلاسة.

---

## 3. الملفات المعدلة والمنشأة

| الملف | النوع | الوصف |
|---|---|---|
| `apps/frontend/src/storefront/studio/utils/studioStyleUtils.ts` | تعديل | إضافة `StudioBreakpoints`، `validateBreakpoints`، `sanitizeBreakpoints`، `formatClampFontSize`، `resolveFontSizeValue`، ودعم `hiddenOn` والبريكبوينت المخصصة في توليد CSS |
| `apps/frontend/src/storefront/sections/elements/elementTypography.ts` | تعديل | إضافة دعم كائنات clamp وسلاسل `clamp(...)` في نصوص وعناوين العناصر |
| `apps/frontend/src/storefront/studio/inspector/StudioResponsiveControls.tsx` | تعديل | إضافة `StudioDeviceVisibilityControl` و `StudioBreakpointsControl` |
| `apps/frontend/src/storefront/studio/inspector/StudioInspectorLayoutTab.tsx` | تعديل | إضافة أكورديون «التجاوب ونقاط التوقف» وإدراج التحكم في الظهور والبريكبوينت |
| `apps/frontend/src/storefront/studio/inspector/StudioInspectorDesignTab.tsx` | تعديل | إضافة تبديل Fixed/Clamp وحقول min/vw/max مع معاينة المعادلة الحية |
| `apps/frontend/src/storefront/__tests__/studioResponsiveExtras.test.tsx` | إنشاء | جناح اختبارات شامل يغطي 12 حالة اختبار للتيكت بالكامل |

---

## 4. نتائج الاختبارات وبوابات الجودة (Quality Gates)

### أ. اختبارات Vitest
```bash
✓ src/storefront/__tests__/studioResponsiveExtras.test.tsx (12 tests) 226ms
✓ src/storefront/__tests__/storefrontTicket5R.test.tsx (10 tests) 324ms
✓ src/storefront/__tests__/studioLayoutExtras.test.tsx (10 tests) 694ms

Total: 32 tests passed across 3 test suites, 0 failed.
```

### ب. شروط القبول الرقمية
1. **Vitest Pass:** 12 حالة اختبار تم اجتيازها بنجاح (المطلوب >= 8).
2. **Hidden on Mobile:** `hiddenOn.mobile=true` ولد `@media (max-width: 767px) { ... display: none !important; }` وبدون أي `display: none` على الديسكتوب.
3. **Clamp:** `{min:18,vw:2.5,max:32}` -> `font-size: clamp(18px, 2.5vw, 32px)`.
4. **Custom Breakpoint:** `mobile=600` -> استخدم 600 في الـ media query (`@media (max-width: 600px)`).
5. **Negative Test:** `mobile=900, tablet=700` تم رفضها مع رسالة خطأ واضحة واحتفاظ بالقيمة القديمة السليمة.
6. **بوابة Oxlint الإلزامية:** 0 أخطاء و 0 تحذيرات على جميع الملفات المعدلة.
7. **صفر Backend:** لم يتم لمس أي ملف في الباك إند أو الملفات المحظورة.
