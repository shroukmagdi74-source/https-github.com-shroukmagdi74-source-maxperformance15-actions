import React from "react";
import { ReminderStats } from "./types";

interface RemindersStatsTabProps {
  stats: ReminderStats | null;
}

export const RemindersStatsTab: React.FC<RemindersStatsTabProps> = ({ stats }) => {
  if (!stats) return null;

  const completionRate = stats.performance?.completionRate
    ? `${Math.round(stats.performance.completionRate * 100)}%`
    : "0%";
  const avgSnooze = stats.performance?.averageSnoozeCount != null
    ? stats.performance.averageSnoozeCount.toFixed(1)
    : "0.0";
  const onTimeRate = stats.performance?.onTimeCompletion
    ? `${Math.round(stats.performance.onTimeCompletion * 100)}%`
    : "0%";

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
          مقاييس الأداء
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {completionRate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">معدل الإنجاز</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {avgSnooze}
            </div>
            <div className="text-xs text-muted-foreground mt-1">متوسط التأجيل</div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-center">
            <div className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {onTimeRate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">الإنجاز في الوقت</div>
          </div>
        </div>
      </div>

      {/* Trends */}
      {stats.trends && stats.trends.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            الاتجاهات الزمنية
          </h3>
          <div className="space-y-2">
            {stats.trends.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
              >
                <span className="text-xs font-medium text-foreground">
                  {trend.period}
                </span>
                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                  <span>
                    تم الإنشاء: <strong className="text-foreground">{trend.created}</strong>
                  </span>
                  <span>
                    مكتمل: <strong className="text-emerald-500">{trend.completed}</strong>
                  </span>
                  <span>
                    متأخر: <strong className="text-destructive">{trend.overdue}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
