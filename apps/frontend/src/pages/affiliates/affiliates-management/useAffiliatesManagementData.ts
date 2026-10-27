import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "../../../services/apiClient";
import { useTheme } from "../../../hooks/useTheme";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  Affiliate,
  AffiliateDocumentVersion,
  AffiliatePolicyFormData,
  AffiliateReviewLog,
  ApiSuccess,
} from "./types";
import { getApiErrorMessage } from "./helpers";

const initialPolicyForm: AffiliatePolicyFormData = {
  minPayout: 100,
  canCreateOrdersForOthers: true,
  canViewCustomerData: true,
};

export const useAffiliatesManagementData = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [newCommission, setNewCommission] = useState<number>(0);
  const [editingPolicyAffiliate, setEditingPolicyAffiliate] =
    useState<Affiliate | null>(null);
  const [policyForm, setPolicyForm] =
    useState<AffiliatePolicyFormData>(initialPolicyForm);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [updatingDocumentAffiliateId, setUpdatingDocumentAffiliateId] =
    useState<string | null>(null);
  const [historyAffiliate, setHistoryAffiliate] = useState<Affiliate | null>(null);
  const [reviewHistory, setReviewHistory] = useState<AffiliateReviewLog[]>([]);
  const [documentHistory, setDocumentHistory] = useState<
    AffiliateDocumentVersion[]
  >([]);
  const [loadingReviewHistory, setLoadingReviewHistory] = useState(false);

  const fetchAffiliates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiSuccess<Affiliate[]>>(
        "/affiliates/list",
      );
      if (response.data.success) {
        setAffiliates(response.data.data);
      }
    } catch (_error: unknown) {
      tToast.error("affiliates.loadFailed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const handleStatusUpdate = async (affiliateId: string, newStatus: string) => {
    const affiliate = affiliates.find((item) => item.id === affiliateId);
    if (!affiliate) {
      return;
    }

    const promptMessage =
      newStatus === "ACTIVE"
        ? "ملاحظة التفعيل أو سبب القبول (اختياري)"
        : newStatus === "SUSPENDED"
          ? "سبب الإيقاف أو الرفض"
          : "ملاحظة حالة المراجعة (اختياري)";
    const enteredReason = window.prompt(
      promptMessage,
      affiliate.statusReason || "",
    );

    if (enteredReason === null) {
      return;
    }

    const normalizedReason = enteredReason.trim();
    if (newStatus === "SUSPENDED" && !normalizedReason) {
      tToast.error("affiliates.suspendReasonRequired");
      return;
    }

    try {
      const response = await apiClient.put<
        ApiSuccess<unknown>,
        { status: string; statusReason: string | null }
      >(`/affiliates/${affiliateId}/status`, {
        status: newStatus,
        statusReason: normalizedReason || null,
      });
      if (response.data.success) {
        tToast.success("affiliates.statusUpdated");
        fetchAffiliates();
      }
    } catch (_error: unknown) {
      tToast.error("affiliates.statusUpdateFailed");
    }
  };

  const updateCommission = async (affiliateId: string) => {
    try {
      const affiliate = affiliates.find((item) => item.id === affiliateId);
      if (!affiliate) return;

      if (!Number.isFinite(newCommission) || newCommission < 0) {
        tToast.error("affiliates.invalidCommissionValue");
        return;
      }

      if (affiliate.commissionType === "PERCENTAGE" && newCommission > 100) {
        tToast.error("affiliates.commissionRateMax");
        return;
      }

      const response = await apiClient.put<
        ApiSuccess<unknown>,
        { commissionRate: number }
      >(`/affiliates/${affiliateId}/commission`, {
        commissionRate: newCommission,
      });
      if (response.data.success) {
        tToast.success("affiliates.commissionUpdated");
        setEditingCommission(null);
        fetchAffiliates();
      }
    } catch (_error: unknown) {
      tToast.error("affiliates.commissionUpdateFailed");
    }
  };

  const openPolicyEditor = (affiliate: Affiliate) => {
    setEditingPolicyAffiliate(affiliate);
    setPolicyForm({
      minPayout: Number(affiliate.minPayout || 100),
      canCreateOrdersForOthers: Boolean(affiliate.canCreateOrdersForOthers),
      canViewCustomerData: Boolean(affiliate.canViewCustomerData),
    });
  };

  const updatePolicy = async () => {
    if (!editingPolicyAffiliate) {
      return;
    }

    try {
      setSavingPolicy(true);
      const response = await apiClient.put<
        ApiSuccess<Affiliate>,
        typeof policyForm
      >(`/affiliates/${editingPolicyAffiliate.id}/policy`, {
        minPayout: Number(policyForm.minPayout),
        canCreateOrdersForOthers: policyForm.canCreateOrdersForOthers,
        canViewCustomerData: policyForm.canViewCustomerData,
      });
      if (response.data.success) {
        tToast.success("affiliates.controlsUpdated");
        setEditingPolicyAffiliate(null);
        fetchAffiliates();
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحديث ضوابط المسوق"));
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleDocumentReviewUpdate = async (
    affiliate: Affiliate,
    nextStatus: "APPROVED" | "REJECTED",
  ) => {
    if (!affiliate.identityDocumentUrl || affiliate.isMissingRecord) {
      return;
    }

    let reviewNote: string | null = null;
    if (nextStatus === "REJECTED") {
      const enteredReason = window.prompt(
        "سبب رفض مستند الاعتماد",
        affiliate.identityDocumentReviewNote || "",
      );

      if (enteredReason === null) {
        return;
      }

      reviewNote = enteredReason.trim();
      if (!reviewNote) {
        tToast.error("affiliates.rejectionReasonRequired");
        return;
      }
    }

    try {
      setUpdatingDocumentAffiliateId(affiliate.id);
      const response = await apiClient.put<
        ApiSuccess<Affiliate>,
        { status: "APPROVED" | "REJECTED"; reviewNote: string | null }
      >(`/affiliates/${affiliate.id}/document-review`, {
        status: nextStatus,
        reviewNote,
      });

      if (response.data.success) {
        toast.success(
          nextStatus === "APPROVED"
            ? "تم اعتماد المستند بنجاح"
            : "تم رفض مستند الاعتماد",
        );
        await fetchAffiliates();
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحديث حالة مستند الاعتماد"));
    } finally {
      setUpdatingDocumentAffiliateId(null);
    }
  };

  const openReviewHistory = async (affiliate: Affiliate) => {
    try {
      setHistoryAffiliate(affiliate);
      setLoadingReviewHistory(true);
      const [reviewResponse, documentResponse] = await Promise.all([
        apiClient.get<ApiSuccess<AffiliateReviewLog[]>>(
          `/affiliates/${affiliate.id}/review-history`,
        ),
        apiClient.get<ApiSuccess<AffiliateDocumentVersion[]>>(
          `/affiliates/${affiliate.id}/document-history`,
        ),
      ]);
      if (reviewResponse.data.success) {
        setReviewHistory(reviewResponse.data.data || []);
      }
      if (documentResponse.data.success) {
        setDocumentHistory(documentResponse.data.data || []);
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحميل سجل مراجعات المسوق"));
      setHistoryAffiliate(null);
      setReviewHistory([]);
      setDocumentHistory([]);
    } finally {
      setLoadingReviewHistory(false);
    }
  };

  const closeReviewHistory = () => {
    setHistoryAffiliate(null);
    setReviewHistory([]);
    setDocumentHistory([]);
  };

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((affiliate) => {
      const matchesSearch =
        affiliate.user.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        affiliate.user.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        affiliate.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (affiliate.user.phone || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "ALL" || affiliate.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [affiliates, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const totalCount = affiliates.length;
    const pendingCount = affiliates.filter((a) => a.status === "PENDING").length;
    const totalSales = affiliates.reduce(
      (acc, curr) => acc + (curr.totalSales || 0),
      0,
    );
    const totalEarnings = affiliates
      .reduce((acc, curr) => acc + (Number(curr.totalEarnings) || 0), 0)
      .toFixed(2);

    return {
      totalCount,
      pendingCount,
      totalSales,
      totalEarnings,
    };
  }, [affiliates]);

  return {
    isDark,
    affiliates,
    filteredAffiliates,
    stats,
    loading,
    searchTerm,
    filterStatus,
    editingCommission,
    newCommission,
    editingPolicyAffiliate,
    policyForm,
    savingPolicy,
    updatingDocumentAffiliateId,
    historyAffiliate,
    reviewHistory,
    documentHistory,
    loadingReviewHistory,
    setSearchTerm,
    setFilterStatus,
    setEditingCommission,
    setNewCommission,
    setEditingPolicyAffiliate,
    setPolicyForm,
    fetchAffiliates,
    handleStatusUpdate,
    updateCommission,
    openPolicyEditor,
    updatePolicy,
    handleDocumentReviewUpdate,
    openReviewHistory,
    closeReviewHistory,
  };
};
