# تقرير إنجاز التيكت — UX-1: بحث/استبدال + multi-select + اختصارات + معاينة/شير

**التاريخ:** 2026-10-28 · **الريبو:** `C:\maxp-platform-13` · **الأولوية:** 🟡 P2 · **المصدر:** backlog بند 25 · 54 · 55 · 56 · **الحالة:** تم بنجاح ✅

---

## 1. ملخص التنفيذ الفني

1. **بحث واستبدال (Search & Replace Panel):**
   - إضافة محرك البحث والاستبدال في نصوص الأقسام `apps/frontend/src/storefront/studio/utils/studioSearchReplace.ts` للبحث التكراري في الحقول النصية (العناوين، النصوص الفرعية، الأزرار، والإعدادات المخصصة).
   - توفير مكون عائم `StudioSearchReplacePanel.tsx` بمطابقة فورية، عداد مطابقات ديناميكي (`current/total`)، أزرار تنقل سريع بين المطابقات (`search-prev-btn`, `search-next-btn`) مع تحديد وتمرير تلقائي للقسم النشط، وزر «استبدال» وزر «استبدال الكل».
   - تفعيل اختصار `Ctrl+F` داخل الاستوديو لفتح/إغلاق البانل تلقائيًا.

2. **تحديد متعدد وإجراءات جماعية (Multi-Select & Bulk Actions):**
   - دعم التحديد المتعدد عبر `Shift+Click` و `Ctrl+Click` على بطاقات الأقسام في كانفس الاستوديو ودرج الطبقات `StudioLayersDrawer` و `StudioSortableLayerRow`.
   - إضافة شريط إجراءات جماعية عائم `StudioMultiSelectActionBar.tsx` يظهر عند تحديد أكثر من قسم (`count > 1`) ويتضمن:
     - إخفاء/إظهار جماعي (`handleBulkToggleVisibility`).
     - قفل/فتح جماعي (`handleBulkToggleLock`).
     - تكرار جماعي (`handleBulkDuplicate`).
     - محاذاة وتوزيع جماعي (`handleBulkAlign`: left, center, right, stretch).
     - حذف جماعي (`handleBulkDelete`).
   - صيانة سجل الـ undo/redo بحيث تتم أي عملية جماعية في خطوة تاريخ واحدة متكاملة (1 undo يرجع كافة العناصر دفعة واحدة).

3. **لوحة اختصارات ديناميكية (Shortcuts Palette):**
   - تعريف خريطة مفاتيح موحدة `apps/frontend/src/storefront/studio/utils/studioKeymap.ts` تضمن 13 اختصارًا حقيقيًا للمحرر (`save`, `undo`, `redo`, `search`, `copy`, `paste`, `delete`, `multi-select`, `zoom-in`, `zoom-out`, `zoom-reset`, `escape`, `help`).
   - إنشاء المودال `StudioShortcutsModal.tsx` الذي يتم إنشاؤه ديناميكيًا من `STUDIO_KEYMAP` بدون نصوص يدوية صلبة، مع التحقق من تكافؤ عدد الصفوف في الاختبارات، وإمكانية فتحه عبر زر `?` في لوحة المفاتيح أو شريط الحالة `StudioStatusBar`.

4. **معاينة ومشاركة برابط عام (Shareable Preview Link & Noindex):**
   - دعم المعلمة `preview=1` ومفتاح `preview` في دوال المسارات `apps/frontend/src/storefront/utils/paths.ts` (`buildStorefrontShareablePreviewUrl`, `buildStorefrontPreviewPath`).
   - تحديث `apps/frontend/src/storefront/engine/StorefrontHead.tsx` لوسم أي صفحة تحتوي على `preview=1` بـ `noindex, follow` على وسم `meta[name="robots"]` مع تنظيف الـ canonical url تلقائيًا.
   - ربط زر المعاينة في `StorefrontVisualEditorPage.tsx` بإنشاء رابط المعاينة المباشر مع `preview=1`.

---

## 2. نتائج معايير القبول (Acceptance Criteria)

| بند القبول | المتطلب | النتيجة | الحالة |
|---|---|---|---|
| **1** | اختبار vitest لـ `__tests__/studioUxExtras.test.tsx` (≥8 حالات) | 8 حالات مرت بنجاح (8 passed) | ✅ مرت |
| **2** | بحث «عروض» في صفحة بها 3 مطابقات: عداد = 3، استبدال الكل = 0 مطابقات + 3 تغييرات | تم التحقق برمجيًا وعبر واجهة البحث في الاختبار 1 | ✅ مرت |
| **3** | Multi-select لقسمين + حذف -> حذف الاثنين في خطوة undo واحدة واسترجاعهما بـ undo واحد | تم التحقق بدقة في الاختبار 3 مع `useStudioHistory` | ✅ مرت |
| **4** | لوحة الاختصارات: عدد الصفوف = عدد مفاتيح خريطة المفاتيح | تم التحقق من التكافؤ التام في الاختبار 4 | ✅ مرت |
| **5** | لينك المعاينة: يحتوي `preview` والصفحة تحمل meta robots بـ `noindex` | تم التحقق في الاختبار 5 | ✅ مرت |
| **6** | فحص `oxlint` الإلزامي على كافة الملفات المعدلة | `Found 0 warnings and 0 errors` | ✅ مرت |
| **7** | صفر backend / API جديد | لا يوجد أي تعديل على الـ backend | ✅ مرت |

---

## 3. قائمة الملفات المنفذة

- `apps/frontend/src/storefront/studio/utils/studioKeymap.ts`
- `apps/frontend/src/storefront/studio/utils/studioSearchReplace.ts`
- `apps/frontend/src/storefront/studio/StudioShortcutsModal.tsx`
- `apps/frontend/src/storefront/studio/StudioSearchReplacePanel.tsx`
- `apps/frontend/src/storefront/studio/StudioMultiSelectActionBar.tsx`
- `apps/frontend/src/storefront/studio/StudioStatusBar.tsx`
- `apps/frontend/src/storefront/studio/StudioSortableSection.tsx`
- `apps/frontend/src/storefront/studio/StudioLayersDrawer.tsx`
- `apps/frontend/src/storefront/studio/StudioSortableLayerRow.tsx`
- `apps/frontend/src/storefront/studio/hooks/useStorefrontStudioState.ts`
- `apps/frontend/src/storefront/studio/StorefrontStudioShell.tsx`
- `apps/frontend/src/storefront/engine/StorefrontHead.tsx`
- `apps/frontend/src/storefront/utils/paths.ts`
- `apps/frontend/src/pages/settings/StorefrontVisualEditorPage.tsx`
- `apps/frontend/src/storefront/__tests__/studioUxExtras.test.tsx`
- `_reports/2026-10-27-agy-ux1-status.md`
