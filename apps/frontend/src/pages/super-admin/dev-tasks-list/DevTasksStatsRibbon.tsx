import React from "react";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { DevTasksStats } from "./types";

interface DevTasksStatsRibbonProps {
  stats: DevTasksStats | null;
}

export const DevTasksStatsRibbon: React.FC<DevTasksStatsRibbonProps> = ({
  stats,
}) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 rounded-xl border border-border/80 bg-card shadow-2xs divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-border/60 overflow-hidden">
      <div className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">المهام النشطة</span>
          <ClipboardDocumentListIcon className="size-3.5 text-primary" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
          {stats.overview?.totalTasks || 0}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">قيد العمل</span>
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono tabular-nums">
          {stats.tasksByStatus?.IN_PROGRESS || 0}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">مكتملة</span>
          <CheckCircleIcon className="size-3.5 text-emerald-500" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
          {stats.tasksByStatus?.DONE || 0}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">متأخرة</span>
          <ExclamationTriangleIcon className="size-3.5 text-destructive" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-destructive font-mono tabular-nums">
          {stats.overview?.overdueTasks || 0}
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="font-medium text-[11px]">مشاريع نشطة</span>
          <TagIcon className="size-3.5 text-primary" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-mono tabular-nums">
          {stats.overview?.activeProjects || 0}
        </div>
      </div>
    </div>
  );
};
