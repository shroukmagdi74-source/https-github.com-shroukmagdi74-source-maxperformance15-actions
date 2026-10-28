import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FolderOpen, Loader2, Printer, X as XMarkIcon } from "lucide-react";
import tokenManager from "../../../utils/tokenManager";
import {
  api,
  fetchJson,
  getCompanyId,
  RadiologyReport,
  RadiologyReportTemplate,
  RADIOLOGY_CRITICAL_META,
  criticalCategoryText,
  MODAL_CONTENT_CLS,
} from "../shared";
import RadiologyViewerModal from "../RadiologyViewerModal";
import { ActionKind, RadiologyReportModalProps, ReportStudy } from "./types";
import { ACTION_META, canManageRadiology, nextActionFor } from "./constants";
import { RadiologyReportStudyHeader } from "./RadiologyReportStudyHeader";
import { RadiologyReportTemplateEditor } from "./RadiologyReportTemplateEditor";
import { RadiologyReportAiDraftSection } from "./RadiologyReportAiDraftSection";
import { RadiologyReportCriticalSection } from "./RadiologyReportCriticalSection";

export function RadiologyReportModal({ studyId, onClose, onSaved }: RadiologyReportModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<RadiologyReport | null>(null);
  const [study, setStudy] = useState<ReportStudy | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [templates, setTemplates] = useState<RadiologyReportTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [viewerStudyId, setViewerStudyId] = useState<string | null>(null);
  const [critCategory, setCritCategory] = useState("NONE");
  const [critFindingText, setCritFindingText] = useState("");
  const [savingCritical, setSavingCritical] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [aiFocus, setAiFocus] = useState("full");
  const [generating, setGenerating] = useState(false);
  const [aiMeta, setAiMeta] = useState<{ model?: string; provider?: string } | null>(null);
  const [showPhrases, setShowPhrases] = useState(false);

  const canManage = canManageRadiology();
  const nextStep = report ? nextActionFor(report.reportStatus) : null;
  const criticalCat = report ? criticalCategoryText(report) : null;
  const criticalMeta = criticalCat ? RADIOLOGY_CRITICAL_META[criticalCat] : undefined;

  const fmtDateTime = (iso?: string): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r, tpls, detail] = await Promise.all([
          fetchJson<RadiologyReport>(api(`studies/${studyId}/report`)),
          fetchJson<RadiologyReportTemplate[]>(api("report-templates")),
          fetchJson<{ study?: ReportStudy }>(api(`studies/${studyId}/details`)).catch(() => null),
        ]);
        setReport(r);
        setText(r?.reportText || "");
        setStudy(detail?.study || null);
        setCritCategory(r?.criticalCategory || "NONE");
        setCritFindingText(r?.criticalFindingText || "");
        setTemplates(tpls || []);
        if ((!r || !(r.reportText || "").trim()) && tpls && tpls.length > 0) {
          const first = tpls[0]!;
          setTemplateId(first.id);
          setText(first.body);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("radiology.reports.reportLoadFailed"));
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [studyId, onClose, t]);

  const applyTemplate = (id: string) => {
    const tpl = templates.find((x) => x.id === id);
    setTemplateId(id);
    if (tpl) setText(tpl.body);
  };

  const appendText = (suffix: string) => {
    setText((prev) => (prev ? `${prev}\n${suffix}` : suffix));
  };

  const appendSection = (labelKey: string) => {
    const label = t(`radiology.reports.${labelKey}`);
    setText((prev) => (prev ? `${prev}\n\n${label}:\n` : `${label}:\n`));
  };

  const generateDraft = async () => {
    if (generating) return;
    setGenerating(true);
    setAiMeta(null);
    try {
      const res = await fetchJson<{
        draft: string | null;
        reason?: "AI_NOT_CONFIGURED" | "AI_ERROR";
        model?: string;
        provider?: string;
      }>(api(`studies/${studyId}/report/draft`), {
        method: "POST",
        body: JSON.stringify({ focus: aiFocus }),
      });
      if (res.draft) {
        setText(res.draft);
        setAiMeta({ model: res.model, provider: res.provider });
        toast.info(t("radiology.aiDraft.filled"));
      } else if (res.reason === "AI_NOT_CONFIGURED") {
        toast.warning(t("radiology.aiDraft.notConfigured"));
      } else {
        toast.error(t("radiology.aiDraft.failed"));
      }
    } catch {
      toast.error(t("radiology.aiDraft.failed"));
    } finally {
      setGenerating(false);
    }
  };

  const critChanged = report
    ? (critCategory || "NONE") !== (report.criticalCategory || "NONE") ||
      critFindingText.trim() !== (report.criticalFindingText || "").trim()
    : true;

  const saveCritical = async () => {
    if (savingCritical || !critChanged) return;
    setSavingCritical(true);
    try {
      const updated = await fetchJson<RadiologyReport>(api(`studies/${studyId}/report/critical`), {
        method: "PUT",
        body: JSON.stringify({ category: critCategory, findingText: critFindingText.trim() || undefined }),
      });
      setReport(updated);
      setCritCategory(updated.criticalCategory || "NONE");
      setCritFindingText(updated.criticalFindingText || "");
    } catch {
      toast.error(t("radiology.critical.saveFailed"));
    } finally {
      setSavingCritical(false);
    }
  };

  const acknowledgeCritical = async () => {
    if (acknowledging) return;
    setAcknowledging(true);
    try {
      const updated = await fetchJson<RadiologyReport>(
        api(`studies/${studyId}/report/critical/acknowledge`),
        { method: "POST" },
      );
      setReport(updated);
      toast.success(t("radiology.critical.acknowledgeSuccess"));
    } catch {
      toast.error(t("radiology.critical.saveFailed"));
    } finally {
      setAcknowledging(false);
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await fetchJson(api(`studies/${studyId}/report`), {
        method: "PUT",
        body: JSON.stringify({ reportText: text.trim() }),
      });
      toast.success(t("radiology.reports.reportSaved"));
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.reports.reportSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const saveAndAdvance = async (kind: ActionKind) => {
    if (saving) return;
    setSaving(true);
    try {
      await fetchJson(api(`studies/${studyId}/report`), {
        method: "PUT",
        body: JSON.stringify({ reportText: text.trim() }),
      });
      await fetchJson(api(`studies/${studyId}/report/${kind}`), { method: "PUT" });
      toast.success(t(ACTION_META[kind].toastKey));
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("radiology.reports.actionFailed"));
    } finally {
      setSaving(false);
    }
  };

  const printPdf = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const headers = tokenManager.createAuthHeaders({});
      const cid = getCompanyId();
      if (cid) headers["X-Company-Id"] = cid;
      const res = await fetch(api(`studies/${studyId}/report/pdf`), { headers });
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

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("radiology.reports.enterReport") as string}
          className={`${MODAL_CONTENT_CLS} !max-w-2xl max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{t("radiology.reports.enterReport")}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-gray-300 cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <RadiologyReportStudyHeader
                study={study}
                reportStatus={report?.reportStatus}
              />

              <RadiologyReportTemplateEditor
                templates={templates}
                templateId={templateId}
                applyTemplate={applyTemplate}
                text={text}
                setText={setText}
                appendText={appendText}
                appendSection={appendSection}
                showPhrases={showPhrases}
                setShowPhrases={setShowPhrases}
              />

              <RadiologyReportAiDraftSection
                aiFocus={aiFocus}
                setAiFocus={setAiFocus}
                generating={generating}
                generateDraft={generateDraft}
                hasText={Boolean(text.trim())}
                aiMeta={aiMeta}
              />

              <RadiologyReportCriticalSection
                critCategory={critCategory}
                setCritCategory={setCritCategory}
                critFindingText={critFindingText}
                setCritFindingText={setCritFindingText}
                saveCritical={saveCritical}
                savingCritical={savingCritical}
                critChanged={critChanged}
                criticalMeta={criticalMeta}
                criticalCat={criticalCat}
                report={report}
                fmtDateTime={fmtDateTime}
                canManage={canManage}
                acknowledgeCritical={acknowledgeCritical}
                acknowledging={acknowledging}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setViewerStudyId(studyId)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  {t("radiology.reports.viewImages")}
                </button>
                <button
                  onClick={printPdf}
                  disabled={printing}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  {t("radiology.reports.printPdf")}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {t("radiology.cancel")}
                </button>
                {canManage && nextStep ? (
                  <button
                    onClick={() => saveAndAdvance(nextStep)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 cursor-pointer ${ACTION_META[nextStep].cls}`}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("radiology.reports.saveAnd")}
                    {t(ACTION_META[nextStep].labelKey)}
                  </button>
                ) : null}
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t("radiology.reports.saveReport")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {viewerStudyId && (
        <RadiologyViewerModal studyId={viewerStudyId} onClose={() => setViewerStudyId(null)} />
      )}
    </>
  );
}
