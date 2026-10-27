import React from "react";
import { Badge } from "../../../../components/ui/badge";

export interface TaskTableHeaderProps {
  loading: boolean;
  searchQuery: string;
  totalCount: number;
  paginatedCount: number;
  selectedCount: number;
  filteredCount: number;
}

export const TaskTableHeader: React.FC<TaskTableHeaderProps> = ({
  loading,
  searchQuery,
  totalCount,
  paginatedCount,
  selectedCount,
  filteredCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-background/40 px-4 py-2.5 md:px-5">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-bold text-foreground">
          قائمة التنفيذ
        </p>
        <p className="text-xs text-muted-foreground">
          {loading
            ? "جاري تحديث القائمة..."
            : searchQuery
              ? `عرض ${totalCount} نتيجة لعبارة "${searchQuery}".`
              : `${totalCount} مهمة في النطاق الحالي، منها ${paginatedCount} في هذه الصفحة.`}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {loading ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] animate-pulse">
            جاري التحميل...
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
            {selectedCount > 0
              ? `${selectedCount} محددة`
              : "جاهزة للتنفيذ"}
          </Badge>
        )}
        {!loading && filteredCount !== totalCount ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
            {filteredCount} بعد التصفية
          </Badge>
        ) : null}
      </div>
    </div>
  );
};
