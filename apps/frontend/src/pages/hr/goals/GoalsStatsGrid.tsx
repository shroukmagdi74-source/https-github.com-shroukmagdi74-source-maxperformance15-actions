import React from "react";
import { Progress } from "../../../components/ui/progress";
import { GoalStats } from "./types";

interface GoalsStatsGridProps {
  stats: GoalStats | null;
  dailyGoalsCount: number;
}

export const GoalsStatsGrid: React.FC<GoalsStatsGridProps> = ({
  stats,
  dailyGoalsCount,
}) => {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-3xl border border-border/70 bg-background p-5">
        <div className="text-sm text-muted-foreground">إجمالي الأهداف</div>
        <div className="mt-2 text-3xl font-semibold font-mono tabular-nums">
          {stats?.total || 0}
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-background p-5">
        <div className="text-sm text-muted-foreground">مكتمل</div>
        <div className="mt-2 text-3xl font-semibold font-mono tabular-nums">
          {stats?.completed || 0}
        </div>
        <div className="mt-1 text-sm text-muted-foreground font-mono tabular-nums">
          {Number(stats?.completionRate || 0).toFixed(1)}%
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-background p-5">
        <div className="text-sm text-muted-foreground">متوسط التقدم</div>
        <div className="mt-2 text-3xl font-semibold font-mono tabular-nums">
          {Number(stats?.averageProgress || 0).toFixed(1)}%
        </div>
        <Progress
          value={Math.max(
            0,
            Math.min(100, Number(stats?.averageProgress || 0)),
          )}
          className="mt-3"
        />
      </div>
      <div className="rounded-3xl border border-border/70 bg-background p-5">
        <div className="text-sm text-muted-foreground">الأهداف اليومية</div>
        <div className="mt-2 text-3xl font-semibold font-mono tabular-nums">
          {dailyGoalsCount}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          تظهر تلقائيًا عند توزيع أهداف الموظفين
        </div>
      </div>
    </section>
  );
};
