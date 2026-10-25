import React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  useEmployeeReportController,
  EmployeeReportFilterBar,
  EmployeeReportOverviewSection,
  EmployeeReportRequestsSection,
  EmployeeReportWarningsAndAttendanceTable,
} from "./employee-report/index";

const EmployeeReport: React.FC = () => {
  const {
    loading,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    report,
    fetchReport,
    handleExport,
    handlePrint,
  } = useEmployeeReportController();

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <EmployeeReportFilterBar
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectedEmployeeChange={setSelectedEmployee}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        hasReport={Boolean(report)}
        onFetchReport={fetchReport}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : report ? (
        <>
          <EmployeeReportOverviewSection report={report} />
          <EmployeeReportRequestsSection report={report} />
          <EmployeeReportWarningsAndAttendanceTable report={report} />
        </>
      ) : (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardContent className="p-20">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-20 h-20 mx-auto mb-6 opacity-20" />
              <h3 className="text-xl font-bold dark:text-white">
                جاهز لعرض التقرير
              </h3>
              <p className="mt-2">
                اختر موظف وحدد الفترة الزمنية من القائمة أعلاه
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeReport;
