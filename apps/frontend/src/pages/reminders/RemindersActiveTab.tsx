import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";

import { Reminder } from "./types";
import { ReminderCard } from "./ReminderCard";

interface RemindersActiveTabProps {
  reminders: Reminder[];
  onUpdateStatus: (id: string, status: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export const RemindersActiveTab: React.FC<RemindersActiveTabProps> = ({
  reminders,
  onUpdateStatus,
  onSnooze,
}) => {
  if (reminders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-12 text-center bg-card/20">
        <BellIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          لا توجد تذكيرات نشطة
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          جميع التذكيرات مكتملة أو لم يتم جدولة تذكيرات بعد
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onUpdateStatus={onUpdateStatus}
          onSnooze={onSnooze}
        />
      ))}
    </div>
  );
};
