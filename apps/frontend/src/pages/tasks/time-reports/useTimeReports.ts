import { useState, useEffect, useCallback, useMemo } from "react";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import {
  UnifiedTaskFilters,
  parseUnifiedFiltersFromUrl,
} from "../../../components/tasks/taskFilterEngine";
import type {
  TimeEntry,
  TimeEvaluationSummary,
  TimeEvaluationTask,
  TimeReportsTab,
  UserTimeStats,
  ProjectTimeStats,
  DailyStats,
} from "./types";
import { exportToCSV } from "./helpers";

export function useTimeReports() {
  const [unifiedFilters, setUnifiedFilters] = useState<UnifiedTaskFilters>(() =>
    parseUnifiedFiltersFromUrl(
      typeof window !== "undefined" ? window.location.search : ""
    )
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeEvaluation, setTimeEvaluation] = useState<{
    summary: TimeEvaluationSummary;
    tasks: TimeEvaluationTask[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TimeReportsTab>("entries");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [users, setUsers] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const fetchTimeEvaluation = useCallback(async () => {
    try {
      const token = tokenManager.getAccessToken();
      const startDate = unifiedFilters.dueDateFrom || dateRange.startDate;
      const endDate = unifiedFilters.dueDateTo || dateRange.endDate;
      let url = `tasks/reports/time-evaluation?startDate=${startDate}&endDate=${endDate}`;
      const effectiveUser =
        unifiedFilters.assignedTo && unifiedFilters.assignedTo !== "all"
          ? unifiedFilters.assignedTo
          : selectedUser;
      if (effectiveUser) url += `&userId=${effectiveUser}`;
      if (selectedProject) url += `&projectId=${selectedProject}`;

      const response = await fetch(buildApiUrl(url), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setTimeEvaluation(data.data);
      }
    } catch (error) {
      console.error("Error fetching time evaluation report:", error);
    }
  }, [dateRange, selectedProject, selectedUser, unifiedFilters]);

  const fetchTimeEntries = useCallback(async () => {
    try {
      setLoading(true);
      const token = tokenManager.getAccessToken();

      const startDate = unifiedFilters.dueDateFrom || dateRange.startDate;
      const endDate = unifiedFilters.dueDateTo || dateRange.endDate;
      let url = `tasks/time-entries?startDate=${startDate}&endDate=${endDate}`;
      const effectiveUser =
        unifiedFilters.assignedTo && unifiedFilters.assignedTo !== "all"
          ? unifiedFilters.assignedTo
          : selectedUser;
      if (effectiveUser) url += `&userId=${effectiveUser}`;
      if (selectedProject) url += `&projectId=${selectedProject}`;

      const response = await fetch(buildApiUrl(url), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setTimeEntries(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setTimeEntries([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedProject, selectedUser, unifiedFilters]);

  const fetchUsers = useCallback(async () => {
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(buildApiUrl("tasks/company-users"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Error fetching users:", {
          status: response.status,
          code: errData?.code,
          message: errData?.message || response.statusText,
        });
        return;
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(buildApiUrl("projects"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  useEffect(() => {
    void fetchTimeEntries();
    void fetchTimeEvaluation();
    void fetchUsers();
    void fetchProjects();
  }, [fetchTimeEntries, fetchTimeEvaluation, fetchUsers, fetchProjects]);

  const handleRefresh = useCallback(() => {
    void fetchTimeEntries();
    void fetchTimeEvaluation();
  }, [fetchTimeEntries, fetchTimeEvaluation]);

  const filteredTimeEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      if (unifiedFilters.search) {
        const query = unifiedFilters.search.toLowerCase();
        const matchesSearch =
          (entry.taskTitle && entry.taskTitle.toLowerCase().includes(query)) ||
          (entry.projectName && entry.projectName.toLowerCase().includes(query)) ||
          (entry.userName && entry.userName.toLowerCase().includes(query)) ||
          (entry.description && entry.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (unifiedFilters.assignedTo && unifiedFilters.assignedTo !== "all") {
        if (entry.userId !== unifiedFilters.assignedTo) return false;
      }
      return true;
    });
  }, [timeEntries, unifiedFilters]);

  const totalMinutes = useMemo(() => {
    return filteredTimeEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );
  }, [filteredTimeEntries]);

  const userStats: UserTimeStats[] = useMemo(() => {
    return Object.values(
      filteredTimeEntries.reduce(
        (acc, entry) => {
          if (!acc[entry.userId]) {
            acc[entry.userId] = {
              userId: entry.userId,
              userName: entry.userName,
              totalMinutes: 0,
              tasksCount: 0,
            };
          }
          acc[entry.userId]!.totalMinutes += entry.duration || 0;
          acc[entry.userId]!.tasksCount += 1;
          return acc;
        },
        {} as Record<string, UserTimeStats>
      )
    ).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [filteredTimeEntries]);

  const projectStats: ProjectTimeStats[] = useMemo(() => {
    return Object.values(
      filteredTimeEntries.reduce(
        (acc, entry) => {
          const projectId = entry.projectName || "no-project";
          if (!acc[projectId]) {
            acc[projectId] = {
              projectId,
              projectName: entry.projectName || "بدون مشروع",
              totalMinutes: 0,
              tasksCount: 0,
            };
          }
          const projectStatsEntry = acc[projectId]!;
          projectStatsEntry.totalMinutes += entry.duration || 0;
          projectStatsEntry.tasksCount += 1;
          return acc;
        },
        {} as Record<string, ProjectTimeStats>
      )
    ).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [filteredTimeEntries]);

  const dailyStats: DailyStats[] = useMemo(() => {
    return Object.values(
      filteredTimeEntries.reduce(
        (acc, entry) => {
          const date = entry.startTime?.split("T")[0] || "";
          if (!date) return acc;
          if (!acc[date]) {
            acc[date] = {
              date,
              totalMinutes: 0,
              entriesCount: 0,
            };
          }
          const dailyStatsEntry = acc[date]!;
          dailyStatsEntry.totalMinutes += entry.duration || 0;
          dailyStatsEntry.entriesCount += 1;
          return acc;
        },
        {} as Record<string, DailyStats>
      )
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTimeEntries]);

  const handleExportCSV = useCallback(() => {
    const startDate = unifiedFilters.dueDateFrom || dateRange.startDate;
    const endDate = unifiedFilters.dueDateTo || dateRange.endDate;
    exportToCSV(filteredTimeEntries, startDate, endDate);
  }, [filteredTimeEntries, unifiedFilters, dateRange]);

  return {
    unifiedFilters,
    setUnifiedFilters,
    timeEntries,
    timeEvaluation,
    loading,
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    selectedUser,
    setSelectedUser,
    selectedProject,
    setSelectedProject,
    users,
    projects,
    handleRefresh,
    filteredTimeEntries,
    totalMinutes,
    userStats,
    projectStats,
    dailyStats,
    handleExportCSV,
  };
}
