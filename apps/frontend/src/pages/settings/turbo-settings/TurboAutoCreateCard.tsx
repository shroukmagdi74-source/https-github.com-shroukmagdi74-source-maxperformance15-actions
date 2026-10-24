import React from "react";

interface TurboAutoCreateCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  enabled: boolean;
  autoCreate: boolean;
  onToggleAutoCreate: (checked: boolean) => void;
}

export const TurboAutoCreateCard: React.FC<TurboAutoCreateCardProps> = ({
  t,
  enabled,
  autoCreate,
  onToggleAutoCreate,
}) => {
  return (
    <div className="border-t dark:border-gray-700 pt-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {t("turbo.k_20")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("turbo.k_34")}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
          <input
            type="checkbox"
            checked={autoCreate}
            onChange={(e) => onToggleAutoCreate(e.target.checked)}
            disabled={!enabled}
            className="sr-only peer"
            aria-label={t("turbo.k_20")}
          />
          <div
            className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              !enabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          ></div>
        </label>
      </div>
    </div>
  );
};
