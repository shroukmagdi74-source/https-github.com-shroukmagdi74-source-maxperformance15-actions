import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import {
  TaskSubtask,
  getStatusBadgeClassName,
  getStatusText,
  getPersonName,
} from './types';
import { TaskEmptyState } from './TaskInfoWidgets';

interface TaskSubtasksTabProps {
  subtasks: TaskSubtask[];
  showSubtaskForm: boolean;
  setShowSubtaskForm: React.Dispatch<React.SetStateAction<boolean>>;
  newSubtask: { title: string; description: string };
  setNewSubtask: React.Dispatch<React.SetStateAction<{ title: string; description: string }>>;
  onCreateSubtask: () => void;
  onUpdateSubtaskStatus: (subtaskId: string, status: string) => void;
}

export const TaskSubtasksTab: React.FC<TaskSubtasksTabProps> = ({
  subtasks,
  showSubtaskForm,
  setShowSubtaskForm,
  newSubtask,
  setNewSubtask,
  onCreateSubtask,
  onUpdateSubtaskStatus,
}) => {
  return (
    <BusinessSectionPanel
      title="المهام الفرعية"
      description="قسّم العمل إلى خطوات أصغر عندما تحتاج المهمة إلى تسلسل واضح بدل قائمة طويلة من الملاحظات."
      headerAside={
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSubtaskForm((current) => !current)}
        >
          <PlusIcon className="size-4" />
          مهمة فرعية
        </Button>
      }
      contentClassName="space-y-4"
    >
      {showSubtaskForm ? (
        <div className="rounded-[26px] border border-border/70 bg-background/60 p-4">
          <div className="grid gap-3">
            <Input
              value={newSubtask.title}
              onChange={(event) =>
                setNewSubtask((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="عنوان المهمة الفرعية"
              className="h-11 rounded-2xl"
            />
            <Textarea
              value={newSubtask.description}
              onChange={(event) =>
                setNewSubtask((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="وصف مختصر يساعد المنفذ على البدء"
              className="min-h-28 rounded-2xl"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSubtaskForm(false)}
              >
                إلغاء
              </Button>
              <Button type="button" onClick={onCreateSubtask}>
                إضافة المهمة الفرعية
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {subtasks.length > 0 ? (
        <div className="space-y-3">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex flex-col gap-3 rounded-[26px] border border-border/70 bg-background/65 px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSubtaskStatus(
                      subtask.id,
                      subtask.status === "COMPLETED"
                        ? "PENDING"
                        : "COMPLETED",
                    )
                  }
                  className={cn(
                    "mt-0.5 inline-flex size-6 items-center justify-center rounded-full border transition-colors",
                    subtask.status === "COMPLETED"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border/80 bg-background text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {subtask.status === "COMPLETED" ? (
                    <CheckIcon className="size-3.5" />
                  ) : null}
                </button>
                <div className="min-w-0 space-y-1">
                  <Link
                    to={`/tasks/${subtask.id}`}
                    className={cn(
                      "block text-sm font-semibold transition-colors hover:text-primary",
                      subtask.status === "COMPLETED"
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {subtask.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {subtask.assignedUser
                      ? getPersonName(subtask.assignedUser)
                      : "بدون مسؤول محدد"}
                  </p>
                </div>
              </div>

              <Badge
                className={cn(
                  "h-7 shrink-0 px-3 text-sm",
                  getStatusBadgeClassName(subtask.status),
                )}
              >
                {getStatusText(subtask.status)}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <TaskEmptyState
          title="لا توجد مهام فرعية"
          description="أضف خطوة أولى إذا كانت هذه المهمة تحتاج تقسيمًا أو تسلسلاً واضحًا أثناء التنفيذ."
        />
      )}
    </BusinessSectionPanel>
  );
};
