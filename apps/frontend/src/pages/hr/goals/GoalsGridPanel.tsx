import React from "react";
import {
  ArrowRight,
  Briefcase,
  CalendarRange,
  ChevronLeft,
  FolderKanban,
  Target,
  Users,
} from "lucide-react";
import { BusinessSectionPanel } from "../../../components/business/BusinessSurface";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { GoalRecord } from "./types";
import {
  GOAL_TYPE_LABELS,
  STATUS_STYLES,
  formatGoalDateRange,
  getGoalOwnerLabel,
  priorityLabel,
  statusLabel,
} from "./helpers";

interface GoalsGridPanelProps {
  filteredGoals: GoalRecord[];
  onOpenGoal: (goalId: string) => void;
}

export const GoalsGridPanel: React.FC<GoalsGridPanelProps> = ({
  filteredGoals,
  onOpenGoal,
}) => {
  return (
    <BusinessSectionPanel
      title="شبكة الأهداف"
      description="كل صف يعرض الهدف نفسه، التقدم الفعلي، وصورته داخل التسلسل الأب والابن."
      contentClassName="space-y-4"
    >
      {filteredGoals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-muted/10 px-6 py-12 text-center">
          <Target className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">لا توجد أهداف مطابقة</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            غيّر الفلاتر الحالية أو ابدأ بإضافة هدف مشروع جديد وتوزيعه على
            الفريق.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <article
              key={goal.id}
              className="rounded-3xl border border-border/70 bg-background p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {GOAL_TYPE_LABELS[goal.goalType]}
                    </Badge>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                        STATUS_STYLES[goal.status] ||
                        "bg-muted text-foreground ring-border"
                      }`}
                    >
                      {statusLabel(goal.status)}
                    </span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      أولوية {priorityLabel(goal.priority)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    {goal.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {getGoalOwnerLabel(goal)}
                    </span>
                    <span className="inline-flex items-center gap-2 font-mono tabular-nums">
                      <CalendarRange className="h-4 w-4" />
                      {formatGoalDateRange(goal)}
                    </span>
                    {goal.parentGoal ? (
                      <span className="inline-flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        يتبع: {goal.parentGoal.title}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => onOpenGoal(goal.id)}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                    فتح
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">التقدم</span>
                    <span className="font-medium font-mono tabular-nums">
                      {Number(goal.progress || 0).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={goal.progress || 0} />
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      الحالي:{" "}
                      <strong className="text-foreground font-mono tabular-nums">
                        {Number(goal.currentValue || 0).toLocaleString("ar-EG")}
                      </strong>
                    </span>
                    <span>
                      المستهدف:{" "}
                      <strong className="text-foreground font-mono tabular-nums">
                        {Number(goal.targetValue || 0).toLocaleString("ar-EG")}
                      </strong>
                    </span>
                    {goal.unit ? (
                      <span>
                        الوحدة:{" "}
                        <strong className="text-foreground">{goal.unit}</strong>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      أبناء الهدف
                    </div>
                    <div className="mt-1 text-xl font-semibold font-mono tabular-nums">
                      {goal.childGoals?.length || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FolderKanban className="h-4 w-4" />
                      مهام مرتبطة
                    </div>
                    <div className="mt-1 text-xl font-semibold font-mono tabular-nums">
                      {goal.tasks?.length || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                      التوليد اليومي
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {goal.autoGenerateDaily ? "مفعّل" : "غير مفعّل"}
                    </div>
                  </div>
                </div>
              </div>

              {goal.childGoals && goal.childGoals.length > 0 ? (
                <div className="mt-4 space-y-2 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <div className="text-sm font-medium">لقطة من التسلسل</div>
                  <div className="space-y-2">
                    {goal.childGoals.slice(0, 3).map((childGoal) => (
                      <div
                        key={childGoal.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background px-3 py-2"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{childGoal.title}</span>
                          <span className="mr-2 text-muted-foreground">
                            {GOAL_TYPE_LABELS[childGoal.goalType]}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground font-mono tabular-nums">
                          {Number(childGoal.currentValue || 0).toLocaleString(
                            "ar-EG",
                          )}
                          {" / "}
                          {Number(childGoal.targetValue || 0).toLocaleString(
                            "ar-EG",
                          )}
                          {" • "}
                          {Number(childGoal.progress || 0).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </BusinessSectionPanel>
  );
};
