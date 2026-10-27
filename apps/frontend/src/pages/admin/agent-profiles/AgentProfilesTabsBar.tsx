import React from "react";
import { useTranslation } from "react-i18next";
import { Shield, Zap, Wrench, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentProfilesTab } from "./types";
import { type AgentProfileResponse } from "../ai-agent-sandbox/services/sandboxApi";

interface AgentProfilesTabsBarProps {
  activeTab: AgentProfilesTab;
  onSelectTab: (tab: AgentProfilesTab) => void;
  profile: AgentProfileResponse | null;
}

export const AgentProfilesTabsBar: React.FC<AgentProfilesTabsBarProps> = ({
  activeTab,
  onSelectTab,
  profile,
}) => {
  const { t } = useTranslation();

  const tabs: {
    key: AgentProfilesTab;
    label: string;
    count?: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: "settings",
      label: t("agentProfiles.tabs.settings", "الإعدادات"),
      icon: <Shield className="size-4" />,
    },
    {
      key: "skills",
      label: t("agentProfiles.tabs.skills", "المهارات"),
      count: profile?.skills?.length ?? 0,
      icon: <Zap className="size-4 text-indigo-500" />,
    },
    {
      key: "tools",
      label: t("agentProfiles.tabs.tools", "الأدوات"),
      count: profile?.allowedTools?.length ?? 0,
      icon: <Wrench className="size-4 text-primary" />,
    },
    {
      key: "guardrails",
      label: t("agentProfiles.tabs.guardrails", "القواعد والتعلم"),
      icon: <Lock className="size-4" />,
    },
  ];

  return (
    <div className="border-b border-border/50 px-2 sm:px-4 lg:px-6 flex gap-1 sm:gap-2 bg-card/40 overflow-x-auto no-scrollbar shrink-0">
      {tabs.map(({ key, label, count, icon }) => (
        <button
          key={key}
          onClick={() => onSelectTab(key)}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap active:scale-98",
            activeTab === key
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {icon}
          <span>{label}</span>
          {typeof count === "number" && (
            <span
              className={cn(
                "text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-mono font-medium tabular-nums",
                activeTab === key
                  ? "bg-primary/15 text-primary font-bold"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
