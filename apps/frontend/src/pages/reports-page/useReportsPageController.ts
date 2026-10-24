import { useCallback, useEffect, useState } from "react";
import { getApiUrl } from "../../config/environment";
import tokenManager from "../../utils/tokenManager";
import { DailyReport, ReportSummary } from "./types";

export const useReportsPageController = () => {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] || "",
  );
  const [exporting, setExporting] = useState(false);

  const getAuthHeaders = useCallback(
    (includeJson = false) =>
      tokenManager.createAuthHeaders(
        includeJson ? { "Content-Type": "application/json" } : {},
      ),
    [],
  );

  const fetchSummary = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/monitor/reports/summary`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [getAuthHeaders]);

  const fetchDailyReport = useCallback(
    async (date: string) => {
      try {
        setError(null);
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/monitor/reports/daily?date=${date}`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.success) {
          setDailyReport(data.data);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error("Error fetching daily report:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [getAuthHeaders],
  );

  const exportReport = useCallback(
    async (type: string, format: string) => {
      try {
        setExporting(true);
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/monitor/reports/export`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ type, format, date: selectedDate }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.success) {
          const blob = new Blob([JSON.stringify(data.data.report, null, 2)], {
            type: "application/json",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = data.data.export.filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error("Error exporting report:", err);
        setError(err instanceof Error ? err.message : "Export failed");
      } finally {
        setExporting(false);
      }
    },
    [getAuthHeaders, selectedDate],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchDailyReport(selectedDate)]);
      if (isMounted) {
        setLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchDailyReport, fetchSummary, selectedDate]);

  return {
    summary,
    dailyReport,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    exporting,
    fetchSummary,
    fetchDailyReport,
    exportReport,
  };
};

export type ReportsPageController = ReturnType<typeof useReportsPageController>;
