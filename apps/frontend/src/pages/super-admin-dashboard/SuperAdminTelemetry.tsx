import React from "react";
import { Building2, MessageSquare, Users, Users2 } from "lucide-react";

import { cn } from "../../lib/utils";
import { DashboardData } from "./types";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  growth?: number;
  subtext?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  growth,
  subtext,
  className = "",
}) => {
  const isPositive = growth !== undefined && growth > 0;
  const isNegative = growth !== undefined && growth < 0;

  return (
    <div
      className={cn(
        "p-4 flex flex-col justify-between hover:bg-muted/10 transition-colors select-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full shrink-0",
              color === "indigo"
                ? "bg-indigo-500"
                : color === "emerald"
                  ? "bg-emerald-500"
                  : color === "blue"
                    ? "bg-sky-500"
                    : "bg-amber-500",
            )}
          />
          <span className="font-medium text-[11px]">{title}</span>
        </div>
        <div className="size-7 rounded-md border border-border/70 bg-muted/30 flex items-center justify-center text-muted-foreground shrink-0">
          <Icon className="size-3.5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {subtext && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {subtext}
            </span>
          )}
          {growth !== undefined && (
            <span
              className={cn(
                "text-[10px] font-mono font-semibold tabular-nums",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNegative
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              {isPositive ? "+" : ""}
              {growth?.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface SuperAdminTelemetryProps {
  overview?: DashboardData["overview"];
  comparison?: DashboardData["comparison"];
}

export const SuperAdminTelemetry: React.FC<SuperAdminTelemetryProps> = ({
  overview,
  comparison,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-border/80 bg-card/40 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-border/60 overflow-hidden shadow-xs">
      <MetricCard
        title="إجمالي الشركات"
        value={overview?.totalCompanies || 0}
        icon={Building2}
        color="indigo"
        subtext={`نشطة: ${overview?.activeCompanies || 0}`}
        growth={comparison?.companiesGrowth}
      />
      <MetricCard
        title="إجمالي المستخدمين"
        value={overview?.totalUsers || 0}
        icon={Users2}
        color="emerald"
        growth={comparison?.usersGrowth}
      />
      <MetricCard
        title="إجمالي العملاء"
        value={overview?.totalCustomers || 0}
        icon={Users}
        color="blue"
        growth={comparison?.customersGrowth}
      />
      <MetricCard
        title="إجمالي المحادثات"
        value={overview?.totalConversations || 0}
        icon={MessageSquare}
        color="amber"
        subtext="عبر كل القنوات"
      />
    </div>
  );
};
