import React from "react";
import {
  ClockIcon,
  ArrowPathIcon,
  UserGroupIcon,
  FolderIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import type { TabItem, TimeReportsTab } from "./types";

const TABS: TabItem[] = [
  { id: "entries", label: "سجلات الوقت", icon: ClockIcon },
  { id: "evaluation", label: "تقييم الوقت وإعادة العمل", icon: ArrowPathIcon },
  { id: "users", label: "حسب المستخدم", icon: UserGroupIcon },
  { id: "projects", label: "حسب المشروع", icon: FolderIcon },
  { id: "daily", label: "حسب اليوم", icon: CalendarIcon },
];

interface TimeReportsTabsNavProps {
  activeTab: TimeReportsTab;
  onTabChange: (tab: TimeReportsTab) => void;
}

export const TimeReportsTabsNav: React.FC<TimeReportsTabsNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex -mb-px overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Icon className="h-5 w-5 ml-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
