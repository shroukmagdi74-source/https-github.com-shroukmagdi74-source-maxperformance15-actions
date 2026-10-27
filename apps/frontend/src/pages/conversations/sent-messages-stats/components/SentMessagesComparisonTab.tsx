import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowTrendingUpIcon, ClockIcon } from "@heroicons/react/24/outline";
import BarChart from "../../../../components/charts/BarChart";
import { SentMessagesStatsData } from "../types";
import { renderTrendIcon } from "./SentMessagesComparisonBanner";

interface SentMessagesComparisonTabProps {
  stats: SentMessagesStatsData;
  hourlyChartData: Array<{
    hour: string;
    count: number;
    saved: number;
    ignored: number;
    revenue: number;
  }>;
}

export const SentMessagesComparisonTab: React.FC<SentMessagesComparisonTabProps> = ({
  stats,
  hourlyChartData,
}) => {
  const { t, i18n } = useTranslation();

  const bestHour =
    [...(stats.hourlyStats || [])].sort(
      (a, b) => (b.revenue || 0) - (a.revenue || 0),
    )[0]?.hour || 0;

  const bestDayName =
    [...(stats.weekdayStats || [])].sort((a, b) => b.count - a.count)[0]?.dayName;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="business-bg-panel rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold business-text-strong mb-6 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-6 h-6 business-text-secondary" />
          {t("sentMessagesStats.detailedPerformanceComparison")}
        </h3>

        {stats.comparison ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 business-bg-primary-soft rounded-xl border business-border-primary-soft">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium business-text-primary">
                  {t("sentMessagesStats.sentMessages")}
                </p>
                {renderTrendIcon(stats.comparison.changes.sentTrend)}
              </div>
              <p className="text-3xl font-bold business-text-primary tabular-nums">
                {stats.summary.messages.totalSent.toLocaleString(i18n.language)}
              </p>
              <p className="text-sm business-text-primary mt-1 tabular-nums">
                {stats.comparison.changes.sentChange > 0 ? "+" : ""}
                {stats.comparison.changes.sentChange}% {t("sentMessagesStats.comparedToPrevious")}
              </p>
            </div>

            <div className="p-6 business-bg-secondary-soft rounded-xl border business-border-secondary-soft">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium business-text-secondary">
                  {t("sentMessagesStats.saveRate")}
                </p>
                {renderTrendIcon(stats.comparison.changes.savedTrend)}
              </div>
              <p className="text-3xl font-bold business-text-secondary tabular-nums">
                {stats.summary.messages.savedPercentage}%
              </p>
              <p className="text-sm business-text-secondary mt-1 tabular-nums">
                {stats.comparison.changes.savedChange > 0 ? "+" : ""}
                {stats.comparison.changes.savedChange}% {t("sentMessagesStats.comparedToPrevious")}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center business-text-muted">
            {t("sentMessagesStats.noComparisonData")}
          </div>
        )}

        {/* Dual Period Visualization (Peak Analysis) */}
        <div className="mt-8 border-t business-border pt-8">
          <h4 className="text-lg font-medium business-text-strong mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 business-text-warning" />
            {t("sentMessagesStats.peakHoursAnalysis")}
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[300px]">
              <p className="text-sm business-text-muted mb-4 text-center">
                {t("sentMessagesStats.hourlyDistribution")}
              </p>
              <BarChart
                data={hourlyChartData}
                xKey="hour"
                bars={[
                  {
                    key: "count",
                    name: t("sentMessagesStats.messagesLabel"),
                    color: "#6366f1",
                  },
                  {
                    key: "saved",
                    name: t("sentMessagesStats.savedChart"),
                    color: "#10b981",
                  },
                ]}
                height={250}
              />
            </div>
            <div className="business-bg-soft rounded-xl p-6">
              <h5 className="font-semibold business-text-strong mb-4">
                {t("sentMessagesStats.smartInsights")}
              </h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full business-bg-primary-solid mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium business-text-strong">
                      {t("sentMessagesStats.bestTimeToSend")}
                    </p>
                    <p className="text-xs business-text-muted">
                      {t("sentMessagesStats.atHour")}{" "}
                      <span className="tabular-nums font-semibold">{bestHour}:00</span>{" "}
                      {t("sentMessagesStats.highestRevenue")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full business-bg-success-solid mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium business-text-strong">
                      {t("sentMessagesStats.mostEffectiveDay")}
                    </p>
                    <p className="text-xs business-text-muted">
                      {t("sentMessagesStats.day")}{" "}
                      <span className="font-semibold">{bestDayName}</span>{" "}
                      {t("sentMessagesStats.highestInteraction")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full business-bg-warning-solid mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium business-text-strong">
                      {t("sentMessagesStats.performanceTip")}
                    </p>
                    <p className="text-xs business-text-muted">
                      {t("sentMessagesStats.distributionAdvice")}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
