import { SlidersHorizontal } from "lucide-react";

export interface ConversionToolsStudioEmptyStateProps {
  onResetFilters: () => void;
}

export function ConversionToolsStudioEmptyState({
  onResetFilters,
}: ConversionToolsStudioEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <SlidersHorizontal className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-white">
        لم نجد أدوات مطابقة لبحثك
      </h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        جرّب تغيير كلمات البحث أو إعادة ضبط فلاتر الحالة والفئات لعرض الأدوات المتاحة.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
      >
        <span>عرض كل الأدوات</span>
      </button>
    </div>
  );
}
