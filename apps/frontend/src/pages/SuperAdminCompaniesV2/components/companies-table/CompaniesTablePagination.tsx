import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";

interface CompaniesTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const CompaniesTablePagination: React.FC<CompaniesTablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-white p-2.5 shadow-2xs dark:bg-card md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground/70">
        <span className="rounded-md bg-muted/40 px-2.5 py-1">
          صفحة <span className="tabular-nums">{currentPage}</span> من{" "}
          <span className="tabular-nums">{totalPages}</span>
        </span>
        <span className="hidden md:inline">
          — إجمالي <span className="tabular-nums">{totalItems}</span> شركة
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 md:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-black border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronRight className="ml-1 size-3.5" /> السابق
        </Button>
        <div className="flex items-center gap-1">
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let page = i + 1;
            if (totalPages > 5) {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              page = start + i;
            }
            return (
              <Button
                key={page}
                type="button"
                aria-label={`فتح صفحة ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                variant={page === currentPage ? "default" : "outline"}
                size="icon-sm"
                className={cn(
                  "h-8 min-w-8 rounded-lg text-xs font-black transition-all tabular-nums",
                  page === currentPage
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5",
                )}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-black border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          التالي <ChevronLeft className="mr-1 size-3.5" />
        </Button>
      </div>
    </div>
  );
};
