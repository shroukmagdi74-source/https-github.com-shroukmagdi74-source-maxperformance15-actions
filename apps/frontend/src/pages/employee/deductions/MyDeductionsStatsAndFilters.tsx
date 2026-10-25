import React from "react";
import {
  DollarSign,
  TrendingDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import type { TFunction } from "i18next";
import { formatDeductionCurrency } from "./types";

interface MyDeductionsStatsAndFiltersProps {
  t: TFunction;
  stats: any;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterMonth: string;
  setFilterMonth: (val: string) => void;
  filterYear: string;
  setFilterYear: (val: string) => void;
}

export const MyDeductionsStatsAndFilters: React.FC<
  MyDeductionsStatsAndFiltersProps
> = ({
  t,
  stats,
  filterStatus,
  setFilterStatus,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
}) => {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 ml-3" />
          {t("employee.deductions.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("employee.deductions.subtitle")}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("employee.deductions.totalDeductions")}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("employee.deductions.totalAmount")}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
                  {formatDeductionCurrency(parseFloat(stats.totalAmount))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("employee.deductions.pending")}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
                  {stats.byStatus.find((s: any) => s.status === "PENDING")
                    ?._count || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("employee.deductions.applied")}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
                  {stats.byStatus.find((s: any) => s.status === "APPLIED")
                    ?._count || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("employee.deductions.status")}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t("employee.deductions.all")}</option>
              <option value="PENDING">
                {t("employee.deductions.pendingStatus")}
              </option>
              <option value="APPROVED">
                {t("employee.deductions.approvedStatus")}
              </option>
              <option value="REJECTED">
                {t("employee.deductions.rejectedStatus")}
              </option>
              <option value="APPLIED">
                {t("employee.deductions.appliedStatus")}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("employee.deductions.month")}
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 font-mono tabular-nums text-gray-900 dark:text-white"
            >
              <option value="">{t("employee.deductions.all")}</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("employee.deductions.year")}
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 font-mono tabular-nums text-gray-900 dark:text-white"
            >
              <option value="">{t("employee.deductions.all")}</option>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i,
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
