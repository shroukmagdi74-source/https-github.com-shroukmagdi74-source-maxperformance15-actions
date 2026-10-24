import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  CheckIcon,
  LinkIcon as DependencyIcon,
  UserCircleIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { cn } from '../../../lib/utils';
import {
  TaskDetails,
  formatDate,
  formatDuration,
  getPersonName,
  getMeasurementTypeText,
} from './types';
import { TaskInfoRow } from './TaskInfoWidgets';

interface TaskMetaSidebarProps {
  task: TaskDetails;
}

export const TaskMetaSidebar: React.FC<TaskMetaSidebarProps> = ({ task }) => {
  const isOverdue =
    Boolean(task.dueDate) &&
    new Date(task.dueDate as string) < new Date() &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED";

  return (
    <aside className="min-w-0 space-y-3 xl:sticky xl:top-4 xl:self-start">
      <BusinessSectionPanel
        title="السياق والملكية"
        description="معلومة واحدة لكل قرار: من يملك المهمة، أين تقع، ومتى بدأت أو تنتهي."
        contentClassName="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <TaskInfoRow
            label="المشروع"
            value={
              task.project ? (
                <span className="text-primary">{task.project.name}</span>
              ) : (
                "بدون مشروع"
              )
            }
            icon={<FolderIcon className="size-4" />}
            emphasized={Boolean(task.project)}
          />
          <TaskInfoRow
            label="الهدف المرتبط"
            value={
              task.goalTitle ? (
                <span className="text-primary">{task.goalTitle}</span>
              ) : (
                "غير مرتبط بهدف"
              )
            }
            icon={<CheckIcon className="size-4" />}
            emphasized={Boolean(task.goalTitle)}
          />
          {task.parentTask ? (
            <TaskInfoRow
              label="المهمة الأصلية"
              value={
                <Link
                  to={`/tasks/${task.parentTask.id}`}
                  className="text-primary transition-colors hover:text-primary/80"
                >
                  {task.parentTask.title}
                </Link>
              }
              icon={<DependencyIcon className="size-4" />}
              emphasized
            />
          ) : null}
          <TaskInfoRow
            label="المسؤول"
            value={getPersonName(task.assignedUser)}
            icon={<UserCircleIcon className="size-4" />}
            emphasized
          />
          <TaskInfoRow
            label="منشئ المهمة"
            value={getPersonName(task.createdByUser)}
            icon={<UserCircleIcon className="size-4" />}
          />
          <TaskInfoRow
            label="تاريخ البدء"
            value={formatDate(task.startDate)}
            icon={<CalendarIcon className="size-4" />}
          />
          <TaskInfoRow
            label="تاريخ الاستحقاق"
            value={
              <span className={cn(isOverdue ? "text-destructive" : undefined)}>
                {formatDate(task.dueDate)}
              </span>
            }
            icon={<CalendarIcon className="size-4" />}
            emphasized={isOverdue}
          />
          <TaskInfoRow
            label="الوقت الفعلي"
            value={formatDuration(task.totalTimeMinutes)}
            icon={<ClockIcon className="size-4" />}
          />
          <TaskInfoRow
            label="أسلوب القياس"
            value={
              task.measurementType === "TIME"
                ? "زمني"
                : `${getMeasurementTypeText(task.measurementType)}${
                    task.metricUnit ? ` • ${task.metricUnit}` : ""
                  }`
            }
            icon={<ClockIcon className="size-4" />}
          />
          {task.measurementType !== "TIME" ? (
            <TaskInfoRow
              label="التقدم العددي"
              value={`${Number(task.metricCurrentValue || 0).toLocaleString("ar-EG")} / ${Number(task.metricTargetValue || 0).toLocaleString("ar-EG")}`}
              icon={<CheckIcon className="size-4" />}
            />
          ) : null}
          <TaskInfoRow
            label="تاريخ الإنشاء"
            value={formatDate(task.createdAt)}
            icon={<CalendarIcon className="size-4" />}
          />
        </div>

        {task.watchersList.length > 0 ? (
          <div className="rounded-[24px] border border-border/65 bg-background/70 px-4 py-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">
              المتابعون
            </p>
            <div className="flex flex-wrap gap-2">
              {task.watchersList.map((watcher) => (
                <span
                  key={watcher.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  <UserCircleIcon className="size-4 text-primary" />
                  {getPersonName(watcher)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </BusinessSectionPanel>
    </aside>
  );
};
