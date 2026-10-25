import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import api from "../../../../services/api";
import { AttendanceSheetData } from "./types";
import { buildAttendanceSheetCsv, calculateAttendanceRate } from "./helpers";

export const useAttendanceSheetReportController = () => {
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [search, setSearch] = useState("");
  const [report, setReport] = useState<AttendanceSheetData | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      const response = await api.get<{ report: AttendanceSheetData }>(
        `/hr/reports/attendance-sheet?${params}`,
      );
      setReport(response.data?.report || null);
    } catch (error) {
      console.error("Error fetching attendance sheet:", error);
      toast.error("حدث خطأ أثناء جلب كشف الحضور الشهري");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = () => {
    if (!report || report.employees.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const csv = buildAttendanceSheetCsv(report);
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-sheet-${selectedYear}-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredEmployees = useMemo(() => {
    if (!report) return [];
    if (!search.trim()) return report.employees;
    const q = search.toLowerCase();
    return report.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.employeeNumber.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    );
  }, [report, search]);

  const totals = report?.totals || {
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
  };
  const attendanceRate = calculateAttendanceRate(totals);

  return {
    loading,
    currentYear: currentDate.getFullYear(),
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
  };
};
