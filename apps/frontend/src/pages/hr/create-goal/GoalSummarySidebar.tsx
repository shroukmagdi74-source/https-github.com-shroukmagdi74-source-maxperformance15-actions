import React from "react";
import {
  Briefcase,
  CalendarRange,
  FolderKanban,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { BusinessSectionPanel } from "../../../components/business/BusinessSurface";
import { Progress } from "../../../components/ui/progress";
import {
  AssignmentDraft,
  DepartmentOption,
  EmployeeOption,
  GoalDetails,
  GoalFormState,
  ParentGoalOption,
  ProjectOption,
  TaskOption,
} from "./types";
import { getEmployeeLabel, toNumber } from "./helpers";

interface GoalSummarySidebarProps {
  form: GoalFormState;
  targetValueNumber: number;
  linkedTasks: TaskOption[];
  goalDetails: GoalDetails | null;
  projects: ProjectOption[];
  employees: EmployeeOption[];
  departments: DepartmentOption[];
  availableParentGoals: ParentGoalOption[];
  isEdit: boolean;
}

export const GoalSummarySidebar: React.FC<GoalSummarySidebarProps> = ({
  form,
  targetValueNumber,
  linkedTasks,
  goalDetails,
  projects,
  employees,
  departments,
  availableParentGoals,
  isEdit,
}) => {
  const currentProgress =
    targetValueNumber > 0
      ? Math.min(
          100,
          (toNumber(form.currentValue || "0") / targetValueNumber) * 100,
        )
      : 0;

  const getOwnerLabel = () => {
    if (form.goalType === "PROJECT" && form.projectId) {
      return (
        projects.find((p) => p.id === form.projectId)?.name || "مشروع غير محدد"
      );
    }
    if (form.goalType === "EMPLOYEE" && form.employeeId) {
      return getEmployeeLabel(
        employees.find((e) => e.id === form.employeeId) || {
          id: "",
          firstName: "موظف",
          lastName: "",
        },
      );
    }
    if (form.goalType === "DEPARTMENT" && form.departmentId) {
      return (
        departments.find((d) => d.id === form.departmentId)?.name ||
        "قسم غير محدد"
      );
    }
    return "على مستوى الشركة";
  };

  const parentGoalTitle =
    availableParentGoals.find((g) => g.id === form.parentGoalId)?.title ||
    "لا يوجد هدف أب";

  const childrenCount =
    form.goalType === "PROJECT"
      ? form.assignments.filter((a) => a.employeeId).length
      : goalDetails?.childGoals?.length || 0;

  return (
    <div className="space-y-4">
      <BusinessSectionPanel
        title="ملخص الهدف"
        description="قراءة سريعة قبل الحفظ."
        contentClassName="space-y-4"
      >
        <div className="grid gap-3">
          <div className="rounded-3xl border border-border/70 bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              التقدم الحالي
            </div>
            <div className="mt-2 text-3xl font-semibold font-mono tabular-nums">
              {currentProgress.toFixed(1)}%
            </div>
            <Progress value={currentProgress} className="mt-3" />
          </div>

          <div className="rounded-3xl border border-border/70 bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarRange className="h-4 w-4" />
              الفترة
            </div>
            <div className="mt-2 text-sm font-medium font-mono tabular-nums">
              {form.startDate || "غير محدد"} - {form.endDate || "غير محدد"}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4" />
              المهام المرتبطة
            </div>
            <div className="mt-2 text-2xl font-semibold font-mono tabular-nums">
              {linkedTasks.length}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              الأبناء الحاليون
            </div>
            <div className="mt-2 text-2xl font-semibold font-mono tabular-nums">
              {childrenCount}
            </div>
          </div>
        </div>
      </BusinessSectionPanel>

      <BusinessSectionPanel
        title="شبكة العلاقة"
        description="من يملك الهدف وإلى أين يرفع التحديث."
        contentClassName="space-y-3"
      >
        <div className="rounded-3xl border border-border/70 bg-muted/15 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            المالك
          </div>
          <div className="mt-2 text-sm font-medium">{getOwnerLabel()}</div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-muted/15 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="h-4 w-4" />
            الهدف الأب
          </div>
          <div className="mt-2 text-sm font-medium">{parentGoalTitle}</div>
        </div>

        {isEdit && goalDetails?.childGoals?.length ? (
          <div className="rounded-3xl border border-border/70 bg-muted/15 p-4">
            <div className="mb-3 text-sm font-medium">أهداف الابن الحالية</div>
            <div className="space-y-2">
              {goalDetails.childGoals.slice(0, 5).map((childGoal) => (
                <div
                  key={childGoal.id}
                  className="flex items-center justify-between rounded-2xl bg-background px-3 py-2 text-sm"
                >
                  <span>{childGoal.title}</span>
                  <span className="text-muted-foreground font-mono tabular-nums">
                    {Number(childGoal.targetValue || 0).toLocaleString("ar-EG")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </BusinessSectionPanel>
    </div>
  );
};
