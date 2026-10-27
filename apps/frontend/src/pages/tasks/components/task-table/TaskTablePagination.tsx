import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

export const buildPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  }

  return pages;
};

export interface TaskTablePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export const TaskTablePagination: React.FC<TaskTablePaginationProps> = ({
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const [jumpPage, setJumpPage] = useState("");

  if (totalPages <= 1) return null;
  const pages = buildPageNumbers(currentPage, totalPages);

  const handleJumpToPage = () => {
    const page = parseInt(jumpPage, 10);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpPage("");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-3 py-2.5 md:px-4 relative z-20 pb-4">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          صفحة <span className="tabular-nums font-semibold text-foreground">{currentPage}</span> من{" "}
          <span className="tabular-nums font-semibold text-foreground">{totalPages}</span>
        </p>
        <div className="hidden items-center gap-1.5 sm:flex">
          <Input
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleJumpToPage()}
            placeholder="رقم"
            className="h-7 w-14 rounded-lg text-center text-xs tabular-nums"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-2 text-[11px]"
            onClick={handleJumpToPage}
            disabled={!jumpPage}
          >
            انتقال
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 relative z-20">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          title="الصفحة الأولى"
        >
          <ChevronLeftIcon className="size-4 rotate-180" />
          <span className="sr-only">الأولى</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          title="الصفحة السابقة"
        >
          <ChevronLeftIcon className="size-4" />
          <span className="sr-only">السابق</span>
        </Button>

        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="flex size-8 items-center justify-center text-xs text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              size="icon"
              variant={currentPage === page ? "default" : "outline"}
              className="size-8 rounded-full text-xs tabular-nums"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="الصفحة التالية"
        >
          <ChevronRightIcon className="size-4" />
          <span className="sr-only">التالي</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          title="الصفحة الأخيرة"
        >
          <ChevronLeftIcon className="size-4" />
          <span className="sr-only">الأخيرة</span>
        </Button>
      </div>
    </div>
  );
};
