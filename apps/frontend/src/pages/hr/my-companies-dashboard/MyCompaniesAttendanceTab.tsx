import React from "react";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CompanyStats } from "./types";
import { getImageUrl } from "./helpers";

interface MyCompaniesAttendanceTabProps {
  companies: CompanyStats[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export const MyCompaniesAttendanceTab: React.FC<
  MyCompaniesAttendanceTabProps
> = ({
  companies,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("ar-EG", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono tabular-nums"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance by Company */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {companies.map((item) => (
          <div
            key={item.company.id}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {item.company.logo ? (
                  <img
                    src={getImageUrl(item.company.logo) || ""}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <BuildingOffice2Icon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {item.company.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                  {item.stats.totalUsers} موظف
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <CheckCircleIcon className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <p className="text-xl font-bold text-gray-800 dark:text-white font-mono tabular-nums">
                  {item.stats.attendance.present}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  حاضر
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <ClockIcon className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                <p className="text-xl font-bold text-gray-800 dark:text-white font-mono tabular-nums">
                  {item.stats.attendance.late}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  متأخر
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <XCircleIcon className="w-5 h-5 mx-auto text-red-600 mb-1" />
                <p className="text-xl font-bold text-gray-800 dark:text-white font-mono tabular-nums">
                  {item.stats.attendance.absent}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  غائب
                </p>
              </div>
            </div>

            {/* Attendance Bar */}
            <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${
                    item.stats.totalUsers > 0
                      ? (item.stats.attendance.present / item.stats.totalUsers) *
                        100
                      : 0
                  }%`,
                }}
                className="bg-green-500 h-full"
              />
              <div
                style={{
                  width: `${
                    item.stats.totalUsers > 0
                      ? (item.stats.attendance.late / item.stats.totalUsers) *
                        100
                      : 0
                  }%`,
                }}
                className="bg-yellow-500 h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
