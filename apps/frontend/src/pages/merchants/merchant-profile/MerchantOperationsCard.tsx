import React from "react";
import { Link } from "react-router-dom";
import { MerchantOperationRow, MerchantOperationsTotals } from "./types";
import { formatMoney, formatPieces, operationStatusLabels } from "./helpers";

interface MerchantOperationsCardProps {
  isDark: boolean;
  operationsTotals: MerchantOperationsTotals;
  recentOperations: MerchantOperationRow[];
}

export const MerchantOperationsCard: React.FC<MerchantOperationsCardProps> = ({
  isDark,
  operationsTotals,
  recentOperations,
}) => {
  const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className={`text-lg font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            متابعة طلبات التاجر
          </h2>
          <p className={`mt-1 text-sm ${textMutedClass}`}>
            ملخص تشغيل من طلبات الشركة الموحدة، بدون شاشة طلبات منفصلة للتاجر.
          </p>
        </div>
        <Link
          to="/orders"
          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${
            isDark
              ? "bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          فتح الطلبات
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          ["قيد التجهيز", operationsTotals.preparationOrdersCount],
          ["في الشحن", operationsTotals.inShippingOrdersCount],
          ["تم التسليم", operationsTotals.deliveredOrdersCount],
          ["مرتجع", operationsTotals.notDeliveredOrdersCount],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className={`rounded-lg border p-3 ${
              isDark
                ? "border-gray-700 bg-gray-900/40"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <p className={`text-xs ${textMutedClass}`}>{label}</p>
            <p
              className={`text-xl font-black tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPieces(value as number)} طلب
            </p>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 rounded-lg border p-4 ${
          isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-100 bg-gray-50"
        }`}
      >
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className={textMutedClass}>مستحق بعد التسليم</span>
            <strong
              className={`tabular-nums ${
                isDark ? "text-emerald-300" : "text-emerald-700"
              }`}
            >
              {formatMoney(operationsTotals.deliveredPayableAmount)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className={textMutedClass}>قيمة في الشحن</span>
            <strong
              className={`tabular-nums ${
                isDark ? "text-amber-300" : "text-amber-700"
              }`}
            >
              {formatMoney(operationsTotals.inShippingAmount)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className={textMutedClass}>تم تحويله</span>
            <strong
              className={`tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatMoney(operationsTotals.paidAmount)}
            </strong>
          </div>
        </div>
      </div>

      {recentOperations.length > 0 ? (
        <div className="mt-4 space-y-2">
          {recentOperations.slice(0, 4).map((operation) => (
            <div
              key={operation.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-gray-700 bg-gray-900/30"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-bold tabular-nums ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {operation.orderNumber || operation.id}
                </span>
                <span className={textMutedClass}>
                  {operationStatusLabels[operation.operationStatus || ""] ||
                    operation.operationStatus ||
                    "قيد المتابعة"}
                </span>
              </div>
              <div
                className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs ${textMutedClass}`}
              >
                <span>{operation.customerName || "عميل"}</span>
                <span className="tabular-nums">
                  {formatPieces(operation.pieces)} قطعة
                </span>
                <span className="tabular-nums">
                  {formatMoney(operation.merchantAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          className={`mt-4 rounded-lg border p-4 text-center text-sm ${textMutedClass} ${
            isDark ? "border-gray-700" : "border-gray-100"
          }`}
        >
          لا توجد طلبات مسندة لهذا التاجر حتى الآن.
        </p>
      )}
    </div>
  );
};
