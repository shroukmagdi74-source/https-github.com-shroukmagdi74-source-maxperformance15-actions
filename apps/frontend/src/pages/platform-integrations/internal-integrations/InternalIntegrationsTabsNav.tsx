import React from "react";
import { useTranslation } from "react-i18next";
import { InternalTab } from "./types";

export interface InternalIntegrationsTabsNavProps {
  activeTab: InternalTab;
  setActiveTab: (tab: InternalTab) => void;
  connectionsCount: number;
  requestsCount: number;
  consumersCount: number;
}

export const InternalIntegrationsTabsNav: React.FC<InternalIntegrationsTabsNavProps> = ({
  activeTab,
  setActiveTab,
  connectionsCount,
  requestsCount,
  consumersCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
      <button
        onClick={() => setActiveTab("connections")}
        className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
          activeTab === "connections"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {t("platform.k_94")}
        <span className="tabular-nums">{connectionsCount}</span>)
      </button>

      <button
        onClick={() => setActiveTab("requests")}
        className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
          activeTab === "requests"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {t("platform.k_95")}
        <span className="tabular-nums">{requestsCount}</span>)
        {requestsCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <button
        onClick={() => setActiveTab("consumers")}
        className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
          activeTab === "consumers"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {t("platform.k_96")}
        <span className="tabular-nums">{consumersCount}</span>)
      </button>

      <button
        onClick={() => setActiveTab("find")}
        className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
          activeTab === "find"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {t("platform.k_97")}
      </button>
    </div>
  );
};
