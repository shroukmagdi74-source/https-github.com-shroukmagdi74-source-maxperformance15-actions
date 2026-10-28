import React from "react";
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Flag,
  Loader2,
  Pencil,
  Printer,
  Save,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  criticalCategoryText,
  MODAL_INPUT_CLS,
  RADIOLOGY_CRITICAL_META,
  RadiologyReport,
  RadiologyReportStatusMap,
} from "../shared";
import { Card } from "./CardRow";
import { fmtDateTime, renderBadge, turnaroundText } from "./helpers";

interface StudyReportCardProps {
  report?: RadiologyReport | null;
  printing: boolean;
  printPdf: () => Promise<void>;
  editingReport: boolean;
  startEditReport: () => void;
  cancelEditReport: () => void;
  savingReport: boolean;
  saveReport: () => Promise<void>;
  draftText: string;
  setDraftText: (val: string) => void;
  aiDrafting: boolean;
  aiDraftInfo: string | null;
  generateDraft: () => Promise<void>;
  criticalOpen: boolean;
  setCriticalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  criticalCategory: string;
  setCriticalCategory: (val: string) => void;
  criticalFindingText: string;
  setCriticalFindingText: (val: string) => void;
  savingCritical: boolean;
  saveCriticalFlag: () => Promise<void>;
  acknowledgeCritical: () => Promise<void>;
  canManage: boolean;
}

export const StudyReportCard: React.FC<StudyReportCardProps> = ({
  report,
  printing,
  printPdf,
  editingReport,
  startEditReport,
  cancelEditReport,
  savingReport,
  saveReport,
  draftText,
  setDraftText,
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
  canManage,
}) => {
  const { t } = useTranslation();

  const criticalCat = criticalCategoryText(report);
  const criticalMeta = criticalCat ? RADIOLOGY_CRITICAL_META[criticalCat] ?? null : null;

  return (
    <Card
      title={t("radiology.details.report")}
      icon={<FileText className="w-5 h-5" />}
      action={
        <div className="flex items-center gap-2 flex-wrap">
          {report ? (
            <button
              onClick={() => void printPdf()}
              disabled={printing}
              className="flex items-center gap-1.5 px-3 py-1.5 border dark:border-gray-600 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
            >
              {printing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              {t("radiology.reports.printPdf")}
            </button>
          ) : null}
          {editingReport ? (
            <>
              <button
                onClick={() => void saveReport()}
                disabled={savingReport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {savingReport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {t("radiology.save")}
              </button>
              <button
                onClick={cancelEditReport}
                disabled={savingReport}
                className="px-3 py-1.5 border dark:border-gray-600 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
              >
                {t("radiology.cancel")}
              </button>
            </>
          ) : (
            <button
              onClick={startEditReport}
              className="flex items-center gap-1.5 px-3 py-1.5 border dark:border-gray-600 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              {report ? t("radiology.details.editReport") : t("radiology.details.draftReport")}
            </button>
          )}
        </div>
      }
    >
      {criticalCat && criticalMeta ? (
        <div className={`mb-4 rounded-lg px-4 py-3 ${criticalMeta.color}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold">{t(criticalMeta.label)}</span>
          </div>
          {report?.criticalFindingText ? (
            <p className="text-sm mt-1.5 whitespace-pre-wrap">{report.criticalFindingText}</p>
          ) : null}
          <div className="text-xs mt-2 space-y-0.5 opacity-80">
            {report?.criticalFlaggedBy ? (
              <p>
                {t("radiology.critical.flaggedBy")}: {report.criticalFlaggedBy} —{" "}
                {fmtDateTime(report.criticalFlaggedAt)}
              </p>
            ) : null}
            {report?.criticalAcknowledgedBy ? (
              <p>
                {t("radiology.critical.acknowledgedBy")}: {report.criticalAcknowledgedBy} —{" "}
                {fmtDateTime(report.criticalAcknowledgedAt)}
              </p>
            ) : (
              <p>{t("radiology.critical.notAcknowledged")}</p>
            )}
          </div>
        </div>
      ) : null}
      {report?.reportStatus ? (
        <div className="mb-3">
          {renderBadge(RadiologyReportStatusMap, report.reportStatus, t)}
        </div>
      ) : null}
      {editingReport ? (
        <div className="space-y-3">
          <button
            onClick={() => void generateDraft()}
            disabled={aiDrafting}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50 cursor-pointer"
          >
            {aiDrafting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {t(
              draftText.trim() ? "radiology.aiDraft.regenerate" : "radiology.aiDraft.generate",
            )}
          </button>
          <textarea
            className={`${MODAL_INPUT_CLS} min-h-[160px]`}
            autoFocus
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder={t("radiology.reports.reportTextPlaceholder") as string}
          />
          {aiDraftInfo ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">{aiDraftInfo}</p>
          ) : null}
        </div>
      ) : (
        <>
          <p className="text-sm leading-6 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {report?.reportText || t("radiology.details.emptyReport")}
          </p>
          {report?.typedBy || report?.reviewedBy || report?.signedBy ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {report.typedBy ? (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("radiology.reports.typedBy")}:{" "}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {report.typedBy}
                  </span>
                </div>
              ) : null}
              {report.reviewedBy ? (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("radiology.reports.reviewedBy")}:{" "}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {report.reviewedBy}
                  </span>
                </div>
              ) : null}
              {report.signedBy ? (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("radiology.reports.signedBy")}:{" "}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {report.signedBy}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
      {report ? (
        <div className="mt-4 pt-3 border-t dark:border-gray-700/50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div>
            {t("radiology.details.reportCreatedAt")}:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {fmtDateTime(report.createdAt)}
            </span>
          </div>
          <div>
            {t("radiology.details.reportSignedAt")}:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {fmtDateTime(report.signedAt)}
            </span>
          </div>
          <div>
            {t("radiology.details.turnaround")}:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {turnaroundText(report)}
            </span>
          </div>
        </div>
      ) : null}
      <div className="mt-4 border dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => setCriticalOpen((o) => !o)}
          className="w-full px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {t("radiology.critical.title")}
          <ChevronDown
            className={`w-3.5 h-3.5 ms-auto transition-transform ${
              criticalOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {criticalOpen ? (
          <div className="px-3 pb-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t("radiology.critical.label")}
              </label>
              <select
                className={MODAL_INPUT_CLS}
                value={criticalCategory}
                onChange={(e) => setCriticalCategory(e.target.value)}
              >
                {Object.entries(RADIOLOGY_CRITICAL_META).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {t(meta.label)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t("radiology.critical.findingText")}
              </label>
              <input
                className={MODAL_INPUT_CLS}
                value={criticalFindingText}
                onChange={(e) => setCriticalFindingText(e.target.value)}
                placeholder={t("radiology.critical.findingPlaceholder") as string}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => void saveCriticalFlag()}
                disabled={savingCritical}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {savingCritical ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Flag className="w-3.5 h-3.5" />
                )}
                {t(
                  criticalCategory === "NONE"
                    ? "radiology.critical.clear"
                    : "radiology.critical.flag",
                )}
              </button>
              {criticalCat && !report?.criticalAcknowledgedBy && canManage ? (
                <button
                  onClick={() => void acknowledgeCritical()}
                  disabled={savingCritical}
                  className="px-3 py-2 border dark:border-gray-600 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
                >
                  {t("radiology.critical.acknowledge")}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
};
