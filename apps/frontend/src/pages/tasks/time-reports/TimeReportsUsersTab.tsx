import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import type { UserTimeStats } from "./types";
import { formatDuration } from "./helpers";

interface TimeReportsUsersTabProps {
  userStats: UserTimeStats[];
  totalMinutes: number;
}

export const TimeReportsUsersTab: React.FC<TimeReportsUsersTabProps> = ({
  userStats,
  totalMinutes,
}) => {
  if (userStats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p>لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userStats.map((stat, index) => (
        <div
          key={stat.userId}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold ml-3 tabular-nums">
                {index + 1}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {stat.userName}
              </span>
            </div>
            <div className="text-left tabular-nums">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatDuration(stat.totalMinutes)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                ({stat.tasksCount} سجل)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  totalMinutes > 0 ? (stat.totalMinutes / totalMinutes) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
