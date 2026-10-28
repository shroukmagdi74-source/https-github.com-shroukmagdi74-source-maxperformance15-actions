import React from "react";
import { CheckSquare, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetaTemplateBulkToolbarProps {
  selectedCount: number;
  loading: boolean;
  onClearSelectedRows: () => void;
  onRefresh: () => void;
  onDeleteSelected: () => void;
}

export const MetaTemplateBulkToolbar: React.FC<
  MetaTemplateBulkToolbarProps
> = ({
  selectedCount,
  loading,
  onClearSelectedRows,
  onRefresh,
  onDeleteSelected,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/[0.04] px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <CheckSquare className="size-3.5 text-[color:var(--color-primary)]" />
        <span className="font-medium">
          تم تحديد{" "}
          <span className="tabular-nums font-mono font-bold">
            {selectedCount}
          </span>{" "}
          قالب
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelectedRows}
          className="h-7 rounded-full px-2 text-xs"
        >
          إلغاء التحديد
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-7 rounded-full text-xs"
        >
          <RefreshCw
            className={`size-3 ${loading ? "animate-spin" : ""}`}
          />{" "}
          تحديث المحدد
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-full text-xs text-red-600 hover:text-red-700 dark:text-red-400"
          onClick={onDeleteSelected}
        >
          <Trash2 className="size-3" /> حذف المحدد ({selectedCount})
        </Button>
      </div>
    </div>
  );
};
