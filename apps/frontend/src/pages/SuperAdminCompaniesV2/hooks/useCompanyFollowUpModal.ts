import { useState, useCallback } from "react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient } from "../../../services/apiClient";
import {
  extractErrorMessage,
  toDateTimeLocalValue,
  fromDateTimeLocalValue,
  getDefaultFollowUpScheduleValue,
} from "../utils";
import type { Company, FollowUpFormData } from "../types";

interface UseCompanyFollowUpModalOptions {
  admin: { id?: string } | null | undefined;
  refetch: () => void;
}

export function useCompanyFollowUpModal({ admin, refetch }: UseCompanyFollowUpModalOptions) {
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpCompany, setFollowUpCompany] = useState<Company | null>(null);
  const [followUpForm, setFollowUpForm] = useState<FollowUpFormData>({
    assignedOwnerId: "",
    status: "pending",
    nextActionAt: "",
    note: "",
  });
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const handleOpenFollowUp = useCallback(async (company: Company) => {
    const state =
      company.followUp ||
      (await import("../../../utils/companyFollowUp")).getCompanyFollowUpState(company);
    setFollowUpCompany(company);
    setFollowUpForm({
      assignedOwnerId: state.assignedOwner.id || "",
      status: state.status === "unassigned" ? "pending" : state.status,
      callStatus: state.callStatus || "not_called",
      callDuration: state.callDuration ? String(state.callDuration) : "",
      nextActionAt:
        toDateTimeLocalValue(state.nextActionAt) ||
        (state.assignedOwner.id && state.status !== "resolved"
          ? getDefaultFollowUpScheduleValue(state.status)
          : ""),
      note: "",
    });
    setFollowUpOpen(true);
  }, []);

  const handleSaveFollowUp = async () => {
    if (!followUpCompany) return;
    setSavingFollowUp(true);
    try {
      const payload: Record<string, unknown> = {
        status: followUpForm.assignedOwnerId ? followUpForm.status : "unassigned",
        note: followUpForm.note.trim() || undefined,
        clearOwner: !followUpForm.assignedOwnerId,
        clearNextAction: !followUpForm.assignedOwnerId || !followUpForm.nextActionAt,
        callStatus: followUpForm.callStatus || "not_called",
        callDuration: followUpForm.callDuration ? Number(followUpForm.callDuration) : undefined,
      };
      if (followUpForm.assignedOwnerId) payload.assignedOwnerId = followUpForm.assignedOwnerId;
      if (followUpForm.assignedOwnerId && followUpForm.nextActionAt)
        payload.nextActionAt = fromDateTimeLocalValue(followUpForm.nextActionAt);
      const res = await apiClient.put(
        `/admin/companies/${followUpCompany.id}/follow-up`,
        payload
      );
      if (res.data?.success) {
        tToast.success("index.success_update_f06b");
        setFollowUpOpen(false);
        refetch();
      } else toast.error(res.data?.message || "فشل في التحديث");
    } catch (err) {
      toast.error(extractErrorMessage(err, "فشل في التحديث"));
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleRunFollowUpAction = useCallback(
    async (company: Company, action: "remind" | "escalate") => {
      try {
        const payload = action === "remind" ? { markReminderSent: true } : { markEscalated: true };
        const res = await apiClient.put(`/admin/companies/${company.id}/follow-up`, payload);
        if (res.data?.success) {
          toast.success(action === "remind" ? "تم تسجيل التذكير" : "تم تسجيل التصعيد");
          refetch();
        } else toast.error(res.data?.message || "فشل");
      } catch (err) {
        toast.error(extractErrorMessage(err, "فشل"));
      }
    },
    [refetch]
  );

  const assignFollowUpSelf = useCallback(() => {
    if (!admin?.id || !followUpCompany) return;
    setFollowUpForm((prev) => ({
      ...prev,
      assignedOwnerId: admin.id as string,
      status: prev.status === "unassigned" ? "pending" : prev.status,
      nextActionAt: prev.nextActionAt || getDefaultFollowUpScheduleValue(prev.status),
    }));
  }, [admin, followUpCompany]);

  return {
    followUpOpen,
    setFollowUpOpen,
    followUpCompany,
    followUpForm,
    setFollowUpForm,
    savingFollowUp,
    handleOpenFollowUp,
    handleSaveFollowUp,
    handleRunFollowUpAction,
    assignFollowUpSelf,
  };
}
