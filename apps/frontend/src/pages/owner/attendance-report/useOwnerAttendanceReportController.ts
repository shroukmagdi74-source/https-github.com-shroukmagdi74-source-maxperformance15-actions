import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import i18n from "../../../i18n";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import {
  AttendanceReportData,
  OwnerReportOptions,
  OwnerReportSortBy,
  OwnerReportViewMode,
} from "./types";
import {
  computePresetDateRange,
  downloadOwnerAttendanceCsvReport,
  downloadOwnerAttendanceHtmlReport,
  getAttendanceRate,
} from "./reportExporters";

export const useOwnerAttendanceReportController = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<AttendanceReportData | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyFilter, setSelectedCompanyFilter] =
    useState<string>("all");
  const [viewMode, setViewMode] = useState<OwnerReportViewMode>("cards");
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(
    new Set(),
  );
  const [sortBy, setSortBy] = useState<OwnerReportSortBy>("attendance");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState<OwnerReportOptions>({
    format: "pdf",
    includeCharts: true,
    includeDetails: true,
    groupByCompany: false,
    showOnlyIssues: false,
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("thisMonth");

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const range = computePresetDateRange(preset);
    if (range) {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  };

  useEffect(() => {
    void fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("owner/reports/attendance", {
        params: { startDate, endDate },
      });
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        toast.error(
          response.data.message ||
            i18n.t("OwnerAttendanceReport.failed_load_cef6"),
        );
      }
    } catch (error) {
      console.error("Failed to fetch report", error);
      tToast.error("OwnerAttendanceReport.failed_load_cef6");
    } finally {
      setIsLoading(false);
    }
  };

  const companies = useMemo(() => {
    if (!reportData) return [];
    const seen = new Set<string>();
    return reportData.byEmployee
      .map((item) => item.company)
      .filter((c) => {
        const duplicate = seen.has(c.id);
        seen.add(c.id);
        return !duplicate;
      });
  }, [reportData]);

  const filteredEmployees = useMemo(() => {
    if (!reportData) return [];
    const filtered = reportData.byEmployee.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        `${item.user.firstName} ${item.user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany =
        selectedCompanyFilter === "all" ||
        item.company.id === selectedCompanyFilter;

      return matchesSearch && matchesCompany;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return `${a.user.firstName} ${a.user.lastName}`.localeCompare(
          `${b.user.firstName} ${b.user.lastName}`,
        );
      } else if (sortBy === "attendance") {
        return getAttendanceRate(b) - getAttendanceRate(a);
      } else {
        return a.company.name.localeCompare(b.company.name);
      }
    });

    return filtered;
  }, [reportData, searchQuery, selectedCompanyFilter, sortBy]);

  const toggleEmployeeExpand = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      if (!reportData) return;

      if (reportOptions.format === "pdf") {
        downloadOwnerAttendanceHtmlReport(
          reportData,
          filteredEmployees,
          reportOptions,
          startDate,
          endDate,
        );
      } else {
        downloadOwnerAttendanceCsvReport(
          filteredEmployees,
          startDate,
          endDate,
          true,
          "attendance-report",
        );
      }

      tToast.success("OwnerAttendanceReport.success_create_27b7");
      setShowReportModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
      tToast.error("OwnerAttendanceReport.failed_create_878d");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (!reportData) return;

      downloadOwnerAttendanceCsvReport(
        filteredEmployees,
        startDate,
        endDate,
        false,
        "detailed-attendance",
      );

      tToast.success("OwnerAttendanceReport.msg_6004");
    } catch {
      tToast.error("OwnerAttendanceReport.msg_6657");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isLoading,
    isExporting,
    reportData,
    searchQuery,
    setSearchQuery,
    selectedCompanyFilter,
    setSelectedCompanyFilter,
    viewMode,
    setViewMode,
    expandedEmployees,
    sortBy,
    setSortBy,
    showReportModal,
    setShowReportModal,
    reportOptions,
    setReportOptions,
    isGeneratingReport,
    selectedPreset,
     setSelectedPreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handlePresetChange,
    companies,
    filteredEmployees,
    toggleEmployeeExpand,
    handleGenerateReport,
    handleExport,
  };
};
