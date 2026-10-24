import React from "react";
import { useTranslation } from "react-i18next";
import { SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export function SidebarSmartInfoCard() {
  const { t } = useTranslation();

  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20">
      <div className="flex items-start gap-3">
        <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
        <div>
          <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            {t("sidebar.sidebarSmartTitle")}
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-indigo-700 dark:text-indigo-300">
            <li className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{t("sidebar.sidebarSmartHidden")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{t("sidebar.sidebarSmartRoles")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{t("sidebar.sidebarSmartInactive")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{t("sidebar.sidebarSmartAutoSave")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
