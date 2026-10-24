import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export interface OrderPreparationSaveBarProps {
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const OrderPreparationSaveBar: React.FC<OrderPreparationSaveBarProps> = ({
  saving,
  onSave,
  onReset,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
        سيتم حفظ القواعد الحالية داخل إعدادات الشركة، ويمكن تعديلها في أي وقت.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={saving}
          className="border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowPathIcon className="ml-1.5 h-3.5 w-3.5" />
          <span>استرجاع الافتراضي</span>
        </Button>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-indigo-600 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          {saving ? "جاري الحفظ..." : "حفظ إعدادات التجهيز"}
        </Button>
      </div>
    </div>
  );
};
