import { useState, useEffect } from "react";
import api from "../../../services/api";
import { tToast } from "../../../utils/i18n-toast";
import {
  AttendanceReport,
  LeaveReport,
  PayrollReport,
  WarningReport,
  TrainingReport,
  PerformanceReport,
} from "./types";
import { exportReportToCsv } from "./helpers";

export const useHRReportsController = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");

  // Filters
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Reports data
  const [attendanceReport, setAttendanceReport] =
    useState<AttendanceReport | null>(null);
  const [leaveReport, setLeaveReport] = useState<LeaveReport | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollReport | null>(
    null,
  );
  const [warningReport, setWarningReport] = useState<WarningReport | null>(
    null,
  );
  const [trainingReport, setTrainingReport] = useState<TrainingReport | null>(
    null,
  );
  const [performanceReport, setPerformanceReport] =
    useState<PerformanceReport | null>(null);

  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      if (activeTab === "attendance") {
        const response = await api.get(`/hr/reports/attendance?${params}`);
        setAttendanceReport(response.data?.report || null);
      } else if (activeTab === "leaves") {
        const response = await api.get(`/hr/reports/leaves?${params}`);
        setLeaveReport(response.data?.report || null);
      } else if (activeTab === "payroll") {
        const response = await api.get(`/hr/reports/payroll?${params}`);
        setPayrollReport(response.data?.report || null);
      } else if (activeTab === "warnings") {
        // Mocking for now as requested
        setWarningReport({
          totalWarnings: 12,
          byType: [
            { type: "تأخير", count: 5 },
            { type: "سلوك", count: 3 },
            { type: "أداء", count: 4 },
          ],
          bySeverity: [
            { severity: "منخفضة", count: 6 },
            { severity: "متوسطة", count: 4 },
            { severity: "عالية", count: 2 },
          ],
        });
      } else if (activeTab === "training") {
        setTrainingReport({
          totalTrainings: 8,
          completed: 5,
          inProgress: 3,
          completionRate: 62.5,
          byCategory: [
            { name: "فني", count: 3 },
            { name: "سلامة", count: 2 },
            { name: "إداري", count: 3 },
          ],
        });
      } else if (activeTab === "performance") {
        setPerformanceReport({
          averageRating: 4.2,
          reviewCount: 25,
          distribution: [
            { rating: "ممتاز", count: 8 },
            { rating: "جيد جداً", count: 10 },
            { rating: "جيد", count: 5 },
            { rating: "مقبول", count: 2 },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      // Fallback demo data
      if (activeTab === "attendance") {
        setAttendanceReport({
          totalEmployees: 50,
          presentDays: 1100,
          absentDays: 50,
          lateDays: 75,
          averageWorkHours: 7.5,
          attendanceRate: 92,
          byDepartment: [
            { department: "المبيعات", rate: 95, employees: 15 },
            { department: "التسويق", rate: 90, employees: 10 },
            { department: "التقنية", rate: 88, employees: 12 },
            { department: "الموارد البشرية", rate: 98, employees: 5 },
            { department: "المالية", rate: 94, employees: 8 },
          ],
        });
      } else if (activeTab === "leaves") {
        setLeaveReport({
          totalRequests: 45,
          approved: 35,
          rejected: 5,
          pending: 5,
          totalDaysTaken: 120,
          byType: [
            { type: "سنوية", count: 25, days: 75 },
            { type: "مرضية", count: 12, days: 24 },
            { type: "طارئة", count: 5, days: 10 },
            { type: "أخرى", count: 3, days: 11 },
          ],
        });
      } else if (activeTab === "payroll") {
        setPayrollReport(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportReportToCsv(
      activeTab,
      payrollReport,
      selectedMonth,
      selectedYear,
      tToast,
    );
  };

  return {
    loading,
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    attendanceReport,
    leaveReport,
    payrollReport,
    warningReport,
    trainingReport,
    performanceReport,
    fetchReport,
    handleExport,
  };
};
