import { useEffect, useState } from "react";
import { toast } from "sonner";
import { companyAwareApi } from "../../../../services/companyAwareApi";
import { useCurrency } from "../../../../hooks/useCurrency";
import i18n from "../../../../i18n";
import { tToast } from "../../../../utils/i18n-toast";
import {
  AssetCategoryOption,
  AssetItemRecord,
  AssetListFiltersState,
  AssigningAssetState,
} from "./types";

export const useAssetListController = (refreshTrigger: number) => {
  const [assets, setAssets] = useState<AssetItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AssetListFiltersState>({
    status: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<AssetCategoryOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { formatPrice } = useCurrency();

  const [editingAsset, setEditingAsset] = useState<AssetItemRecord | null>(
    null,
  );
  const [assigningAsset, setAssigningAsset] =
    useState<AssigningAssetState | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    void fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    void fetchAssets(1, true);
  }, [refreshTrigger, search, filters]);

  const fetchCategories = async () => {
    try {
      const response = await companyAwareApi.get("/hr/assets/categories");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAssets = async (targetPage = page, replace = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", targetPage.toString());
      params.append("limit", "20");
      if (search) params.append("search", search);
      if (filters.status) params.append("status", filters.status);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);

      const response = await companyAwareApi.get(
        `/hr/assets?${params.toString()}`,
      );
      if (response.data.success) {
        const newData: AssetItemRecord[] = response.data.data || [];
        const pagination = response.data.pagination;
        setHasMore(
          pagination
            ? targetPage < pagination.totalPages
            : newData.length === 20,
        );
        setAssets((prev) => {
          const combined = replace ? newData : [...prev, ...newData];
          const uniqueMap = new Map<string, AssetItemRecord>();
          combined.forEach((item) => uniqueMap.set(item.id, item));
          return Array.from(uniqueMap.values());
        });
        setPage(targetPage);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من استنساخ هذا الأصل؟")) return;

    const toastId = tToast.loading("AssetList.msg_b785");
    try {
      const response = await companyAwareApi.post(`/hr/assets/${id}/clone`);
      if (response.data.success) {
        toast.success(
          response.data.message || i18n.t("AssetList.msg_c0e9"),
          { id: toastId },
        );
        void fetchAssets(1, true);
      } else {
        toast.error(response.data.message || i18n.t("AssetList.msg_20bb"), {
          id: toastId,
        });
      }
    } catch (error: any) {
      console.error("Error cloning asset:", error);
      toast.error(error.response?.data?.message || "فشل في استنساخ الأصل", {
        id: toastId,
      });
    }
  };

  const handleDelete = async (id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    if (ids.length === 0) return;

    const msg =
      ids.length > 1
        ? `هل أنت متأكد من حذف ${ids.length} أصول مختارة؟`
        : "هل أنت متأكد من حذف هذا الأصل؟";
    if (!window.confirm(msg)) return;

    const toastId = toast.loading(
      ids.length > 1 ? "جاري حذف الأصول..." : "جاري حذف الأصل...",
    );
    try {
      await Promise.all(
        ids.map((assetId) =>
          companyAwareApi.delete(`/hr/assets/${assetId}`).catch((err) => {
            console.error(`Failed to delete asset ${assetId}:`, err);
            throw err;
          }),
        ),
      );

      toast.success(
        ids.length > 1
          ? `تم حذف ${ids.length} أصول بنجاح`
          : "تم حذف الأصل بنجاح",
        { id: toastId },
      );
      setSelectedIds((prev) => prev.filter((i) => !ids.includes(i)));
      void fetchAssets(1, true);
    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast.error(error.response?.data?.message || "فشل في حذف الأصل", {
        id: toastId,
      });
    }
  };

  const handleBulkStatusChange = async (
    statusKey: string,
    statusLabel: string,
  ) => {
    const toastId = tToast.loading("AssetList.loading_update_4408");
    try {
      await Promise.all(
        selectedIds.map((assetId) =>
          companyAwareApi.put(`/hr/assets/${assetId}`, { status: statusKey }),
        ),
      );
      toast.success(
        `تم تغيير حالة ${selectedIds.length} أصول إلى ${statusLabel}`,
        { id: toastId },
      );
      setSelectedIds([]);
      void fetchAssets(1, true);
    } catch {
      toast.error("فشل في تحديث الحالة", { id: toastId });
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return {
    assets,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    categories,
    page,
    hasMore,
    formatPrice,
    editingAsset,
    setEditingAsset,
    assigningAsset,
    setAssigningAsset,
    selectedIds,
    setSelectedIds,
    fetchAssets,
    handleClone,
    handleDelete,
    handleBulkStatusChange,
    handleSelectAll,
    toggleSelect,
  };
};
