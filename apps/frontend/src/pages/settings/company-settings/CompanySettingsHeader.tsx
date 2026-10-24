import React from "react";
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { CompanyTab, TabConfig } from "./types";

interface CompanySettingsHeaderProps {
  activeTab: CompanyTab;
  onTabChange: (tab: CompanyTab) => void;
  isOwner: boolean;
}

export const CompanySettingsHeader: React.FC<CompanySettingsHeaderProps> = ({
  activeTab,
  onTabChange,
  isOwner,
}) => {
  const tabs: TabConfig[] = [
    { id: "general", label: "عام", icon: BuildingOfficeIcon },
    { id: "appearance", label: "المظهر", icon: ChartBarIcon },
    { id: "usage", label: "الاستخدام", icon: ChartBarIcon },
  ];

  if (isOwner) {
    tabs.push({ id: "ownership", label: "الملكية", icon: ShieldCheckIcon });
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          إعدادات الشركة
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          إدارة إعدادات الشركة والاشتراكات
        </p>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav
          className="-mb-px flex space-x-8 space-x-reverse"
          aria-label="Tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`${
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                <Icon
                  className={`${
                    isActive
                      ? "text-indigo-500 dark:text-indigo-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500"
                  } -ml-0.5 mr-2 h-5 w-5`}
                  aria-hidden="true"
                />
                <span className="mr-2">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
