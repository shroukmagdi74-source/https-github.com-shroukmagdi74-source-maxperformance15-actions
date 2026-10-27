import React from "react";
import { useTranslation } from "react-i18next";
import { ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline";

interface SentMessagesHeaderProps {
  lastUpdated: Date | null;
  formatTime: (date: Date) => string;
}

export const SentMessagesHeader: React.FC<SentMessagesHeaderProps> = ({
  lastUpdated,
  formatTime,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-bold business-text-strong mb-2 flex items-center gap-3">
            <ChartBarIcon className="w-10 h-10 business-text-primary" />
            {t("sentMessagesStats.pageTitle")}
          </h1>
          <p className="business-text-muted">
            {t("sentMessagesStats.pageSubtitleAlt")}
          </p>
        </div>
        {lastUpdated && (
          <div className="text-sm business-text-muted flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            {t("sentMessagesStats.lastUpdate")}
            <span className="tabular-nums">{formatTime(lastUpdated)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
