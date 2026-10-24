import React from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface RemindersTabsProps {
  activeTab: "active" | "completed" | "stats";
  onTabChange: (tab: "active" | "completed" | "stats") => void;
  activeCount: number;
  completedCount: number;
}

export const RemindersTabs: React.FC<RemindersTabsProps> = ({
  activeTab,
  onTabChange,
  activeCount,
  completedCount,
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border/60 rounded-lg w-fit">
      <button
        type="button"
        onClick={() => onTabChange("active")}
        className={`px-3 py-1 rounded-md text-xs font-mono transition-all active:scale-[0.98] ${
          activeTab === "active"
            ? "bg-background text-foreground shadow-2xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ClockIcon className="size-3.5 inline ml-1.5" />
        النشطة ({activeCount})
      </button>
      <button
        type="button"
        onClick={() => onTabChange("completed")}
        className={`px-3 py-1 rounded-md text-xs font-mono transition-all active:scale-[0.98] ${
          activeTab === "completed"
            ? "bg-background text-foreground shadow-2xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <CheckCircleIcon className="size-3.5 inline ml-1.5" />
        المكتملة ({completedCount})
      </button>
      <button
        type="button"
        onClick={() => onTabChange("stats")}
        className={`px-3 py-1 rounded-md text-xs font-mono transition-all active:scale-[0.98] ${
          activeTab === "stats"
            ? "bg-background text-foreground shadow-2xs font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <CalendarIcon className="size-3.5 inline ml-1.5" />
        الإحصائيات
      </button>
    </div>
  );
};
