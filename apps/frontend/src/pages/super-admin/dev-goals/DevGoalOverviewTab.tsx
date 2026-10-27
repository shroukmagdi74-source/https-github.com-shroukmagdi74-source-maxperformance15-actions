import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, Tag, MessageSquare } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Goal, statusConfig } from "./types";

interface DevGoalOverviewTabProps {
  goal: Goal;
  onOpenCheckInModal: () => void;
}

export const DevGoalOverviewTab: React.FC<DevGoalOverviewTabProps> = ({
  goal,
  onOpenCheckInModal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column: Details & Child Goals */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border border-border/60 p-4 bg-muted/10">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Target className="size-3.5 text-primary" />
            <span>مواصفات وتصنيف الهدف</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">المالك</span>
              <span className="font-medium text-foreground">
                {goal.owner?.name || "غير محدد"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">المشروع</span>
              <span className="font-medium text-foreground">
                {goal.project?.name || "غير محدد"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">الهدف الأعلى</span>
              <span className="font-medium text-foreground">
                {goal.parentGoal?.title || "هدف رئيسي"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">الربع السنوي</span>
              <span className="font-medium text-foreground font-mono">
                {goal.quarter || "غير محدد"}
              </span>
            </div>
          </div>
        </div>

        {/* Child Goals */}
        {(goal.childGoals?.length ?? 0) > 0 && (
          <div className="rounded-lg border border-border/60 p-4 bg-card">
            <h3 className="text-xs font-semibold text-foreground mb-3">
              الأهداف الفرعية التابعة
            </h3>
            <div className="space-y-2">
              {goal.childGoals.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-2.5 bg-muted/20 hover:bg-muted/40 border border-border/40 rounded-lg cursor-pointer transition-colors"
                  onClick={() => navigate(`/super-admin/dev-goals/${child.id}`)}
                >
                  <div>
                    <p className="font-medium text-xs text-foreground">{child.title}</p>
                    <p className="text-[10px] text-muted-foreground">{child.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                        statusConfig[child.status]?.color || ""
                      } ${statusConfig[child.status]?.border || ""}`}
                    >
                      {statusConfig[child.status]?.label || child.status}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                      {child.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Telemetry & Tags */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border/60 p-4 bg-muted/10">
          <h3 className="text-xs font-semibold text-foreground mb-3">
            إحصائيات الإنجاز
          </h3>
          <div className="space-y-2 text-xs divide-y divide-border/40">
            <div className="flex justify-between pt-1.5 first:pt-0">
              <span className="text-muted-foreground">النتائج الرئيسية</span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                {goal.keyResults?.length ?? 0}
              </span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-muted-foreground">المهام المرتبطة</span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                {goal.linkedTasks?.length ?? 0}
              </span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-muted-foreground">الأهداف الفرعية</span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                {goal.childGoals?.length ?? 0}
              </span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-muted-foreground">الأولوية</span>
              <span className="font-medium text-foreground font-mono">
                {goal.priority}
              </span>
            </div>
          </div>
        </div>

        {goal.tags && goal.tags.length > 0 && (
          <div className="rounded-lg border border-border/60 p-4 bg-card">
            <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Tag className="size-3 text-muted-foreground" />
              <span>التصنيفات</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {goal.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[11px] font-mono border border-border/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border/60 p-3 bg-card space-y-2">
          <Button
            onClick={onOpenCheckInModal}
            variant="outline"
            size="sm"
            className="w-full text-xs font-medium gap-1.5 text-primary border-primary/30 hover:bg-primary/5 shadow-2xs cursor-pointer"
          >
            <MessageSquare className="size-3.5" />
            <span>إضافة مراجعة سريعة (Check-in)</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
