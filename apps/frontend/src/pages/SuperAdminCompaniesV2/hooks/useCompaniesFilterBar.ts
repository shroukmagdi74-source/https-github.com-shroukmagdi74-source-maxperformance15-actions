import { useState, useEffect, useCallback, useMemo } from "react";
import { DEFAULT_SORT } from "../constants";
import { enrichCompanies, computeQuickStats, getCount } from "../utils";
import type { Company } from "../types";

interface UseCompaniesFilterBarOptions {
  companies: Company[];
  adminId: string | null;
  meta: any;
  serverStats: any;
  totalPages: number;
  bulkStatus: { mutate: (data: { companyIds: string[]; isActive: boolean }) => void };
}

export function useCompaniesFilterBar({
  companies,
  adminId,
  meta,
  serverStats,
  totalPages,
  bulkStatus,
}: UseCompaniesFilterBarOptions) {
  const [search, setSearch] = useState("");
  const [savedView, setSavedView] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // FB Lookup state
  const [fbQuery, setFbQuery] = useState("");
  const [fbResults, setFbResults] = useState<import("../types").FacebookPageResult[]>([]);
  const [fbSearched, setFbSearched] = useState(false);

  // Enriched companies and stats
  const enrichedCompanies = useMemo(
    () => enrichCompanies(companies, adminId),
    [companies, adminId]
  );

  const quickStats = useMemo(() => {
    if (meta?.stats) {
      return {
        totalCompanies: meta.stats.totalCompanies || 0,
        activeCompanies: meta.stats.activeCompanies || 0,
        connectedFacebookPages: meta.stats.connectedFacebookPages || 0,
        followUpNow: meta.stats.followUpNow || 0,
        escalationDue: meta.stats.escalationDue || 0,
        urgentEscalationDue: meta.stats.urgentEscalationDue || 0,
        stale72h: meta.stats.stale72h || 0,
        myDueToday: meta.stats.myDueToday || 0,
      };
    }
    return computeQuickStats(enrichedCompanies, serverStats);
  }, [enrichedCompanies, meta, serverStats]);

  const pageSize = Number(rowsPerPage) || 10;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, savedView, status, sort, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const visibleIds = enrichedCompanies.map((c) => c.id);
  const isAllVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const isSomeVisibleSelected =
    visibleIds.some((id) => selectedIds.includes(id)) && !isAllVisibleSelected;
  const filterCount = [status !== "ALL"].filter(Boolean).length;
  const activeFilterLabels = [
    status !== "ALL" ? (status === "ACTIVE" ? "نشطة" : "متوقفة") : null,
  ].filter(Boolean);

  const handleOpenView = useCallback((view: string) => setSavedView(view), []);
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSavedView("ALL");
    setStatus("ALL");
    setSort(DEFAULT_SORT);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleToggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
      else setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    },
    [visibleIds]
  );

  const handleBulkActivate = useCallback(() => {
    if (selectedIds.length) bulkStatus.mutate({ companyIds: selectedIds, isActive: true });
  }, [selectedIds, bulkStatus]);

  const handleBulkDeactivate = useCallback(() => {
    if (selectedIds.length) bulkStatus.mutate({ companyIds: selectedIds, isActive: false });
  }, [selectedIds, bulkStatus]);

  const handleExport = useCallback(() => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Website",
      "Is Active",
      "Users",
      "Customers",
      "Facebook Pages",
      "Installed Apps",
      "Created At",
    ];
    const lines = enrichedCompanies.map((c) =>
      [
        c.id,
        `"${c.name || ""}"`,
        c.email || "",
        c.phone || "",
        c.website || "",
        c.isActive ? "Active" : "Inactive",
        getCount(c, "users"),
        getCount(c, "customers"),
        getCount(c, "facebookPages"),
        getCount(c, "installedApps"),
        c.createdAt ? new Date(c.createdAt).toISOString() : "",
      ].join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `companies_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [enrichedCompanies]);

  return {
    search,
    setSearch,
    savedView,
    setSavedView,
    status,
    setStatus,
    sort,
    setSort,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    filterOpen,
    setFilterOpen,
    fbQuery,
    setFbQuery,
    fbResults,
    setFbResults,
    fbSearched,
    setFbSearched,
    enrichedCompanies,
    quickStats,
    pageSize,
    safeCurrentPage,
    isAllVisibleSelected,
    isSomeVisibleSelected,
    filterCount,
    activeFilterLabels,
    handleOpenView,
    handleClearFilters,
    handleToggleSelect,
    handleToggleSelectAll,
    handleBulkActivate,
    handleBulkDeactivate,
    handleExport,
  };
}
