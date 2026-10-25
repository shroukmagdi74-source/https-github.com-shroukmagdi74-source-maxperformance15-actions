import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import i18n from "../../../i18n";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { Promotion } from "./types";
import { computePromotionStats, filterAndSortPromotions } from "./helpers";

export const useEmployeesPromotionController = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("promotionDate");

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/promotions");

      let fetchedPromotions: Promotion[] = [];
      if (
        response.data &&
        response.data.promotions &&
        Array.isArray(response.data.promotions)
      ) {
        fetchedPromotions = response.data.promotions;
      } else if (Array.isArray(response.data)) {
        fetchedPromotions = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        fetchedPromotions = response.data.data;
      }

      setPromotions(fetchedPromotions);
    } catch (error: any) {
      console.error("Error fetching promotions:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "فشل في جلب الترقيات";
      toast.error(errorMessage);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filteredPromotions = useMemo(
    () =>
      filterAndSortPromotions({
        promotions,
        searchTerm,
        statusFilter,
        sortBy,
      }),
    [promotions, searchTerm, statusFilter, sortBy],
  );

  const handleUpdateStatus = async (
    promotionId: string,
    status: string,
    rejectionReason?: string,
  ) => {
    try {
      const response = await api.put(`/hr/promotions/${promotionId}`, {
        status,
        rejectionReason,
      });
      if (response.data.success) {
        toast.success(
          status === "APPROVED"
            ? "تم اعتماد الترقية بنجاح وتحديث ملف الموظف"
            : "تم رفض الترقية",
        );
        fetchPromotions();
      } else {
        toast.error(
          response.data.error ||
            i18n.t("EmployeesPromotion.failed_update_d7a0"),
        );
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء التحديث");
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      const response = await api.delete(`/hr/promotions/${promotionId}`);
      if (response.data.success) {
        tToast.success("EmployeesPromotion.success_delete_044f");
        fetchPromotions();
      } else {
        toast.error(
          response.data.error ||
            i18n.t("EmployeesPromotion.failed_delete_c80d"),
        );
      }
    } catch (error: any) {
      console.error("Error deleting promotion:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "فشل في حذف الترقية";
      toast.error(errorMessage);
    }
  };

  const stats = computePromotionStats(promotions);

  const goToNewPromotion = () => navigate("/hr/promotions/new");
  const goToEditPromotion = (promotionId: string) =>
    navigate(`/hr/promotions/${promotionId}/edit`);

  return {
    promotions,
    filteredPromotions,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    stats,
    handleUpdateStatus,
    handleDeletePromotion,
    goToNewPromotion,
    goToEditPromotion,
  };
};
