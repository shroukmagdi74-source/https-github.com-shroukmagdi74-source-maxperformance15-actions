import React from "react";
import {
  Award,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
} from "lucide-react";
import { RewardListStatistics, RewardListFilters } from "./types";

interface RewardsListStatsAndFiltersProps {
  statistics: RewardListStatistics | null;
  filters: RewardListFilters;
  showFilters: boolean;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  onUpdateFilters: React.Dispatch<React.SetStateAction<RewardListFilters>>;
}

export const RewardsListStatsAndFilters: React.FC<
  RewardsListStatsAndFiltersProps
> = ({
  statistics,
  filters,
  showFilters,
  onToggleFilters,
  onResetFilters,
  onUpdateFilters,
}) => {
  return (
    <>
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  إجمالي المكافآت
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
                  {statistics.total}
                </p>
              </div>
              <Award className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  القيمة الإجمالية
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="font-mono tabular-nums">
                    {statistics.totalValue.toLocaleString()}
                  </span>{" "}
                  ج.م
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  معتمد
                </p>
                <p className="text-2xl font-bold text-green-600 font-mono tabular-nums">
                  {statistics.byStatus.find((s) => s.status === "APPROVED")
                    ?.count || 0}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  قيد الانتظار
                </p>
                <p className="text-2xl font-bold text-yellow-600 font-mono tabular-nums">
                  {statistics.byStatus.find((s) => s.status === "PENDING")
                    ?.count || 0}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter className="w-5 h-5" />
            الفلاتر
          </button>
          <button
            onClick={onResetFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            إعادة تعيين
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                بحث
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    onUpdateFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  placeholder="ابحث..."
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الحالة
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  onUpdateFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">الكل</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="APPROVED">معتمد</option>
                <option value="APPLIED">مطبق</option>
                <option value="REJECTED">مرفوض</option>
                <option value="VOIDED">ملغي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                التصنيف
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  onUpdateFilters((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">الكل</option>
                <option value="ATTENDANCE">حضور</option>
                <option value="PERFORMANCE">أداء</option>
                <option value="ACHIEVEMENT">إنجاز</option>
                <option value="SEASONAL">موسمية</option>
                <option value="TEAM_BASED">فريق</option>
                <option value="COMPANY_WIDE">عامة</option>
                <option value="OTHER">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                السنة
              </label>
              <select
                value={filters.year}
                onChange={(e) =>
                  onUpdateFilters((prev) => ({ ...prev, year: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tabular-nums"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
