import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  FolderIcon,
  LinkIcon as DependencyIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import {
  TaskDetails,
  TaskRunningTimer,
  getStatusBadgeClassName,
  getPriorityBadgeClassName,
  getStatusText,
  getPriorityText,
  getTaskTypeText,
  formatDate,
  formatDuration,
  getPersonName,
} from './types';
import { TaskWorkspaceStat } from './TaskInfoWidgets';

interface TaskDetailsHeaderProps {
  task: TaskDetails;
  runningTimer: TaskRunningTimer | null;
  isApprover: boolean;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onToggleWatcher: () => void;
  onUpdateTask: (updates: Record<string, unknown>) => void;
  onDeleteTask: () => void;
}

export const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
  task,
  runningTimer,
  isApprover,
  onStartTimer,
  onStopTimer,
  onToggleWatcher,
  onUpdateTask,
  onDeleteTask,
}) => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "";
  const isWatching = task.watchersList.some(
    (watcher) => watcher.id === currentUserId,
  );
  const timerOnThisTask = runningTimer?.taskId === task.id;
  const hasOtherRunningTimer =
    Boolean(runningTimer) && runningTimer?.taskId !== task.id;
  const isOverdue =
    Boolean(task.dueDate) &&
    new Date(task.dueDate as string) < new Date() &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED";
  const isTaskClosed =
    task.status === "COMPLETED" || task.status === "CANCELLED";

  const workspaceSummary = timerOnThisTask
    ? "المؤقت يعمل الآن على هذه المهمة ويمكنك متابعة التنفيذ من هنا مباشرة."
    : isOverdue
      ? "المهمة تجاوزت موعدها الحالي وتحتاج قرارًا سريعًا بخصوص الحالة أو الموعد أو التقدم."
      : task.status === "COMPLETED"
        ? "المهمة مكتملة ويمكنك الآن مراجعة التعليقات والمرفقات وسجل النشاط."
        : task.progress > 0
          ? `تم إنجاز ${task.progress}% من العمل حتى الآن، ويمكنك تحديث الباقي من لوحة التنفيذ.`
          : "ابدأ من لوحة التنفيذ وعدّل الحالة أو المسؤول أو نسبة الإنجاز دون التنقل بين طبقات كثيرة.";

  const mobileWorkspaceSummary = timerOnThisTask
    ? "المؤقت يعمل على المهمة الآن."
    : isOverdue
      ? "المهمة متأخرة وتحتاج متابعة سريعة."
      : task.status === "COMPLETED"
        ? "المهمة مكتملة."
        : task.progress > 0
          ? `التقدم الحالي ${task.progress}%.`
          : "المهمة جاهزة للبدء.";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeftIcon className="size-4" />
          العودة للمهام
        </Button>

        {task.project ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-foreground">
            <FolderIcon className="size-4 text-primary" />
            {task.project.name}
          </span>
        ) : null}

        {task.parentTask ? (
          <Link
            to={`/tasks/${task.parentTask.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-foreground transition-colors hover:bg-background"
          >
            <DependencyIcon className="size-4 text-primary" />
            المهمة الأصلية: {task.parentTask.title}
          </Link>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-[26px] border border-border/70 bg-card/72 px-3.5 py-3.5 shadow-[0_24px_70px_-50px_rgba(15,27,45,0.34)] md:rounded-[30px] md:px-5 md:py-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                className={cn(
                  "h-7 rounded-full px-3 text-[11px]",
                  getStatusBadgeClassName(task.status),
                )}
              >
                {getStatusText(task.status)}
              </Badge>
              <Badge
                className={cn(
                  "h-7 rounded-full px-3 text-[11px]",
                  getPriorityBadgeClassName(task.priority),
                )}
              >
                {getPriorityText(task.priority)}
              </Badge>
              <Badge
                variant="outline"
                className="h-7 rounded-full px-3 text-[11px]"
              >
                النوع: {getTaskTypeText(task.type || "general")}
              </Badge>
              {isOverdue ? (
                <Badge
                  variant="outline"
                  className="h-7 rounded-full border-rose-500/25 bg-rose-500/10 px-3 text-[11px] text-rose-700 dark:text-rose-300"
                >
                  متأخرة
                </Badge>
              ) : null}
              {task.watchersList.length > 0 ? (
                <Badge
                  variant="outline"
                  className="hidden h-7 rounded-full px-3 text-[11px] md:inline-flex"
                >
                  {task.watchersList.length} متابع
                </Badge>
              ) : null}
            </div>

            <div className="space-y-1">
              <h1 className="break-words text-[1.28rem] font-semibold leading-7 tracking-tight text-foreground md:text-2xl md:leading-8">
                {task.title}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:hidden">
                {mobileWorkspaceSummary}
              </p>
              <p className="hidden max-w-3xl text-sm leading-6 text-muted-foreground md:block">
                {workspaceSummary}
              </p>
            </div>

            {task.tags.length > 0 ? (
              <div className="hidden flex-wrap gap-2 md:flex">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="h-7 rounded-full px-3 text-[11px]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:max-w-[24rem] xl:justify-end">
            {!isTaskClosed ? (
              <Button
                type="button"
                className={cn(
                  "col-span-2 h-11 justify-center rounded-2xl text-sm sm:col-span-1 sm:h-10",
                  timerOnThisTask
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : undefined,
                )}
                onClick={timerOnThisTask ? onStopTimer : onStartTimer}
                disabled={hasOtherRunningTimer}
              >
                {timerOnThisTask ? (
                  <>
                    <StopIcon className="size-4" />
                    إيقاف المؤقت
                  </>
                ) : (
                  <>
                    <PlayIcon className="size-4" />
                    بدء المؤقت
                  </>
                )}
              </Button>
            ) : null}

            {task.status === "IN_REVIEW" && (
              isApprover ? (
                <>
                  <Button
                    type="button"
                    className="h-11 justify-center rounded-2xl text-sm sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => void onUpdateTask({ status: "COMPLETED" })}
                    title="اعتماد وإنجاز المهمة"
                  >
                    <CheckCircleIcon className="size-4" />
                    اعتماد
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 justify-center rounded-2xl text-sm sm:h-10 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    onClick={() => void onUpdateTask({ status: "IN_PROGRESS" })}
                    title="طلب تعديلات على المهمة"
                  >
                    <ArrowPathIcon className="size-4" />
                    طلب تعديلات
                  </Button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  بانتظار الاعتماد
                </span>
              )
            )}

            <Button
              type="button"
              variant={isWatching ? "secondary" : "outline"}
              className="h-11 justify-center rounded-2xl text-sm sm:h-10"
              onClick={onToggleWatcher}
            >
              <EyeIcon className="size-4" />
              {isWatching ? "إيقاف المتابعة" : "متابعة"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 justify-center rounded-2xl text-sm sm:h-10"
              onClick={() => navigate(`/tasks?edit=${task.id}`)}
            >
              <PencilIcon className="size-4" />
              تعديل
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="hidden h-10 rounded-2xl md:inline-flex"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
                  onDeleteTask();
                }
              }}
            >
              <TrashIcon className="size-4" />
              حذف
            </Button>
          </div>
        </div>

        {hasOtherRunningTimer ? (
          <div className="mt-4 rounded-[22px] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            يوجد مؤقت يعمل على مهمة أخرى الآن. أوقفه أولًا إذا أردت تسجيل
            الوقت على هذه المهمة.
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-2 xl:grid-cols-4">
          <TaskWorkspaceStat
            label="التقدم"
            value={`${task.progress}%`}
            hint={
              task.status === "COMPLETED"
                ? "مكتملة"
                : task.progress > 0
                  ? "قابل للتحديث"
                  : "لم يبدأ"
            }
            tone={task.status === "COMPLETED" ? "success" : "primary"}
          />
          <TaskWorkspaceStat
            label="الاستحقاق"
            value={formatDate(task.dueDate)}
            hint={isOverdue ? "متأخرة" : "الموعد الحالي"}
            tone={isOverdue ? "warning" : "default"}
          />
          <div className="contents">
            <TaskWorkspaceStat
              label="الوقت المسجل"
              value={formatDuration(task.totalTimeMinutes)}
              hint={`مقابل ${task.estimatedHours || 0} ساعة مقدرة`}
              tone="default"
            />
          </div>
          <div className="contents">
            <TaskWorkspaceStat
              label="المسؤول"
              value={getPersonName(task.assignedUser)}
              hint={
                task.watchersList.length > 0
                  ? `${task.watchersList.length} متابع على المهمة`
                  : "لا يوجد متابعون بعد"
              }
              tone="default"
            />
          </div>
        </div>
      </section>
    </>
  );
};
