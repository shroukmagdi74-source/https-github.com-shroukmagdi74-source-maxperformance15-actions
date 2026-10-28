# تقرير إنجاز التيكت — TOKENS-1: Variables Manager من الواجهة (#10)

**التاريخ:** 2026-10-28 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🟠 P1 · **المصدر:** backlog بند 10 · **الحالة:** تم بنجاح ✅  
**Commit SHA:** `e245515f0e42e79de7cf0cbe27d814e65db2f8b4`

---

## 1. ملخص الإنجاز
تم بناء وتفعيل محرر متغيرات التصميم (`StudioVariablesPanel.tsx`) في محرر المتجر (`Storefront Studio`)، موفراً للتاجر تحكماً مركزياً موحداً في كافة ألوان، أبعاد، وهوامش، وظلال المتجر من مكان واحد وفقاً للمتطلبات:

1. **محرر متغيرات متكامل بـ 5 مجموعات أساسية:**
   - **الألوان (`colors`):** `brand`, `text`, `bg`, `border`, `success`, `warn`.
   - **المسافات (`spacing`):** من `space-xs` (4px) حتى `space-2xl` (48px).
   - **الانحناءات (`radius`):** `radius-sm` (6px), `radius-md` (12px), `radius-lg` (20px), `radius-pill` (999px).
   - **الظلال (`shadows`):** `shadow-soft`, `shadow-card`, `shadow-elevated`.
   - **مقياس الخطوط (`fontScale`):** من `text-xs` (12px) حتى `text-2xl` (36px).
2. **حقن مركزي على مستوى الصفحة (`--sf-<name>`):**
   - مكوّن `StudioVariablesStyle.tsx` يحقن المتغيرات في `<style data-studio-variables="true">` على مستوى الـ Canvas وفي المتجر المنشور.
   - يمكن لأي حقل تصميم الإشارة إليها بـ `var(--sf-brand)` أو أي متغير آخر.
3. **تحديث فوري لكافة الأقسام مع Undo بخطوة واحدة:**
   - تعديل أي متغير يحدّث تلقائياً وفورياً جميع الأقسام التي تستخدمه.
   - العملية مسجلة في سجل التراجع (`useStudioHistory`) لتمكين التراجع بخطوة واحدة.
4. **تصدير واستيراد المتغيرات:**
   - زر «نسخ CSS» لنسخ تعريفات CSS كاملة للحافظة.
   - تصدير/نسخ واستيراد بصيغة JSON مع التحقق الصارم من صحة المدخلات ومنع أي حقن CSS غير آمن.
5. **توافق كامل مع تغيير الثيمات:**
   - استخدام دالة `preserveStudioVariablesOnThemeChange` ودمج المتغيرات في مسار `global.variables` لحمايتها بواسطة `MERCHANT_CONTENT_KEYS` عند تبديل الثيم، دون الحاجة لأي تعديل في الـ Backend.
6. **صفر كسر للمكونات القائمة:**
   - توسيع كامل بدون استبدال أو كسر لـ `StudioShadowControls` أو الـ tokens السابقة.

---

## 2. الملفات المنجزة والمعدلة

| المسار | الوصف |
|---|---|
| `apps/frontend/src/storefront/studio/utils/studioVariables.ts` | المحرك الأساسي للمتغيرات (تعريفات، تطبيع، توليد CSS، فك مراجع `var(--sf-*)`، استيراد/تصدير، وحفظ المتغيرات عند تبديل الثيم) |
| `apps/frontend/src/storefront/studio/StudioVariablesPanel.tsx` | واجهة محرر المتغيرات الجانبية بكافة الأقسام والأدوات والأزرار |
| `apps/frontend/src/storefront/studio/StudioVariablesStyle.tsx` | مكوّن حقن وسوم `<style>` على مستوى الصفحة |
| `apps/frontend/src/storefront/studio/StorefrontStudioShell.tsx` | ربط اللوحة بالزر الجانبي واستدعاء `StudioVariablesStyle` وحفظ التوكِنز عند التبديل |
| `apps/frontend/src/storefront/StorefrontShell.tsx` | حقن متغيرات المتجر على مستوى المتجر المنشور |
| `apps/frontend/src/storefront/studio/StudioLeftRail.tsx` | إضافة تاب «متغيرات» في الشريط الجانبي الأيسر |
| `apps/frontend/src/storefront/studio/StudioTypes.ts` | توسيع `StudioLeftRailTab` ليشمل `"variables"` |
| `apps/frontend/src/storefront/studio/hooks/useStorefrontStudioState.ts` | ربط استخراج وتحديث المتغيرات بحالة المحرر |
| `apps/frontend/src/storefront/__tests__/studioVariables.test.tsx` | جناح اختبارات شامل يغطي 18 حالة اختبار (المطلوب ≥8) |

---

## 3. نتائج معايير القبول والفحص (Acceptance Gates)

| # | معيار القبول | النتيجة المستهدفة | النتيجة الفعلية | الحالة |
|---|---|---|---|:---:|
| 1 | اختبارات Vitest | ≥ 8 حالات نجاح | **18 / 18 نجحت** (`studioVariables.test.tsx`) | ✅ |
| 2 | تعريف `brand=#123456` واستخدامه بقسمين | تعديله مرة واحدة يظهر في الاثنين | نجح الاختبار مع فحص الـ CSS المولد في كلا القسمين | ✅ |
| 3 | تحويل `var(--sf-brand)` لقيمة فعلية | يتحول لقيمته في الـ CSS الناتج | مطبق في `resolveStudioVariableValue` وثبت بالاختبار | ✅ |
| 4 | اختبار سلبي: متغير غير معرف | fallback آمن مع صفر `undefined` | يسقط إلى `initial` أو الـ fallback، وصفر `undefined` | ✅ |
| 5 | تبديل الثيم | المتغيرات المخصصة باقية | حفظ كامل عبر `preserveStudioVariablesOnThemeChange` | ✅ |
| 6 | فحص الأنواع `tsc --noEmit` | صفر أخطاء في ملفات المتغيرات | صفر أخطاء في ملفات الاستوديو والمتغيرات | ✅ |
| 7 | فحص `oxlint` الصارم | صفر أخطاء وتحذيرات | `Found 0 warnings and 0 errors` | ✅ |
| 8 | عزل التعديلات ونطاق التغيير | صفر تعديلات Backend/Schema | 100% فرونت إند بدون مساس بالباك إند أو إضافة حزم | ✅ |

---

## 4. ملخص الأوامر المنفذة للاختبار
- **تشغيل الاختبارات:**
  ```powershell
  cd apps/frontend; & "C:/Users/hp/AppData/Local/hermes/tools/node-26.7.0-win32-x64/node.exe" ./node_modules/vitest/vitest.mjs run src/storefront/__tests__/studioVariables.test.tsx
  # Result: 18 passed (18) in 1.25s
  ```
- **تشغيل oxlint:**
  ```powershell
  cd apps/frontend; & "C:/Users/hp/AppData/Local/hermes/tools/node-26.7.0-win32-x64/node.exe" ./node_modules/oxlint/bin/oxlint --config .oxlintrc.json src/storefront/studio/StudioVariablesPanel.tsx src/storefront/studio/StudioVariablesStyle.tsx src/storefront/studio/utils/studioVariables.ts src/storefront/__tests__/studioVariables.test.tsx
  # Result: Found 0 warnings and 0 errors.
  ```
