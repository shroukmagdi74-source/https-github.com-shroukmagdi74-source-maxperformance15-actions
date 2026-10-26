import React from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  TASK_TYPES,
  TASK_STATUSES,
  PRIORITY_CONFIG,
} from "../../../constants/taskConstants";
import { DevTasksFilters } from "./types";

interface DevTasksFilterBarProps {
  filters: DevTasksFilters;
  setFilters: React.Dispatch<React.SetStateAction<DevTasksFilters>>;
  settings: any;
  hideCompleted: boolean;
  setHideCompleted: (value: boolean) => void;
  showMyTasksOnly: boolean;
  setShowMyTasksOnly: (value: boolean) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleFilterChange: (key: string, value: string) => void;
  clearFilters: () => void;
  onOpenSidebar: () => void;
}

export const DevTasksFilterBar: React.FC<DevTasksFilterBarProps> = ({
  filters,
  setFilters,
  settings,
  hideCompleted,
  setHideCompleted,
  showMyTasksOnly,
  setShowMyTasksOnly,
  handleSearch,
  handleFilterChange,
  clearFilters,
  onOpenSidebar,
}) => {
  const statusOptions =
    settings?.taskStatuses ||
    Object.entries(TASK_STATUSES).map(([key, value]) => ({
      value: key,
      ...value,
    }));

  const priorityOptions =
    settings?.taskPriorities ||
    Object.entries(PRIORITY_CONFIG).map(([key, value]) => ({
      value: key,
      ...value,
    }));

  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.type || filters.search,
  );

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="بحث في المهام بالاسم، الوصف، أو الرقم..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full h-8 rounded-lg border border-border bg-background py-1.5 pr-9 pl-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="h-8 border border-border rounded-lg px-2.5 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">كل الحالات</option>
          {statusOptions.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
          className="h-8 border border-border rounded-lg px-2.5 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">كل الأولويات</option>
          {priorityOptions.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="h-8 border border-border rounded-lg px-2.5 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">كل الأنواع</option>
          {Object.entries(TASK_TYPES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Hide Completed Toggle */}
        <label className="flex items-center gap-1.5 h-8 px-3 border border-border rounded-lg hover:bg-muted/40 bg-background text-foreground text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="rounded size-3.5 border-border text-primary focus:ring-primary"
          />
          <span>إخفاء المكتملة</span>
        </label>

        {/* My Tasks Only Toggle */}
        <label className="flex items-center gap-1.5 h-8 px-3 border border-border rounded-lg hover:bg-muted/40 bg-background text-foreground text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showMyTasksOnly}
            onChange={(e) => setShowMyTasksOnly(e.target.checked)}
            className="rounded size-3.5 border-border text-primary focus:ring-primary"
          />
          <span className="font-medium">مهامي فقط</span>
        </label>

        {/* Advanced Filters Button */}
        <button
          onClick={onOpenSidebar}
          className="flex items-center gap-2 h-8 px-3 border border-border rounded-lg hover:bg-muted/40 bg-card text-foreground text-xs font-medium transition-colors"
        >
          <FunnelIcon className="size-3.5 text-muted-foreground" />
          فلاتر متقدمة
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            مسح الفلاتر
          </button>
        )}
      </div>
    </div>
  );
};
