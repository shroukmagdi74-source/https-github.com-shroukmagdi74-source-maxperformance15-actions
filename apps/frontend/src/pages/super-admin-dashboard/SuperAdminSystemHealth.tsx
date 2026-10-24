import React from "react";
import { Database, HardDrive, Server, Wifi } from "lucide-react";

import { cn } from "../../lib/utils";
import { DashboardData } from "./types";

interface SuperAdminSystemHealthProps {
  health: DashboardData["health"];
}

export const SuperAdminSystemHealth: React.FC<SuperAdminSystemHealthProps> = ({
  health,
}) => {
  const statusColor =
    health.status === "healthy"
      ? "bg-emerald-500"
      : health.status === "degraded"
        ? "bg-amber-500"
        : "bg-rose-500";

  const statusText =
    health.status === "healthy"
      ? "ممتاز"
      : health.status === "degraded"
        ? "منخفض"
        : "عطل";

  const dbColor =
    health.database === "connected"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  const uptimeStr =
    Math.floor(health.uptime / 86400) +
    "d " +
    Math.floor((health.uptime % 86400) / 3600) +
    "h";

  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-border/80 bg-card/40 px-4 py-2.5 shadow-xs text-xs">
      <div className="flex items-center gap-2">
        <div className={cn("size-2 rounded-full", statusColor)} />
        <span className="font-medium text-muted-foreground text-[11px]">
          حالة النظام:
        </span>
        <span
          className={cn(
            "font-semibold text-xs",
            health.status === "healthy"
              ? "text-emerald-600 dark:text-emerald-400"
              : health.status === "degraded"
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400",
          )}
        >
          {statusText}
        </span>
      </div>
      <div className="h-3.5 w-px bg-border/60" />
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
        <Server className="size-3.5" />
        <span className="tabular-nums">{uptimeStr}</span>
      </div>
      <div className="h-3.5 w-px bg-border/60" />
      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <Database className={cn("size-3.5", dbColor)} />
        <span className={cn("font-medium", dbColor)}>
          {health.database === "connected"
            ? "قاعدة البيانات متصلة"
            : "قاعدة البيانات منفصلة"}
        </span>
        {health.dbStats && (
          <span className="text-muted-foreground tabular-nums">
            ({health.dbStats.active}/{health.dbStats.queryCount} اتصال)
          </span>
        )}
      </div>
      <div className="h-3.5 w-px bg-border/60" />
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
        <Wifi className="size-3.5" />
        <span>{health.environment === "production" ? "إنتاج" : "تطوير"}</span>
      </div>
      {health.dbStats && (
        <>
          <div className="h-3.5 w-px bg-border/60" />
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
            <HardDrive className="size-3.5" />
            <span className="tabular-nums">{health.dbStats.latency}ms</span>
          </div>
        </>
      )}
    </div>
  );
};
