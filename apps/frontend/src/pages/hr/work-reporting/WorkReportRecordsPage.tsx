import React from "react";
import {
  useWorkReportRecordsController,
  WorkReportRecordsHeaderAndCharts,
  WorkReportRecordsTablesSection,
} from "./records";

const WorkReportRecordsPage: React.FC = () => {
  const {
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedUserId,
    setSelectedUserId,
    payload,
    fetchRecords,
    visibleFields,
    primaryMetric,
    secondaryMetric,
    chartData,
    employeeChartData,
    exportCsv,
  } = useWorkReportRecordsController();

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 px-4 py-10 text-center text-slate-500 dark:bg-slate-950 dark:text-slate-400"
        dir="rtl"
      >
        جاري تحميل السجلات والتحليل...
      </div>
    );
  }

  if (!payload) {
    return (
      <div
        className="min-h-screen bg-slate-50 px-4 py-10 text-center text-slate-500 dark:bg-slate-950 dark:text-slate-400"
        dir="rtl"
      >
        لا توجد بيانات للعرض.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <WorkReportRecordsHeaderAndCharts
          payload={payload}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          selectedUserId={selectedUserId}
          onSelectedUserIdChange={setSelectedUserId}
          onRefresh={() => void fetchRecords()}
          onExportCsv={exportCsv}
          chartData={chartData}
          employeeChartData={employeeChartData}
          primaryMetric={primaryMetric}
          secondaryMetric={secondaryMetric}
        />

        <WorkReportRecordsTablesSection
          payload={payload}
          visibleFields={visibleFields}
        />
      </div>
    </div>
  );
};

export default WorkReportRecordsPage;
