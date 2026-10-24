import { Search, X } from "lucide-react";
import type { CategoryTabItem, StatusFilter } from "./types";

export interface ConversionToolsStudioToolbarProps {
  categoryTabs: CategoryTabItem[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function ConversionToolsStudioToolbar({
  categoryTabs,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  hasActiveFilters,
  onResetFilters,
}: ConversionToolsStudioToolbarProps) {
  return (
    <section className="space-y-3">
      {/* Category Tabs with horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {categoryTabs.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/25"
                  : "border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-extrabold tabular-nums ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input & Status Filter Controls */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="البحث في الأدوات بالاسم أو الفائدة..."
            className="w-full rounded-xl border border-slate-200/90 bg-white py-2 text-xs text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 rtl:pr-9 rtl:pl-8 ltr:pl-9 ltr:pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 rtl:left-2.5 ltr:right-2.5 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Segmented Control */}
          <div className="flex items-center rounded-xl border border-slate-200/90 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => onStatusFilterChange("all")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("active")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === "active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>النشطة</span>
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("inactive")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === "inactive"
                  ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>المعطلة</span>
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
