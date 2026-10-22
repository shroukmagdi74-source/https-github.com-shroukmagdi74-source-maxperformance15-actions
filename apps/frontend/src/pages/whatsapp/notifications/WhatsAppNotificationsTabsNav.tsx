import React from "react";
import type { TabId, TabDefinition } from "./types";

interface WhatsAppNotificationsTabsNavProps {
  tabs: TabDefinition[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export const WhatsAppNotificationsTabsNav: React.FC<WhatsAppNotificationsTabsNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex border-b border-border/60 overflow-x-auto no-scrollbar gap-1 pt-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              isActive
                ? "border-emerald-600 text-foreground font-semibold dark:border-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
