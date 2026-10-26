import React from "react";
import { ShippingClassOption } from "../../../../../constants/shippingClasses";

interface VariantsBulkActionsProps {
  variantsCount: number;
  bulkAction: string;
  handleBulkActionChange: (action: string) => void;
  showBulkInput: boolean;
  bulkValue: string | number;
  setBulkValue: React.Dispatch<React.SetStateAction<string | number>>;
  applyBulkAction: () => void;
  shippingClassOptions: ShippingClassOption[];
  defaultPricing?: {
    price?: number;
    comparePrice?: number;
    cost?: number;
  };
  displayCurrency: string;
  onOpenColorModal: () => void;
}

export const VariantsBulkActions: React.FC<VariantsBulkActionsProps> = ({
  variantsCount,
  bulkAction,
  handleBulkActionChange,
  showBulkInput,
  bulkValue,
  setBulkValue,
  applyBulkAction,
  shippingClassOptions,
  defaultPricing,
  displayCurrency,
  onOpenColorModal,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          إجراء جماعي على كل المتغيرات:
        </span>
        <select
          value={bulkAction}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "set_color_images") {
              onOpenColorModal();
              return;
            }
            handleBulkActionChange(val);
          }}
          className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm min-w-[200px]"
        >
          <option value="">-- اختر إجراء --</option>
          <optgroup label="🖼️ الصور">
            <option value="set_color_images">🎨 تعيين الصور حسب اللون...</option>
          </optgroup>
          <optgroup label="📌 الحالة">
            <option value="activate">✅ تفعيل الكل</option>
            <option value="deactivate">⏸️ إيقاف الكل</option>
            <option value="delete">🗑️ حذف الكل</option>
          </optgroup>
          <optgroup label="💰 التسعير">
            {defaultPricing?.price !== undefined &&
              Number(defaultPricing.price) > 0 && (
                <option value="sync_product_pricing">
                  🔄 تطبيق تسعير المنتج الأساسي ({defaultPricing.price}{" "}
                  {displayCurrency})
                </option>
              )}
            <option value="set_price">💵 تعيين السعر</option>
            <option value="increase_price">📈 زيادة السعر (مبلغ)</option>
            <option value="decrease_price">📉 تخفيض السعر (مبلغ)</option>
            <option value="increase_price_percent">📈 زيادة السعر (%)</option>
            <option value="decrease_price_percent">📉 تخفيض السعر (%)</option>
            <option value="set_compare_price">🏷️ تعيين السعر الأساسي</option>
            <option value="set_cost">💳 تعيين سعر الشراء</option>
          </optgroup>
          <optgroup label="📦 المخزون">
            <option value="track_inventory">📊 تفعيل تتبع المخزون</option>
            <option value="untrack_inventory">📭 إيقاف تتبع المخزون</option>
            <option value="set_stock">🔢 تعيين الكمية</option>
            <option value="set_low_stock">⚠️ تعيين حد التنبيه</option>
            <option value="in_stock">✅ متوفر</option>
            <option value="out_of_stock">❌ نفد المخزون</option>
            <option value="allow_backorders">🔄 السماح بالطلبات المسبقة</option>
            <option value="disallow_backorders">🚫 منع الطلبات المسبقة</option>
          </optgroup>
          <optgroup label="🚚 الشحن">
            <option value="set_weight">⚖️ تعيين الوزن (كجم)</option>
            <option value="set_length">📏 تعيين الطول (سم)</option>
            <option value="set_width">📐 تعيين العرض (سم)</option>
            <option value="set_height">📐 تعيين الارتفاع (سم)</option>
            <option value="set_shipping_class">📦 تعيين فئة الشحن</option>
          </optgroup>
        </select>

        {/* Input for value-based actions */}
        {showBulkInput && bulkAction !== "set_shipping_class" && (
          <input
            type="number"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            placeholder={
              bulkAction.includes("percent")
                ? "النسبة %"
                : bulkAction.includes("price") || bulkAction.includes("cost")
                  ? "المبلغ"
                  : bulkAction.includes("stock")
                    ? "الكمية"
                    : bulkAction.includes("weight")
                      ? "الوزن (كجم)"
                      : "القيمة"
            }
            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm w-28 tabular-nums"
            min="0"
            step={bulkAction.includes("weight") ? "0.01" : "1"}
          />
        )}

        {/* Shipping class select */}
        {showBulkInput && bulkAction === "set_shipping_class" && (
          <select
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
          >
            <option value="">اختر فئة الشحن</option>
            {shippingClassOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={applyBulkAction}
          disabled={!bulkAction || (showBulkInput && !bulkValue)}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          تطبيق على {variantsCount} متغير
        </button>
      </div>
    </div>
  );
};
