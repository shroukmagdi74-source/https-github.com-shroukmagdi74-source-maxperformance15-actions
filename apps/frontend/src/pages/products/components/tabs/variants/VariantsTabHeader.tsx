import React from "react";
import { PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface VariantsTabHeaderProps {
  variantsCount: number;
  colorGroupsCount: number;
  showVariants: boolean;
  setShowVariants: React.Dispatch<React.SetStateAction<boolean>>;
  defaultPricing?: {
    price?: number;
    comparePrice?: number;
    cost?: number;
  };
  displayCurrency: string;
  onOpenColorModal: () => void;
  onSyncPricing?: () => void;
  t: (key: string) => string;
}

export const VariantsTabHeader: React.FC<VariantsTabHeaderProps> = ({
  variantsCount,
  colorGroupsCount,
  showVariants,
  setShowVariants,
  defaultPricing,
  displayCurrency,
  onOpenColorModal,
  onSyncPricing,
  t,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("products.variants.title")} ({variantsCount})
        </h3>
        {variantsCount > 0 && (
          <button
            type="button"
            onClick={onOpenColorModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors shadow-sm active:scale-[0.98]"
            title="تعيين ورفع الصور لكل لون وتطبيقها على كافة مقاساته دفعة واحدة"
          >
            <PhotoIcon className="h-3.5 w-3.5" />
            تعيين الصور حسب اللون ({colorGroupsCount} ألوان)
          </button>
        )}
        {variantsCount > 0 &&
          defaultPricing?.price !== undefined &&
          Number(defaultPricing.price) > 0 && (
            <button
              type="button"
              onClick={onSyncPricing}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/50 rounded-lg transition-colors shadow-sm"
              title="تطبيق سعر وسعر شراء المنتج الأساسي على جميع المتغيرات"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              مزامنة تسعير الكل مع المنتج الأساسي ({defaultPricing.price}{" "}
              {displayCurrency})
            </button>
          )}
      </div>
      <button
        type="button"
        onClick={() => setShowVariants(!showVariants)}
        className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
      >
        {showVariants ? "إخفاء" : "إظهار"}
      </button>
    </div>
  );
};
