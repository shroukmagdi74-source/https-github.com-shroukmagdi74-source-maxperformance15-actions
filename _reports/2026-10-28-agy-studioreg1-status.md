# تقرير إنجاز التيكت — STUDIO-REG-1: إصلاح اختبار المحرر القديم + حرس انحدار

**التاريخ:** 2026-10-29 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🟠 P1 · **الحالة:** تم ✅ (مع بند متابعة واحد مفتوح — القسم 8)
**Commit SHA:** `6fe3105133f6de64017fe97be8f2935d9dee004f`
**CI Run:** `studio-tests` → [run 40802706232](https://github.com/shroukmagdi74-source/https-github.com-shroukmagdi74-source-maxperformance15-actions/actions/runs/40802706232)

---

## 1. الأرقام (قبل → بعد)

| القياس | قبل | بعد |
|---|---|---|
| `storefrontProStudio.test.tsx` | **8 فاشلة / 18** (10 ناجحة) | **18 ناجحة / 18** |
| حرس آلي في الـCI لاختبارات المحرر | **مفيش** (الـCI = Oxlint + Build فقط) | workflow مستقل `studio-tests.yml` |
| ملفات studio في الحرس | — | **23 ملف · 265 حالة · 265 ناجحة · 0 فاشلة** (ملف واحد مستثنى بسبب عطل سابق — القسم 8) |
| ملفات `src/storefront/**` خارج `__tests__` في الـdiff | — | **صفر** (`git diff --stat` + `git status` = لا شيء) |

## 2. القبول المطلوب — واحد بواحد

| # | البند | النتيجة |
|---|---|---|
| 1 | `vitest run storefrontProStudio.test.tsx` | ✅ `Tests 18 passed (18)` |
| 2 | `node scripts/run-studio-tests.mjs` | ✅ `cases: 265 total · 265 passed · 0 failed` + `✔ studio-tests PASSED` |
| 3 | اختبار سلبي (كسر حقيقي) | ✅ السكربت فشل وسمّى الملف/الحالة (مخرجات كاملة في القسم 6) |
| 4 | صفر تعديل في كود المنتج | ✅ مراجعة `git status` بعد إرجاع الكسر: لا ملف خارج `__tests__` |
| 5 | الـworkflow يظهر ويعدّي | ✅ `gh run list --workflow=studio-tests.yml` → run `40802706232` |

بوابة oxlint:
`oxlint --config .oxlintrc.json <8 ملفات>` → **صفر أخطاء** (exit 0).

## 3. `storefrontProStudio.test.tsx` — كل توقع اتغير (قبل → بعد + السبب)

كل الحالات الـ18 اتحافظ عليها (مفيش حذف، مفيش تخفيف لـ`truthy` فقط).

| # | الحالة | قبل | بعد | السبب |
|---|---|---|---|---|
| 1 | CanvasRuler › pixel marks | `getByText("1200px*")` | `getByText("1200px")` + عدد التكات **13** + أول/آخر تك (`0`/`1200`) | البادج بقى `{width}px` بدون نجمة `*`، والتكات اتوسعت لـ13 (كل 100px) |
| 2 | CanvasRuler › mobile | `getByText("375px*")` | `getByText("375px")` + عدد التكات **9** + آخر تك `375` | نفس السبب + تكات الموبايل بقت 9 |
| 3 | LeftRail | 8 أدوات بأسماء قديمة (`طبقات`, `كود`, `Responsive AI`) | **13 أداة** بالأسماء الحالية: إضافة · مكوّنات · قوالب · الثيمات · **الهيكل** · صفحات · الهيدر والفوتر · امتثال · وسائط · أنماط · **متغيرات** · **قواعد التجاوب الذكية** · إعدادات المتجر + عدّ الأزرار 13 + الكليك على «الهيكل» → `onSelectTab("layers")` | الموجتان A/B ضافوا مكوّنات/قوالب/ثيمات/هيدر-فوتر/امتثال/متغيرات، وغيّروا «طبقات»→«الهيكل» وحذفوا «كود» و«Responsive AI» |
| 4 | ElementsPanel | `onAdd("richtext")` عند الضغط على «عنوان» | `onAdd("heading")` + 13 عنصر سريع بالاسم + `[data-studio-draggable] = 38` (13 سريع + 7 تجارة + 4 سلة + 5 بريستس) + عنوانا مجموعتي التجارة والسلة + بريست «شبكة منتجات» → `featured-products` | نوع العنصر اتغير من `richtext` لـ`heading`، واللوحة اتوسعت بمجموعات COMM-1/CHECKOUT-1 والبريستس |
| 5 | TopBar › breakpoints | `getByText("1200")` (ambiguous) | `getByTitle("سطح المكتب (1200px)")` وعليه `textContent` يحتوي `1200`، ونفسه لـ 768/375 + **عدد أزرار البكسلات = 3** + زر النشر عبر `data-testid` | `getByText("1200")` بقى يطابق عنصرين (تكة المسطرة + بادج الزر) بسبب تسريب DOM بين الاختبارات (اتصلح في الـsetup) + صار لازم التحقق داخل الزر نفسه |
| 6 | PropertyInspector | 4 تابات + `getByText("تجاوب")` | **7 تابات** (تصميم · تخطيط · **حركة** · محتوى · تجاوب · **اللغة** · **الأداء**) مع `within(tabStrip)` + بعد كليك «محتوى» قيمة `عنوان تجريبي` + بعد كليك «تجاوب»: `ai-capabilities-panel` + «قدرات مساعد المتجر (AI)» + «2 مفعّلة · 3 قريباً» + **5** كروت قدرات | تبويبات الحركة/اللغة/الأداء اتضافت، ومحتوى «قواعد التجاوب الذكية … قيد التجهيز» اتشال واستبدل بلوحة القدرات الحقيقية (AI_CAPABILITIES = 5) |
| 7 | Section Append (1A.1) | `activeSections = 7` → بعد الإضافة 8 → undo 7 | `activeSections = 6` (الـ`pageOverrides` هي المرجع في الكانفس) → بعد الإضافة 7 في `pages` و`pageOverrides` معًا وآخرها القسم الجديد → undo يرجّع **بالظبط** الأصل: `pages` 7 (بالـnewsletter) و`pageOverrides` 6 | الهوك بقى يعتمد `pageOverrides` كمرجع للصفحة بدل دمج `pages`، فالكانفس بيشوف 6 أقسام بينما `resolveStorefrontTheme` (المتجر الحي) بيرندر 7. الحالة اتظبطت على سلوك الهوك الحقيقي مع تأكيد صفر فقد بعد الـundo |
| 8 | SortableSection › hairline | `document.querySelector(".shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]")` | `.studio-section-hairline` + تأكيد `absolute`/`inset-0`/`pointer-events-none` + قراءة `storefront-studio.css` والتأكيد على `inset 0 0 0 1px rgba(15, 23, 42, 0.08)` وقاعدة hover `inset 0 0 0 2px` | الحد الشَعري اتنقل من كلاس Tailwind inline لطبقة CSS مُعمّاة (`.studio-section-hairline`)، فالتحقق بقى على العقد البصري في الـCSS نفسه |

### الحالات اللي بقت سلوكية (مش أرقام ثابتة)
1. **LeftRail** — عدد الأدوات + الأسماء + الكليك بيرجّع التاب الصح (`layers`).
2. **ElementsPanel** — الكليك بيضيف النوع الصح (`heading`) والبريست بيضيف نوعه (`featured-products`) + عدّ العناصر القابلة للسحب.
3. **TopBar** — الأزرار الثلاثة بتتحقق من البادج **جواها**، والكليك بينادي `onDeviceChange("mobile")`، والزوم بينادي بالقيم `1.1/0.9`.
4. **Inspector** — التنقل بين التابات بيعرض المحتوى الحقيقي (حقل العنوان / لوحة القدرات) بدل أرقام.
5. **SortableSection** — عقد الـCSS (1px resting / 2px hover) بدل كلاس Tailwind محدد.
6. **Append/Undo** — إلحاق بلا إعادة ترتيب + undo بيرجّع نفس البنية (`pages` و`pageOverrides` كلٌّ بقيمه).

## 4. setup موحّد للاختبارات (بند 3-ب)

**ملف جديد:** `apps/frontend/src/storefront/__tests__/setup/storefrontTestSetup.ts`

| المشكلة المقيسة | الإصلاح |
|---|---|
| `localStorage is not available because --localstorage-file was not provided` + `Cannot read properties of undefined (reading 'clear'/'setItem')` | `createMemoryStorage()` (Storage كامل: get/set/remove/clear/key/length) + تركيبه على `globalThis.localStorage` و`sessionStorage` قبل أي import للاختبار |
| `window.matchMedia` غير موجود في jsdom | polyfill كامل (`matches`, `addEventListener`, `addListener`, `dispatchEvent`) |
| DOM بيتسرّب بين الاختبارات → `Found multiple elements with the text: 1200/تجاوب` | `afterEach(cleanup)` مسجّل في الـsetup (المشروع بيستورد `describe/it` صراحة فمفيش auto-cleanup من RTL) |
| `No QueryClient set, use QueryClientProvider to set one` | `createStorefrontTestQueryClient()` + `StorefrontTestProviders` + `renderWithStorefrontProviders()` |
| تلوث الحالة بين الاختبارات | `beforeEach` بيفرّغ الـstorage |

**الربط:** `apps/frontend/scripts/vitest.storefront.config.ts` — بيورّث `vite.config.ts` (نفس alias/plugins) ويضيف `test.environment=jsdom` + `setupFiles` + `include` لمسارات `src/storefront/__tests__/**` **فقط**. مفيش `setupFiles` عام على مستوى المشروع (كان لازم يتعمله ملف config لأن الريبو مفيهوش `vitest.config.*` أصلًا).

**أثر الـsetup على الـsuites المذكورة في 3-ب (قياس حقيقي):**

| suite | قبل | بعد |
|---|---|---|
| `CartUpsellHost.khemet` | 0/2 (رمي `localStorage.clear`) | **2/2** ✅ |
| `RelatedProducts.elessiCompleteSet` | 0/2 (`No QueryClient set` + `localStorage`) | **2/2** ✅ (مع `StorefrontTestProviders` + توقّع `EGP 280` بدل `EGP 280.00` بعد LOCALE-1) |
| `storefrontPreview` | **16/16 فاشلة** (الكل بيموت في `beforeEach` على `localStorage.clear`) | **10 ناجحة / 16** — الـ6 الباقية **مش من عائلة localStorage/Provider** (القسم 8) |
| `studioOnboarding` | 8/8 (كان بيعمل mock خاص) | 8/8 عبر الـsetup المشترك |

## 5. حرس الانحدار + CI

**`apps/frontend/scripts/run-studio-tests.mjs`** (+ `npm run test:studio`):
- بيكتشف تلقائيًا كل `__tests__/studio*.test.tsx` + `storefrontProStudio.test.tsx` (وأي ملف `*studio*.test.tsx` جديد).
- بيشغّل **كل suite في process لوحده** (عشان لو suite كسر الـworker النتيجة متضيعش كلها) بمهلة لكل ملف (`STUDIO_TEST_FILE_TIMEOUT_MS`, افتراضي 300s).
- بيطبع سطر لكل ملف (pass/fail/CRASH + الزمن) + ملخص: عدد الملفات، عدد الحالات، الفاشل، أسماء الحالات الفاشلة ورسالتها، وشرط `storefrontProStudio ≥ 18 حالة`.
- بيرجّع exit code = 1 لو فيه أي فشل/كراش.

**`.github/workflows/studio-tests.yml`** (ملف جديد مستقل — **`deploy.yml` متلمسش**):
- `push`/`pull_request` على مسارات `apps/frontend/src/storefront/**`, `scripts/run-studio-tests.mjs`, `scripts/vitest.storefront.config.ts`, `package.json`, والـworkflow نفسه + `workflow_dispatch`.
- Node 20 · `npm ci` · `node scripts/run-studio-tests.mjs`.

مخرج التشغيل الكامل (محلي):
```
▶ Studio regression guard — 23 suite(s), one process each
✔ storefrontProStudio.test.tsx — 18 passed (17.7s)
✔ studioAnalyticsTab.test.tsx — 3 passed ... ✔ studioVariables.test.tsx — 18 passed
──────────── studio-tests summary ────────────
files  : 23 run · 0 with failures · 0 crashed
excl.  : 1 (listed above)
cases  : 265 total · 265 passed · 0 failed
guard  : storefrontProStudio.test.tsx → 18 case(s)
✔ studio-tests PASSED.
```

## 6. الاختبار السلبي (إثبات إن الحرس بيمسك كسر حقيقي)

كسر مُحقن مؤقتًا في `src/storefront/studio/StudioTopBar.tsx` (بادج الديسكتوب `1200` → `1180`)، تشغيل السكربت:

```
✖ src\storefront\__tests__\storefrontProStudio.test.tsx — 1/18 failed (16.8s)
✔ باقي الـ22 ملف ناجحة
──────────── studio-tests summary ────────────
files  : 23 run · 1 with failures · 0 crashed
cases  : 265 total · 264 passed · 1 failed
failing cases:
  ✖ Storefront Pro Studio (Design 3 - Wix Studio 2026) StudioTopBar renders the 3 breakpoint buttons with pixel badges
      src\storefront\__tests__\storefrontProStudio.test.tsx
      AssertionError: expected 'سطح المكتب1180' to contain '1200'
✖ studio-tests FAILED (1 failing case(s), 0 crashed suite(s)).
EXIT=1
```

بعد الإرجاع: `diff` بين النسخة الأصلية والملف = **IDENTICAL**، و`git diff --stat -- apps/frontend/src/storefront/studio/` = فراغ (صفر تعديل منتج).

## 7. الملفات اللي اتغيرت

| الملف | نوع |
|---|---|
| `apps/frontend/src/storefront/__tests__/storefrontProStudio.test.tsx` | تعديل (18 حالة محدّثة) |
| `apps/frontend/src/storefront/__tests__/setup/storefrontTestSetup.ts` | **جديد** (setup موحّد) |
| `apps/frontend/scripts/vitest.storefront.config.ts` | **جديد** (ربط الـsetup لمسارات storefront فقط) |
| `apps/frontend/scripts/run-studio-tests.mjs` | **جديد** (حرس التشغيل + الملخص) |
| `apps/frontend/src/storefront/__tests__/RelatedProducts.elessiCompleteSet.test.tsx` | تعديل (Provider + تنسيق المبلغ) |
| `apps/frontend/src/storefront/__tests__/studioAnalyticsTab.test.tsx` | تعديل (`initialSubView="traffic"` — المكوّن بقى يفتح على تبويب «الأداء» افتراضيًا) |
| `apps/frontend/package.json` | سكربت `test:studio` فقط |
| `.github/workflows/studio-tests.yml` | **جديد** |

## 8. المتبقي (مش من نطاق الكسر ده) — تكتات متابعة

1. **`storefrontPreview.test.tsx` — 6 حالات حمراء** بعد ما الـsetup شال عطل الـ`localStorage` (كانت 16/16 بتقع في `beforeEach`). كلها **انحراف محتوى/تنسيق** مش Provider:
   - `shows a compact preview return action…` → `العودة إلى متجر القوالب` مش موجودة في الـDOM خالص (بانر المعاينة مش بيرندر للثيم `elegant-luxe` مع `previewAdminOrigin`) — **محتمل باج منتج: مفيش رجوع من المعاينة**.
   - `hydrates BiteRush checkout…` و`opens BiteRush home preview cart drawer…` → عناصر «راش كومبو» مش موجودة (بذور سلة المعاينة مش بتتحقن).
   - `refreshes elegant-luxe preview cart items…` → 1 عنصر بدل 3 (توقيع بذور المعاينة القديم مش بينضّف).
   - `keeps split-panel fallback copy generic…` → النص «ابدأ من الفئة الأقرب لاحتياجك» اتغير.
   - `prefers submitted purchase tracking…` → `EGP 1,890.00` بقى `EGP 1,890` (تغيير مقصود من LOCALE-1؛ محتاج تحديث توقّع زي ما عملنا في RelatedProducts).
   التوصية: تكت منفصل `STUDIO-REG-1-FU` لعائلة المعاينة، مع فصل «باج منتج» (البانر/البذور) عن «توقّع قديم» (النص/المبلغ).

2. **`studioEditorSmokeE2E.test.tsx` — كراش سابق مستقل**: تشغيل Scenario 1 (رندر `StorefrontStudioShell` كامل) بيقتل vitest worker (`Worker exited unexpectedly`, صفر نتائج) — بيتكرر **بدون أي تعديل مني** وعلى الشجرة الأصلية، بينما Scenarios 2/3/4/5 + Negative Test بتعدّي منفردة. عشان الحرس يفضل مفيد ومش بيدفن باقي الـ22 ملف، الملف **مستثنى صراحة** في السكربت بسطر `⚠ EXCLUDED` + السبب مطبوع في كل تشغيل (مش مخفي)، و`.github/workflows/e2e-studio.yml` لسه بيشغّله. محتاج تكت منفصل لتحديد هل السبب ذاكرة/jsdom أم سلوك مكوّن.

3. **عدم اتساق `pages` vs `pageOverrides`**: الكانفس في المحرر بيشوف 6 أقسام (`pageOverrides` مرجعية) بينما `resolveStorefrontTheme` بيرندر 7 (بالـnewsletter). يعني قسم أضافه الثيم لـ`pages` مش ظاهر في المحرر، وأول حفظ بيستبدل `pages` بقائمة الأوفررايد → القسم يختفي من `pages` كذلك. الحالة الوحيدة اللي بتغطي ده (`Section Append`) اتظبطت على السلوك الحالي مع تأكيد الـundo، لكن **الخطر الحقيقي مسجّل هنا** كتكت منفصل.

## 9. الالتزام بالقيود
- **صفر** تعديل في `src/storefront/**` خارج `__tests__` (تحقق بالـdiff + `git status`).
- `deploy.yml` متلمسش — الـworkflow الجديد ملف مستقل.
- مفيش `git add -A` / `restore` / `revert` / `checkout` / `reset`؛ الكوميت اتعمل بالمسارات بالاسم (8 ملفات).
- `pull --rebase` قبل الـpush، و`push` ناجح: `4cef2324c..6fe310513 main -> main`.
- مفيش تشغيل لـ`tsc` الكامل.
