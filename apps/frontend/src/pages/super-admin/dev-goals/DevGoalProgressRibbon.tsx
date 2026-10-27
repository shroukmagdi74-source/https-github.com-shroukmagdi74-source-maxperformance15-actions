import React from "react";
import { Goal } from "./types";

interface DevGoalProgressRibbonProps {
  goal: Goal;
}

export const DevGoalProgressRibbon: React.FC<DevGoalProgressRibbonProps> = ({
  goal,
}) => {
  return (
    <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card p-3.5 shadow-2xs">
      <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
        <span className="text-muted-foreground font-sans">
          الهدف:{" "}
          <strong className="text-foreground font-mono tabular-nums">
            {goal.currentValue} / {goal.targetValue}
            {goal.unit ? ` ${goal.unit}` : ""}
          </strong>
        </span>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {new Date(goal.startDate).toLocaleDateString("ar-EG")} ←{" "}
          {new Date(goal.endDate).toLocaleDateString("ar-EG")}
        </span>
      </div>
      <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden border border-border/40">
        <div
          className={`h-full rounded-full transition-all ${
            goal.progress >= 80
              ? "bg-emerald-500"
              : goal.progress >= 50
              ? "bg-primary"
              : goal.progress >= 30
              ? "bg-amber-500"
              : "bg-destructive"
          }`}
          style={{ width: `${Math.min(goal.progress, 100)}%` }}
        />
      </div>
    </div>
  );
};
