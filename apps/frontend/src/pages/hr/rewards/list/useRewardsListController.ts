import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../../../services/apiClient";
import { useAuth } from "../../../../hooks/useAuthSimple";
import { tToast } from "../../../../utils/i18n-toast";
import { mapRewardStatusFilterToApi } from "../rewardRecordUtils";
import {
  RewardRecord,
  RewardListStatistics,
  RewardListFilters,
  RewardListPagination,
} from "./types";
import { createDefaultRewardFilters } from "./helpers";

export const useRewardsListController = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<RewardRecord[]>([]);
  const [statistics, setStatistics] = useState<RewardListStatistics | null>(
    null,
  );
  const [pagination, setPagination] = useState<RewardListPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<RewardListFilters>(
    createDefaultRewardFilters,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RewardRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiStatusFilter = mapRewardStatusFilterToApi(filters.status);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries({
            ...filters,
            status: apiStatusFilter,
          }).filter(([_, v]) => v !== ""),
        ),
      });

      const response = await apiClient.get(`/hr/rewards/records?${params}`);

      if (response.data.success) {
        setRecords(response.data.records || []);
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
      }
    } catch (err: any) {
      console.error("Error fetching rewards:", err);
      setError(err.response?.data?.message || "فشل في تحميل المكافآت");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStatistics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        month: filters.month,
        year: filters.year,
      });

      const response = await apiClient.get(`/hr/rewards/statistics?${params}`);

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  }, [filters.month, filters.year]);

  useEffect(() => {
    fetchRewards();
    fetchStatistics();
  }, [fetchRewards, fetchStatistics]);

  const handleStatusUpdate = async (
    id: string,
    action: "approve" | "reject",
  ) => {
    try {
      setLoading(true);
      await apiClient.patch(`/hr/rewards/${action}/${id}`);
      toast.success(
        action === "approve" ? "تم اعتماد المكافأة" : "تم رفض المكافأة",
      );
      fetchRewards();
      fetchStatistics();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل تحديث الحالة");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = useCallback((record: RewardRecord) => {
    setDeleteTarget(record);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await apiClient.delete(`/hr/rewards/records/${deleteTarget.id}`);
      tToast.success("RewardsList.success_delete_7170");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);

      if (records.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        await fetchStatistics();
      } else {
        await Promise.all([fetchRewards(), fetchStatistics()]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في حذف المكافأة");
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setFilters(createDefaultRewardFilters());
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return {
    navigate,
    user,
    loading,
    error,
    records,
    statistics,
    pagination,
    setPagination,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteTarget,
    setDeleteTarget,
    deleting,
    fetchRewards,
    handleStatusUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    resetFilters,
  };
};
