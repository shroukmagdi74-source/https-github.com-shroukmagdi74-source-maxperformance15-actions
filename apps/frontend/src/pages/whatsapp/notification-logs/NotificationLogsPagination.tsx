import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROWS_PER_PAGE_OPTIONS } from './types';

interface NotificationLogsPaginationProps {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newLimit: number) => void;
}

export const NotificationLogsPagination: React.FC<NotificationLogsPaginationProps> = ({
  from,
  to,
  total,
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1">
      <div className="text-xs text-muted-foreground font-mono tabular-nums">
        عرض من {from} إلى {to} من أصل {total} سجل
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(rowsPerPage)}
          onValueChange={(v) => onRowsPerPageChange(Number(v))}
        >
          <SelectTrigger className="h-7 w-[6rem] rounded-lg text-xs font-mono tabular-nums">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)} className="text-xs font-mono tabular-nums">
                {n} لكل صفحة
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="size-3.5 rtl:rotate-180" />
          </Button>
          <span className="min-w-[2.5rem] text-center text-xs font-mono tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="size-3.5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};
