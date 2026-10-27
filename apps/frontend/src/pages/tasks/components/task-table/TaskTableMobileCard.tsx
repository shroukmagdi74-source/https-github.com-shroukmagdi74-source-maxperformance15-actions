import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowPathIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Target } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import type { Task } from "../../types";
import { statusNeedsComplete, statusNeedsReview, statusNeedsStart } from "./types";
import { TaskEvidenceBadges } from "./TaskEvidenceBadges";

export interface TaskTableMobileCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  isOverdue: (dueDate: string | null, status: Task["status"]) => boolean;
  getStatusColor: (status: Task["status"]) => string;
  getStatusText: (status: Task["status"]) => string;
  getPriorityColor: (priority: Task["priority"]) => string;
  getPriorityText: (priority: Task["priority"]) => string;
  formatDate: (date: string) => string;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  canApprove?: boolean;
  onOpenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenDeliveryGate: (task: Task) => void;
  onOpenApprovalGate: (task: Task) => void;
  onDirectApprove: (task: Task) => void;
}

export const TaskTableMobileCard: React.FC<TaskTableMobileCardProps> = ({
  task,
  isSelected,
  onSelect,
  isOverdue,
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityText,
  formatDate,
  updateTaskStatus,
  canApprove = true,
  onOpenTask,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onOpenDeliveryGate,
  onOpenApprovalGate,
  onDirectApprove,
}) => {
  return (
    <article
      className={`overflow-hidden rounded-xl border px-3.5 py-3.5 transition-all duration-150 ${
        isSelected
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-border/60 bg-background/70 hover:border-border/80 hover:bg-background hover:shadow-sm"
      } ${
        isOverdue(task.dueDate, task.status)
          ? "ring-1 ring-rose-400/30"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`h-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusColor(
                task.status,
              )}`}
            >
              {getStatusText(task.status)}
            </Badge>
            <Badge
              variant="outline"
              className={`h-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${getPriorityColor(
                task.priority,
              )}`}
            >
              {getPriorityText(task.priority)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/tasks/${task.id}`}
              className="block text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {task.title}
            </Link>
            {task.isRecurring ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" title="مهمة متكررة دورياً">
                <ArrowPathIcon className="size-3" />
                متكررة
              </span>
            ) : null}
            <TaskEvidenceBadges task={task} />
          </div>

          <p className="line-clamp-1 text-xs leading-5 text-muted-foreground">
            {task.description || "لا يوجد وصف إضافي لهذه المهمة."}
          </p>
        </div>

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(task.id)}
          className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <FolderIcon className="size-4 shrink-0" />
          <span className="truncate">
            {task.projectName || "بدون مشروع"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon className="size-4 shrink-0" />
          <span className="truncate">
            {task.assignedToName || "غير محدد"}
          </span>
        </div>
        {task.goalTitle ? (
          <div className="col-span-2 flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
            <Target className="size-3.5 shrink-0" />
            <span className="truncate font-medium">الهدف: {task.goalTitle}</span>
            {task.goalProgress !== null && task.goalProgress !== undefined ? (
              <span className="font-mono text-[10px] tabular-nums opacity-80">
                ({Math.round(task.goalProgress)}%)
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 shrink-0" />
          <span
            className={
              isOverdue(task.dueDate, task.status)
                ? "font-semibold text-rose-600"
                : undefined
            }
          >
            {task.dueDate ? formatDate(task.dueDate) : "بدون موعد"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>التقدم</span>
          <span className="font-semibold text-foreground tabular-nums">
            {task.progress}%
          </span>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted/70">
        <div
          className="h-1.5 rounded-full bg-gradient-to-l from-primary to-primary/70 transition-all duration-500"
          style={{ width: `${task.progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {statusNeedsStart(task.status) ? (
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-2.5 text-xs"
              onClick={() => updateTaskStatus(task.id, "in_progress")}
            >
              بدء التنفيذ
            </Button>
          ) : null}
          {statusNeedsComplete(task.status) ? (
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-2.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onOpenDeliveryGate(task)}
              title="تسليم المهمة للمراجعة وإرفاق الدليل"
            >
              تسليم للمراجعة
            </Button>
          ) : null}
          {statusNeedsReview(task.status) ? (
            canApprove ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 rounded-full px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => onDirectApprove(task)}
                  title="اعتماد وإنجاز المهمة مباشرة"
                >
                  اعتماد
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-2.5 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => onOpenApprovalGate(task)}
                  title="طلب تعديلات على المهمة"
                >
                  طلب تعديلات
                </Button>
              </>
            ) : (
              <Badge
                variant="outline"
                className="h-8 rounded-full px-2.5 text-xs border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
              >
                بانتظار الاعتماد
              </Badge>
            )
          ) : null}
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => onOpenTask(task)}
            title="عرض التفاصيل"
          >
            <EyeIcon className="size-4" />
            <span className="sr-only">عرض</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => onEditTask(task)}
            title="تعديل المهمة"
          >
            <PencilIcon className="size-4" />
            <span className="sr-only">تعديل</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => onDuplicateTask(task)}
            title="تكرار المهمة"
          >
            <DocumentDuplicateIcon className="size-4" />
            <span className="sr-only">تكرار</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-rose-600 hover:text-rose-700"
            onClick={() => onDeleteTask(task.id)}
            title="حذف المهمة"
          >
            <TrashIcon className="size-4" />
            <span className="sr-only">حذف</span>
          </Button>
        </div>
      </div>
    </article>
  );
};
