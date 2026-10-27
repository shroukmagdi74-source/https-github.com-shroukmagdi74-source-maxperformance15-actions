import React from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import DateRangePicker from "../../../../components/filters/DateRangePicker";
import { ConnectedPage } from "../types";

interface SentMessagesFiltersProps {
  period: string;
  onDateChange: (
    startDate: Date | null,
    endDate: Date | null,
    selectedPeriod: string,
  ) => void;
  selectedPages: string[];
  setSelectedPages: React.Dispatch<React.SetStateAction<string[]>>;
  availablePages: ConnectedPage[];
  messageStatusFilter: string;
  setMessageStatusFilter: (val: string) => void;
  conversationStatusFilter: string;
  setConversationStatusFilter: (val: string) => void;
  onRefresh: () => void;
  loading: boolean;
  autoRefresh: boolean;
  setAutoRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SentMessagesFilters: React.FC<SentMessagesFiltersProps> = ({
  period,
  onDateChange,
  selectedPages,
  setSelectedPages,
  availablePages,
  messageStatusFilter,
  setMessageStatusFilter,
  conversationStatusFilter,
  setConversationStatusFilter,
  onRefresh,
  loading,
  autoRefresh,
  setAutoRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="business-bg-panel rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold business-text-strong mb-4 flex items-center gap-2">
        <CalendarDaysIcon className="w-6 h-6 business-text-primary" />
        {t("sentMessagesStats.filters")}
      </h2>

      {/* Date Range Picker */}
      <div className="mb-6">
        <DateRangePicker
          onDateChange={onDateChange}
          initialPeriod={period}
        />
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Page Filter */}
        <div>
          <label className="block text-sm font-medium business-text-body mb-2">
            {t("sentMessagesStats.page")}
          </label>
          <select
            value={selectedPages.length === 1 ? selectedPages[0] : "all"}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedPages(val === "all" ? [] : [val]);
            }}
            className="w-full px-4 py-2 border business-control-border rounded-lg business-bg-panel business-text-strong business-focus-primary"
          >
            <option value="all">{t("sentMessagesStats.allPages")}</option>
            {availablePages.map((page) => (
              <option key={page.pageId} value={page.pageId}>
                {page.pageName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium business-text-body mb-2">
            {t("sentMessagesStats.messageStatus")}
          </label>
          <select
            value={messageStatusFilter}
            onChange={(e) => setMessageStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border business-control-border rounded-lg business-bg-panel business-text-strong business-focus-primary"
          >
            <option value="all">{t("sentMessagesStats.all")}</option>
            <option value="saved">{t("sentMessagesStats.saved")}</option>
            <option value="ignored">{t("sentMessagesStats.ignored")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium business-text-body mb-2">
            {t("sentMessagesStats.conversationStatus")}
          </label>
          <select
            value={conversationStatusFilter}
            onChange={(e) => setConversationStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border business-control-border rounded-lg business-bg-panel business-text-strong business-focus-primary"
          >
            <option value="all">{t("sentMessagesStats.all")}</option>
            <option value="created">{t("sentMessagesStats.new")}</option>
            <option value="existed">{t("sentMessagesStats.existing")}</option>
            <option value="ignored">{t("sentMessagesStats.ignored")}</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 business-bg-primary-solid business-text-on-accent rounded-lg business-hover-primary-solid disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />
            {t("sentMessagesStats.refresh")}
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
              autoRefresh
                ? "business-bg-success-solid business-text-on-accent business-border-success-strong"
                : "business-bg-panel business-text-body business-control-border"
            }`}
            title={
              autoRefresh
                ? t("sentMessagesStats.disableAutoRefresh")
                : t("sentMessagesStats.enableAutoRefresh")
            }
          >
            <ClockIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
