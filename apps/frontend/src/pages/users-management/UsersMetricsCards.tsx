import React from "react";
import { cn } from "@/lib/utils";
import type { UsersTabValue } from "./useUsersManagementController";

interface MetricItem {
  id: UsersTabValue;
  title: string;
  value: number;
  subtitle: string;
  tone: "primary" | "success" | "warning" | "danger" | "secondary";
}

interface UsersMetricsCardsProps {
  metrics: MetricItem[];
  activeTab: UsersTabValue;
  onTabChange: (tab: UsersTabValue) => void;
}

const DOT_COLORS: Record<string, string> = {
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  secondary: "bg-sky-500",
};

export const UsersMetricsCards: React.FC<UsersMetricsCardsProps> = ({
  metrics,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card shadow-2xs overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-border/60">
        {metrics.map((m) => {
          const isCurrent = activeTab === m.id;
          return (
            <div
              key={m.title}
              onClick={() => onTabChange(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTabChange(m.id);
                }
              }}
              className={cn(
                "p-3 flex flex-col justify-between cursor-pointer transition-colors select-none",
                isCurrent
                  ? "bg-muted/40 dark:bg-muted/20 border-b-2 sm:border-b-0 sm:border-t-2 border-indigo-600 dark:border-indigo-400"
                  : "hover:bg-muted/20",
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-medium text-[11px]">{m.title}</span>
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    DOT_COLORS[m.tone] || "bg-indigo-500",
                  )}
                />
              </div>
              <div className="text-xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {m.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
