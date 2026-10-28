import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api, fetchJson, getAuthHeaders, parsePatientFlags, RadiologyStudy } from "../shared";
import { canManageRadiology } from "./helpers";
import { StudyDetailsData } from "./types";

export function useStudyDetails(studyId: string) {
  const { t } = useTranslation();
  const canManage = canManageRadiology();
  const [data, setData] = useState<StudyDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [payModal, setPayModal] = useState<"PAY" | "REFUND" | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payNote, setPayNote] = useState("");
  const [savingPay, setSavingPay] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [editingReport, setEditingReport] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [savingReport, setSavingReport] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiDraftInfo, setAiDraftInfo] = useState<string | null>(null);
  const [criticalOpen, setCriticalOpen] = useState(false);
  const [criticalCategory, setCriticalCategory] = useState("NONE");
  const [criticalFindingText, setCriticalFindingText] = useState("");
  const [savingCritical, setSavingCritical] = useState(false);
  const [siblings, setSiblings] = useState<RadiologyStudy[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchJson<StudyDetailsData>(api(`studies/${studyId}/details`));
      setData(d);
      if (d.study.appointmentId) {
        try {
          const list = await fetchJson<{ items?: RadiologyStudy[] }>(
            api(`studies?appointmentId=${encodeURIComponent(d.study.appointmentId)}&limit=50`),
          );
          setSiblings((list.items || []).filter((s) => s.id !== studyId));
        } catch {
          setSiblings([]);
        }
      } else {
        setSiblings([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("radiology.operationFailed"));
    } finally {
      setLoading(false);
    }
  }, [studyId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const report = data?.report || null;

  useEffect(() => {
    setCriticalCategory(report?.criticalCategory || "NONE");
    setCriticalFindingText(report?.criticalFindingText || "");
  }, [report?.criticalCategory, report?.criticalFindingText]);

  const history = useMemo(
    () =>
      [...(data?.statusHistory || [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [data?.statusHistory],
  );

  const flags = useMemo(
    () => parsePatientFlags(data?.study?.patientFlags),
    [data?.study?.patientFlags],
  );

  const recordPayment = async () => {
    if (savingPay) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("radiology.studies.invalidAmount"));
      return;
    }
    setSavingPay(true);
    try {
      await fetchJson(api(`studies/${studyId}/payment`), {
        method: "POST",
        body: JSON.stringify({ amount, method: payMethod, note: payNote.trim() || undefined }),
      });
      toast.success(t("radiology.studies.paymentRecorded", { amount }));
      setPayModal(null);
      setPayAmount("");
      setPayNote("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.studies.paymentFailed"));
    } finally {
      setSavingPay(false);
    }
  };

  const recordRefund = async () => {
    if (savingPay) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t("radiology.studies.invalidAmount"));
      return;
    }
    setSavingPay(true);
    try {
      await fetchJson(api(`studies/${studyId}/payment/refund`), {
        method: "POST",
        body: JSON.stringify({ amount, note: payNote.trim() || undefined }),
      });
      toast.success(t("radiology.studies.refundRecorded", { amount }));
      setPayModal(null);
      setPayAmount("");
      setPayNote("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.studies.refundFailed"));
    } finally {
      setSavingPay(false);
    }
  };

  const printPdf = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const res = await fetch(api(`studies/${studyId}/report/pdf`), { headers: getAuthHeaders() });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || t("radiology.reports.pdfFailed"));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.reports.pdfFailed"));
    } finally {
      setPrinting(false);
    }
  };

  const startEditReport = () => {
    setDraftText(report?.reportText || "");
    setAiDraftInfo(null);
    setEditingReport(true);
  };

  const cancelEditReport = () => {
    setEditingReport(false);
    setDraftText("");
    setAiDraftInfo(null);
  };

  const saveReport = async () => {
    if (savingReport) return;
    setSavingReport(true);
    try {
      await fetchJson(api(`studies/${studyId}/report`), {
        method: "PUT",
        body: JSON.stringify({ reportText: draftText.trim() }),
      });
      toast.success(t("radiology.reports.reportSaved"));
      setEditingReport(false);
      setDraftText("");
      setAiDraftInfo(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.reports.reportSaveFailed"));
    } finally {
      setSavingReport(false);
    }
  };

  const generateDraft = async () => {
    if (aiDrafting) return;
    setAiDrafting(true);
    setAiDraftInfo(null);
    try {
      const res = await fetchJson<{ draft: string | null; reason?: string; model?: string }>(
        api(`studies/${studyId}/report/draft`),
        {
          method: "POST",
          body: JSON.stringify({ focus: "full" }),
        },
      );
      if (res.draft) {
        setDraftText(res.draft);
        setAiDraftInfo(
          res.model
            ? `${t("radiology.aiDraft.disclaimer")} — ${t("radiology.aiDraft.model")}: ${res.model}`
            : t("radiology.aiDraft.disclaimer"),
        );
        toast.info(t("radiology.aiDraft.filled"));
      } else if (res.reason === "AI_NOT_CONFIGURED") {
        toast.warning(t("radiology.aiDraft.notConfigured"));
      } else {
        toast.error(t("radiology.aiDraft.failed"));
      }
    } catch (e) {
      toast.error(t("radiology.aiDraft.failed"));
    } finally {
      setAiDrafting(false);
    }
  };

  const saveCriticalFlag = async () => {
    if (savingCritical) return;
    setSavingCritical(true);
    try {
      await fetchJson(api(`studies/${studyId}/report/critical`), {
        method: "PUT",
        body: JSON.stringify({
          category: criticalCategory,
          findingText: criticalFindingText.trim() || undefined,
        }),
      });
      await load();
      if (criticalCategory === "NONE") {
        toast.success(t("radiology.critical.clearSuccess"));
      }
    } catch (e) {
      toast.error(t("radiology.critical.saveFailed"));
    } finally {
      setSavingCritical(false);
    }
  };

  const acknowledgeCritical = async () => {
    if (savingCritical) return;
    if (!window.confirm(t("radiology.critical.confirmAcknowledge") as string)) return;
    setSavingCritical(true);
    try {
      await fetchJson(api(`studies/${studyId}/report/critical/acknowledge`), {
        method: "POST",
      });
      toast.success(t("radiology.critical.acknowledgeSuccess"));
      await load();
    } catch (e) {
      toast.error(t("radiology.critical.saveFailed"));
    } finally {
      setSavingCritical(false);
    }
  };

  return {
    data,
    loading,
    error,
    load,
    canManage,
    siblings,
    viewerOpen,
    setViewerOpen,
    payModal,
    setPayModal,
    payAmount,
    setPayAmount,
    payMethod,
    setPayMethod,
    payNote,
    setPayNote,
    savingPay,
    recordPayment,
    recordRefund,
    printing,
    printPdf,
    editingReport,
    startEditReport,
    cancelEditReport,
    draftText,
    setDraftText,
    savingReport,
    saveReport,
    aiDrafting,
    aiDraftInfo,
    generateDraft,
    criticalOpen,
    setCriticalOpen,
    criticalCategory,
    setCriticalCategory,
    criticalFindingText,
    setCriticalFindingText,
    savingCritical,
    saveCriticalFlag,
    acknowledgeCritical,
    history,
    flags,
  };
}
