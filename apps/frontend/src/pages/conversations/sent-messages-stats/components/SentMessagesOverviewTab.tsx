import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import PieChart from "../../../../components/charts/PieChart";
import BestHourCard from "../../../../components/stats/BestHourCard";
import BestDayCard from "../../../../components/stats/BestDayCard";
import { SentMessagesStatsData } from "../types";

interface SentMessagesOverviewTabProps {
  stats: SentMessagesStatsData;
  pieChartData: Array<{ name: string; value: number }>;
}

export const SentMessagesOverviewTab: React.FC<SentMessagesOverviewTabProps> = ({
  stats,
  pieChartData,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <>
      {/* Messages Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Requests (All Traffic) */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6 border-l-4 business-border-primary-strong transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium business-text-muted mb-1">
                {t("sentMessagesStats.totalRequests")}
              </p>
              <p className="text-2xl font-bold business-text-strong tabular-nums">
                {stats.summary.messages.totalSent.toLocaleString(i18n.language)}
              </p>
            </div>
            <div className="business-bg-primary-soft rounded-full p-3">
              <ArrowPathIcon className="h-6 w-6 business-text-primary" />
            </div>
          </div>
          <p className="text-xs business-text-subtle">
            {t("sentMessagesStats.totalRequestsDesc")}
          </p>
        </div>

        {/* Reached Conversations (Real Reach) */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6 border-l-4 business-border-success-strong transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium business-text-muted mb-1">
                {t("sentMessagesStats.reached")}
              </p>
              <p className="text-2xl font-bold business-text-strong tabular-nums">
                {stats.summary.conversations.reached.toLocaleString(i18n.language)}
              </p>
            </div>
            <div className="business-bg-success-soft rounded-full p-3">
              <UserGroupIcon className="h-6 w-6 business-text-success" />
            </div>
          </div>
          <p className="text-xs business-text-success font-medium">
            {t("sentMessagesStats.reachedDesc")}
          </p>
        </div>

        {/* Ignored Conversations (Noise) */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6 border-l-4 business-border-warning-strong transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium business-text-muted mb-1">
                {t("sentMessagesStats.ignoredConversations")}
              </p>
              <p className="text-2xl font-bold business-text-strong tabular-nums">
                {stats.summary.conversations.ignored.toLocaleString(i18n.language)}
              </p>
            </div>
            <div className="business-bg-warning-soft rounded-full p-3">
              <XCircleIcon className="h-6 w-6 business-text-warning" />
            </div>
          </div>
          <p className="text-xs business-text-warning font-medium">
            {t("sentMessagesStats.ignoredDesc")}
          </p>
        </div>

        {/* Saved vs Ignored Messages (Flow) */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6 border-l-4 business-border-primary-strong transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium business-text-muted mb-1">
                {t("sentMessagesStats.messageQuality")}
              </p>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-lg font-bold business-text-success">
                  {stats.summary.messages.totalSaved.toLocaleString(i18n.language)}
                </span>
                <span className="business-text-subtle">/</span>
                <span className="text-lg font-bold business-text-danger">
                  {stats.summary.messages.totalIgnored.toLocaleString(i18n.language)}
                </span>
              </div>
            </div>
            <div className="business-bg-primary-soft rounded-full p-3">
              <CheckCircleIcon className="h-6 w-6 business-text-primary" />
            </div>
          </div>
          <p className="text-xs business-text-subtle">
            {t("sentMessagesStats.savedRate")}
            <span className="tabular-nums font-medium">
              {stats.summary.messages.savedPercentage}%
            </span>
          </p>
        </div>

        {/* New Conversations */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6 border-l-4 business-border-secondary-strong transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium business-text-muted mb-1">
                {t("sentMessagesStats.newConversations")}
              </p>
              <p className="text-2xl font-bold business-text-strong tabular-nums">
                {stats.summary.conversations.created.toLocaleString(i18n.language)}
              </p>
            </div>
            <div className="business-bg-secondary-soft rounded-full p-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 business-text-secondary" />
            </div>
          </div>
          <p className="text-xs business-text-subtle">
            {t("sentMessagesStats.conversionRate")}
            <span className="tabular-nums font-medium">
              {stats.summary.messages.conversionRate}%
            </span>
          </p>
        </div>
      </div>

      {/* Daily Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold business-text-strong mb-4">
            {t("sentMessagesStats.distributionTitle")}
          </h3>
          <PieChart
            data={pieChartData}
            colors={["#10b981", "#ef4444"]}
            height={300}
          />
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full business-bg-success-solid"></div>
              <span className="business-text-body">
                {t("sentMessagesStats.savedLabel")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full business-bg-danger-solid"></div>
              <span className="business-text-body">
                {t("sentMessagesStats.ignoredLabel")}
              </span>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold business-text-strong mb-4">
            {t("sentMessagesStats.topPages")}
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.pageStats.slice(0, 5).map((page, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 business-bg-soft rounded-lg business-hover-soft transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 business-bg-primary-solid business-text-on-accent rounded-full flex items-center justify-center font-bold tabular-nums">
                    {index + 1}
                  </div>
                  <span className="font-medium business-text-strong">
                    {page.pageName}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold business-text-primary tabular-nums">
                    {page.count.toLocaleString(i18n.language)}
                  </p>
                  {page.percentage && (
                    <p className="text-xs business-text-muted tabular-nums">
                      {page.percentage}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Activity Summary */}
        <div className="business-bg-panel rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold business-text-strong mb-6 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 business-text-warning" />
            {t("sentMessagesStats.peakAnalysis")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BestHourCard stats={stats} />
            <BestDayCard stats={stats} />
          </div>
        </div>
      </div>
    </>
  );
};
