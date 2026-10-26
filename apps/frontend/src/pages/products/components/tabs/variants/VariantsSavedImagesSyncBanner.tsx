import React from "react";
import { PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface VariantsSavedImagesSyncBannerProps {
  syncableSavedCount: number;
  variantsCount: number;
  onApplyAllSavedColorImages: () => void;
}

export const VariantsSavedImagesSyncBanner: React.FC<VariantsSavedImagesSyncBannerProps> = ({
  syncableSavedCount,
  variantsCount,
  onApplyAllSavedColorImages,
}) => {
  if (syncableSavedCount <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/30 dark:to-indigo-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-3.5 sm:p-4 mb-4 flex items-center justify-between flex-wrap gap-3 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-shrink-0">
          <PhotoIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            تم العثور على {syncableSavedCount} صور ألوان محفوظة مسبقاً لهذا المنتج!
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
            يمكنك تطبيقها فوراً على جميع المقاسات والمتغيرات ({variantsCount} مقاس) بنقرة واحدة دون الحاجة لإعادة الرفع.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onApplyAllSavedColorImages}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-sm transition whitespace-nowrap"
      >
        <ArrowPathIcon className="w-3.5 h-3.5" />
        تطبيق صور الألوان على كل المقاسات الآن
      </button>
    </div>
  );
};
