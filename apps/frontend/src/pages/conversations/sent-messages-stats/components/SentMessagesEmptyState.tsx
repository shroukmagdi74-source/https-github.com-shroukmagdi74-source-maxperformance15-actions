import React from "react";
import { useTranslation } from "react-i18next";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export const SentMessagesEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="business-bg-panel rounded-xl shadow-lg p-12 text-center">
      <ChartBarIcon className="h-16 w-16 business-text-subtle mx-auto mb-4" />
      <p className="business-text-muted text-xl font-medium">
        {t("sentMessagesStats.noMessagesInPeriod")}
      </p>
      <p className="business-text-muted mt-2">
        {t("sentMessagesStats.tryChangingPeriod")}
      </p>
    </div>
  );
};
