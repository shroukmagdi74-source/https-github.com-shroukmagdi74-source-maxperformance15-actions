import React from 'react';
import { Eye, FileText, LayoutTemplate, Menu, Search } from 'lucide-react';
import { PAGE_TYPE_CONFIG } from './pageTypeConfig';

interface StorePagesMetricsProps {
  metrics: {
    total: number;
    active: number;
    inFooter: number;
    inMenu: number;
  };
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: string;
  onFilterTypeChange: (val: string) => void;
  translate: (key: string) => string;
}

export const StorePagesMetrics: React.FC<StorePagesMetricsProps> = ({
  metrics,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  translate,
}) => {
  return (
    <div className="border-b border-border/50 bg-card/40 px-4 py-3.5 md:px-6">
      {/* Metric chips */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3 mb-3.5">
        <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <FileText className="size-3.5 text-primary" />
            <span>إجمالي الصفحات</span>
          </div>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums text-foreground">
            {metrics.total}
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Eye className="size-3.5 text-emerald-500" />
            <span>الصفحات النشطة</span>
          </div>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {metrics.active}
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <LayoutTemplate className="size-3.5 text-indigo-500" />
            <span>ظاهرة في الفوتر</span>
          </div>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums text-foreground">
            {metrics.inFooter}
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-background/60 p-2.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Menu className="size-3.5 text-amber-500" />
            <span>ظاهرة في القائمة</span>
          </div>
          <div className="mt-1 text-lg font-bold font-mono tabular-nums text-foreground">
            {metrics.inMenu}
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث بالاسم أو الرابط..."
            className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-9 pr-3 text-xs md:text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rtl:pl-3 rtl:pr-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary/50"
          >
            <option value="ALL">جميع أنواع الصفحات</option>
            {Object.entries(PAGE_TYPE_CONFIG).map(([key, meta]) => (
              <option key={key} value={key}>
                {translate(`storePages.${meta.labelKey}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
