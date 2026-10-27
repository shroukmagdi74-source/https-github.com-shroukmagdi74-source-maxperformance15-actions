import React from "react";
import { SyncInventoryResult } from "./types";

interface MerchantInventorySyncCardProps {
  isDark: boolean;
  syncableProductsCount: number;
  totalProductsCount: number;
  lastSyncSummary: SyncInventoryResult | null;
  syncingInventory: boolean;
  onSync: () => void;
}

export const MerchantInventorySyncCard: React.FC<
  MerchantInventorySyncCardProps
> = ({
  isDark,
  syncableProductsCount,
  totalProductsCount,
  lastSyncSummary,
  syncingInventory,
  onSync,
}) => {
  const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${cardClass}`}>
      <h2
        className={`text-xl font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        مزامنة المخزون
      </h2>
      <p className={`mt-2 text-sm ${textMutedClass}`}>
        شغّل المزامنة اليدوية لتحديث آخر مزامنة لكل منتج مربوط بهذا التاجر.
      </p>

      <div
        className={`mt-6 rounded-lg border p-4 ${
          isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-100 bg-gray-50"
        }`}
      >
        <div className="space-y-2 text-sm">
          <p className={textMutedClass}>
            المنتجات القابلة للمزامنة:{" "}
            <span
              className={`tabular-nums font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {syncableProductsCount}
            </span>
          </p>
          <p className={textMutedClass}>
            آخر عملية يدوية:{" "}
            <span
              className={`tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {lastSyncSummary?.timestamp
                ? new Date(lastSyncSummary.timestamp).toLocaleString("ar-EG")
                : "لم يتم تنفيذ مزامنة في هذه الجلسة"}
            </span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSync}
        disabled={syncingInventory || totalProductsCount === 0}
        className={`mt-6 w-full px-6 py-3 rounded-lg text-white font-medium transition ${
          syncingInventory || totalProductsCount === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
        }`}
      >
        {syncingInventory ? "جارٍ تنفيذ المزامنة..." : "تشغيل مزامنة المخزون الآن"}
      </button>

      {lastSyncSummary && (
        <p className={`mt-4 text-sm tabular-nums ${textMutedClass}`}>
          تمت مزامنة {lastSyncSummary.synced ?? 0} منتج في آخر عملية.
        </p>
      )}
    </div>
  );
};
