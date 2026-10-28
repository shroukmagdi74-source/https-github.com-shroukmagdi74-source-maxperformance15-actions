import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api, fetchJson } from "../shared";
import { ActionKind, CounterKey, Counters, ReportFilters, ReportRow } from "./types";
import { ACTION_META, canManageRadiology } from "./constants";

export const PAGE_SIZE = 20;

export function useReportsTab() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    studySearch: "",
    statusFilter: "",
    criticalFilter: "",
    dateFrom: "",
    dateTo: "",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counters, setCounters] = useState<Counters | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; kind: ActionKind } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<ActionKind | null>(null);

  const canManage = canManageRadiology();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilters = Boolean(
    filters.search.trim() ||
    filters.studySearch.trim() ||
    filters.statusFilter ||
    filters.criticalFilter ||
    filters.dateFrom ||
    filters.dateTo
  );

  const loadCounters = useCallback(async () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const specs: Array<[CounterKey, Array<[string, string]>]> = [
      ["total", []],
      ["awaitingReview", [["reportStatus", "DRAFT"]]],
      ["awaitingSign", [["reportStatus", "REVIEWED"]]],
      ["deliveredToday", [["reportStatus", "DELIVERED"], ["dateFrom", todayStr], ["dateTo", todayStr]]],
      ["critical", [["criticalCategory", "CRITICAL"]]],
    ];
    const results = await Promise.all(
      specs.map(async ([key, pairs]) => {
        try {
          const u = new URL(api("studies"));
          u.searchParams.set("hasReport", "true");
          u.searchParams.set("limit", "1");
          pairs.forEach(([k, v]) => u.searchParams.set(k, v));
          const res = await fetchJson<{ items?: unknown[]; total?: number }>(u.toString());
          return [key, res.total || 0] as [CounterKey, number];
        } catch {
          return [key, 0] as [CounterKey, number];
        }
      }),
    );
    const next: Counters = { total: 0, awaitingReview: 0, awaitingSign: 0, deliveredToday: 0, critical: 0 };
    results.forEach(([k, v]) => {
      next[k] = v;
    });
    setCounters(next);
  }, []);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    setRefreshing(true);
    try {
      const url = new URL(api("studies"));
      url.searchParams.set("limit", String(PAGE_SIZE));
      url.searchParams.set("page", String(page));
      url.searchParams.set("hasReport", "true");
      if (filters.statusFilter) url.searchParams.set("reportStatus", filters.statusFilter);
      if (filters.criticalFilter) url.searchParams.set("criticalCategory", filters.criticalFilter);
      if (filters.search.trim()) url.searchParams.set("patientName", filters.search.trim());
      if (filters.studySearch.trim()) url.searchParams.set("studyNumber", filters.studySearch.trim());
      if (filters.dateFrom) url.searchParams.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) url.searchParams.set("dateTo", filters.dateTo);
      const res = await fetchJson<{ items?: ReportRow[]; total?: number }>(url.toString());
      setRows(res.items || []);
      setTotal(res.total || 0);
      setLoadError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : t("radiology.reports.loadFailed");
      setLoadError(message);
      if (!opts?.silent) toast.error(message);
    } finally {
      setRefreshing(false);
    }
    void loadCounters();
  }, [filters, page, loadCounters, t]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const updateFilter = (key: keyof ReportFilters, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const isCounterActive = (key: CounterKey): boolean => {
    switch (key) {
      case "awaitingReview":
        return filters.statusFilter === "DRAFT";
      case "awaitingSign":
        return filters.statusFilter === "REVIEWED";
      case "deliveredToday":
        return Boolean(filters.statusFilter === "DELIVERED" && filters.dateFrom && filters.dateTo);
      case "critical":
        return filters.criticalFilter === "CRITICAL";
      default:
        return false;
    }
  };

  const toggleCounter = (key: CounterKey) => {
    setFilters(f => {
      const next = { ...f };
      if (key === "awaitingReview") {
        next.statusFilter = f.statusFilter === "DRAFT" ? "" : "DRAFT";
      } else if (key === "awaitingSign") {
        next.statusFilter = f.statusFilter === "REVIEWED" ? "" : "REVIEWED";
      } else if (key === "deliveredToday") {
        if (f.statusFilter === "DELIVERED" && f.dateFrom && f.dateTo) {
          next.statusFilter = "";
          next.dateFrom = "";
          next.dateTo = "";
        } else {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          next.statusFilter = "DELIVERED";
          next.dateFrom = todayStr;
          next.dateTo = todayStr;
        }
      } else if (key === "critical") {
        next.criticalFilter = f.criticalFilter === "CRITICAL" ? "" : "CRITICAL";
      }
      return next;
    });
    setPage(1);
  };

  const runAction = async (studyId: string, kind: ActionKind) => {
    if (busyId === studyId) return;
    setBusyId(studyId);
    try {
      await fetchJson(api(`studies/${studyId}/report/${kind}`), { method: "PUT" });
      toast.success(t(ACTION_META[kind].toastKey));
      setConfirmAction(null);
      await refresh({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.reports.actionFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const allVisibleSelected = (rows?.length || 0) > 0 && (rows || []).every(r => selected.has(r.id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      (rows || []).forEach(r => {
        if (allVisibleSelected) next.delete(r.id); else next.add(r.id);
      });
      return next;
    });
  };

  const runBulkAction = async (action: ActionKind) => {
    if (bulkBusy || selected.size === 0) return;
    setBulkBusy(action);
    try {
      const ids = Array.from(selected);
      const result = await fetchJson<{ successCount?: number; failed?: Array<{ id: string; error: string }> }>(
        api("bulk/reports/advance"),
        { method: "POST", body: JSON.stringify({ ids, action }) },
      );
      const successCount = result.successCount ?? 0;
      const failedCount = result.failed?.length ?? 0;
      if (failedCount > 0) {
        toast.warning(t("radiology.bulk.result", { successCount, failedCount }));
      } else {
        toast.success(t("radiology.bulk.result", { successCount, failedCount }));
      }
      setSelected(new Set());
      await refresh({ silent: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.reports.actionFailed"));
    } finally {
      setBulkBusy(null);
    }
  };

  return {
    rows,
    loading,
    refreshing,
    loadError,
    filters,
    page,
    setPage,
    total,
    totalPages,
    counters,
    hasActiveFilters,
    canManage,
    editId,
    setEditId,
    confirmAction,
    setConfirmAction,
    busyId,
    selected,
    setSelected,
    bulkBusy,
    updateFilter,
    isCounterActive,
    toggleCounter,
    refresh,
    runAction,
    toggleSelect,
    toggleSelectAll,
    allVisibleSelected,
    runBulkAction,
  };
}
