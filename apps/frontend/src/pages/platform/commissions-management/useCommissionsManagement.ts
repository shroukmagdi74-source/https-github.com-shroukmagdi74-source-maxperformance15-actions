import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import { useCurrency } from "../../../hooks/useCurrency";
import { useTheme } from "../../../hooks/useTheme";
import { toast as namedToast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";

const toast = namedToast;
import type {
  Commission,
  AffiliatePayout,
  CommissionStats,
  CommissionFilters,
} from "./types";

export function useCommissionsManagement() {
  const { formatPrice } = useCurrency();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);
  const [proofTargetPayoutId, setProofTargetPayoutId] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [filters, setFilters] = useState<CommissionFilters>({
    status: "",
    type: "",
  });

  const showSuccess = (key: string) => {
    try {
      tToast.success(key);
    } catch {
      toast.success?.(key);
    }
  };

  const showError = (key: string) => {
    try {
      tToast.error(key);
    } catch {
      toast.error?.(key);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;

      const [commissionsResponse, payoutsResponse] = await Promise.all([
        apiClient.get("/commissions", { params }),
        apiClient.get("/affiliates/admin/payouts"),
      ]);

      if (commissionsResponse.data?.success) {
        setCommissions(commissionsResponse.data.data.commissions || []);
        setStats(commissionsResponse.data.data.stats || null);
      }

      if (payoutsResponse.data?.success) {
        setPayouts(payoutsResponse.data.data || []);
      }
    } catch {
      showError("CommissionsManagement.error_error_d02d");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filters]);

  const updateCommissionStatus = async (
    commissionId: string,
    status: string
  ) => {
    try {
      const response = await apiClient.put(
        `/commissions/${commissionId}/status`,
        { status }
      );
      if (response.data?.success) {
        showSuccess("CommissionsManagement.success_update_a539");
        void loadData();
      }
    } catch {
      showError("CommissionsManagement.error_error_dffd");
    }
  };

  const recordExternalPayout = async (payoutId: string) => {
    const transactionId = window.prompt("أدخل رقم العملية أو رقم التحويل");
    if (transactionId === null) return;

    const normalizedTransactionId = transactionId.trim();
    if (!normalizedTransactionId) {
      showError("CommissionsManagement.msg_eebb");
      return;
    }

    const externalReference = window.prompt("مرجع إضافي أو ملاحظة (اختياري)");

    try {
      setProcessingPayoutId(payoutId);
      const response = await apiClient.post(
        `/affiliates/payouts/${payoutId}/record-external`,
        {
          transactionId: normalizedTransactionId,
          externalReference: externalReference?.trim() || undefined,
        }
      );

      if (response.data?.success) {
        showSuccess("CommissionsManagement.msg_6a52");
        void loadData();
      }
    } catch (error: any) {
      toast.error?.(error.response?.data?.message || "فشل تسجيل التحويل");
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const cancelPayoutRequest = async (payoutId: string) => {
    const reason = window.prompt("سبب رفض أو إلغاء طلب السحب");
    if (reason === null) return;

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      showError("CommissionsManagement.reason_required_09eb");
      return;
    }

    try {
      setProcessingPayoutId(payoutId);
      const response = await apiClient.post(
        `/affiliates/payouts/${payoutId}/cancel`,
        { reason: normalizedReason }
      );

      if (response.data?.success) {
        showSuccess("CommissionsManagement.msg_9672");
        void loadData();
      }
    } catch (error: any) {
      toast.error?.(error.response?.data?.message || "فشل إلغاء طلب السحب");
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const openProofUploadDialog = (payoutId: string) => {
    setProofTargetPayoutId(payoutId);
    proofInputRef.current?.click();
  };

  const uploadPayoutProof = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    const payoutId = proofTargetPayoutId;
    event.target.value = "";

    if (!selectedFile || !payoutId) {
      setProofTargetPayoutId(null);
      return;
    }

    try {
      setProcessingPayoutId(payoutId);
      const formData = new FormData();
      formData.append("proof", selectedFile);

      const response = await apiClient.post(
        `/affiliates/payouts/${payoutId}/proof`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.success) {
        showSuccess("CommissionsManagement.msg_b64d");
        void loadData();
      }
    } catch (error: any) {
      toast.error?.(error.response?.data?.message || "فشل رفع إثبات التحويل");
    } finally {
      setProcessingPayoutId(null);
      setProofTargetPayoutId(null);
    }
  };

  const pendingPayouts = useMemo(
    () => payouts.filter((payout) => payout.status === "PENDING"),
    [payouts]
  );

  const pendingPayoutAmount = useMemo(
    () =>
      pendingPayouts.reduce(
        (sum, payout) => sum + Number(payout.amount || 0),
        0
      ),
    [pendingPayouts]
  );

  return {
    formatPrice,
    isDark,
    commissions,
    payouts,
    stats,
    loading,
    processingPayoutId,
    proofInputRef,
    filters,
    setFilters,
    pendingPayouts,
    pendingPayoutAmount,
    loadData,
    updateCommissionStatus,
    recordExternalPayout,
    cancelPayoutRequest,
    openProofUploadDialog,
    uploadPayoutProof,
  };
}
