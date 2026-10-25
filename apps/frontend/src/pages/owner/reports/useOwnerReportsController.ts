import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import i18n from "../../../i18n";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import { SalesReportData, TodayAttendanceData } from "./types";
import {
  computeAttendancePresetRange,
  computeSalesDateRange,
  downloadSalesReportCsv,
  downloadTodayAttendanceCsv,
} from "./helpers";

export const useOwnerReportsController = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sales" | "todayAttendance">(
    "todayAttendance",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [todayAttendanceData, setTodayAttendanceData] =
    useState<TodayAttendanceData | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const [attendanceStartDate, setAttendanceStartDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [attendanceEndDate, setAttendanceEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [attendancePreset, setAttendancePreset] = useState<string>("today");

  const handleRangeSelect = (range: string) => {
    const next = computeSalesDateRange(range);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
  };

  const handleAttendancePresetChange = (preset: string) => {
    setAttendancePreset(preset);
    const next = computeAttendancePresetRange(preset);
    if (next) {
      setAttendanceStartDate(next.startDate);
      setAttendanceEndDate(next.endDate);
    }
  };

  const handleSwitchToCompany = async (companyId: string) => {
    try {
      const response = await apiClient.post(
        `/auth/switch-company/${companyId}`,
      );
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("accessToken", response.data.token);
        }
        tToast.success("OwnerReports.msg_9431");
        window.location.reload();
      } else {
        toast.error(response.data.message || i18n.t("OwnerReports.msg_d5a6"));
      }
    } catch (error) {
      console.error("Failed to switch company:", error);
      tToast.error("OwnerReports.msg_d5a6");
    }
  };

  useEffect(() => {
    if (activeTab === "sales") {
      void fetchSalesReport();
    } else {
      void fetchTodayAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, attendanceStartDate, attendanceEndDate, activeTab]);

  const fetchSalesReport = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("owner/reports/sales", {
        params: { startDate, endDate },
      });
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        toast.error(
          response.data.message || i18n.t("OwnerReports.failed_load_2917"),
        );
      }
    } catch (error) {
      console.error("Failed to fetch report", error);
      tToast.error("OwnerReports.failed_load_2917");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("owner/reports/today-attendance", {
        params: {
          startDate: attendanceStartDate,
          endDate: attendanceEndDate,
        },
      });
      if (response.data.success) {
        const attendanceData = response.data.data;
        setTodayAttendanceData({
          date: attendanceData.date,
          totalPresent: attendanceData.totalPresent,
          totalLate: attendanceData.totalLate,
          records: attendanceData.records,
        });
      } else {
        toast.error(
          response.data.message || i18n.t("OwnerReports.failed_load_7c13"),
        );
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error);
      tToast.error("OwnerReports.failed_load_7c13");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSales = async () => {
    try {
      setIsExporting(true);
      if (!reportData) return;
      downloadSalesReportCsv(reportData, startDate, endDate);
      tToast.success("OwnerReports.msg_f9f4");
    } catch {
      tToast.error("OwnerReports.msg_1d9e");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAttendance = async () => {
    try {
      setIsExporting(true);
      if (!todayAttendanceData) return;
      downloadTodayAttendanceCsv(todayAttendanceData);
      tToast.success("OwnerReports.msg_f9f4");
    } catch {
      tToast.error("OwnerReports.msg_1d9e");
    } finally {
      setIsExporting(false);
    }
  };

  return {
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
    handleSwitchToCompany,
    handleExportSales,
    handleExportAttendance,
  };
};
