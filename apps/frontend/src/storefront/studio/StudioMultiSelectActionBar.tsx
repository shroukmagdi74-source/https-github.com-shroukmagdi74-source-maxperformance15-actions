import React from "react";
import {
  EyeSlashIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  XMarkIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
} from "@heroicons/react/24/outline";

interface StudioMultiSelectActionBarProps {
  selectedCount: number;
  onHide: () => void;
  onLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAlign?: (alignment: "left" | "center" | "right") => void;
  onClear: () => void;
}

export const StudioMultiSelectActionBar: React.FC<StudioMultiSelectActionBarProps> = ({
  selectedCount,
  onHide,
  onLock,
  onDuplicate,
  onDelete,
  onAlign,
  onClear,
}) => {
  if (selectedCount <= 1) return null;

  return (
    <div
      role="toolbar"
      aria-label="شريط العمليات الجماعية"
      data-testid="studio-multi-select-bar"
      className="fixed bottom-12 start-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-2xl border border-[#373b45] bg-[#1a1c22]/98 px-3.5 py-2 text-xs text-[#e8eaee] shadow-2xl backdrop-blur-md ring-1 ring-black/40 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      {/* Counter Badge */}
      <div className="flex items-center gap-1.5 pe-2 border-e border-[#2d3139]">
        <span
          data-testid="multi-select-count"
          className="rounded-lg bg-[#2b6cf6]/20 px-2 py-0.5 font-bold text-[#60a5fa] text-[11px]"
        >
          {selectedCount} محدد
        </span>
      </div>

      {/* Bulk Hide */}
      <button
        type="button"
        data-testid="bulk-hide-btn"
        onClick={onHide}
        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[#c3c7cd] hover:bg-[#252830] hover:text-white transition-colors text-[11px]"
        title="إخفاء / إظهار الأقسام المحددة"
      >
        <EyeSlashIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">إخفاء</span>
      </button>

      {/* Bulk Lock */}
      <button
        type="button"
        data-testid="bulk-lock-btn"
        onClick={onLock}
        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[#c3c7cd] hover:bg-[#252830] hover:text-white transition-colors text-[11px]"
        title="قفل / فك قفل الأقسام المحددة"
      >
        <LockClosedIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">قفل</span>
      </button>

      {/* Bulk Duplicate */}
      <button
        type="button"
        data-testid="bulk-duplicate-btn"
        onClick={onDuplicate}
        className="flex h-7 items-center gap-1 rounded-lg px-2 text-[#c3c7cd] hover:bg-[#252830] hover:text-white transition-colors text-[11px]"
        title="تكرار الأقسام المحددة"
      >
        <DocumentDuplicateIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">تكرار</span>
      </button>

      {/* Bulk Alignments */}
      {onAlign && (
        <div className="flex items-center gap-0.5 px-1 border-x border-[#2d3139]">
          <button
            type="button"
            data-testid="bulk-align-right-btn"
            onClick={() => onAlign("right")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ba0a8] hover:bg-[#252830] hover:text-white transition-colors"
            title="محاذاة لليمين"
          >
            <Bars3BottomRightIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="bulk-align-center-btn"
            onClick={() => onAlign("center")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ba0a8] hover:bg-[#252830] hover:text-white transition-colors"
            title="محاذاة للوسط"
          >
            <Bars3Icon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            data-testid="bulk-align-left-btn"
            onClick={() => onAlign("left")}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ba0a8] hover:bg-[#252830] hover:text-white transition-colors"
            title="محاذاة لليسار"
          >
            <Bars3BottomLeftIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bulk Delete */}
      <button
        type="button"
        data-testid="bulk-delete-btn"
        onClick={onDelete}
        className="flex h-7 items-center gap-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 px-2.5 transition-colors text-[11px] font-semibold"
        title="حذف جميع الأقسام المحددة"
      >
        <TrashIcon className="h-3.5 w-3.5" />
        <span>حذف ({selectedCount})</span>
      </button>

      {/* Clear Selection */}
      <button
        type="button"
        data-testid="bulk-clear-btn"
        onClick={onClear}
        className="ms-1 flex h-7 w-7 items-center justify-center rounded-lg text-[#808791] hover:bg-[#252830] hover:text-white transition-colors"
        title="إلغاء التحديد (Esc)"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
