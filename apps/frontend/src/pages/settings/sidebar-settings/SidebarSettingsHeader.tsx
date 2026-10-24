import React from "react";
import { useTranslation } from "react-i18next";
import {
  PaintBrushIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export interface SidebarSettingsHeaderProps {
  visibleCount: number;
  totalCount: number;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onRefresh: () => void;
}

export function SidebarSettingsHeader({
  visibleCount,
  totalCount,
  saveStatus,
  onRefresh,
}: SidebarSettingsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          <PaintBrushIcon className="h-6 w-6 text-indigo-500" />
          {t("sidebar.sidebarTitle")}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("sidebar.sidebarDescription")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-mono tabular-nums text-gray-400 sm:inline">
          {t("sidebar.sidebarCountVisible", { visible: visibleCount, total: totalCount })}
        </span>
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("sidebar.sidebarSaving")}
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
            {t("sidebar.sidebarSaved")}
          </span>
        )}
        {saveStatus === "error" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <ExclamationCircleIcon className="h-4 w-4" />
            {t("sidebar.sidebarSaveFailed")}
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          {t("sidebar.sidebarRefresh")}
        </button>
      </div>
    </div>
  );
}