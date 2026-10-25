import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { StatusFilter, SortBy } from "./types";

interface ShiftsFilterControlsProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
}

export const ShiftsFilterControls: React.FC<ShiftsFilterControlsProps> = ({
  searchInputRef,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={searchInputRef as any}
          placeholder="ابحث عن مناوبة... (/)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(val: any) => onStatusFilterChange(val)}
        >
          <SelectTrigger className="w-full md:w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(val: any) => onSortByChange(val)}
        >
          <SelectTrigger className="w-full md:w-[150px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="startTime">وقت البدء</SelectItem>
            <SelectItem value="employees">عدد الموظفين</SelectItem>
            <SelectItem value="custom">الترتيب المخصص</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
