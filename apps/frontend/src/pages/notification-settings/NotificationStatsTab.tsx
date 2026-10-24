import React from "react";
import {
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { type NotificationChannelId } from "@/utils/notificationSettings";
import { type NotificationStats, getChannelName } from "./types";
import { getNotificationChannelIcon } from "./NotificationTypesTab";

interface NotificationStatsTabProps {
  stats: NotificationStats | null;
}

export const NotificationStatsTab: React.FC<NotificationStatsTabProps> = ({
  stats,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-2xs border border-border/60 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <BellIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                إجمالي المرسل
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                {stats?.delivered.total ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-2xs border border-border/60 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                معدل الفتح
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                {Math.round((stats?.engagement.openRate ?? 0) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-2xs border border-border/60 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <ClockIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                وقت الاستجابة
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white font-mono tabular-nums">
                {stats?.engagement.responseTime ?? 0}ث
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-2xs border border-border/60 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <ComputerDesktopIcon className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                القناة المفضلة
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {getChannelName(stats?.preferences.mostUsedChannel || "push")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Distribution */}
      <div className="rounded-2xl bg-white p-6 shadow-2xs border border-border/60 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          توزيع القنوات
        </h2>
        <div className="space-y-3">
          {Object.entries(stats?.delivered.byChannel || {}).map(
            ([channel, count]) => (
              <div
                key={channel}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700/40"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  {getNotificationChannelIcon(channel as NotificationChannelId)}
                  <span>{getChannelName(channel)}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-mono tabular-nums">
                  {count}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="rounded-2xl bg-white p-6 shadow-2xs border border-border/60 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          الاتجاهات الأسبوعية
        </h2>

        {stats?.trends.length ? (
          <div className="space-y-3">
            {stats.trends.map((trend) => (
              <div
                key={trend.period}
                className="flex flex-col gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-gray-700/40 md:flex-row md:items-center md:justify-between"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {trend.period}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-300 font-mono tabular-nums">
                  <span>مرسل: {trend.delivered}</span>
                  <span>مفتوح: {trend.opened}</span>
                  <span>نقرات: {trend.clicked}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
            لا توجد بيانات كافية بعد لعرض اتجاهات الإشعارات.
          </div>
        )}
      </div>
    </div>
  );
};
