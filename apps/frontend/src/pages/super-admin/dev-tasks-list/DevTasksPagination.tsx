import React from "react";
import { Button } from "../../../components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Pagination } from "./types";

interface DevTasksPaginationProps {
  pagination: Pagination;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const DevTasksPagination: React.FC<DevTasksPaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const from = (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="text-xs text-muted-foreground">
          عرض <span className="font-mono tabular-nums">{from}</span> -{" "}
          <span className="font-mono tabular-nums">{to}</span> من{" "}
          <span className="font-mono tabular-nums">{pagination.total}</span>
        </div>
        <select
          value={pagination.limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
        >
          <option value="10">10 / صفحة</option>
          <option value="20">20 / صفحة</option>
          <option value="50">50 / صفحة</option>
          <option value="100">100 / صفحة</option>
        </select>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <span className="px-2 text-xs text-muted-foreground font-mono tabular-nums">
            صفحة {pagination.page} من {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
