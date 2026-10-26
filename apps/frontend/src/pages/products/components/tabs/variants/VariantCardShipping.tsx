import React from "react";
import { TruckIcon } from "@heroicons/react/24/outline";
import { ProductVariant, ShippingClassOption } from "./types";

interface VariantCardShippingProps {
  idx: number;
  variant: ProductVariant;
  updateVariant: (idx: number, field: keyof ProductVariant, value: any) => void;
  shippingClassOptions: ShippingClassOption[];
}

export const VariantCardShipping: React.FC<VariantCardShippingProps> = ({
  idx,
  variant,
  updateVariant,
  shippingClassOptions,
}) => {
  return (
    <>
      {/* Shipping Section */}
      <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <TruckIcon className="h-4 w-4 ml-1" />
          الشحن
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الوزن (كجم)
            </label>
            <input
              type="number"
              value={variant.weight || ""}
              onChange={(e) =>
                updateVariant(
                  idx,
                  "weight",
                  e.target.value ? parseFloat(e.target.value) : undefined,
                )
              }
              min="0"
              step="0.01"
              placeholder="0.5"
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الطول (سم)
            </label>
            <input
              type="number"
              value={variant.dimensions?.length || ""}
              onChange={(e) =>
                updateVariant(idx, "dimensions", {
                  ...variant.dimensions,
                  length: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              min="0"
              placeholder="20"
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العرض (سم)
            </label>
            <input
              type="number"
              value={variant.dimensions?.width || ""}
              onChange={(e) =>
                updateVariant(idx, "dimensions", {
                  ...variant.dimensions,
                  width: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              min="0"
              placeholder="15"
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الارتفاع (سم)
            </label>
            <input
              type="number"
              value={variant.dimensions?.height || ""}
              onChange={(e) =>
                updateVariant(idx, "dimensions", {
                  ...variant.dimensions,
                  height: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              min="0"
              placeholder="10"
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm tabular-nums"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            فئة الشحن
          </label>
          <select
            value={variant.shippingClass || "standard"}
            onChange={(e) =>
              updateVariant(idx, "shippingClass", e.target.value)
            }
            className="block w-full md:w-1/3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {shippingClassOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Section */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            حالة المتغير
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            تفعيل أو إيقاف هذا المتغير
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              variant.isActive
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {variant.isActive ? "نشط" : "غير نشط"}
          </span>
          <input
            type="checkbox"
            checked={variant.isActive}
            onChange={(e) => updateVariant(idx, "isActive", e.target.checked)}
            className="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
      </div>
    </>
  );
};
