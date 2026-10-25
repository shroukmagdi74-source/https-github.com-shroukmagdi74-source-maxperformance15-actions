import { useState, useEffect } from "react";
import api from "../../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../../utils/i18n-toast";
import { EmployeeOption, EmployeeReportData } from "./types";
import { buildEmployeeReportCsv } from "./helpers";

export const useEmployeeReportController = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<EmployeeReportData | null>(null);

  useEffect(() => {
    fetchEmployees();

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split("T")[0] || "");
    setEndDate(lastDay.toISOString().split("T")[0] || "");
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/hr/employees");
      setEmployees(response.data?.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      tToast.error("EmployeeReport.failed_fetch_50e6");
    }
  };

  const fetchReport = async () => {
    if (!selectedEmployee) {
      tToast.error("EmployeeReport.msg_57a7");
      return;
    }

    if (!startDate || !endDate) {
      tToast.error("EmployeeReport.msg_5832");
      return;
    }

    try {
      setLoading(true);
      if (new Date(startDate) > new Date(endDate)) {
        tToast.error("EmployeeReport.msg_8609");
        return;
      }

      const params = new URLSearchParams({
        employeeId: selectedEmployee,
        startDate,
        endDate,
      });

      const response = await api.get(`/hr/reports/employee?${params}`);

      if (response.data?.success) {
        setReport(response.data.report);
      } else {
        toast.error(response.data?.error || "فشل في جلب التقرير");
        setReport(null);
      }
    } catch (error: any) {
      console.error("Error fetching report:", error);
      const errorMsg = error.response?.data?.error || "فشل في جلب التقرير";
      toast.error(errorMsg);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;

    const csvContent = buildEmployeeReportCsv(report);
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employee_report_${report.employee.name}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    tToast.success("EmployeeReport.msg_9b34");
  };

  const handlePrint = () => {
    window.print();
  };

  return {
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
  };
};
