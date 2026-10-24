import React from "react";
import { NotificationReadFilter } from "./types";

interface NotificationsFilterBarProps {
  filter: NotificationReadFilter;
  onFilterChange: (filter: NotificationReadFilter) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  totalCount: number;
  unreadCount: number;
}

const CATEGORIES = [
  { key: "all", label: "الجميع" },
  { key: "incidents", label: "أعطال النظام" },
  { key: "order", label: "طلبات البيع" },
  { key: "info", label: "معلومات" },
  { key: "warning", label: "تنبيهات" },
  { key: "error", label: "أخطاء" },
  { key: "success", label: "نجاح" },
];

export const NotificationsFilterBar: React.FC<NotificationsFilterBarProps> = ({
  filter,
  onFilterChange,
  typeFilter,
  onTypeFilterChange,
  totalCount,
  unreadCount,
}) => {
  const readCount = Math.max(0, totalCount - unreadCount);

  return (
    <div className="p-2.5 sm:p-3 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      {/* Read Status Filter */}
      <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/40 text-xs shrink-0 self-start">
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            filter === "all"
              ? "bg-card text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          الكل ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("unread")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            filter === "unread"
              ? "bg-card text-primary shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          غير مقروءة ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("read")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            filter === "read"
              ? "bg-card text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          مقروءة ({readCount})
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => onTypeFilterChange(cat.key)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
              typeFilter === cat.key
                ? "bg-foreground text-background font-semibold"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
