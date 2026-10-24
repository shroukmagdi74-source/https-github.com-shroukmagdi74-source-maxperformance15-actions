import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FiltersState } from "./types";

interface SuperAdminUsersFilterBarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  filters: FiltersState;
  onStatusChange: (status: string) => void;
  filterCount: number;
  onClearFilters: () => void;
}

export const SuperAdminUsersFilterBar: React.FC<SuperAdminUsersFilterBarProps> = ({
  searchInput,
  onSearchInputChange,
  onSearch,
  filters,
  onStatusChange,
  filterCount,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border/60 p-3 sm:p-4">
      <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            id="super-admin-users-search-desktop"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch();
              }
            }}
            placeholder="ابحث بالاسم أو البريد..."
            className="h-8 pr-8 text-xs font-mono"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs font-mono active:scale-[0.98]"
          onClick={onSearch}
        >
          بحث
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Select
          name="super-admin-users-status-filter-desktop"
          value={filters.isActive || null}
          onValueChange={(value) => onStatusChange(value || "")}
        >
          <SelectTrigger aria-label="حالة الحساب" className="h-8 text-xs font-mono min-w-[130px]">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value={null}>كل الحالات</SelectItem>
            <SelectItem value="true">الحسابات النشطة</SelectItem>
            <SelectItem value="false">الحسابات غير النشطة</SelectItem>
          </SelectContent>
        </Select>

        {filterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClearFilters}
            title="مسح الفلاتر"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
