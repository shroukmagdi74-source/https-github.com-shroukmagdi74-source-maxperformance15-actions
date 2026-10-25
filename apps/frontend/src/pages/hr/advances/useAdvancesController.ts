import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import type {
  AdvanceRequest,
  AdvancePagination,
  AdvanceStats,
  PayStatusFilter,
} from "./types";
import { isRequestPaid } from "./helpers";

export const useAdvancesController = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [pagination, setPagination] = useState<AdvancePagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [payStatusFilter, setPayStatusFilter] =
    useState<PayStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(
    null,
  );
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] =
    useState(false);

  const fetchAdvances = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await api.get(`/hr/advances?${params}`);
      const advancesData = response.data?.data || [];
      setRequests(Array.isArray(advancesData) ? advancesData : []);

      if (response.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error fetching advances:", error);
      tToast.error("Advances.error_error_0c59");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdvances();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchAdvances]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/hr/advances/${id}/approve`);
      tToast.success("Advances.msg_0709");
      fetchAdvances();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ");
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    try {
      await api.post(`/hr/advances/${selectedRequest.id}/reject`, {
        rejectedReason: rejectionReason || "تم الرفض من قبل الإدارة",
      });
      tToast.success("Advances.msg_20d9");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      fetchAdvances();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ");
    }
  };

  const openRejectDialog = (request: AdvanceRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const openDetailsDialog = (request: AdvanceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const openUpdateStatusDialog = (request: AdvanceRequest) => {
    setSelectedRequest(request);
    setIsUpdateStatusDialogOpen(true);
  };

  const handleUpdateStatus = (status: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return;
    setIsUpdateStatusDialogOpen(false);

    if (status === "APPROVED") {
      handleApprove(selectedRequest.id);
    } else {
      openRejectDialog(selectedRequest);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

    try {
      await api.delete(`/hr/advances/${id}`);
      tToast.success("Advances.success_delete_c219");
      fetchAdvances();
    } catch (error) {
      console.error("Error deleting advance:", error);
      tToast.error("Advances.error_error_7491");
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      await api.post(`/hr/advances/${id}/mark-paid`);
      tToast.success("Advances.msg_408c");
      fetchAdvances();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "فشل في تحديث حالة السلفة");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const paid = isRequestPaid(request);
      if (payStatusFilter === "paid") return paid;
      if (payStatusFilter === "unpaid") return !paid;
      return true;
    });
  }, [requests, payStatusFilter]);

  const stats: AdvanceStats = useMemo(() => {
    return {
      total: requests?.length || 0,
      pending: requests?.filter((r) => r.status === "PENDING").length || 0,
      approved: requests?.filter((r) => r.status === "APPROVED").length || 0,
      totalAmount:
        requests?.reduce(
          (sum, r) => sum + parseFloat(r.amount?.toString() || "0"),
          0,
        ) || 0,
    };
  }, [requests]);

  return {
    loading,
    requests: filteredRequests,
    rawTotalCount: requests.length,
    pagination,
    handlePageChange,
    statusFilter,
    setStatusFilter,
    payStatusFilter,
    setPayStatusFilter,
    searchTerm,
    setSearchTerm,
    selectedRequest,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    rejectionReason,
    setRejectionReason,
    isDetailsOpen,
    setIsDetailsOpen,
    isUpdateStatusDialogOpen,
    setIsUpdateStatusDialogOpen,
    fetchAdvances,
    handleApprove,
    confirmReject,
    openRejectDialog,
    openDetailsDialog,
    openUpdateStatusDialog,
    handleUpdateStatus,
    handleDelete,
    markAsPaid,
    stats,
  };
};
