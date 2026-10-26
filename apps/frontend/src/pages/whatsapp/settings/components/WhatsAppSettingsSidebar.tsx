import React from "react";
import { cn } from "@/lib/utils";
import type { TabDefinition, TabId } from "../types/whatsAppSettingsTypes";

interface WhatsAppSettingsNavProps {
  tabs: TabDefinition[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export const WhatsAppSettingsNav: React.FC<WhatsAppSettingsNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      aria-label="تبويبات إعدادات واتساب"
      className="w-full min-w-0"
    >
      <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x px-0.5">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap active:scale-95 min-h-[38px] cursor-pointer",
                selected
                  ? "bg-[color:var(--business-success)] text-white shadow-sm ring-2 ring-[color:var(--business-success)]/20"
                  : "border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Aliases for backward compatibility
export const WhatsAppMobileNav = WhatsAppSettingsNav;
export const WhatsAppDesktopSidebar = WhatsAppSettingsNav;
