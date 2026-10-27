import React from "react";
import { useNavigate } from "react-router-dom";
import { Link2 } from "lucide-react";
import { Goal } from "./types";

interface DevGoalTasksTabProps {
  linkedTasks: Goal["linkedTasks"];
}

export const DevGoalTasksTab: React.FC<DevGoalTasksTabProps> = ({
  linkedTasks,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {(linkedTasks?.length ?? 0) === 0 ? (
        <div className="p-8 text-center border border-dashed border-border/80 rounded-lg">
          <Link2 className="size-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            لا توجد مهام مرتبطة بهذا الهدف
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden">
          {linkedTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-card hover:bg-muted/20 transition-colors flex items-center justify-between cursor-pointer"
              onClick={() => navigate(`/super-admin/dev-tasks/${task.id}`)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`size-2 rounded-full shrink-0 ${
                    task.status === "DONE"
                      ? "bg-emerald-500"
                      : task.status === "IN_PROGRESS"
                      ? "bg-primary"
                      : task.status === "IN_REVIEW"
                      ? "bg-purple-500"
                      : "bg-muted-foreground/50"
                  }`}
                />
                <span className="font-medium text-xs text-foreground truncate">
                  {task.title}
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/40">
                {task.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
