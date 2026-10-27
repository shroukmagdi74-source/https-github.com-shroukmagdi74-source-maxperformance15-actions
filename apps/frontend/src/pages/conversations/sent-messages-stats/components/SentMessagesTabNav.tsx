import React from "react";
import { useTranslation } from "react-i18next";
import { SentMessagesTab } from "../types";

interface SentMessagesTabNavProps {
  activeTab: SentMessagesTab;
  onSelectTab: (tab: SentMessagesTab) => void;
}

export const SentMessagesTabNav: React.FC<SentMessagesTabNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useTranslation();

  return (
    <div className="business-bg-panel rounded-xl shadow-lg mb-6">
      <div className="border-b business-border">
        <nav className="flex -mb-px">
          <button
            onClick={() => onSelectTab("overview")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "business-border-primary-strong business-text-primary"
                : "business-border-clear business-text-muted business-hover-muted business-control-border"
            }`}
          >
            {t("sentMessagesStats.overview")}
          </button>
          <button
            onClick={() => onSelectTab("comparison")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "comparison"
                ? "business-border-primary-strong business-text-primary"
                : "business-border-clear business-text-muted business-hover-muted business-control-border"
            }`}
          >
            {t("sentMessagesStats.detailedComparison")}
          </button>
          <button
            onClick={() => onSelectTab("tables")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "tables"
                ? "business-border-primary-strong business-text-primary"
                : "business-border-clear business-text-muted business-hover-muted business-control-border"
            }`}
          >
            {t("sentMessagesStats.tables")}
          </button>
        </nav>
      </div>
    </div>
  );
};
