import React from "react";
import { CalculatorIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { CampaignTab } from "./types";

interface CampaignTabsNavProps {
  activeTab: CampaignTab;
  onTabChange: (tab: CampaignTab) => void;
}

const TABS: Array<{
  id: CampaignTab;
  label: string;
  icon: typeof CalculatorIcon;
}> = [
  { id: "input", label: "إعدادات الحملة", icon: CalculatorIcon },
  { id: "results", label: "النتائج المتوقعة", icon: ChartBarIcon },
];

export const CampaignTabsNav: React.FC<CampaignTabsNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg mb-6">
      <div className="border-b business-border">
        <nav className="flex -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "business-border-clear text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 business-control-border"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
