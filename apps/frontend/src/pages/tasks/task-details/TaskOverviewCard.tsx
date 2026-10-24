import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import {
  TaskDetails,
  TaskPerson,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  formatDate,
  getPersonName,
} from './types';
import { TaskWorkspaceStat } from './TaskInfoWidgets';

interface TaskOverviewCardProps {
  task: TaskDetails;
  users: TaskPerson[];
  showFullDescription: boolean;
  setShowFullDescription: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdateTask: (updates: Record<string, unknown>) => void;
  onDeleteTask: () => void;
}

export const TaskOverviewCard: React.FC<TaskOverviewCardProps> = ({
  task,
  users,
  showFullDescription,
  setShowFullDescription,
  onUpdateTask,
  onDeleteTask,
}) => {
  const isOverdue =
    Boolean(task.dueDate) &&
    new Date(task.dueDate as string) < new Date() &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED";

  const taskDescription = task.description?.trim()
    ? task.description
    : "لا يوجد وصف مكتوب لهذه المهمة حتى الآن.";
  const shouldCollapseDescription = taskDescription.length > 220;
  const isDescriptionCollapsed =
    shouldCollapseDescription && !showFullDescription;

  return (
    <BusinessSectionPanel
      title="لوحة التنفيذ"
      description="عدّل الحالة والملكية ونسبة الإنجاز من مساحة واحدة بدل التنقل بين كتل متعددة."
      contentClassName="space-y-4"
    >
      <div className="rounded-[22px] border border-border/65 bg-background/70 px-3.5 py-3.5 md:rounded-[24px] md:px-4 md:py-4">
        <p
          className={cn(
            "text-sm leading-7 text-foreground whitespace-pre-wrap",
            isDescriptionCollapsed && "max-h-36 overflow-hidden md:max-h-none",
          )}
        >
          {taskDescription}
        </p>
        {shouldCollapseDescription ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 h-9 w-full rounded-full md:hidden"
            onClick={() => setShowFullDescription((current) => !current)}
          >
            {showFullDescription ? "إخفاء التفاصيل" : "عرض الوصف بالكامل"}
          </Button>
        ) : null}
      </div>

      {isOverdue ? (
        <div className="rounded-[22px] border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          المهمة متأخرة عن تاريخ الاستحقاق الحالي. راجع الحالة أو الموعد أو نسبة
          الإنجاز حتى تبقى الصورة واضحة للفريق.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            الحالة
          </label>
          <select
            value={task.status}
            onChange={(event) => void onUpdateTask({ status: event.target.value })}
            className="business-control-input h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            الأولوية
          </label>
          <select
            value={task.priority}
            onChange={(event) => void onUpdateTask({ priority: event.target.value })}
            className="business-control-input h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">
            المسؤول
          </label>
          <select
            value={task.assignedUser?.id || ""}
            onChange={(event) => void onUpdateTask({ assignedTo: event.target.value })}
            className="business-control-input h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getPersonName(user)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-[24px] border border-border/65 bg-background/70 px-4 py-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">التقدم</span>
          <span className="font-semibold text-primary">{task.progress}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={task.progress}
          onChange={(event) =>
            void onUpdateTask({
              progress: parseInt(event.target.value, 10),
            })
          }
          className="w-full accent-[var(--color-primary)]"
        />

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <TaskWorkspaceStat
          label="تاريخ البدء"
          value={formatDate(task.startDate)}
          hint="يمكن تعديل الموعد من بيانات المهمة الأساسية."
          tone="default"
        />
        <TaskWorkspaceStat
          label="آخر تحديث"
          value={formatDate(task.updatedAt)}
          hint="يعكس آخر تعديل تم حفظه على المهمة."
          tone="default"
        />
      </div>

      <div className="flex justify-end md:hidden">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-destructive/25 text-destructive hover:bg-destructive/5 hover:text-destructive"
          onClick={() => {
            if (window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
              onDeleteTask();
            }
          }}
        >
          <TrashIcon className="size-4" />
          حذف المهمة
        </Button>
      </div>
    </BusinessSectionPanel>
  );
};
