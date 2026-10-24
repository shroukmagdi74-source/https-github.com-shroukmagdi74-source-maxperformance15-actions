import React from "react";
import { ChartBarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import i18n from "../../../i18n";
import { SIDEBAR_LAYOUT_OPTIONS, SidebarLayout } from "./types";

interface CompanyAppearanceTabProps {
  sidebarLayout: SidebarLayout;
  savingLayout: boolean;
  handleLayoutChange: (layout: SidebarLayout) => void;
}

export const CompanyAppearanceTab: React.FC<CompanyAppearanceTabProps> = ({
  sidebarLayout,
  savingLayout,
  handleLayoutChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        نظام القائمة الجانبية
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SIDEBAR_LAYOUT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleLayoutChange(option.id)}
            disabled={savingLayout}
            className={`relative p-4 rounded-xl border-2 text-right transition-[background-color,border-color,color,box-shadow] duration-200 ${
              sidebarLayout === option.id
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <h3
              className={`font-semibold ${
                sidebarLayout === option.id
                  ? "text-indigo-700 dark:text-indigo-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {i18n.t(option.nameKey)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {i18n.t(option.descriptionKey)}
            </p>
            {sidebarLayout === option.id && (
              <div className="absolute top-4 left-4 h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
