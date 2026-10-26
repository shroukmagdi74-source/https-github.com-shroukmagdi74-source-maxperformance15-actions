import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { TableRow, TableCell } from "../../../components/ui/table";
import {
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  TASK_TYPES,
  TASK_STATUSES,
  PRIORITY_CONFIG,
} from "../../../constants/taskConstants";
import { Task } from "./types";

interface DevTaskRowProps {
  task: Task;
  isSelected: boolean;
  settings: any;
  userPermissions: any;
  onToggleSelect: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const DevTaskRow: React.FC<DevTaskRowProps> = ({
  task,
  isSelected,
  settings,
  userPermissions,
  onToggleSelect,
  onDeleteTask,
}) => {
  const navigate = useNavigate();

  const typeInfo = TASK_TYPES[task.type] || TASK_TYPES["FEATURE"];

  const statusInfo =
    settings?.taskStatuses?.find((s: any) => s.value === task.status) ||
    TASK_STATUSES[task.status] ||
    TASK_STATUSES["BACKLOG"];

  const priorityInfo =
    settings?.taskPriorities?.find((p: any) => p.value === task.priority) ||
    PRIORITY_CONFIG[task.priority] ||
    PRIORITY_CONFIG["MEDIUM"];

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => navigate(`/super-admin/dev-tasks/${task.id}`)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          aria-label={`تحديد المهمة ${task.title}`}
          checked={isSelected}
          onChange={() => onToggleSelect(task.id)}
          className="rounded border-border"
        />
      </TableCell>
      <TableCell>
        <div className="max-w-md">
          <Link
            to={`/super-admin/dev-tasks/${task.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-foreground truncate hover:text-primary block text-sm"
          >
            {task.title}
          </Link>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground text-xs">
            {task.commentsCount > 0 && (
              <span className="flex items-center gap-0.5 font-mono tabular-nums">
                <ChatBubbleLeftIcon className="size-3" />
                {task.commentsCount}
              </span>
            )}
            {task.attachmentsCount > 0 && (
              <span className="flex items-center gap-0.5 font-mono tabular-nums">
                <PaperClipIcon className="size-3" />
                {task.attachmentsCount}
              </span>
            )}
            {task.subtasksCount > 0 && (
              <span className="flex items-center gap-0.5 font-mono tabular-nums">
                <ClipboardDocumentListIcon className="size-3" />
                {task.subtasksCount}
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="gap-1 text-xs">
          {typeInfo?.icon}
          {typeInfo?.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {statusInfo?.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${priorityInfo?.color || ""}`}
          />
          <span className="text-xs text-muted-foreground">
            {priorityInfo?.label}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1 min-w-[100px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono tabular-nums">
              {task.progress}%
            </span>
            {task.estimatedHours > 0 && (
              <span className="text-muted-foreground/70 font-mono tabular-nums">
                {task.actualHours}/{task.estimatedHours}h
              </span>
            )}
          </div>
          <Progress value={task.progress} className="h-1.5" />
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {task.assigneeName ? (
          <div className="flex items-center gap-2">
            {task.assigneeAvatar ? (
              <img
                src={task.assigneeAvatar}
                alt=""
                className="size-6 rounded-full"
              />
            ) : (
              <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                {task.assigneeName.charAt(0)}
              </div>
            )}
            <span className="text-xs text-foreground">
              {task.assigneeName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">
            غير محدد
          </span>
        )}
      </TableCell>
      <TableCell>
        {task.projectName ? (
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor: task.projectColor || "#6366f1",
              }}
            />
            <span className="text-xs text-foreground">
              {task.projectName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">
            -
          </span>
        )}
      </TableCell>
      <TableCell>
        {task.dueDate ? (
          <span
            className={`flex items-center gap-1 text-xs font-mono tabular-nums ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
          >
            <CalendarDaysIcon className="size-3.5" />
            {new Date(task.dueDate).toLocaleDateString("ar-EG")}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">
            -
          </span>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <Link
            to={`/super-admin/dev-tasks/${task.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            title="عرض"
          >
            <EyeIcon className="size-4" />
          </Link>
          {userPermissions?.canEdit && (
            <Link
              to={`/super-admin/dev-tasks/${task.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              title="تعديل"
            >
              <PencilIcon className="size-4" />
            </Link>
          )}
          {userPermissions?.canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="حذف"
            >
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
