import React from "react";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { X } from "lucide-react";

interface AssignShiftFiltersProps {
  departments: string[];
  positions: string[];
  departmentFilter: string;
  onDepartmentFilterChange: (dept: string) => void;
  positionFilter: string;
  onPositionFilterChange: (pos: string) => void;
  onClearFilters: () => void;
}

export const AssignShiftFilters: React.FC<AssignShiftFiltersProps> = ({
  departments,
  positions,
  departmentFilter,
  onDepartmentFilterChange,
  positionFilter,
  onPositionFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">القسم</Label>
        <Select
          value={departmentFilter}
          onValueChange={onDepartmentFilterChange}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="كل الأقسام" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأقسام</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept || ""} value={dept || ""}>
                {dept || ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">المنصب</Label>
        <Select
          value={positionFilter}
          onValueChange={onPositionFilterChange}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="كل المناصب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المناصب</SelectItem>
            {positions.map((pos) => (
              <SelectItem key={pos || ""} value={pos || ""}>
                {pos || ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(departmentFilter !== "all" || positionFilter !== "all") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="mt-5"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
