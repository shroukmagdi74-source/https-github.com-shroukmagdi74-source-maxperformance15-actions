import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { SentMessagesStatsData } from "../types";

interface SentMessagesComparisonBannerProps {
  comparison: NonNullable<SentMessagesStatsData["comparison"]>;
}

export function renderTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return (
        <ArrowTrendingUpIcon className="w-5 h-5 business-text-success" />
      );
    case "down":
      return (
        <ArrowTrendingDownIcon className="w-5 h-5 business-text-danger" />
      );
    default:
      return <MinusIcon className="w-5 h-5 business-text-subtle" />;
  }
}

export const SentMessagesComparisonBanner: React.FC<SentMessagesComparisonBannerProps> = ({
  comparison,
}) => {
  const { t } = useTranslation();

  return (
    <div className="business-hero-gradient border business-border-primary-soft rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold business-text-strong mb-4">
        {t("sentMessagesStats.comparisonWithPrevious")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          {renderTrendIcon(comparison.changes.sentTrend)}
          <div>
            <p className="text-sm business-text-muted">
              {t("sentMessagesStats.totalReach")}
            </p>
            <p className="text-2xl font-bold business-text-strong tabular-nums">
              {comparison.changes.sentChange > 0 ? "+" : ""}
              {comparison.changes.sentChange}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
