import React from "react";
import CreateCompanyModal from "../../components/CreateCompanyModal";
import {
  useMyCompaniesDashboardController,
  MyCompaniesHeader,
  MyCompaniesOverviewTab,
  MyCompaniesAttendanceTab,
  MyCompaniesReportsTab,
  DashboardSkeleton,
} from "./my-companies-dashboard/index";

const MyCompaniesDashboard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    isExporting,
    dashboardData,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    fetchDashboard,
    handleExport,
    switchToCompany,
    handleSetDefaultCompany,
    goToReports,
  } = useMyCompaniesDashboardController();

  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {error}
      </div>
    );
  }

  const overview = dashboardData?.overview;
  const companies = dashboardData?.byCompany || [];

  return (
    <div
      className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
      dir="rtl"
    >
      <MyCompaniesHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {activeTab === "overview" && overview && (
        <MyCompaniesOverviewTab
          overview={overview}
          companies={companies}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onSwitchCompany={switchToCompany}
          onSetDefaultCompany={handleSetDefaultCompany}
        />
      )}

      {activeTab === "attendance" && (
        <MyCompaniesAttendanceTab
          companies={companies}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      )}

      {activeTab === "reports" && (
        <MyCompaniesReportsTab onGoToReports={goToReports} />
      )}

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchDashboard({ background: true });
        }}
      />
    </div>
  );
};

export default MyCompaniesDashboard;
