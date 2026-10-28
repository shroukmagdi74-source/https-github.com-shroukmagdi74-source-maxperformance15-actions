import React from "react";
import {
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  FolderIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { formatDuration } from "./helpers";
import type { TimeEvaluationSummary } from "./types";

interface TimeReportsSummaryCardsProps {
  totalMinutes: number;
  filteredCount: number;
  userCount: number;
  projectCount: number;
  summary?: TimeEvaluationSummary | null;
}

export const TimeReportsSummaryCards: React.FC<TimeReportsSummaryCardsProps> = ({
  totalMinutes,
  filteredCount,
  userCount,
  projectCount,
  summary,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              إجمالي الوقت
            </p>
            <p className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatDuration(totalMinutes)}
            </p>
          </div>
          <ClockIcon className="h-8 w-8 text-indigo-400" />
        </div>
      </div>

      {/* 2. Entries Count */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              عدد السجلات
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {filteredCount}
            </p>
          </div>
          <ChartBarIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* 3. Active Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              المستخدمين النشطين
            </p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 tabular-nums">
              {userCount}
            </p>
          </div>
          <UserGroupIcon className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* 4. Active Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              المشاريع النشطة
            </p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {projectCount}
            </p>
          </div>
          <FolderIcon className="h-8 w-8 text-blue-400" />
        </div>
      </div>

      {/* 5. Estimation Accuracy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              دقة التقدير
            </p>
            <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {summary?.overallAccuracyPct ?? 0}%
            </p>
          </div>
          <ChartBarIcon className="h-8 w-8 text-emerald-400" />
        </div>
      </div>

      {/* 6. Rework Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              إعادة العمل
            </p>
            <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {Math.round(summary?.totalReworkMinutes ?? 0)} د
            </p>
          </div>
          <ArrowPathIcon className="h-8 w-8 text-amber-400" />
        </div>
      </div>
    </div>
  );
};
