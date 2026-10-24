import React from "react";
import {
  BellIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface RemindersHeaderProps {
  loading: boolean;
  onOpenCreate: () => void;
  onRefresh: () => void;
}

export const RemindersHeader: React.FC<RemindersHeaderProps> = ({
  loading,
  onOpenCreate,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center shrink-0">
          <BellIcon className="size-4.5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              التذكيرات والمتابعة
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-border/80 bg-muted/30">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              تنبيهات نشطة
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            إدارة تنبيهات المهام والمتابعات اليومية مع العملاء
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCreate}
          className="h-8 px-3 rounded-lg text-xs font-mono font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <PlusIcon className="size-3.5" />
          تذكير جديد
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 px-3 rounded-lg text-xs font-mono font-medium border border-border/80 bg-card hover:bg-muted/50 text-foreground transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          <ArrowPathIcon className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>
    </div>
  );
};
