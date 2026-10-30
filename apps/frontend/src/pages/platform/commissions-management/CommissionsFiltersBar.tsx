import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { CommissionFilters } from "./types";

export interface CommissionsFiltersBarProps {
  filters: CommissionFilters;
  setFilters: React.Dispatch<React.SetStateAction<CommissionFilters>>;
  isDark: boolean;
}

export const CommissionsFiltersBar: React.FC<CommissionsFiltersBarProps> = ({
  filters,
  setFilters,
  isDark,
}) => {
  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow p-4 mb-6`}
    >
      <div className="flex items-center gap-4">
        <FunnelIcon
          className={`h-5 w-5 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <select
          aria-label="تصفية حسب الحالة"
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className={`px-4 py-2 border rounded-lg ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="">جميع الحالات</option>
          <option value="PENDING">معلق</option>
          <option value="CONFIRMED">مؤكد</option>
          <option value="PAID">مدفوع</option>
          <option value="CANCELLED">ملغي</option>
        </select>

        <select
          aria-label="تصفية حسب النوع"
          value={filters.type}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, type: e.target.value }))
          }
          className={`px-4 py-2 border rounded-lg ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="">جميع الأنواع</option>
          <option value="AFFILIATE">مسوق</option>
          <option value="MERCHANT">تاجر</option>
          <option value="PLATFORM">منصة</option>
        </select>
      </div>
    </div>
  );
};
