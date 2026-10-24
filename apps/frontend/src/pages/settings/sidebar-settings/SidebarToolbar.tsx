import React from "react";
import { useTranslation } from "react-i18next";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

export interface SidebarToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "categories" | "flat";
  onViewModeChange: (mode: "categories" | "flat") => void;
}

export function SidebarToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: SidebarToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("sidebar.sidebarSearchPlaceholder")}
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pr-10 pl-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewModeChange("categories")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            viewMode === "categories"
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Squares2X2Icon className="h-3.5 w-3.5" />
          {t("sidebar.sidebarViewCategories")}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("flat")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
            viewMode === "flat"
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Bars3Icon className="h-3.5 w-3.5" />
          {t("sidebar.sidebarViewFlat")}
        </button>
      </div>
    </div>
  );
}
