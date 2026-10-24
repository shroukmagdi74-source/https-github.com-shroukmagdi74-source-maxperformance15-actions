import React from "react";

interface NotificationsTelemetryProps {
  totalCount: number;
  unreadCount: number;
  incidentsCount: number;
  todayCount: number;
}

export const NotificationsTelemetry: React.FC<NotificationsTelemetryProps> = ({
  totalCount,
  unreadCount,
  incidentsCount,
  todayCount,
}) => {
  return (
    <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card shadow-2xs overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-border/60">
        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-[11px]">إجمالي الإشعارات</span>
            <span className="size-1.5 rounded-full bg-primary" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {totalCount}
          </div>
        </div>

        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-[11px]">غير مقروءة</span>
            <span className="size-1.5 rounded-full bg-blue-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {unreadCount}
          </div>
        </div>

        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-[11px]">أعطال وتنبيهات حرجة</span>
            <span className="size-1.5 rounded-full bg-rose-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {incidentsCount}
          </div>
        </div>

        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-[11px]">وارد اليوم</span>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {todayCount}
          </div>
        </div>
      </div>
    </div>
  );
};
