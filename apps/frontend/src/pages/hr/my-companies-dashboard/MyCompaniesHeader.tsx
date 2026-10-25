import React from "react";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";
import { DashboardTab } from "./types";

interface MyCompaniesHeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenCreateModal: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const MyCompaniesHeader: React.FC<MyCompaniesHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  onExport,
  isExporting,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          لوحة تحكم شركاتي
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          متابعة شاملة لجميع فروعك وشركاتك من مكان واحد
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => onTabChange("overview")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => onTabChange("attendance")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              activeTab === "attendance"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            الحضور
          </button>
          <button
            onClick={() => onTabChange("reports")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              activeTab === "reports"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            التقارير
          </button>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">إضافة شركة</span>
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-xs sm:text-sm"
        >
          {isExporting ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span className="hidden sm:inline">تصدير</span>
        </button>
      </div>
    </div>
  );
};
