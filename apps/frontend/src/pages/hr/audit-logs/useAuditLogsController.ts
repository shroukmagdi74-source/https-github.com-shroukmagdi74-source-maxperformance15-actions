import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import {
  AuditLog,
  AuditStats,
  AuditFilters,
  AuditPagination,
} from "./types";
import { exportAuditLogsToCsv } from "./helpers";

export function useAuditLogsController() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<AuditPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<AuditFilters>({
    entityType: "",
    action: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      const response = await api.get("/hr/audit-logs/stats", { params });
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching audit stats:", error);
    }
  }, [filters.startDate, filters.endDate]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        entityType: filters.entityType === "all" ? "" : filters.entityType,
        action: filters.action === "all" ? "" : filters.action,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
      };

      const response = await api.get("/hr/audit-logs", { params });

      if (response.data?.success) {
        setLogs(response.data.logs || []);
        setPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        );
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    filters.entityType,
    filters.action,
    filters.startDate,
    filters.endDate,
    filters.search,
  ]);

  // Debounce search / filters / page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuditLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAuditLogs]);

  // Fetch stats separately when date filters change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExport = useCallback(() => {
    exportAuditLogsToCsv(logs);
  }, [logs]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  return {
    logs,
    stats,
    loading,
    pagination,
    filters,
    selectedLog,
    setFilters,
    setPagination,
    setSelectedLog,
    handleExport,
    handlePageChange,
    refetchLogs: fetchAuditLogs,
    refetchStats: fetchStats,
  };
}
