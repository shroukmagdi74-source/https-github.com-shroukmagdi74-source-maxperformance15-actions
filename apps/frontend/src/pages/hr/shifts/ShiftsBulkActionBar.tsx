import React from "react";
import { CheckSquare, Trash2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface ShiftsBulkActionBarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export const ShiftsBulkActionBar: React.FC<ShiftsBulkActionBarProps> = ({
  selectedCount,
  onDeleteSelected,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
          تم تحديد {selectedCount} مناوبة
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs font-bold"
          onClick={onDeleteSelected}
        >
          <Trash2 className="h-3.5 w-3.5 ml-1.5" />
          <span>حذف المحدد</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-xs"
        >
          <X className="h-3.5 w-3.5 ml-1.5" />
          <span>إلغاء التحديد</span>
        </Button>
      </div>
    </div>
  );
};
