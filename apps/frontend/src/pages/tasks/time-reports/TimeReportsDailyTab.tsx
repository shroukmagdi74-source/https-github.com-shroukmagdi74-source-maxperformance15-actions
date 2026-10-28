import React from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import type { DailyStats } from "./types";
import { formatDate, formatDuration } from "./helpers";

interface TimeReportsDailyTabProps {
  dailyStats: DailyStats[];
}

export const TimeReportsDailyTab: React.FC<TimeReportsDailyTabProps> = ({
  dailyStats,
}) => {
  if (dailyStats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p>لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dailyStats.map((stat) => (
        <div
          key={stat.date}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 ml-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                {formatDate(stat.date)}
              </span>
            </div>
            <div className="text-left tabular-nums">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatDuration(stat.totalMinutes)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                ({stat.entriesCount} سجل)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((stat.totalMinutes / 480) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left tabular-nums">
            {stat.totalMinutes >= 480
              ? "8+ ساعات"
              : `${((stat.totalMinutes / 480) * 100).toFixed(0)}% من يوم العمل`}
          </div>
        </div>
      ))}
    </div>
  );
};
