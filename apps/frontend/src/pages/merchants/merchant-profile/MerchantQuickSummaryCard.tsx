import React from "react";
import {
  MerchantOperationsTotals,
  MerchantRecord,
  ShippingCompanyOption,
  WarehouseOption,
} from "./types";
import { formatPieces } from "./helpers";

interface MerchantQuickSummaryCardProps {
  isDark: boolean;
  merchant: MerchantRecord;
  selectedWarehouse?: WarehouseOption;
  selectedShippingCompany?: ShippingCompanyOption;
  operationsTotals: MerchantOperationsTotals;
  fulfillmentModeLabel: string;
}

export const MerchantQuickSummaryCard: React.FC<MerchantQuickSummaryCardProps> = ({
  isDark,
  merchant,
  selectedWarehouse,
  selectedShippingCompany,
  operationsTotals,
  fulfillmentModeLabel,
}) => {
  const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${cardClass}`}>
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        ملخص سريع
      </h2>
      <div className="space-y-3 text-sm">
        <div>
          <p className={textMutedClass}>الحالة</p>
          <p
            className={
              merchant.isActive
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {merchant.isActive ? "نشط" : "غير نشط"}
          </p>
        </div>
        <div>
          <p className={textMutedClass}>عدد المنتجات المرتبطة</p>
          <p
            className={`font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {merchant.products?.length || 0}
          </p>
        </div>
        <div>
          <p className={textMutedClass}>طلبات مسندة للتاجر</p>
          <p
            className={`font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatPieces(operationsTotals.assignedOrdersCount)} طلب
          </p>
        </div>
        <div>
          <p className={textMutedClass}>قطع مستحقة بعد التسليم</p>
          <p
            className={`font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatPieces(operationsTotals.payablePieces)} قطعة
          </p>
        </div>
        <div>
          <p className={textMutedClass}>طريقة التنفيذ</p>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {fulfillmentModeLabel}
          </p>
        </div>
        <div>
          <p className={textMutedClass}>المخزن الافتراضي</p>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {selectedWarehouse?.name || "غير محدد"}
          </p>
        </div>
        <div>
          <p className={textMutedClass}>المخزون القابل للبيع</p>
          <p
            className={`font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatPieces(merchant.inventorySummary?.availableForSale)} قطعة
          </p>
          <p className={textMutedClass}>
            {merchant.inventorySummary?.stockLocationLabel || fulfillmentModeLabel}
          </p>
        </div>
        <div>
          <p className={textMutedClass}>المحجوز</p>
          <p
            className={`font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatPieces(merchant.inventorySummary?.reservedQuantity)} قطعة
          </p>
        </div>
        <div>
          <p className={textMutedClass}>شركة الشحن الافتراضية</p>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {selectedShippingCompany?.name || "غير محددة"}
          </p>
        </div>
        <div>
          <p className={textMutedClass}>تاريخ الإنشاء</p>
          <p
            className={`font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {merchant.createdAt
              ? new Date(merchant.createdAt).toLocaleDateString("ar-EG")
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
};
