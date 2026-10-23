import React from "react";
import { Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SectionOption {
  id: string;
  label: string;
  icon?: string;
}

interface MetaTemplateFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  sectionFilter: string;
  onSectionFilterChange: (sec: string) => void;
  sectionFilterOptions: SectionOption[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusFilterCounts: Record<string, number>;
  onClearFilters: () => void;
}

export const MetaTemplateFilterBar: React.FC<MetaTemplateFilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  sectionFilter,
  onSectionFilterChange,
  sectionFilterOptions,
  statusFilter,
  onStatusFilterChange,
  statusFilterCounts,
  onClearFilters,
}) => {
  const statusChips = [
    { id: "ALL", label: "الكل", tone: "default" },
    { id: "PENDING", label: "في الانتظار", tone: "amber" },
    { id: "APPROVED", label: "معتمدة", tone: "emerald" },
    { id: "REJECTED", label: "مرفوضة", tone: "red" },
    { id: "DISABLED", label: "معطلة", tone: "slate" },
    { id: "PAUSED", label: "متوقفة", tone: "blue" },
  ];

  const toneActive: Record<string, string> = {
    default: "bg-[color:var(--color-primary)] text-white",
    amber: "bg-amber-500 text-white",
    emerald: "bg-emerald-500 text-white",
    red: "bg-red-500 text-white",
    slate: "bg-slate-500 text-white",
    blue: "bg-blue-500 text-white",
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== "ALL" ||
    sectionFilter !== "ALL";

  return (
    <div className="space-y-3">
      {/* Search and Section Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="ابحث بالاسم أو ID..."
            aria-label="البحث في القوالب"
            className="h-9 w-56 rounded-full bg-[color:var(--color-muted)] pe-9 ps-3 text-xs"
          />
        </div>
        <span
          id="section-filter-label"
          className="hidden text-xs text-[color:var(--color-muted-foreground)] sm:inline"
        >
          القسم:
        </span>
        <Select
          value={sectionFilter}
          onValueChange={(v) => onSectionFilterChange(v ?? "ALL")}
        >
          <SelectTrigger
            aria-labelledby="section-filter-label"
            className="h-9 w-44 rounded-full bg-[color:var(--color-muted)] text-xs"
          >
            <SelectValue placeholder="كل الأقسام" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الأقسام</SelectItem>
            {sectionFilterOptions.map((sec) => (
              <SelectItem key={sec.id} value={sec.id}>
                {sec.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Chips Row */}
      <div
        role="tablist"
        aria-label="تصفية حسب الحالة"
        className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0"
      >
        {statusChips.map((chip) => {
          const active = statusFilter === chip.id;
          const count = statusFilterCounts[chip.id] ?? 0;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusFilterChange(chip.id)}
              disabled={count === 0 && chip.id !== "ALL"}
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all duration-150 ${
                active
                  ? `${toneActive[chip.tone]} shadow-sm`
                  : "bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/80 disabled:opacity-40"
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums font-mono ${
                  active ? "bg-white/20 text-white" : "bg-[color:var(--color-card)]/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 rounded-full px-2 text-xs text-[color:var(--color-muted-foreground)]"
          >
            <XCircle className="size-3" /> مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
};
