import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { BusinessSectionPanel } from "../../../components/business/BusinessSurface";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Progress } from "../../../components/ui/progress";
import { Switch } from "../../../components/ui/switch";
import { AssignmentDraft, EmployeeOption } from "./types";
import { getEmployeeLabel } from "./helpers";

interface GoalAssignmentsSectionProps {
  assignments: AssignmentDraft[];
  employees: EmployeeOption[];
  assignmentTargetTotal: number;
  targetValueNumber: number;
  assignmentCoverage: number;
  onUpdateAssignment: (
    index: number,
    key: keyof AssignmentDraft,
    value: string | boolean,
  ) => void;
  onAddAssignment: () => void;
  onRemoveAssignment: (index: number) => void;
}

export const GoalAssignmentsSection: React.FC<GoalAssignmentsSectionProps> = ({
  assignments,
  employees,
  assignmentTargetTotal,
  targetValueNumber,
  assignmentCoverage,
  onUpdateAssignment,
  onAddAssignment,
  onRemoveAssignment,
}) => {
  return (
    <BusinessSectionPanel
      title="توزيع الهدف على الفريق"
      description="كل توزيع هنا ينشئ هدف ابن لموظف، ويمكن لكل واحد منهم توليد أهداف يومية تلقائيًا."
      contentClassName="space-y-4"
    >
      <div className="rounded-3xl border border-border/70 bg-muted/15 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <div className="font-medium">إجمالي التوزيع</div>
            <div className="text-muted-foreground font-mono tabular-nums">
              تم توزيع {assignmentTargetTotal.toLocaleString("ar-EG")} من أصل{" "}
              {targetValueNumber.toLocaleString("ar-EG")}
            </div>
          </div>
          <Badge variant="outline" className="rounded-full font-mono tabular-nums">
            المتبقي{" "}
            {Math.max(0, targetValueNumber - assignmentTargetTotal).toLocaleString(
              "ar-EG",
            )}
          </Badge>
        </div>
        <Progress value={assignmentCoverage} className="mt-3" />
      </div>

      <div className="space-y-3">
        {assignments.map((assignment, index) => (
          <div
            key={`${assignment.id || "new"}-${index}`}
            className="rounded-3xl border border-border/70 bg-background p-4"
          >
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_180px_auto]">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  الموظف
                </label>
                <select
                  data-testid={`goal-assignment-employee-${index}`}
                  value={assignment.employeeId}
                  onChange={(event) =>
                    onUpdateAssignment(index, "employeeId", event.target.value)
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">اختر الموظف</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {getEmployeeLabel(employee)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  عنوان هدف الموظف
                </label>
                <Input
                  value={assignment.title}
                  onChange={(event) =>
                    onUpdateAssignment(index, "title", event.target.value)
                  }
                  placeholder="يترك فارغًا ليأخذ نفس عنوان الهدف الأب"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  المستهدف
                </label>
                <Input
                  data-testid={`goal-assignment-target-${index}`}
                  type="number"
                  min="0"
                  value={assignment.targetValue}
                  onChange={(event) =>
                    onUpdateAssignment(index, "targetValue", event.target.value)
                  }
                  className="rounded-2xl font-mono tabular-nums"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex flex-1 items-center justify-between rounded-2xl border border-border/70 px-3 py-2">
                  <div className="text-xs">
                    <div className="font-medium">يومي تلقائي</div>
                    <div className="text-muted-foreground">يولد أهداف يومية</div>
                  </div>
                  <Switch
                    data-testid={`goal-assignment-auto-daily-${index}`}
                    checked={assignment.autoGenerateDaily}
                    onCheckedChange={(checked) =>
                      onUpdateAssignment(
                        index,
                        "autoGenerateDaily",
                        Boolean(checked),
                      )
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl text-destructive"
                  onClick={() => onRemoveAssignment(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        onClick={onAddAssignment}
      >
        <Plus className="ml-2 h-4 w-4" />
        إضافة توزيع جديد
      </Button>
    </BusinessSectionPanel>
  );
};
