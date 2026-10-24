import React from "react";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { UsageStat, resourceNames } from "./types";

interface CompanyUsageTabProps {
  usage: Record<string, UsageStat>;
}

export const CompanyUsageTab: React.FC<CompanyUsageTabProps> = ({ usage }) => {
  const getUsageColor = (stat: UsageStat) => {
    if (stat.exceeded) return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
    if (stat.warning) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
  };

  const getUsageBarColor = (stat: UsageStat) => {
    if (stat.exceeded) return "bg-red-500";
    if (stat.warning) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "غير محدود";
    if (limit >= 1000000) return `${(limit / 1000000).toFixed(1)}م`;
    if (limit >= 1000) return `${(limit / 1000).toFixed(1)}ك`;
    return limit.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        إحصائيات الاستخدام
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(usage).map(([resource, stat]) => (
          <div
            key={resource}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {resourceNames[resource] || resource}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium font-mono tabular-nums ${getUsageColor(
                  stat,
                )}`}
              >
                {stat.unlimited ? "غير محدود" : `${stat.percentage}%`}
              </span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-mono tabular-nums">
                <span>{stat.usage.toLocaleString()}</span>
                <span>{formatLimit(stat.limit)}</span>
              </div>
              {!stat.unlimited && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${getUsageBarColor(stat)}`}
                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>

            {stat.exceeded && (
              <div className="flex items-center text-red-600 dark:text-red-400 text-xs gap-1 mt-1">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                <span>تم تجاوز الحد المسموح</span>
              </div>
            )}
            {stat.warning && !stat.exceeded && (
              <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs gap-1 mt-1">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                <span>قريب من الحد المسموح</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
