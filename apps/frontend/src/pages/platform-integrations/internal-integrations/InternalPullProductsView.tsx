import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Connection, InternalProduct } from "./types";

export interface InternalPullProductsViewProps {
  selectedProvider: Connection;
  providerProducts: InternalProduct[];
  filteredProducts: InternalProduct[];
  totalProviderVariants: number;
  selectedProductIndexes: Set<number>;
  fetchingProducts: boolean;
  importing: boolean;
  productSearchQuery: string;
  setProductSearchQuery: (query: string) => void;
  onBack: () => void;
  onImport: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleProduct: (index: number) => void;
}

export const InternalPullProductsView: React.FC<InternalPullProductsViewProps> = ({
  selectedProvider,
  providerProducts,
  filteredProducts,
  totalProviderVariants,
  selectedProductIndexes,
  fetchingProducts,
  importing,
  productSearchQuery,
  setProductSearchQuery,
  onBack,
  onImport,
  onSelectAll,
  onDeselectAll,
  onToggleProduct,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="الرجوع"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("platform.k_22")}
              {selectedProvider.provider.name}
            </h2>
            <p className="text-sm text-gray-500">{t("platform.k_23")}</p>
            <div className="text-xs text-gray-500 mt-1">
              {providerProducts.length > 0
                ? t("platform.products_variants_summary", {
                    products: providerProducts.length,
                    variants: totalProviderVariants,
                  })
                : ""}
            </div>
          </div>
        </div>
        <button
          onClick={onImport}
          disabled={importing || selectedProductIndexes.size === 0}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {importing ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowDownTrayIcon className="w-5 h-5" />
          )}
          {t("platform.k_90")}
          <span className="tabular-nums">{selectedProductIndexes.size}</span>)
        </button>
      </div>

      {/* Search + Selection Actions */}
      {!fetchingProducts && providerProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              placeholder={t("platform.k_25")}
              className="w-full pr-9 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 outline-none"
              dir="rtl"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-100 transition-colors"
            >
              {t("platform.k_91")}
              <span className="tabular-nums">{filteredProducts.length}</span>)
            </button>
            <button
              onClick={onDeselectAll}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("platform.k_92")}
            </button>
          </div>
        </div>
      )}

      {fetchingProducts ? (
        <div className="py-20 text-center">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">{t("platform.k_26")}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const originalIndex = providerProducts.indexOf(product);
            const isSelected = selectedProductIndexes.has(originalIndex);
            return (
              <div
                key={product.internalId}
                onClick={() => onToggleProduct(originalIndex)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                }`}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gray-50">
                  <img
                    src={
                      product.images[0] ||
                      "https://placehold.co/200x200/png?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1 shadow-lg">
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {product.name}
                </h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-600 font-bold tabular-nums">
                    {product.price}
                    {t("platform.k_27")}
                  </span>
                  <span className="text-gray-500 tabular-nums">
                    {t("platform.k_28")}
                    {product.stock}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {t("platform.variants_count", {
                    count: product.variants?.length || 0,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : providerProducts.length > 0 ? (
        <div className="py-20 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("platform.k_29")}
          </h3>
          <p className="text-gray-500">{t("platform.k_30")}</p>
        </div>
      ) : (
        <div className="py-20 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("platform.k_31")}
          </h3>
          <p className="text-gray-500">{t("platform.k_32")}</p>
        </div>
      )}
    </div>
  );
};
