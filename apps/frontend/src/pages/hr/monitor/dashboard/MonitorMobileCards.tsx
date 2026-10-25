import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { TeamMemberSummary } from "./types";
import {
  formatClockTime,
  formatSeconds,
  getCheckInMethodLabel,
} from "./helpers";

interface MonitorMobileCardsProps {
  sortedMembers: TeamMemberSummary[];
  onSelectEmployee: (employeeId: string) => void;
}

export const MonitorMobileCards: React.FC<MonitorMobileCardsProps> = ({
  sortedMembers,
  onSelectEmployee,
}) => {
  return (
    <div className="block divide-y divide-border/20 md:hidden">
      {sortedMembers.map((m) => {
        const inTimeStr = formatClockTime(m.clockInTime);
        const firstActStr = formatClockTime(m.firstActivityTime);
        const warmupMin = m.lateStartMinutes ?? 0;
        const weeklyAvg = m.weeklyAvgLateStartMinutes ?? warmupMin;
        const methodLabel = getCheckInMethodLabel(m.checkInMethod);

        return (
          <div
            key={m.employeeId}
            className="p-3.5 space-y-2.5 transition-colors hover:bg-muted/40 dark:hover:bg-zinc-900/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-foreground text-sm">
                  {m.employeeName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.departmentName} • {m.jobTitle}
                </div>
              </div>
              <div className="text-left space-y-1">
                {m.status === "active" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    <CheckCircle2 className="h-2.5 w-2.5" /> نشط الآن
                  </span>
                )}
                {m.status === "idle" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20">
                    <PauseCircle className="h-2.5 w-2.5" /> خامل (مفتوح)
                  </span>
                )}
                {m.status === "offline" && (
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:text-zinc-400 ring-1 ring-inset ring-border/20">
                      <XCircle className="h-2.5 w-2.5" /> غير متصل
                    </span>
                    {m.lastSeenTime && (
                      <span className="text-[9px] text-muted-foreground mt-0.5 font-mono tabular-nums">
                        آخر اتصال: {formatClockTime(m.lastSeenTime)}
                      </span>
                    )}
                  </div>
                )}
                {m.operationalSignal &&
                  m.operationalSignal.type !== "NORMAL" && (
                    <div>
                      <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                        {m.operationalSignal.label}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {m.activeTask && (
              <div className="flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse shrink-0" />
                <span className="truncate">يعمل الآن: {m.activeTask.title}</span>
              </div>
            )}

            <div className="rounded-lg border border-border/40 bg-muted/40 dark:bg-zinc-900/50 p-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">
                  البصمة الرسمية:
                </span>
                <span className="font-semibold text-foreground font-mono tabular-nums">
                  {inTimeStr ? (
                    `${inTimeStr} (${methodLabel})`
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-normal font-sans">
                      لم يسجل حضوراً
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">
                  أول نشاط للجهاز:
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {firstActStr || (
                    <span className="text-muted-foreground font-normal font-sans">
                      لا توجد حركة مسجلة
                    </span>
                  )}
                </span>
              </div>
              {m.clockInTime && (
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-muted-foreground text-[11px]">
                    وقت التسخين:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        warmupMin <= 15
                          ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
                          : warmupMin < 30
                            ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"
                            : "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/15"
                      }`}
                    >
                      {warmupMin <= 0 ? "فوري (0 د)" : `${warmupMin} دقيقة`}
                    </span>
                    {weeklyAvg > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        (متوسط 7 أيام: {weeklyAvg} د)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {m.untrackedSeconds && m.untrackedSeconds >= 15 * 60 ? (
                <div className="pt-0.5 text-left">
                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 dark:border-transparent dark:text-rose-400 dark:bg-rose-500/15 px-1.5 py-0.5 rounded font-mono tabular-nums">
                    <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                    غير موثق: {formatSeconds(m.untrackedSeconds)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-muted/50 dark:bg-zinc-900/60 p-2">
                <span className="text-muted-foreground block text-[10px]">
                  عمل فعلي:
                </span>
                <div className="flex items-baseline justify-between font-mono tabular-nums">
                  <span className="font-semibold text-foreground">
                    {formatSeconds(m.totalActiveSeconds)}
                  </span>
                  {typeof m.activityRatio === "number" && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {m.activityRatio}% نشاط
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded bg-muted/50 dark:bg-zinc-900/60 p-2">
                <span className="text-muted-foreground block text-[10px]">
                  سكون وبريك:
                </span>
                <div className="flex items-baseline justify-between font-mono tabular-nums">
                  <span className="font-semibold text-muted-foreground">
                    {formatSeconds(m.totalSleepSeconds ?? m.totalIdleSeconds)}
                  </span>
                  {m.totalBreaksCount && m.totalBreaksCount > 0 ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {m.totalBreaksCount} بريك (
                      {formatSeconds(m.totalBreakSeconds || 0)})
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {m.completedTasksCount || 0} منجزة
                </span>
                {m.overdueTasksCount !== undefined &&
                  m.overdueTasksCount > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                      ({m.overdueTasksCount} متأخرة)
                    </span>
                  )}
                {m.tasksPerHour !== undefined && m.tasksPerHour > 0 && (
                  <span className="text-purple-600 dark:text-purple-400 text-[10px] font-medium">
                    ({m.tasksPerHour} م/س)
                  </span>
                )}
                <span className="text-sky-600 dark:text-sky-400 font-semibold">
                  {m.productivityScore}% إنتاجية
                </span>
              </div>
              <button
                onClick={() => onSelectEmployee(m.employeeId)}
                className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 transition hover:bg-sky-500/10 active:scale-95 shadow-xs"
              >
                <span>عرض التفاصيل</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
