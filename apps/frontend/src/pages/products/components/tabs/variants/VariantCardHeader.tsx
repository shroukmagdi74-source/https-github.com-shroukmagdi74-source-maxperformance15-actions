import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ProductVariant } from "./types";

interface VariantCardHeaderProps {
  idx: number;
  variant: ProductVariant;
  isExpanded: boolean;
  displayCurrency: string;
  onToggle: () => void;
  onRemove: () => void;
}

export const VariantCardHeader: React.FC<VariantCardHeaderProps> = ({
  idx,
  variant,
  isExpanded,
  displayCurrency,
  onToggle,
  onRemove,
}) => {
  return (
    <div
      className="px-5 py-4 flex flex-wrap gap-4 items-center justify-between cursor-pointer transition-colors select-none group"
      onClick={onToggle}
    >
      <div className="flex items-center gap-4">
        {/* Number Handle */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold transition-colors tabular-nums ${
            isExpanded
              ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {idx + 1}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4
              className={`font-semibold text-base transition-colors ${
                isExpanded
                  ? "text-indigo-900 dark:text-indigo-100"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {variant.name || "متغير جديد"}
            </h4>
            {variant.type && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                {variant.type === "color"
                  ? "لون"
                  : variant.type === "size"
                    ? "حجم"
                    : variant.type}
              </span>
            )}
          </div>
          {variant.sku && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5 font-mono tracking-wide">
              {variant.sku}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {variant.price ? (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
              السعر
            </p>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {variant.price}{" "}
              <span className="text-xs font-normal text-gray-500">
                {displayCurrency}
              </span>
            </span>
          </div>
        ) : null}

        {variant.trackInventory && variant.stock !== undefined ? (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
              المخزون
            </p>
            <span
              className={`text-sm font-bold tabular-nums ${variant.stock > 0 ? "text-gray-900 dark:text-gray-100" : "text-red-600 dark:text-red-400"}`}
            >
              {variant.stock}{" "}
              <span className="text-xs font-normal text-gray-500">
                قطعة
              </span>
            </span>
          </div>
        ) : null}

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
            variant.isActive
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
              : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          }`}
        >
          {variant.isActive ? "نشط" : "معطل"}
        </span>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20"
          title="حذف المتغير"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div
          className={`p-1.5 rounded-full transition-colors ${
            isExpanded
              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "bg-transparent text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
