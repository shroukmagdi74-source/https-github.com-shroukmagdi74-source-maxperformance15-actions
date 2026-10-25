import React from "react";
import {
  Laptop,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ExternalLink,
  ListTodo,
  Coffee,
} from "lucide-react";
import { TeamMemberSummary } from "./types";
import {
  formatClockTime,
  formatSeconds,
  getCheckInMethodLabel,
} from "./helpers";

interface MonitorDesktopRowProps {
  member: TeamMemberSummary;
  onSelectEmployee: (employeeId: string) => void;
}

export const MonitorDesktopRow: React.FC<MonitorDesktopRowProps> = ({
  member: m,
  onSelectEmployee,
}) => {
  const inTimeStr = formatClockTime(m.clockInTime);
  const firstActStr = formatClockTime(m.firstActivityTime);
  const methodLabel = getCheckInMethodLabel(m.checkInMethod);
  const warmupMin = m.lateStartMinutes ?? 0;
  const weeklyAvg = m.weeklyAvgLateStartMinutes ?? warmupMin;

  return (
    <tr className="transition-colors hover:bg-muted/50 dark:hover:bg-zinc-900/40">
      <td className="px-4 py-3">
        <div className="font-semibold text-foreground">{m.employeeName}</div>
        <div className="text-[11px] text-muted-foreground">
          {m.departmentName} • {m.jobTitle}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="space-y-1">
          {m.status === "active" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" /> نشط الآن
            </span>
          )}
          {m.status === "break" && (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30">
                <Coffee className="h-3 w-3 text-amber-500" /> استراحة:{" "}
                {m.breakReason || "استراحة رسمية"}
              </span>
              {m.deviceName && (
                <div className="text-[10px] text-muted-foreground">
                  {m.deviceName}
                </div>
              )}
            </div>
          )}
          {m.status === "idle" && (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20">
                <PauseCircle className="h-3 w-3" /> خامل (مفتوح)
              </span>
              {m.deviceName && (
                <div className="text-[10px] text-muted-foreground">
                  {m.deviceName}
                </div>
              )}
            </div>
          )}
          {m.status === "offline" && (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted dark:bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:text-zinc-400 ring-1 ring-inset ring-border/20">
                <XCircle className="h-3 w-3" /> غير متصل
              </span>
              {m.lastSeenTime && (
                <div className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  آخر اتصال: {formatClockTime(m.lastSeenTime)}
                </div>
              )}
            </div>
          )}

          {m.operationalSignal && m.operationalSignal.type !== "NORMAL" && (
            <div>
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  m.operationalSignal.type === "TASK_OVERLOAD"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:border-transparent dark:bg-indigo-500/15 dark:text-indigo-300"
                    : m.operationalSignal.type === "DISTRACTION"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 dark:border-transparent dark:bg-amber-500/15 dark:text-amber-300"
                      : m.operationalSignal.type === "NEGLECT"
                        ? "bg-rose-50 text-rose-700 border border-rose-200 dark:border-transparent dark:bg-rose-500/15 dark:text-rose-300"
                        : m.operationalSignal.type === "STEADY_PERFORMANCE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-transparent dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-sky-50 text-sky-700 border border-sky-200 dark:border-transparent dark:bg-sky-500/15 dark:text-sky-300"
                }`}
                title={m.operationalSignal.reason}
              >
                {m.operationalSignal.label}
              </span>
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="text-muted-foreground font-sans">البصمة:</span>
            {inTimeStr ? (
              <span className="font-semibold text-foreground">
                {inTimeStr}{" "}
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-normal font-sans">
                  ({methodLabel})
                </span>
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400/80 font-medium font-sans">
                لم يسجل حضوراً
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="text-muted-foreground font-sans">أول نشاط:</span>
            {firstActStr ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {firstActStr}
              </span>
            ) : (
              <span className="text-muted-foreground font-normal font-sans">
                لا توجد حركة مسجلة
              </span>
            )}
          </div>

          {m.clockInTime && (
            <div className="pt-0.5 space-y-0.5">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  warmupMin <= 15
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-transparent dark:bg-emerald-500/15 dark:text-emerald-400"
                    : warmupMin < 30
                      ? "bg-amber-50 text-amber-700 border border-amber-200 dark:border-transparent dark:bg-amber-500/15 dark:text-amber-400"
                      : "bg-rose-50 text-rose-700 border border-rose-200 dark:border-transparent dark:bg-rose-500/15 dark:text-rose-400"
                }`}
                title={`الفارق بين البصمة وبداية استخدام الجهاز: ${warmupMin} دقيقة`}
              >
                {warmupMin <= 0
                  ? "تسخين فوري (0 د)"
                  : `وقت تسخين: ${warmupMin} د`}
              </span>
              {weeklyAvg > 0 && (
                <div className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  متوسط 7 أيام: {weeklyAvg} د
                </div>
              )}
            </div>
          )}

          {m.untrackedSeconds && m.untrackedSeconds >= 15 * 60 ? (
            <div className="pt-0.5">
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:border-transparent dark:bg-rose-500/15 dark:text-rose-400"
                title="الموظف سجل حضوراً بالبصمة لكن الجهاز كان متوقفاً أو خارج نطاق العمل"
              >
                <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                <span>غير موثق: {formatSeconds(m.untrackedSeconds)}</span>
              </span>
            </div>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-3 font-mono tabular-nums">
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">
            {formatSeconds(m.totalActiveSeconds)}
          </div>
          {typeof m.activityRatio === "number" && (
            <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              نسبة النشاط: {m.activityRatio}%
            </div>
          )}
          {m.totalClockSeconds && m.totalClockSeconds > 0 ? (
            <div className="text-[10px] text-muted-foreground">
              من دوام {formatSeconds(m.totalClockSeconds)}
            </div>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-3 font-mono tabular-nums">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-foreground text-xs">
            <span className="text-muted-foreground text-[11px] font-sans">
              سكون:
            </span>
            <span className="font-semibold">
              {formatSeconds(m.totalSleepSeconds ?? m.totalIdleSeconds)}
            </span>
          </div>
          {(m.totalBreaksCount && m.totalBreaksCount > 0) ||
          (m.totalBreakSeconds && m.totalBreakSeconds > 0) ? (
            <div className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20">
              <span>بريك: {formatSeconds(m.totalBreakSeconds || 0)}</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                ({m.totalBreaksCount} مرات)
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground font-sans">
              لا توجد فترات بريك
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${
                  m.productivityScore >= 75
                    ? "bg-emerald-500"
                    : m.productivityScore >= 50
                      ? "bg-sky-500"
                      : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, m.productivityScore)}%` }}
              />
            </div>
            <span className="font-semibold text-foreground font-mono tabular-nums">
              {m.productivityScore}%
            </span>
          </div>
          {m.tasksPerHour !== undefined && m.tasksPerHour > 0 && (
            <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400 font-mono tabular-nums">
              {m.tasksPerHour} مهمة/ساعة
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3 font-mono tabular-nums">
        <div className="flex flex-col gap-1">
          {m.activeTask && (
            <span
              className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/25 max-w-[155px] truncate font-sans"
              title={`يعمل الآن على: ${m.activeTask.title}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse shrink-0" />
              <span className="truncate">{m.activeTask.title}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>{m.completedTasksCount || 0} منجزة</span>
          </span>
          {m.openTasksCount !== undefined && m.openTasksCount > 0 && (
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              {m.openTasksCount} قيد التنفيذ
            </span>
          )}
          {m.overdueTasksCount !== undefined && m.overdueTasksCount > 0 && (
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
              {m.overdueTasksCount} متأخرة
            </span>
          )}
          {(m.createdTasksCount || 0) > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400"
              title="مهام تم إنشاؤها وتكليفها اليوم"
            >
              <ListTodo className="h-2.5 w-2.5 shrink-0" />
              <span>{m.createdTasksCount} منشأة</span>
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-foreground">
          <Laptop className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span
            className="truncate max-w-[130px] font-medium"
            title={m.topApp || "سطح المكتب"}
          >
            {m.topApp || "سطح المكتب"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3 text-left">
        <button
          onClick={() => onSelectEmployee(m.employeeId)}
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 transition hover:bg-sky-500/10 hover:border-sky-500/30 active:scale-95 shadow-xs"
          title="عرض المخطط الزمني والبرامج والمواقع لهذا الموظف"
        >
          <span>التفاصيل</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
};
