import React from "react";
import {
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  Reminder,
  formatReminderTime,
  getPriorityColor,
  isOverdue,
} from "./types";

interface ReminderCardProps {
  reminder: Reminder;
  onUpdateStatus: (id: string, status: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />;
    case "triggered":
      return <BellIcon className="h-4 w-4 text-primary" />;
    case "dismissed":
      return <XMarkIcon className="h-4 w-4 text-muted-foreground" />;
    default:
      return <ClockIcon className="h-4 w-4 text-amber-500" />;
  }
};

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onUpdateStatus,
  onSnooze,
}) => {
  const overdue = isOverdue(reminder.scheduledTime);

  return (
    <div
      className={`rounded-xl border transition-all ${
        overdue
          ? "border-destructive/40 bg-destructive/5"
          : "border-border/80 bg-card hover:border-border"
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {getStatusIcon(reminder.status)}
              <h4 className="text-sm font-semibold text-foreground truncate">
                {reminder.title}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getPriorityColor(
                  reminder.priority,
                )}`}
              >
                {reminder.priority === "high"
                  ? "عالية"
                  : reminder.priority === "medium"
                    ? "متوسطة"
                    : "منخفضة"}
              </span>
              {overdue && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-destructive/15 text-destructive border border-destructive/25">
                  متأخر
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {reminder.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono">
                <ClockIcon className="h-3.5 w-3.5" />
                {formatReminderTime(reminder.scheduledTime)}
              </span>
              {reminder.customerId && (
                <span className="flex items-center gap-1 font-mono">
                  <UserIcon className="h-3.5 w-3.5" />
                  عميل #{reminder.customerId}
                </span>
              )}
              {reminder.snoozeCount > 0 && (
                <span className="text-amber-500 font-mono text-[11px]">
                  تم التأجيل {reminder.snoozeCount} مرة
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onUpdateStatus(reminder.id, "completed")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              title="تم الإنجاز"
              aria-label="تم الإنجاز"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>

            {reminder.canSnooze && reminder.snoozeCount < reminder.maxSnooze && (
              <div className="relative group">
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition-colors"
                  title="تأجيل"
                  aria-label="تأجيل"
                >
                  <ClockIcon className="h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-32 bg-popover text-popover-foreground border border-border rounded-lg shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-1">
                  <button
                    type="button"
                    onClick={() => onSnooze(reminder.id, 15)}
                    className="w-full text-right px-2.5 py-1.5 text-xs rounded-md hover:bg-accent transition-colors"
                  >
                    15 دقيقة
                  </button>
                  <button
                    type="button"
                    onClick={() => onSnooze(reminder.id, 60)}
                    className="w-full text-right px-2.5 py-1.5 text-xs rounded-md hover:bg-accent transition-colors"
                  >
                    ساعة واحدة
                  </button>
                  <button
                    type="button"
                    onClick={() => onSnooze(reminder.id, 240)}
                    className="w-full text-right px-2.5 py-1.5 text-xs rounded-md hover:bg-accent transition-colors"
                  >
                    4 ساعات
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => onUpdateStatus(reminder.id, "dismissed")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="تجاهل"
              aria-label="تجاهل"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
