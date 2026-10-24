import React from "react";

interface SuperAdminUsersTelemetryProps {
  totalCount: number;
  activeCount: number;
  superAdminsCount: number;
  limit: number;
}

export const SuperAdminUsersTelemetry: React.FC<SuperAdminUsersTelemetryProps> = ({
  totalCount,
  activeCount,
  superAdminsCount,
  limit,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-y sm:divide-y-0 divide-border/60 rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">إجمالي المستخدمين</span>
          <span className="size-1.5 rounded-full bg-blue-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {totalCount}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">حسابات نشطة</span>
          <span className="size-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">مدراء النظام</span>
          <span className="size-1.5 rounded-full bg-purple-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {superAdminsCount}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">حد العرض للصفحة</span>
          <span className="size-1.5 rounded-full bg-amber-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {limit} <span className="text-xs font-sans text-muted-foreground font-normal">سجل</span>
          </span>
        </div>
      </div>
    </div>
  );
};
