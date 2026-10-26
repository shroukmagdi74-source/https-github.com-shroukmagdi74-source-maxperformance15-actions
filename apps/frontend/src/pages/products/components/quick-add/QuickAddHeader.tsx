import React from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface QuickAddHeaderProps {
  titleId: string;
  onClose: () => void;
}

export const QuickAddHeader: React.FC<QuickAddHeaderProps> = ({
  titleId,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <PlusIcon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              إنشاء طلب سريع
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 rounded-full">
              طلب سريع
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أدخل البيانات الأساسية لإطلاق منتجك في متجرك فوراً
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق النافذة"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
