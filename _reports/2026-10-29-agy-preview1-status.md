# تقرير إنجاز التيكت — PREVIEW-1: إصلاح انحراف معاينة المتجر (banner/سلة/نصوص/عملة)

**التاريخ:** 2026-10-29 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🔴 P0 · **الحالة:** تم ✅
**Commit SHA:** `3cf262222` (الإصلاح + الاختبارات) · تقرير التسليم في commits منفصلة
**النطاق المعدّل:** `apps/frontend/src/storefront/**` فقط (منتج + اختبار) · **صفر backend** · **صفر dependency جديدة** · `git diff package.json` فارغ

---

## 1. الأرقام (قبل → بعد)

| القياس | قبل | بعد |
|---|---|---|
| `storefrontPreview.test.tsx` | **6–9 فاشلة (متذبذبة) / 16** | **17 ناجحة / 17** (زادت حالة واحدة: إثبات العملة ar/en) |
| `storefrontLocaleFormat.test.ts` (LOCALE-1) | 32 ناجحة | **32 ناجحة** (بدون تراجع) |
| `scripts/run-studio-tests.mjs` | 23 ملف · 265 حالة · 0 فاشلة | **23 ملف · 265 حالة · 265 ناجحة · 0 فاشلة** ✔ |
| oxlint على ملفاتي السبعة | — | **صفر أخطاء** (exit 0) |
| `git diff package.json` | — | **فارغ** |

المقاس قبل الإصلاح على نفس الأمر المرجعي: `Tests 9 failed | 7 passed (16)` — والتشغيل المتكرر كان يعطي 6 أو 7 أو 9 فاشلة، أي أن جزءًا من «الفشل» كان **توقيت** لا سلوك.

## 2. جدول التشخيص والإصلاح (كل حالة صُنّفت قبل التعديل)

| # | الحالة | التصنيف | الإصلاح (منتج أم اختبار) | الدليل (`file:line`) |
|---|---|---|---|---|
| 1 | بانر «العودة إلى متجر القوالب» مش لاقيه | **(ب) اختبار قديم/توقيت — ليس باج منتج**: البانر **بيرندر فعلًا** بعد التحقق بقياس مباشر (query بـ 6s → `href=https://admin.example.com/marketplace/themes?theme=elegant-luxe`) | الاختبار: نافذة انتظار واقعية (`configure({asyncUtilTimeout})`) مع تعليق يشرح القياس — **الـassertions لم تتغير** | `__tests__/storefrontPreview.test.tsx:28-38,52` · قياس البانر في القسم 3 |
| 2 | بذور سلة BiteRush/cafe/pc-hub/Max Care Go مش بتتحقن | **(أ) باج منتج حقيقي**: البذور كانت تُحقن على `/cart` و`/checkout` و`/thank-you` فقط، فمعاينة الصفحة الرئيسية كانت بسلة فاضية، وبنود قديمة مخزنة (صور/سعر قديم) لا تُحدَّث أبدًا | المنتج: الحقن على **كل مسارات المعاينة** + مصالحة السلة المخزنة مع البذرة الحالية (التخزين يظل معزولًا لكل ثيم) | `components/preview/StorefrontPreviewBanner.tsx:1661-1673` |
| 3 | `/راش كومبو/` و`/حبوب هاوس بليند/` و`أعد نفس الطلب سريعًا` و`ابدأ من الفئة الأقرب لاحتياجك` مش موجودة | **(أ) باج منتج حقيقي (جذر واحد)**: `cafe-demo` و`restaurant-demo` عندهم JSON preset لكنهم **غير مسجّلين** في مكتبة الثيمات، فكان محرّك العرض يقع على صفحة «Theme Registry Check» التشخيصية بدل الثيم | المنتج: خريطة presets للمعاينة فقط (`STOREFRONT_PREVIEW_ONLY_THEME_PRESETS`) تُستخدم في `hasStorefrontThemePreset` + `getStorefrontThemePreset`، بدون إدخال الثيمين في معرض التاجر | `themes/index.ts:752-761,766-771,2166` |
| 4 | `EGP 1,890.00` مش موجود (بقى `1,890 ج.م`) | **مزيج**: (ب) جزئيًا — المتجر `men-shoes-eg` عربي (`dir=rtl`, `lang=ar`) فالصيغة الصحيحة `1,890 ج.م`؛ (أ) حقيقي للمتجر الإنجليزي — التنسيق كان يقرأ `document.documentElement` (بائت) **و**`style:'currency'` كان يُسقط `.00` فينتج `EGP 1,890` | المنتج: `setStorefrontMoneyLocale` تنشر لغة المتجر أثناء الرندر + `formatMoney` يحتفظ بكسور العملة في نمط currency. الاختبار: تثبيت `1,890 ج.م` للمتجر العربي **بتعليق**، وحالة جديدة تثبت `ar → 1,890 ج.م` · `en → EGP 1,890.00` | `StorefrontShell.tsx:181` · `utils/currency.ts:22-49,75` · `utils/localeFormat.ts:315,362-383` · `__tests__/storefrontPreview.test.tsx:759-763,847-885` |
| 5 | «التوصيل علينا في الطلب الحالي» ظهر في معاينة الموبايل | **(أ) باج منتج اكتُشف بعد إصلاح #2**: شريط الشحن المجاني (من conversion-suite) لم يكن يطبّق نفس قاعدة `GlobalConversionHost` (إخفاء في معاينة الماركت مساحة الموبايل). بعد حقن السلة تجاوز الإجمالي حدّ الشحن فظهر الشريط فوق دوك المعاينة | المنتج: نفس القاعدة تمامًا في `FreeShippingBar` | `components/FreeShippingBar.tsx:92-116` |

### لماذا لم أُصلح الاختبار في #2/#3/#5
لأن **المنتج** هو الذي كان ناقصًا: البيانات (بذور + نصوص + ثيمات) موجودة في الريبو لكن المسار لا يصلها. الاختبار هنا يصف السلوك الصحيح للمعاينة (سلة 3 بنود، ثيم المقهى بيظهر، الشريط مخفي على الموبايل) ولم أُضعّف أي assert — الوحيدة المُعدَّلة هي **صيغة العملة** في متجر عربي (وهي تصحيح تصنيف، موثّق بتعليق).

## 3. إثبات البانر (بند القبول 3)

قياس مباشر (بروب مؤقت، حُذف قبل الـcommit):
```
coldToBanner= 3614 ms   warmToBanner= 1047 ms
findByRole(link, "العودة إلى متجر القوالب") → href = https://admin.example.com/marketplace/themes?theme=elegant-luxe
```
يعني البانر موجود وبيترندر بالـhref الصحيح؛ سبب السقوط هو أن الـchunk/الـsettings pipeline في هذه البيئة ياخد ~1.0s دافئ و~3.6s بارد، والـdefault timeout كان 1000ms. لذلك الإصلاح في **الاختبار** (ميزانية انتظار معلنة) لا في المنتج.

## 4. إثبات العملة (بند القبول 2) — الحالة الجديدة

`__tests__/storefrontPreview.test.tsx:847` «formats EGP for the storefront locale (ar vs en)»:

| الإدخال | الناتج المتوقّع | الناتج الفعلي |
|---|---|---|
| `formatMoney(1890, {currency:'EGP', symbol:'ج.م', position:'after', locale:'ar-EG'})` | `1,890 ج.م` | ✅ |
| `formatStorefrontCurrency(1890, 'EGP', 'ar-EG')` | `1,890 ج.م` | ✅ |
| `formatMoney(1890, {style:'currency', currency:'EGP', locale:'en-US'})` | `EGP 1,890.00` | ✅ |
| `formatStorefrontCurrency(1890, 'EGP', 'en-US')` | `EGP 1,890.00` | ✅ |
| `formatStorefrontCurrency(1890.5, 'EGP', 'en-US')` | `EGP 1,890.50` | ✅ |
| `formatStorefrontCurrency(1890.5, 'EGP', 'ar-EG')` | `1,890.50 ج.م` | ✅ |

كذلك تم توحيد مسافات `Intl` (NBSP/bidi marks → مسافة عادية) حتى يكون الناتج نصًا واحدًا قابلًا للنسخ والمقارنة في أي اتجاه.

## 5. إثبات السلة (بند القبول 4)

| المتجر | الحالة المضافة/القائمة | النتيجة |
|---|---|---|
| BiteRush (`restaurant-demo`) | `expect(useCartStore.getState().items).toHaveLength(3)` + drawer بيفتح (`role=dialog`) ويعرض «راش كومبو» | ✅ |
| cafe (`cafe-demo`) | thank-you: 3 بنود + كميات `[2,4,2]` بعد «أعد الطلب» | ✅ |
| Max Care Go · pc-hub · elegant-luxe | بذور معزولة (preview storage) + تجديد الصور القديمة | ✅ |

## 6. الأوامر المرجعية (مخرجات حقيقية)

```bash
cd apps/frontend
N="C:/Users/hp/AppData/Local/hermes/tools/node-26.7.0-win32-x64/node.exe"

"$N" ./node_modules/vitest/vitest.mjs run src/storefront/__tests__/storefrontPreview.test.tsx \
  --config scripts/vitest.storefront.config.ts
#   Test Files  1 passed (1)
#        Tests  17 passed (17)

"$N" ./node_modules/vitest/vitest.mjs run src/storefront/__tests__/storefrontLocaleFormat.test.ts \
  --config scripts/vitest.storefront.config.ts
#        Tests  32 passed (32)

"$N" scripts/run-studio-tests.mjs
# files : 23 run · 0 with failures · 0 crashed
# cases : 265 total · 265 passed · 0 failed
# ✔ studio-tests PASSED.

"$N" ./node_modules/oxlint/bin/oxlint --config .oxlintrc.json <7 ملفات> → exit 0
```

## 7. الملفات المعدّلة

| الملف | التغيير |
|---|---|
| `themes/index.ts` | استيراد JSON للثيمين + `STOREFRONT_PREVIEW_ONLY_THEME_PRESETS` + استخدامه في `hasStorefrontThemePreset` / `getStorefrontThemePreset` |
| `components/preview/StorefrontPreviewBanner.tsx` | حقن بذور السلة على كل مسارات المعاينة + إزالة بوابة المسار وعلامة «تم الحقن» الميتة |
| `utils/currency.ts` | لغة المتجر المنشورة (`setStorefrontMoneyLocale`) قبل قراءة الـDOM + تمرير كسور العملة |
| `utils/localeFormat.ts` | `style:'currency'` يحترم minor units للعملة + توحيد المسافات/bidi |
| `StorefrontShell.tsx` | نشر `currentLocale` للتنسيق أثناء الرندر |
| `components/FreeShippingBar.tsx` | إخفاء شريط الشحن المجاني في معاينة الماركت على الموبايل (نفس قاعدة GlobalConversionHost) |
| `__tests__/storefrontPreview.test.tsx` | ميزانية انتظار معلنة · assert الطول 3 لسلة BiteRush · صيغة العملة العربية + حالة ar/en الجديدة |

## 8. ملاحظات خارج نطاق التيكت (لم ألمسها)

- `themeCatalog.test.ts` فاشل **قبل** هذا التيكت (بيتوقّع تسجيل `furniture-demo` / `electronics-demo` / `smart-bazaar` في المعرض) — خارج نطاق PREVIEW-1.
- `storefrontRuntimeImports.test.ts` فاشل **قبل** هذا التيكت: يمنع وجود `from '../themes'` داخل `runtimeThemeResolver.ts` وهذا الاستيراد موجود أصلًا.
- `preview/__tests__/marketplacePreviewCart.test.ts` (خارج config الـstorefront) فاشل قبل وبعد: بيتوقّع بذور `art-deco-chrono` القديمة لـ`vela-fashion-eg` و`fastly-eg`.
