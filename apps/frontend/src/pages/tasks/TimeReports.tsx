import React from "react";
import { TaskUnifiedFilterBar } from "../../components/tasks/TaskUnifiedFilterBar";
import {
  useTimeReports,
  TimeReportsHeader,
  TimeReportsSummaryCards,
  TimeReportsTabsNav,
  TimeReportsEntriesTab,
  TimeReportsEvaluationTab,
  TimeReportsUsersTab,
  TimeReportsProjectsTab,
  TimeReportsDailyTab,
} from "./time-reports";

const TimeReports: React.FC = () => {
  const {
    unifiedFilters,
    setUnifiedFilters,
    timeEntries,
    timeEvaluation,
    loading,
    activeTab,
    setActiveTab,
    users,
    handleRefresh,
    filteredTimeEntries,
    totalMinutes,
    userStats,
    projectStats,
    dailyStats,
    handleExportCSV,
  } = useTimeReports();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <TimeReportsHeader onExportCSV={handleExportCSV} />

      {/* Unified Filters Bar */}
      <TaskUnifiedFilterBar
        filters={unifiedFilters}
        onFiltersChange={setUnifiedFilters}
        users={users}
        onRefresh={handleRefresh}
        isLoading={loading}
        totalCount={timeEntries.length}
        filteredCount={filteredTimeEntries.length}
        className="mb-6"
      />

      {/* Summary Cards */}
      <TimeReportsSummaryCards
        totalMinutes={totalMinutes}
        filteredCount={filteredTimeEntries.length}
        userCount={userStats.length}
        projectCount={projectStats.length}
        summary={timeEvaluation?.summary}
      />

      {/* Tabs Chassis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <TimeReportsTabsNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === "entries" && (
            <TimeReportsEntriesTab entries={filteredTimeEntries} />
          )}

          {activeTab === "evaluation" && (
            <TimeReportsEvaluationTab
              summary={timeEvaluation?.summary}
              tasks={timeEvaluation?.tasks}
            />
          )}

          {activeTab === "users" && (
            <TimeReportsUsersTab
              userStats={userStats}
              totalMinutes={totalMinutes}
            />
          )}

          {activeTab === "projects" && (
            <TimeReportsProjectsTab
              projectStats={projectStats}
              totalMinutes={totalMinutes}
            />
          )}

          {activeTab === "daily" && (
            <TimeReportsDailyTab dailyStats={dailyStats} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeReports;
export * from "./time-reports";
