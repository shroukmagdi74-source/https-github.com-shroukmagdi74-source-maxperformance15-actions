import React from "react";
import {
  useReportsDashboard,
  ReportsHeader,
  ReportsSummaryCards,
  ReportsTopProducts,
  AvailableReportsGrid,
  RelatedViewsPanel,
  ReportDetailsViewer,
} from "./reports-dashboard";

const Reports: React.FC = () => {
  const {
    t,
    reports,
    selectedReport,
    setSelectedReport,
    dateRange,
    setDateRange,
    loading,
    partialErrors,
    presets,
    activePresetId,
    handleStartDateChange,
    handleEndDateChange,
    fetchReports,
    summaryCards,
    topProducts,
  } = useReportsDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-900">
      <ReportsHeader
        dateRange={dateRange}
        loading={loading}
        presets={presets}
        activePresetId={activePresetId}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onRefresh={fetchReports}
        onSelectPreset={setDateRange}
      />

      <ReportsSummaryCards summaryCards={summaryCards} />

      {partialErrors.length > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {t("reports.partialErrors", {
            reports: partialErrors.join("، "),
          })}
        </div>
      )}

      <ReportsTopProducts topProducts={topProducts} />

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <AvailableReportsGrid
          reports={reports}
          selectedReportId={selectedReport?.id}
          onSelectReport={setSelectedReport}
        />
        <RelatedViewsPanel />
      </div>

      <ReportDetailsViewer selectedReport={selectedReport} />
    </div>
  );
};

export default Reports;
