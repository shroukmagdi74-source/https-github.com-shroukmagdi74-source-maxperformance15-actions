import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiClient } from "../../../services/apiClient";
import { useAuth } from "../../../hooks/useAuthSimple";
import {
  BULK_DELETE_ID,
  MarketplaceApp,
  SortField,
  SortOrder,
  buildAppPayload,
  getApiErrorMessage,
  sortApps,
} from "./types";

const APPS_ENDPOINT = "/super-admin/marketplace-management/apps";

export const useAppPricingSheetController = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<"sheet" | "grid">("sheet");
  const [detailApp, setDetailApp] = useState<MarketplaceApp | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Partial<MarketplaceApp> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trialDaysEdit, setTrialDaysEdit] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const saveError = (err: unknown) =>
    toast.error(getApiErrorMessage(err) || t("subscription.appSaveError", "حدث خطأ أثناء الحفظ"));

  const loadAppsList = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isSuperAdmin ? APPS_ENDPOINT : "/marketplace/apps";
      const params = isSuperAdmin ? undefined : { limit: 500 };
      const response = await apiClient.get<{ success: boolean; data: MarketplaceApp[] }>(
        endpoint,
        { params },
      );
      if (response.data?.success && Array.isArray(response.data.data)) {
        setApps(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching apps pricing:", error);
      toast.error(t("subscription.appsPricingError", "حدث خطأ أثناء تحميل تسعير التطبيقات"));
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, t]);

  useEffect(() => {
    void loadAppsList();
  }, [loadAppsList]);

  const slugExists = (slug: string, excludeId?: string) =>
    apps.some((a) => a.slug === slug && a.id !== excludeId);

  const handleOpenDialog = (app?: MarketplaceApp) => {
    setEditingApp(
      app ?? {
        name: "", nameEn: "", slug: "", category: "ECOMMERCE", description: "", imageUrl: "",
        pricingModel: "SUBSCRIPTION",
        monthlyPrice: 0, yearlyPrice: 0, unitPrice: 0, unitName: "", trialDays: 14, isActive: true,
      },
    );
    setIsDialogOpen(true);
  };

  const handleSaveApp = async () => {
    try {
      if (!editingApp?.name || !editingApp?.category || !editingApp?.pricingModel) {
        toast.error(t("subscription.fillRequiredFields", "الرجاء تعبئة الحقول المطلوبة"));
        return;
      }
      const newSlug = editingApp.slug || editingApp.name.toLowerCase().replace(/\s+/g, "-");
      if (slugExists(newSlug, editingApp.id)) {
        toast.error(t("subscription.slugExists", "Slug already exists, please choose another"));
        return;
      }
      const payload = buildAppPayload(editingApp, newSlug);
      if (editingApp.id) {
        await apiClient.put(`${APPS_ENDPOINT}/${editingApp.id}`, payload);
        toast.success(t("subscription.appUpdated", "تم تحديث التطبيق بنجاح"));
      } else {
        await apiClient.post(APPS_ENDPOINT, payload);
        toast.success(t("subscription.appAdded", "تمت إضافة التطبيق بنجاح"));
      }
      setIsDialogOpen(false);
      await loadAppsList();
    } catch (err: unknown) {
      saveError(err);
    }
  };

  const handleSaveTrialDays = async (app: MarketplaceApp, days: number) => {
    try {
      await apiClient.put(`${APPS_ENDPOINT}/${app.id}`, {
        name: app.name,
        slug: app.slug,
        category: app.category,
        description: app.description || "",
        nameEn: app.nameEn || "",
        imageUrl: app.imageUrl || "",
        pricingModel: app.pricingModel,
        monthlyPrice: app.monthlyPrice || 0,
        yearlyPrice: app.yearlyPrice || 0,
        unitPrice: app.unitPrice || 0,
        unitName: app.unitName || "",
        trialDays: days,
        isActive: app.isActive ?? true,
      });
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, trialDays: days } : a)));
      toast.success(t("subscription.trialDaysUpdated", "تم تحديث أيام التجربة المجانية"));
    } catch (err: unknown) {
      saveError(err);
    }
  };

  const commitTrialDays = (app: MarketplaceApp) => {
    const days = trialDaysEdit[app.id] ?? app.trialDays;
    if (days !== app.trialDays) void handleSaveTrialDays(app, days);
  };

  const confirmDeleteApp = async () => {
    if (!deleteConfirmId) return;
    try {
      await apiClient.delete(`${APPS_ENDPOINT}/${deleteConfirmId}`);
      toast.success(t("subscription.appDeleted", "تم حذف التطبيق بنجاح"));
      setApps((prev) => prev.filter((a) => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || t("subscription.appDeleteError", "حدث خطأ أثناء الحذف"));
    }
  };

  const toggleField = async (app: MarketplaceApp, field: "isActive" | "isInstalled") => {
    const next = !app[field];
    setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, [field]: next } : a)));
    try {
      await apiClient.put(`${APPS_ENDPOINT}/${app.id}`, { [field]: next });
      toast.success(t("subscription.appUpdated", "تم تحديث التطبيق بنجاح"));
    } catch (err: unknown) {
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, [field]: app[field] } : a)));
      saveError(err);
    }
  };

  const categories = useMemo(() => Array.from(new Set(apps.map((app) => app.category))), [apps]);

  const stats = useMemo(() => {
    const paidApps = apps.filter((app) => app.pricingModel === "SUBSCRIPTION" && app.monthlyPrice);
    const avgSubPrice =
      paidApps.length > 0
        ? Math.round(paidApps.reduce((acc, app) => acc + (app.monthlyPrice || 0), 0) / paidApps.length)
        : 0;
    return {
      total: apps.length,
      installed: apps.filter((app) => app.isInstalled).length,
      withTrial: apps.filter((app) => app.trialDays > 0).length,
      avgSubPrice,
    };
  }, [apps]);

  const getCategoryLabel = (cat: string) => {
    if (cat === "ALL") return t("subscription.all");
    const translated = t(`subscription.categories.${cat}`);
    return translated !== `subscription.categories.${cat}` ? translated : cat;
  };

  const getAppName = (app: MarketplaceApp) =>
    i18n.language === "ar" ? app.name : app.nameEn || app.name;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const processedApps = useMemo(() => {
    let result = [...apps];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          (app.nameEn && app.nameEn.toLowerCase().includes(q)) ||
          app.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory !== "ALL") result = result.filter((app) => app.category === selectedCategory);
    if (selectedPricingModel !== "ALL") {
      result = result.filter((app) => app.pricingModel === selectedPricingModel);
    }
    return sortApps(result, sortField, sortOrder, i18n.language);
  }, [apps, searchQuery, selectedCategory, selectedPricingModel, sortField, sortOrder, i18n.language]);

  const totalPages = Math.max(1, Math.ceil(processedApps.length / pageSize));
  const paginatedApps = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedApps.slice(start, start + pageSize);
  }, [processedApps, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedPricingModel]);

  const isFilterActive =
    searchQuery.trim() !== "" || selectedCategory !== "ALL" || selectedPricingModel !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedPricingModel("ALL");
  };

  const toggleSelectApp = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedApps.length && selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedApps.map((a) => a.id)));
    }
  };

  const handleBulkToggleActive = async (activate: boolean) => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          apiClient.put(`${APPS_ENDPOINT}/${id}`, { isActive: activate }),
        ),
      );
      setApps((prev) => prev.map((a) => (selectedIds.has(a.id) ? { ...a, isActive: activate } : a)));
      setSelectedIds(new Set());
      toast.success(
        activate
          ? t("subscription.bulkActivated", "Selected apps activated successfully")
          : t("subscription.bulkDeactivated", "Selected apps deactivated successfully"),
      );
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || t("common.error", "An error occurred"));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => apiClient.delete(`${APPS_ENDPOINT}/${id}`)),
      );
      setApps((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      toast.success(t("subscription.bulkDeleted", "Selected apps deleted successfully"));
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err) || t("common.error", "An error occurred"));
    }
  };

  return {
    t,
    isSuperAdmin,
    loading,
    stats,
    categories,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedPricingModel, setSelectedPricingModel,
    sortField, sortOrder, handleSort,
    viewMode, setViewMode,
    detailApp, setDetailApp,
    isDialogOpen, setIsDialogOpen,
    editingApp, setEditingApp,
    deleteConfirmId, setDeleteConfirmId,
    selectedIds, toggleSelectApp, toggleSelectAll,
    trialDaysEdit, setTrialDaysEdit, commitTrialDays,
    page, setPage, pageSize, setPageSize, totalPages,
    processedApps, paginatedApps,
    isFilterActive, clearFilters,
    getCategoryLabel, getAppName,
    handleOpenDialog, handleSaveApp,
    handleToggleActive: (app: MarketplaceApp) => toggleField(app, "isActive"),
    handleToggleInstalled: (app: MarketplaceApp) => toggleField(app, "isInstalled"),
    handleBulkToggleActive,
    handleBulkDelete: () => setDeleteConfirmId(BULK_DELETE_ID),
    confirmDeleteApp, confirmBulkDelete,
  };
};

export type AppPricingController = ReturnType<typeof useAppPricingSheetController>;
