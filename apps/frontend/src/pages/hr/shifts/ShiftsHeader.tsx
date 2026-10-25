import React from "react";
import { Clock, Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { ViewMode } from "./types";

interface ShiftsHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateNew: () => void;
}

export const ShiftsHeader: React.FC<ShiftsHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onCreateNew,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          المناوبات
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1 text-sm">
          <Clock className="h-4 w-4 text-purple-500 shrink-0" />
          <span>إدارة مناوبات العمل وجداول الموظفين</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={
              viewMode === "grid"
                ? "shadow-sm bg-white dark:bg-gray-700 font-bold text-xs"
                : "text-xs"
            }
          >
            <LayoutGrid className="h-3.5 w-3.5 ml-1.5" />
            <span>شبكة</span>
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className={
              viewMode === "table"
                ? "shadow-sm bg-white dark:bg-gray-700 font-bold text-xs"
                : "text-xs"
            }
          >
            <TableIcon className="h-3.5 w-3.5 ml-1.5" />
            <span>جدول</span>
          </Button>
        </div>

        <Button
          type="button"
          onClick={onCreateNew}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <Plus className="h-4 w-4 ml-1.5" />
          <span>مناوبة جديدة</span>
        </Button>
      </div>
    </div>
  );
};
