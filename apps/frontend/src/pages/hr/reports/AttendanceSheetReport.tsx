import React from "react";
import {
  useAttendanceSheetReportController,
  AttendanceSheetFiltersAndKPIs,
  AttendanceSheetMatrixTable,
} from "./attendance-sheet";

const AttendanceSheetReport: React.FC = () => {
  const {
    loading,
    currentYear,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    search,
    setSearch,
    report,
    filteredEmployees,
    totals,
    attendanceRate,
    fetchReport,
    handleExport,
  } = useAttendanceSheetReportController();

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <AttendanceSheetFiltersAndKPIs
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        currentYear={currentYear}
        hasReport={!loading && !!report}
        attendanceRate={attendanceRate}
        totals={totals}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onRefresh={fetchReport}
        onExport={handleExport}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        report && (
          <AttendanceSheetMatrixTable
            report={report}
            filteredEmployees={filteredEmployees}
            search={search}
            onSearchChange={setSearch}
          />
        )
      )}
    </div>
  );
};

export default AttendanceSheetReport;
