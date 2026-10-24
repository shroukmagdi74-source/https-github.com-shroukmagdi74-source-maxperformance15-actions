import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TurboInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

export const TurboInfoSection: React.FC<TurboInfoSectionProps> = ({ t }) => {
  return (
    <div className="border-t dark:border-gray-700 pt-6">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 ml-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-indigo-800 dark:text-indigo-300">
            <h4 className="font-medium mb-2">{t("turbo.k_18")}</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-700 dark:text-indigo-400">
              <li>{t("turbo.k_19")}</li>
              <li>{t("turbo.k_41")}</li>
              <li>{t("turbo.k_44")}</li>
              <li>{t("turbo.k_42")}</li>
              <li>{t("turbo.k_43")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
