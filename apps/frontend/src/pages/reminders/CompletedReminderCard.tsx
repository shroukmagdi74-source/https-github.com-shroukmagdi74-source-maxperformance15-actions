import React from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDateFormat } from "../../hooks/useDateFormat";
import { Reminder } from "./types";

interface CompletedReminderCardProps {
  reminder: Reminder;
}

export const CompletedReminderCard: React.FC<CompletedReminderCardProps> = ({
  reminder,
}) => {
  const { formatDate } = useDateFormat();

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {reminder.status === "completed" ? (
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            ) : (
              <XMarkIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <h4 className="text-sm font-semibold text-foreground truncate">
              {reminder.title}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                reminder.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {reminder.status === "completed" ? "مكتمل" : "تم التجاهل"}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {reminder.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>تم الإنشاء: {formatDate(reminder.createdAt)}</span>
            <span>كان مجدولاً: {formatDate(reminder.scheduledTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
