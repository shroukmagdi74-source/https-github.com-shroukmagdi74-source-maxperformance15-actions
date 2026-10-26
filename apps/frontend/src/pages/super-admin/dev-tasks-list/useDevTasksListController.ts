import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import {
  Task,
  Pagination,
  DevTasksFilters,
  DevTasksStats,
  ProjectOption,
  TeamMemberOption,
  ReleaseOption,
} from "./types";
import { useDevTasksBulkActions } from "./useDevTasksBulkActions";

const getAccessToken = (): string | null => tokenManager.getAccessToken();

export function useDevTasksListController() {
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [releases, setReleases] = useState<ReleaseOption[]>([]);
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState<DevTasksStats | null>(null);

  const bulkActions = useDevTasksBulkActions();

  const [filters, setFilters] = useState<DevTasksFilters>({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    type: searchParams.get("type") || "",
    projectId: searchParams.get("projectId") || "",
    assigneeId: searchParams.get("assigneeId") || "",
    component: searchParams.get("component") || "",
    releaseId: searchParams.get("releaseId") || "",
    dueDateFrom: searchParams.get("dueDateFrom") || "",
    dueDateTo: searchParams.get("dueDateTo") || "",
    tags: searchParams.get("tags") || "",
    dateType: "dueDate",
  });

  const [pendingFilters, setPendingFilters] = useState<DevTasksFilters>(filters);

  const [hideCompleted, setHideCompleted] = useState(true);
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(() => {
    const saved = localStorage.getItem("devTasks_showMyTasksOnly");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("devTasks_showMyTasksOnly", String(showMyTasksOnly));
  }, [showMyTasksOnly]);

  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (showFiltersSidebar) {
      setPendingFilters(filters);
    }
  }, [showFiltersSidebar, filters]);

  const fetchUserPermissions = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        buildApiUrl("super-admin/user/permissions"),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setUserPermissions(data.data.permissions);
        if (data.data.memberId) {
          setCurrentMemberId(data.data.memberId);
        }
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/settings"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/projects"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/team"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  }, []);

  const fetchReleases = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/releases"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setReleases(data.data);
      }
    } catch (err) {
      console.error("Error fetching releases:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(buildApiUrl("super-admin/dev/dashboard"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchUserPermissions();
    fetchProjects();
    fetchTeamMembers();
    fetchReleases();
    fetchStats();
  }, [
    fetchSettings,
    fetchUserPermissions,
    fetchProjects,
    fetchTeamMembers,
    fetchReleases,
    fetchStats,
  ]);

  const urlSearch = searchParams.get("search") || "";
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search !== urlSearch) {
        return { ...prev, search: urlSearch };
      }
      return prev;
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [urlSearch]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();

      const params = new URLSearchParams();

      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.type) params.append("type", filters.type);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (showMyTasksOnly) {
        params.append("assigneeId", "me");
      } else if (filters.assigneeId) {
        params.append("assigneeId", filters.assigneeId);
      }
      if (filters.component) params.append("component", filters.component);
      if (filters.releaseId) params.append("releaseId", filters.releaseId);
      if (filters.dateType) params.append("dateType", filters.dateType);
      if (filters.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
      if (filters.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
      if (filters.tags) params.append("tags", filters.tags);
      if (hideCompleted) params.append("excludeStatus", "DONE");

      const response = await fetch(
        buildApiUrl(`super-admin/dev/tasks?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`فشل تحميل المهام (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || "حدث خطأ أثناء تحميل المهام");
      }
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(
        err.message || "حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    sortBy,
    sortOrder,
    filters,
    showMyTasksOnly,
    hideCompleted,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, currentMemberId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePendingFilterChange = (key: string, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyPendingFilters = () => {
    setFilters(pendingFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setShowFiltersSidebar(false);
  };

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    const currentTags = pendingFilters.tags
      ? pendingFilters.tags.split(",")
      : [];
    if (!currentTags.includes(tag.trim())) {
      const newTags = [...currentTags, tag.trim()].join(",");
      handlePendingFilterChange("tags", newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = pendingFilters.tags
      ? pendingFilters.tags.split(",")
      : [];
    const newTags = currentTags.filter((tag) => tag !== tagToRemove).join(",");
    handlePendingFilterChange("tags", newTags);
  };

  const clearFilters = () => {
    const clearedFilters: DevTasksFilters = {
      search: "",
      status: "",
      priority: "",
      type: "",
      projectId: "",
      assigneeId: "",
      component: "",
      releaseId: "",
      dueDateFrom: "",
      dueDateTo: "",
      tags: "",
      dateType: "dueDate",
    };
    setFilters(clearedFilters);
    setPendingFilters(clearedFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return {
    tasks,
    settings,
    userPermissions,
    pagination,
    setPagination,
    loading,
    error,
    showFiltersSidebar,
    setShowFiltersSidebar,
    projects,
    teamMembers,
    releases,
    sortBy,
    sortOrder,
    stats,
    filters,
    setFilters,
    pendingFilters,
    hideCompleted,
    setHideCompleted,
    showMyTasksOnly,
    setShowMyTasksOnly,
    fetchTasks,
    handleSearch,
    handleFilterChange,
    handlePendingFilterChange,
    applyPendingFilters,
    addTag,
    removeTag,
    clearFilters,
    handleSort,
    // Delegated to useDevTasksBulkActions
    selectedTasks: bulkActions.selectedTasks,
    setSelectedTasks: bulkActions.setSelectedTasks,
    bulkAction: bulkActions.bulkAction,
    setBulkAction: bulkActions.setBulkAction,
    confirmModal: bulkActions.confirmModal,
    setConfirmModal: bulkActions.setConfirmModal,
    toggleSelectAll: () => bulkActions.toggleSelectAll(tasks),
    toggleSelectTask: bulkActions.toggleSelectTask,
    handleBulkAction: () => bulkActions.handleBulkAction(fetchTasks, setError),
    handleDeleteTask: (id: string) =>
      bulkActions.handleDeleteTask(id, fetchTasks, setError),
    handleExport: (format: "csv" | "json") =>
      bulkActions.handleExport(format, filters),
  };
}
