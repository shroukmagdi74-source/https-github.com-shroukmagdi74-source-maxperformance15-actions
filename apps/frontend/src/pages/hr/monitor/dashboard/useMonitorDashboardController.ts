import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../../services/api";
import { useAuth } from "../../../../hooks/useAuthSimple";
import {
  MonitorOverviewStats,
  MonitorStatusFilter,
  SortField,
  TeamMemberSummary,
} from "./types";
import { filterAndSortTeamMembers, parseTeamOverviewData } from "./helpers";

export const useMonitorDashboardController = () => {
  const { user } = useAuth();
  const roleStr = String(user?.role || "").toUpperCase();
  const isManagerOrHR = [
    "ADMIN",
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "HR_MANAGER",
    "OWNER",
    "MANAGER",
  ].includes(roleStr);
  const isSuperOrOwner = ["SUPER_ADMIN", "COMPANY_ADMIN", "OWNER"].includes(
    roleStr
  );

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<MonitorStatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("totalActiveSeconds");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [teamMembers, setTeamMembers] = useState<TeamMemberSummary[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(
    new Set()
  );

  const [archiving, setArchiving] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState<string | null>(null);

  const [stats, setStats] = useState<MonitorOverviewStats>({
    totalTracked: 0,
    activeNow: 0,
    avgProductivity: 0,
    totalHoursTracked: 0,
    totalTasksCompleted: 0,
    totalTasksCreated: 0,
    avgWarmupMinutes: 0,
    avgActivityRatio: 0,
  });

  const handleDateStep = (daysOffset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysOffset);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (current <= today) {
      setSelectedDate(current.toISOString().split("T")[0]);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const fetchAlerts = useCallback(async () => {
    if (!isManagerOrHR) return;
    try {
      const res: any = await api.get("/employee-monitor/alerts");
      const list = res?.data?.data || [];
      setAlerts(list.filter((a: any) => !a.isRead));
    } catch {}
  }, [isManagerOrHR]);

  const handleDismissAlert = async (alertId: string) => {
    setDismissedAlertIds((prev) => new Set(prev).add(alertId));
    try {
      await api.put(`/employee-monitor/alerts/${alertId}/read`);
    } catch {}
  };

  const fetchData = useCallback(async () => {
    if (!isManagerOrHR) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const overviewRes: any = await api.get(
        `/employee-monitor/team/overview?date=${selectedDate}`
      );
      const data = overviewRes?.data?.data || [];
      const parsed = parseTeamOverviewData(data);
      setTeamMembers(parsed.members);
      setStats(parsed.stats);
    } catch (err) {
      console.warn("[MonitorDashboard] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isManagerOrHR, selectedDate]);

  useEffect(() => {
    fetchData();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchData();
      fetchAlerts();
    }, 45_000);
    return () => clearInterval(interval);
  }, [fetchData, fetchAlerts]);

  const handleTriggerArchive = async () => {
    setArchiving(true);
    setArchiveSuccess(null);
    try {
      const res: any = await api.post(
        "/employee-monitor/admin/retention-archive",
        { daysThreshold: 60 }
      );
      if (res?.data?.success) {
        setArchiveSuccess(
          `تم بنجاح أرشفة ${res.data.data?.archivedCount || 0} سجل.`
        );
        setTimeout(() => setArchiveSuccess(null), 5000);
      }
    } catch {
      setArchiveSuccess("تعذر تنفيذ الأرشفة حالياً.");
    } finally {
      setArchiving(false);
    }
  };

  const sortedMembers = useMemo(
    () =>
      filterAndSortTeamMembers(
        teamMembers,
        searchQuery,
        statusFilter,
        sortField,
        sortDirection
      ),
    [teamMembers, searchQuery, statusFilter, sortField, sortDirection]
  );

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !dismissedAlertIds.has(a.id)).slice(0, 3),
    [alerts, dismissedAlertIds]
  );

  return {
    isManagerOrHR,
    isSuperOrOwner,
    loading,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    teamMembers,
    selectedEmployeeId,
    setSelectedEmployeeId,
    visibleAlerts,
    archiving,
    archiveSuccess,
    stats,
    isToday,
    yesterdayStr,
    handleDateStep,
    handleSort,
    handleDismissAlert,
    fetchData,
    handleTriggerArchive,
    sortedMembers,
  };
};
