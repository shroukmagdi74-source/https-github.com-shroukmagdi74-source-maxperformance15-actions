import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import {
  AffiliateProfileResponse,
  ApiSuccess,
} from "./types";
import {
  getApiErrorMessage,
  getDisplayName,
  toNumber,
} from "./helpers";

export function useAffiliateProfile(id?: string) {
  const [profile, setProfile] = useState<AffiliateProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commissionRate, setCommissionRate] = useState("");
  const [policyForm, setPolicyForm] = useState({
    minPayout: "100",
    canCreateOrdersForOthers: true,
    canViewCustomerData: true,
  });

  const loadProfile = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiClient.get<ApiSuccess<AffiliateProfileResponse>>(
        `/affiliates/${id}/profile`,
      );
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setCommissionRate(String(data.affiliate.commissionRate || 0));
        setPolicyForm({
          minPayout: String(toNumber(data.affiliate.minPayout || 100)),
          canCreateOrdersForOthers: Boolean(
            data.affiliate.canCreateOrdersForOthers,
          ),
          canViewCustomerData: Boolean(data.affiliate.canViewCustomerData),
        });
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحميل ملف المسوق"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const affiliate = profile?.affiliate;
  const stats = profile?.stats;
  const displayName = useMemo(
    () => getDisplayName(affiliate?.user),
    [affiliate?.user],
  );

  const updateStatus = async (nextStatus: "ACTIVE" | "PENDING" | "SUSPENDED") => {
    if (!affiliate) return;
    const enteredReason = window.prompt(
      nextStatus === "SUSPENDED"
        ? "سبب إيقاف المسوق"
        : "ملاحظة القرار (اختياري)",
      affiliate.statusReason || "",
    );
    if (enteredReason === null) return;
    if (nextStatus === "SUSPENDED" && !enteredReason.trim()) {
      tToast.error("AffiliateProfile.msg_996e");
      return;
    }

    try {
      setSaving(true);
      await apiClient.put(`/affiliates/${affiliate.id}/status`, {
        status: nextStatus,
        statusReason: enteredReason.trim() || null,
      });
      tToast.success("AffiliateProfile.success_update_status_085a");
      await loadProfile();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحديث حالة المسوق"));
    } finally {
      setSaving(false);
    }
  };

  const saveCommission = async () => {
    if (!affiliate) return;
    const nextRate = Number(commissionRate);
    if (!Number.isFinite(nextRate) || nextRate < 0) {
      tToast.error("AffiliateProfile.msg_47d6");
      return;
    }

    try {
      setSaving(true);
      await apiClient.put(`/affiliates/${affiliate.id}/commission`, {
        commissionRate: nextRate,
      });
      tToast.success("AffiliateProfile.success_update_6452");
      await loadProfile();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحديث العمولة"));
    } finally {
      setSaving(false);
    }
  };

  const savePolicy = async () => {
    if (!affiliate) return;
    try {
      setSaving(true);
      await apiClient.put(`/affiliates/${affiliate.id}/policy`, {
        minPayout: Number(policyForm.minPayout),
        canCreateOrdersForOthers: policyForm.canCreateOrdersForOthers,
        canViewCustomerData: policyForm.canViewCustomerData,
      });
      tToast.success("AffiliateProfile.success_update_d401");
      await loadProfile();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحديث ضوابط المسوق"));
    } finally {
      setSaving(false);
    }
  };

  const reviewDocument = async (status: "APPROVED" | "REJECTED") => {
    if (!affiliate) return;
    let reviewNote = "";
    if (status === "REJECTED") {
      const note = window.prompt("سبب رفض مستند الاعتماد", "");
      if (note === null) return;
      reviewNote = note.trim();
      if (!reviewNote) {
        tToast.error("AffiliateProfile.msg_de2f");
        return;
      }
    }

    try {
      setSaving(true);
      await apiClient.put(`/affiliates/${affiliate.id}/document-review`, {
        status,
        reviewNote: reviewNote || null,
      });
      tToast.success("AffiliateProfile.success_update_status_fd25");
      await loadProfile();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "فشل تحديث مستند المسوق"));
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    affiliate,
    stats,
    displayName,
    loading,
    saving,
    commissionRate,
    setCommissionRate,
    policyForm,
    setPolicyForm,
    loadProfile,
    updateStatus,
    saveCommission,
    savePolicy,
    reviewDocument,
  };
}
