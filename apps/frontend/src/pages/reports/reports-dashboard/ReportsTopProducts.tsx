import React from "react";
import { useTranslation } from "react-i18next";
import { TopProductItem } from "./types";

interface ReportsTopProductsProps {
  topProducts: TopProductItem[];
}

export const ReportsTopProducts: React.FC<ReportsTopProductsProps> = ({
  topProducts,
}) => {
  const { t } = useTranslation();

  if (topProducts.length === 0) return null;

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("reports.topProducts", "المنتجات الأكثر مبيعاً")}
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {topProducts.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.name}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
