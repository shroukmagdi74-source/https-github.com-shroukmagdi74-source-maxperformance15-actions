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

interface EmployeesPromotionFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export const EmployeesPromotionFilterBar: React.FC<
  EmployeesPromotionFilterBarProps
> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث بالاسم، المنصب، أو السبب..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>
      <div className="w-full sm:w-48">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="فلترة بالحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="PENDING">قيد المراجعة</SelectItem>
            <SelectItem value="APPROVED">موافق عليها</SelectItem>
            <SelectItem value="REJECTED">مرفوضة</SelectItem>
            <SelectItem value="COMPLETED">مكتملة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-48">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger>
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="promotionDate">تاريخ الترقية</SelectItem>
            <SelectItem value="employeeName">اسم الموظف</SelectItem>
            <SelectItem value="toPosition">المنصب الجديد</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
