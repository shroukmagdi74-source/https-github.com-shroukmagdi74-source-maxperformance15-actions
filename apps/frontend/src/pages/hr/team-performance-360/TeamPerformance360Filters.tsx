import React from "react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";

interface TeamPerformance360FiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  departments: string[];
}

export const TeamPerformance360Filters: React.FC<
  TeamPerformance360FiltersProps
> = ({
  searchQuery,
  onSearchChange,
  selectedTier,
  onTierChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/50">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث باسم الموظف، الرقم الوظيفي، أو المسمى..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-9 text-xs h-9 bg-background border-border/60"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Tier Filter */}
        <select
          value={selectedTier}
          onChange={(e) => onTierChange(e.target.value)}
          className="h-9 px-3 py-1 bg-background border border-border/50 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">جميع المستويات</option>
          <option value="TIER_S">Tier S (متميز)</option>
          <option value="TIER_A">Tier A (ممتاز)</option>
          <option value="TIER_B">Tier B (مطابق للتوقعات)</option>
          <option value="TIER_C">Tier C (يحتاج تحسين)</option>
          <option value="TIER_D">Tier D (حرج)</option>
          <option value="PENDING">قيد التقييم</option>
          <option value="AT_RISK">في دائرة الخطر فقط</option>
        </select>

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="h-9 px-3 py-1 bg-background border border-border/50 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">جميع الأقسام</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
