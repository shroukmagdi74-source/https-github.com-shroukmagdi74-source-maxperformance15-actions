import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import { ExportColumn } from "../../../utils/exportHelpers";
import { SentMessagesStatsData, SentMessagesTab, ConnectedPage } from "./types";

export function useSentMessagesStats() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<SentMessagesStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filter states
  const [period, setPeriod] = useState<string>("1d");
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [messageStatusFilter, setMessageStatusFilter] = useState<string>("all");
  const [conversationStatusFilter, setConversationStatusFilter] =
    useState<string>("all");

  // UI states
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval] = useState<number>(60000); // 1 minute
  const [activeTab, setActiveTab] = useState<SentMessagesTab>("overview");
  const [availablePages, setAvailablePages] = useState<ConnectedPage[]>([]);

  useEffect(() => {
    const token = tokenManager.getAccessToken();
    const fetchPages = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          buildApiUrl("integrations/facebook/connected"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.pages)) {
          setAvailablePages(data.pages);
        }
      } catch (err) {
        console.error("Failed to fetch pages", err);
      }
    };
    fetchPages();
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = tokenManager.createAuthHeaders({
        "Content-Type": "application/json",
      });

      const params = new URLSearchParams();

      if (customDateRange.start && customDateRange.end) {
        params.append("startDate", customDateRange.start.toISOString());
        params.append("endDate", customDateRange.end.toISOString());
      } else {
        params.append("period", period);
      }

      if (selectedPages.length > 0) {
        params.append("pageIds", selectedPages.join(","));
      }

      if (messageStatusFilter !== "all") {
        params.append("messageStatus", messageStatusFilter);
      }

      if (conversationStatusFilter !== "all") {
        params.append("conversationStatus", conversationStatusFilter);
      }

      const response = await fetch(
        buildApiUrl(`conversations/stats/sent-messages?${params.toString()}`),
        { headers },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t("sentMessagesStats.fetchError"));
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || t("sentMessagesStats.fetchError"));
      }
    } catch (err: unknown) {
      console.error("Error fetching sent messages stats:", err);
      setError(
        err instanceof Error ? err.message : t("sentMessagesStats.errorOccurred"),
      );
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [
    conversationStatusFilter,
    customDateRange.start,
    customDateRange.end,
    messageStatusFilter,
    period,
    selectedPages,
  ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchStatsRef = useRef(fetchStats);
  useEffect(() => {
    fetchStatsRef.current = fetchStats;
  }, [fetchStats]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchStatsRef.current();
      }, refreshInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  const handleDateChange = (
    startDate: Date | null,
    endDate: Date | null,
    selectedPeriod: string,
  ) => {
    if (selectedPeriod === "custom" && startDate && endDate) {
      setCustomDateRange({ start: startDate, end: endDate });
      setPeriod("custom");
    } else {
      setCustomDateRange({ start: null, end: null });
      setPeriod(selectedPeriod);
    }
  };

  const formatDate = useCallback(
    (dateString: string): string => {
      return new Date(dateString).toLocaleDateString(i18n?.language || "ar", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
    [i18n?.language],
  );

  const formatTime = useCallback(
    (date: Date): string => {
      return date.toLocaleTimeString(i18n?.language || "ar", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [i18n?.language],
  );

  const pieChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: t("sentMessagesStats.saved"), value: stats.summary.messages.totalSaved },
      { name: t("sentMessagesStats.ignored"), value: stats.summary.messages.totalIgnored },
    ];
  }, [stats, t]);

  const hourlyChartData = useMemo(() => {
    if (!stats?.hourlyStats) return [];
    return stats.hourlyStats.map((hour) => ({
      hour: `${hour.hour}:00`,
      count: hour.count,
      saved: hour.saved,
      ignored: hour.ignored,
      revenue: hour.revenue,
    }));
  }, [stats]);

  const dailyTableColumns: ExportColumn[] = useMemo(
    () => [
      { key: "date", label: t("sentMessagesStats.date") },
      { key: "total", label: t("sentMessagesStats.totalAttempts") },
      { key: "savedReach", label: t("sentMessagesStats.reachedConversations") },
      { key: "ignoredReach", label: t("sentMessagesStats.ignoredConversationsShort") },
      { key: "conversationsCreated", label: t("sentMessagesStats.new") },
      { key: "conversationsExisted", label: t("sentMessagesStats.existing") },
    ],
    [t],
  );

  const pageTableColumns: ExportColumn[] = useMemo(
    () => [
      { key: "pageName", label: t("sentMessagesStats.pageName") },
      { key: "count", label: t("sentMessagesStats.messageCount") },
      { key: "percentage", label: t("sentMessagesStats.percentage") },
    ],
    [t],
  );

  const dailyTableData = useMemo(() => {
    if (!stats?.dailyStats) return [];
    return stats.dailyStats.map((day) => ({
      ...day,
      date: formatDate(day.date),
    }));
  }, [stats, formatDate]);

  const pageTableData = useMemo(() => {
    if (!stats?.pageStats) return [];
    return stats.pageStats.map((page) => ({
      ...page,
      percentage: page.percentage ? `${page.percentage}%` : "0%",
    }));
  }, [stats]);

  return {
    t,
    i18n,
    stats,
    loading,
    error,
    lastUpdated,
    period,
    setPeriod,
    selectedPages,
    setSelectedPages,
    messageStatusFilter,
    setMessageStatusFilter,
    conversationStatusFilter,
    setConversationStatusFilter,
    autoRefresh,
    setAutoRefresh,
    activeTab,
    setActiveTab,
    availablePages,
    fetchStats,
    handleDateChange,
    formatDate,
    formatTime,
    pieChartData,
    hourlyChartData,
    dailyTableColumns,
    pageTableColumns,
    dailyTableData,
    pageTableData,
  };
}
