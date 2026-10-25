import React from "react";
import { Gift, Users, Crown, TrendingUp, DollarSign } from "lucide-react";
import type { LoyaltyTabKey } from "./types";

interface CustomerLoyaltyTabsBarProps {
  activeTab: LoyaltyTabKey;
  onTabChange: (tab: LoyaltyTabKey) => void;
}

export const CustomerLoyaltyTabsBar: React.FC<CustomerLoyaltyTabsBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: "programs" as const, label: "البرامج", icon: Gift },
    { id: "customers" as const, label: "العملاء", icon: Users },
    { id: "tiers" as const, label: "المستويات", icon: Crown },
    { id: "analytics" as const, label: "التحليلات", icon: TrendingUp },
    { id: "cashback" as const, label: "الكاش باك", icon: DollarSign },
  ];

  return (
    <div className="flex gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              isActive
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
