import React from "react";
import { CheckSquare } from "lucide-react";
import { BusinessSectionPanel } from "../../../components/business/BusinessSurface";
import { Input } from "../../../components/ui/input";
import { TaskOption } from "./types";

interface GoalLinkedTasksSectionProps {
  taskSearch: string;
  setTaskSearch: (search: string) => void;
  filteredTaskOptions: TaskOption[];
  linkedTaskIds: string[];
  onToggleTaskLink: (taskId: string) => void;
}

export const GoalLinkedTasksSection: React.FC<GoalLinkedTasksSectionProps> = ({
  taskSearch,
  setTaskSearch,
  filteredTaskOptions,
  linkedTaskIds,
  onToggleTaskLink,
}) => {
  return (
    <BusinessSectionPanel
      title="المهام المرتبطة"
      description="اربط المهام التي تمثل تنفيذًا مباشرًا لهذا الهدف. يمكن أن تكون مهام زمنية أو عددية."
      contentClassName="space-y-4"
    >
      <Input
        value={taskSearch}
        onChange={(event) => setTaskSearch(event.target.value)}
        placeholder="ابحث عن مهمة بالعنوان"
        className="rounded-2xl"
      />

      {filteredTaskOptions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
          لا توجد مهام مطابقة للفلتر الحالي.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredTaskOptions.slice(0, 16).map((task) => {
            const selected = linkedTaskIds.includes(task.id);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTaskLink(task.id)}
                className={`rounded-3xl border p-4 text-right transition-colors ${
                  selected
                    ? "border-primary/40 bg-primary/8"
                    : "border-border/70 bg-background hover:border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {task.measurementType === "COUNT"
                        ? "مهمة بعدّاد إنجاز"
                        : task.measurementType === "VALUE"
                          ? "مهمة بقياس قيمة"
                          : "مهمة زمنية"}
                    </div>
                  </div>
                  <CheckSquare
                    className={`h-5 w-5 ${
                      selected ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>

                {task.metricTargetValue !== null &&
                task.metricTargetValue !== undefined ? (
                  <div className="mt-3 text-xs text-muted-foreground font-mono tabular-nums">
                    المستهدف داخل المهمة:{" "}
                    {Number(task.metricTargetValue).toLocaleString("ar-EG")}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </BusinessSectionPanel>
  );
};
