import React from "react";
import { Tag, RefreshCw, Plus, Loader2 } from "lucide-react";

export interface OrderStatusHeaderProps {
  syncing: boolean;
  onInitializeDefaults: () => void;
  onOpenAddModal: () => void;
}

export function OrderStatusHeader({
  syncing,
  onInitializeDefaults,
  onOpenAddModal,
}: OrderStatusHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Tag className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
          إدارة حالات الطلبات
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          إدارة وتخصيص حالات الطلبات، الدفع، الشحن، ومراحل التجهيز.
        </p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onInitializeDefaults}
          disabled={syncing}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 text-xs font-semibold shadow-xs transition"
          title="تهيئة جميع الحالات الافتراضية (الطلبات، الدفع، الشحن، التجهيز)"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          تهيئة الحالات
        </button>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          إضافة حالة
        </button>
      </div>
    </div>
  );
}