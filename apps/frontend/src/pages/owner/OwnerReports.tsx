import React from "react";
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  OwnerSalesReportSection,
  OwnerTodayAttendanceSection,
  useOwnerReportsController,
} from "./reports";

const OwnerReports: React.FC = () => {
  const {
    navigate,
    activeTab,
    setActiveTab,
    isLoading,
    isExporting,
    reportData,
    todayAttendanceData,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    attendanceStartDate,
    setAttendanceStartDate,
    attendanceEndDate,
    setAttendanceEndDate,
    attendancePreset,
    setAttendancePreset,
    handleRangeSelect,
    handleAttendancePresetChange,
    handleExportSales,
    handleExportAttendance,
  } = useOwnerReportsController();

  if (isLoading) {
    return (
      <div
        className="p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900"
        dir="rtl"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              جاري تحميل البيانات...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              يرجى الانتظار قليلاً
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
      dir="rtl"
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-7 h-7 text-blue-600" />
              التقارير الموحدة
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              تقارير شاملة لجميع شركاتك
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              onClick={
                activeTab === "sales"
                  ? handleExportSales
                  : handleExportAttendance
              }
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowDownTrayIcon className="w-4 h-4" />
              )}
              تصدير
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <button
            onClick={() => setActiveTab("todayAttendance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "todayAttendance"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            حضور اليوم
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "sales"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            تقرير المبيعات
          </button>
        </div>
      </div>

      {activeTab === "todayAttendance" && todayAttendanceData && (
        <OwnerTodayAttendanceSection
          todayAttendanceData={todayAttendanceData}
          attendancePreset={attendancePreset}
          onPresetChange={handleAttendancePresetChange}
          onSetCustomPreset={() => setAttendancePreset("custom")}
          attendanceStartDate={attendanceStartDate}
          onStartDateChange={setAttendanceStartDate}
          attendanceEndDate={attendanceEndDate}
          onEndDateChange={setAttendanceEndDate}
        />
      )}

      {activeTab === "sales" && (
        <OwnerSalesReportSection
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onRangeSelect={handleRangeSelect}
          overview={reportData?.overview}
          companies={reportData?.byCompany || []}
          onNavigateCompanyOrders={(companyId) =>
            navigate(`/my-companies/company/${companyId}/orders`)
          }
        />
      )}
    </div>
  );
};

export default OwnerReports;
