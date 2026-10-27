import React from "react";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useSentMessagesStats } from "./sent-messages-stats/useSentMessagesStats";
import { SentMessagesHeader } from "./sent-messages-stats/components/SentMessagesHeader";
import { SentMessagesFilters } from "./sent-messages-stats/components/SentMessagesFilters";
import { SentMessagesComparisonBanner } from "./sent-messages-stats/components/SentMessagesComparisonBanner";
import { SentMessagesTabNav } from "./sent-messages-stats/components/SentMessagesTabNav";
import { SentMessagesOverviewTab } from "./sent-messages-stats/components/SentMessagesOverviewTab";
import { SentMessagesComparisonTab } from "./sent-messages-stats/components/SentMessagesComparisonTab";
import { SentMessagesTablesTab } from "./sent-messages-stats/components/SentMessagesTablesTab";
import { SentMessagesEmptyState } from "./sent-messages-stats/components/SentMessagesEmptyState";

const SentMessagesStats: React.FC = () => {
  const {
    t,
    stats,
    loading,
    error,
    lastUpdated,
    period,
    selectedPages,
    setSelectedPages,
    messageStatusFilter,
    setMessageStatusFilter,
    conversationStatusFilter,
    setConversationStatusFilter,
    autoRefresh,
    setAutoRefresh,
    activeTab,
    setActiveTab,
    availablePages,
    fetchStats,
    handleDateChange,
    formatTime,
    pieChartData,
    hourlyChartData,
    dailyTableColumns,
    pageTableColumns,
    dailyTableData,
    pageTableData,
  } = useSentMessagesStats();

  return (
    <div className="min-h-screen business-shell-gradient p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl 2xl:max-w-7xl mx-auto">
        {/* Header */}
        <SentMessagesHeader lastUpdated={lastUpdated} formatTime={formatTime} />

        {/* Filters Section */}
        <SentMessagesFilters
          period={period}
          onDateChange={handleDateChange}
          selectedPages={selectedPages}
          setSelectedPages={setSelectedPages}
          availablePages={availablePages}
          messageStatusFilter={messageStatusFilter}
          setMessageStatusFilter={setMessageStatusFilter}
          conversationStatusFilter={conversationStatusFilter}
          setConversationStatusFilter={setConversationStatusFilter}
          onRefresh={fetchStats}
          loading={loading}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
        />

        {/* Error Message */}
        {error && (
          <div className="business-bg-danger-soft border business-border-danger-soft rounded-xl p-4 mb-6 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 business-text-danger" />
            <div>
              <p className="business-text-danger font-medium">{error}</p>
              <button
                onClick={fetchStats}
                className="text-sm business-text-danger underline mt-1"
              >
                {t("sentMessagesStats.retry")}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !stats && (
          <div className="business-bg-panel rounded-xl shadow-lg p-12 text-center">
            <ArrowPathIcon className="h-12 w-12 animate-spin business-text-primary mx-auto mb-4" />
            <p className="business-text-muted text-lg">
              {t("sentMessagesStats.loadingMessage")}
            </p>
          </div>
        )}

        {/* Stats Content */}
        {!loading && stats && (
          <>
            {/* Comparison Banner */}
            {stats.comparison && (
              <SentMessagesComparisonBanner comparison={stats.comparison} />
            )}

            {/* Tab Navigation */}
            <SentMessagesTabNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <SentMessagesOverviewTab
                stats={stats}
                pieChartData={pieChartData}
              />
            )}

            {/* Comparison Tab */}
            {activeTab === "comparison" && (
              <SentMessagesComparisonTab
                stats={stats}
                hourlyChartData={hourlyChartData}
              />
            )}

            {/* Tables Tab */}
            {activeTab === "tables" && (
              <SentMessagesTablesTab
                dailyTableData={dailyTableData}
                dailyTableColumns={dailyTableColumns}
                pageTableData={pageTableData}
                pageTableColumns={pageTableColumns}
              />
            )}

            {/* Empty State */}
            {stats.summary.messages.totalSent === 0 && (
              <SentMessagesEmptyState />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SentMessagesStats;
