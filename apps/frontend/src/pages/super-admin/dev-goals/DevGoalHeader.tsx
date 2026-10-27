import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Pencil } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Goal, statusConfig, confidenceConfig } from "./types";

interface DevGoalHeaderProps {
  goal: Goal;
}

export const DevGoalHeader: React.FC<DevGoalHeaderProps> = ({ goal }) => {
  const navigate = useNavigate();
  const statusInfo = statusConfig[goal.status] || statusConfig.ACTIVE;
  const confidenceInfo = goal.confidence ? confidenceConfig[goal.confidence] : null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/super-admin/dev-goals")}
          className="size-9 rounded-lg border border-border/80 bg-card text-foreground shadow-2xs hover:bg-muted/40 cursor-pointer"
          title="رجوع"
          aria-label="رجوع"
        >
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {goal.title}
            </h1>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${statusInfo.color} ${statusInfo.border}`}
            >
              {statusInfo.label}
            </span>
            {confidenceInfo && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/60 text-muted-foreground border border-border/60">
                <span className={`size-1.5 rounded-full ${confidenceInfo.dot}`} />
                {confidenceInfo.label}
              </span>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              {goal.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="text-left font-mono">
          <div className="text-2xl font-bold tracking-tight text-primary tabular-nums">
            {goal.progress}%
          </div>
          <div className="text-[10px] text-muted-foreground font-sans">
            نسبة الإنجاز
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/super-admin/dev-goals/${goal.id}/edit`)}
          className="h-8 text-xs font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
        >
          <Pencil className="size-3.5" />
          <span>تعديل الهدف</span>
        </Button>
      </div>
    </div>
  );
};
