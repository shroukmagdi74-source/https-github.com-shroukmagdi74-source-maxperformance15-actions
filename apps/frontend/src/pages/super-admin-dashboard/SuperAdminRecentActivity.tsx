import React from "react";
import { Briefcase, TrendingUp, Users, Users2 } from "lucide-react";

import { cn } from "../../lib/utils";
import { DashboardData } from "./types";

interface SuperAdminRecentActivityProps {
  recentActivity?: DashboardData["recentActivity"];
  comparison?: DashboardData["comparison"];
}

export const SuperAdminRecentActivity: React.FC<SuperAdminRecentActivityProps> = ({
  recentActivity,
  comparison,
}) => {
  return (
    <div className="rounded-xl border border-border/80 bg-card/40 shadow-xs overflow-hidden">
      <div className="p-3 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-foreground">
            النشاط ومعدل النمو الأخير
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            (آخر 30 يوماً)
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          نمو إيجابي
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-border/60">
        <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">شركات جديدة</span>
            <Briefcase className="size-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums mb-1">
            {recentActivity?.newCompaniesLast30Days || 0}
          </div>
          {comparison?.companiesGrowth !== undefined && (
            <p
              className={cn(
                "text-[10px] font-mono font-semibold tabular-nums",
                comparison.companiesGrowth >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {comparison.companiesGrowth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(comparison.companiesGrowth).toFixed(1)}% عن الشهر الماضي
            </p>
          )}
        </div>

        <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">مستخدمون جدد</span>
            <Users2 className="size-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums mb-1">
            {recentActivity?.newUsersLast30Days || 0}
          </div>
          {comparison?.usersGrowth !== undefined && (
            <p
              className={cn(
                "text-[10px] font-mono font-semibold tabular-nums",
                comparison.usersGrowth >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {comparison.usersGrowth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(comparison.usersGrowth).toFixed(1)}% عن الشهر الماضي
            </p>
          )}
        </div>

        <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">عملاء جدد</span>
            <Users className="size-3.5 text-sky-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums mb-1">
            {recentActivity?.newCustomersLast30Days || 0}
          </div>
          {comparison?.customersGrowth !== undefined && (
            <p
              className={cn(
                "text-[10px] font-mono font-semibold tabular-nums",
                comparison.customersGrowth >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {comparison.customersGrowth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(comparison.customersGrowth).toFixed(1)}% عن الشهر الماضي
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
