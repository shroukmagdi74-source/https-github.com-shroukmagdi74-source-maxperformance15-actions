import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { Reminder } from "./types";
import { CompletedReminderCard } from "./CompletedReminderCard";

interface RemindersCompletedTabProps {
  reminders: Reminder[];
}

export const RemindersCompletedTab: React.FC<RemindersCompletedTabProps> = ({
  reminders,
}) => {
  if (reminders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-12 text-center bg-card/20">
        <CheckCircleIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          لا توجد تذكيرات مكتملة
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <CompletedReminderCard key={reminder.id} reminder={reminder} />
      ))}
    </div>
  );
};
