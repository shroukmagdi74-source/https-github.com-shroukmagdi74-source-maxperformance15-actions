import React from "react";
import { ArrowLeftIcon, ArrowsRightLeftIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

interface TurboSettingsHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  onNavigateShippingCompanies: () => void;
  onNavigateStoreSettings: () => void;
  onNavigateStatusMapping: () => void;
}

export const TurboSettingsHeader: React.FC<TurboSettingsHeaderProps> = ({
  t,
  onNavigateShippingCompanies,
  onNavigateStoreSettings,
  onNavigateStatusMapping,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={onNavigateShippingCompanies}
          className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 ml-1" />
          شركات الشحن
        </button>
        <span>/</span>
        <button
          onClick={onNavigateStoreSettings}
          className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          {t("turbo.k_24")}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <RocketLaunchIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 ml-3" />
            {t("turbo.k_25")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("turbo.k_26")}
          </p>
        </div>
        <button
          onClick={onNavigateStatusMapping}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-medium text-sm transition-colors shadow-sm"
        >
          <ArrowsRightLeftIcon className="h-4 w-4" />
          <span>ربط حالات Turbo بالنظام</span>
        </button>
      </div>
    </div>
  );
};
