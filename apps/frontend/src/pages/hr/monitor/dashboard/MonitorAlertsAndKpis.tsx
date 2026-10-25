import React from "react";
import {
  Activity,
  Users,
  Clock,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { MonitorOverviewStats } from "./types";

interface MonitorAlertsAndKpisProps {
  visibleAlerts: any[];
  onDismissAlert: (alertId: string) => void;
  stats: MonitorOverviewStats;
}

export const MonitorAlertsAndKpis: React.FC<MonitorAlertsAndKpisProps> = ({
  visibleAlerts,
  onDismissAlert,
  stats,
}) => {
  return (
    <>
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map((al, idx) => (
            <div
              key={al.id || idx}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-xs shadow-xs transition ${
                al.severity === "critical"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="font-semibold truncate">{al.message}</span>
              </div>
              <button
                onClick={() => onDismissAlert(al.id)}
                className="shrink-0 rounded-md border border-border/40 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted active:scale-95"
              >
                تمت المراجعة
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border/40 bg-card/60 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>الموثقون اليوم</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
              <Users className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono tabular-nums">
            {stats.totalTracked}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground truncate">
            أجهزة أرسلت بيانات
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/60 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>نشط ومتصل الآن</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <Activity className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {stats.activeNow}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 truncate">
            تفاعل خلال 15 دقيقة
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/60 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>متوسط وقت التسخين</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono tabular-nums">
            <span
              className={
                stats.avgWarmupMinutes <= 15
                  ? "text-emerald-600 dark:text-emerald-400"
                  : stats.avgWarmupMinutes < 30
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
              }
            >
              {stats.avgWarmupMinutes} د
            </span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground truncate">
            بين البصمة وأول نشاط للجهاز
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/60 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>نسبة النشاط الفعلي</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {stats.avgActivityRatio}%
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground truncate">
            من إجمالي ساعات الدوام
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/60 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>متوسط الإنتاجية</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono tabular-nums">
            {stats.avgProductivity}%
          </div>
          <div className="mt-1 text-[11px] text-purple-600 dark:text-purple-400 truncate">
            معدل متوازن (نشاط + مهام)
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/60 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>المهام وساعات العمل</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
              <Laptop className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-lg font-bold text-foreground font-mono tabular-nums truncate">
            {stats.totalTasksCompleted} م • {stats.totalHoursTracked} س
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground truncate">
            مجموع مخرجات وساعات الفريق
          </div>
        </div>
      </div>
    </>
  );
};
