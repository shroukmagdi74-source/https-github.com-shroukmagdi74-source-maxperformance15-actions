import React from "react";
import { ReminderStats } from "./types";

interface RemindersTelemetryProps {
  stats: ReminderStats | null;
  activeCount: number;
  completedCount: number;
}

export const RemindersTelemetry: React.FC<RemindersTelemetryProps> = ({
  stats,
  activeCount,
  completedCount,
}) => {
  const completionRate = stats?.performance?.completionRate
    ? `${Math.round(stats.performance.completionRate * 100)}%`
    : "0%";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-border/80 bg-card/40 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-border/60 overflow-hidden shadow-xs">
      <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">التذكيرات النشطة</span>
          <span className="size-1.5 rounded-full bg-indigo-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {stats?.active?.total ?? activeCount}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">متأخرة عن الموعد</span>
          <span className="size-1.5 rounded-full bg-rose-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono tabular-nums">
          {stats?.active?.overdue ?? 0}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">مكتملة هذا الأسبوع</span>
          <span className="size-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
          {stats?.completed?.thisWeek ?? completedCount}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between hover:bg-muted/10 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">معدل الإنجاز</span>
          <span className="size-1.5 rounded-full bg-violet-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {completionRate}
        </div>
      </div>
    </div>
  );
};
