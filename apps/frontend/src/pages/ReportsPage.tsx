import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  ReportsConcernsCard,
  ReportsExportCard,
  ReportsPageHeader,
  ReportsPageSkeleton,
  ReportsPerformanceCard,
  ReportsRecommendationsCard,
  ReportsSummaryCards,
  useReportsPageController,
} from "./reports-page/index";

export type { DailyReport, ReportSummary } from "./reports-page/types";

const ReportsPage: React.FC = () => {
  const {
    summary,
    dailyReport,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    exporting,
    fetchDailyReport,
    exportReport,
  } = useReportsPageController();

  if (loading) {
    return <ReportsPageSkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
      dir="rtl"
    >
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <ReportsPageHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onRefresh={() => fetchDailyReport(selectedDate)}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" />
              <span className="text-red-600 dark:text-red-400 font-medium text-sm">
                {error}
              </span>
            </div>
          </div>
        )}

        {summary && <ReportsSummaryCards summary={summary} />}

        {dailyReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportsPerformanceCard performance={dailyReport.performance} />
            <ReportsRecommendationsCard
              recommendations={dailyReport.recommendations}
            />
          </div>
        )}

        <ReportsExportCard
          exporting={exporting}
          onExport={exportReport}
        />

        {dailyReport && (
          <ReportsConcernsCard
            concerns={dailyReport.executiveSummary.mainConcerns}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
