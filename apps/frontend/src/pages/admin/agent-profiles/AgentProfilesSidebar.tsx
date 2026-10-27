import React from "react";
import { useTranslation } from "react-i18next";
import { Bot, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AgentItem, AgentProfilesTab } from "./types";

interface AgentProfilesSidebarProps {
  isDrawer?: boolean;
  agents: AgentItem[];
  filteredAgents: AgentItem[];
  agentsLoading: boolean;
  selectedId: string | null;
  onSelectAgent: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  agentsListTab: "active" | "archived";
  onTabChange: (tab: "active" | "archived") => void;
  onOpenCreate: () => void;
  setTab: (tab: AgentProfilesTab) => void;
  onCloseDrawer?: () => void;
}

export const AgentProfilesSidebar: React.FC<AgentProfilesSidebarProps> = ({
  isDrawer = false,
  agents,
  filteredAgents,
  agentsLoading,
  selectedId,
  onSelectAgent,
  searchQuery,
  onSearchChange,
  agentsListTab,
  onTabChange,
  onOpenCreate,
  setTab,
  onCloseDrawer,
}) => {
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        "h-full flex flex-col overflow-hidden",
        isDrawer
          ? "w-full bg-card"
          : "w-64 shrink-0 border-e border-border/50 bg-card/40",
      )}
    >
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground/90">
            {t("agentProfiles.sidebar.title", "فريق الايجنت")}
          </h2>
          {!agentsLoading && (
            <Badge variant="secondary" className="text-xs font-mono tabular-nums">
              {agents.length}
            </Badge>
          )}
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
          title={t("agentProfiles.sidebar.addTitle", "إضافة وكيل ذكي")}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
          <Input
            placeholder={t("agentProfiles.sidebar.search", "بحث...")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pr-8 text-xs"
          />
        </div>
      </div>

      <div className="px-3 pb-2 flex gap-1 border-b border-border/20">
        <button
          onClick={() => {
            if (agentsListTab !== "active") {
              onTabChange("active");
              onSearchChange("");
            }
          }}
          className={cn(
            "flex-1 py-1 text-center text-[11px] font-semibold rounded-md transition-all",
            agentsListTab === "active"
              ? "bg-primary/10 text-primary font-bold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {t("agentProfiles.sidebar.activeTab", "النشطين")}
        </button>
        <button
          onClick={() => {
            if (agentsListTab !== "archived") {
              onTabChange("archived");
              onSearchChange("");
            }
          }}
          className={cn(
            "flex-1 py-1 text-center text-[11px] font-semibold rounded-md transition-all",
            agentsListTab === "archived"
              ? "bg-primary/10 text-primary font-bold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {t("agentProfiles.sidebar.archivedTab", "المؤرشفين")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {agentsLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2.5 animate-pulse"
              >
                <div className="size-8 rounded-lg bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-xs text-muted-foreground/60">
            <Search className="size-6 text-muted-foreground/30" />
            <span>
              {t("agentProfiles.sidebar.noResults", "لا توجد نتائج")}
            </span>
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const isAgentActive = agent.status?.toUpperCase() === "ACTIVE";
            const isCurrentSelected = selectedId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent.id);
                  setTab("settings");
                  if (onCloseDrawer) onCloseDrawer();
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-lg text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCurrentSelected
                    ? "bg-primary/10 border border-primary/20 text-primary font-semibold"
                    : "hover:bg-muted/50 border border-transparent text-foreground/80",
                )}
              >
                <span className="text-xl shrink-0">{agent.icon || "🤖"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs truncate font-medium">{agent.name}</p>
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full shrink-0",
                        isAgentActive
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/30",
                      )}
                      title={isAgentActive ? "نشط" : "متوقف"}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {agent.role}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
