import React from "react";
import { FolderIcon } from "@heroicons/react/24/outline";
import type { ProjectTimeStats } from "./types";
import { formatDuration } from "./helpers";

interface TimeReportsProjectsTabProps {
  projectStats: ProjectTimeStats[];
  totalMinutes: number;
}

export const TimeReportsProjectsTab: React.FC<TimeReportsProjectsTabProps> = ({
  projectStats,
  totalMinutes,
}) => {
  if (projectStats.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p>لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projectStats.map((stat, index) => (
        <div
          key={stat.projectId}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="w-8 h-8 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold ml-3 tabular-nums">
                {index + 1}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {stat.projectName}
              </span>
            </div>
            <div className="text-left tabular-nums">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatDuration(stat.totalMinutes)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                ({stat.tasksCount} سجل)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
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
