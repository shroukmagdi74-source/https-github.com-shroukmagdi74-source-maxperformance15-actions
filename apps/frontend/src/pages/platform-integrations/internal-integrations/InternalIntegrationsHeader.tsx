import React from "react";
import { LinkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export const InternalIntegrationsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
        <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("platform.k_43")}
        </h2>
        <p className="text-sm text-gray-500">{t("platform.k_44")}</p>
      </div>
    </div>
  );
};
