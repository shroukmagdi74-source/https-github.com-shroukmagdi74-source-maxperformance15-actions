import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../../../services/apiClient";
import { useAuth } from "../../../../hooks/useAuthSimple";
import { tToast } from "../../../../utils/i18n-toast";
import {
  canUserApproveReward,
  canUserDeleteReward,
  canUserEditReward,
  normalizeRewardStatus,
} from "../rewardRecordUtils";
import { RewardDetailsRecord } from "./types";

export const useRewardDetailsController = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardDetailsRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchRewardDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/hr/rewards/records/${id}`);

      if (response.data.success) {
        setReward(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching reward details:", err);
      setError(err.response?.data?.message || "فشل في تحميل تفاصيل المكافأة");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRewardDetails();
    }
  }, [id, fetchRewardDetails]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await apiClient.patch(`/hr/rewards/approve/${id}`, {});
      tToast.success("RewardDetails.msg_7955");
      fetchRewardDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في اعتماد المكافأة");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setActionLoading(true);
      await apiClient.patch(`/hr/rewards/reject/${id}`, { reason });
      tToast.success("RewardDetails.msg_1c5d");
      fetchRewardDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في رفض المكافأة");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = useCallback(async () => {
    try {
      setActionLoading(true);
      await apiClient.delete(`/hr/rewards/records/${id}`);
      tToast.success("RewardDetails.success_delete_48dd");
      setDeleteDialogOpen(false);
      navigate("/hr/rewards");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل في حذف المكافأة");
    } finally {
      setActionLoading(false);
    }
  }, [id, navigate]);

  const normalizedStatus = reward ? normalizeRewardStatus(reward) : "PENDING";
  const canApproveThisReward =
    normalizedStatus === "PENDING" && canUserApproveReward(user?.role);
  const canEditThisReward =
    normalizedStatus === "PENDING" && canUserEditReward(user?.role);
  const canDeleteThisReward = canUserDeleteReward(user?.role);

  return {
    id,
    navigate,
    loading,
    error,
    reward,
    actionLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    normalizedStatus,
    canApproveThisReward,
    canEditThisReward,
    canDeleteThisReward,
    handleApprove,
    handleReject,
    handleDeleteConfirm,
  };
};
