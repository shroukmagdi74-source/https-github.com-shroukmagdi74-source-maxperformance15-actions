import React, { useState, useMemo } from "react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  STUDIO_PAGE_EXPORT_VERSION,
  exportPage,
  exportPageAsJSON,
  downloadJSON,
  validatePageJSON,
  computePageDiff,
  importPage,
  type StudioExportedPageData,
  type StudioPageDiff,
} from "./utils/studioPageExportImport";
import type { PageStyleScope } from "./StudioTypes";
import { toast } from "sonner";

export interface StudioExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePageKey: string;
  currentSections: any[];
  currentStyles?: PageStyleScope;
  designTokens?: Record<string, any>;
  theme?: Record<string, any>;
  onApplyImport: (imported: StudioExportedPageData) => void;
}

export const StudioExportImportModal: React.FC<StudioExportImportModalProps> = ({
  isOpen,
  onClose,
  activePageKey,
  currentSections,
  currentStyles,
  designTokens,
  theme,
  onApplyImport,
}) => {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [importJsonText, setImportJsonText] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewDiff, setPreviewDiff] = useState<StudioPageDiff | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generate exported data
  const exportedData = useMemo(() => {
    return exportPage(activePageKey, {
      sections: currentSections,
      styles: currentStyles,
      designTokens,
      theme,
    });
  }, [activePageKey, currentSections, currentStyles, designTokens, theme]);

  const exportedJsonString = useMemo(() => {
    return exportPageAsJSON(activePageKey, {
      sections: currentSections,
      styles: currentStyles,
      designTokens,
      theme,
    });
  }, [activePageKey, currentSections, currentStyles, designTokens, theme]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(exportedJsonString);
      setCopied(true);
      toast.success("تم نسخ JSON الصفحة إلى الحافظة");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadJSON(`page-${activePageKey}-export.json`, exportedData);
    toast.success("تم تنزيل ملف التصدير بنجاح");
  };

  const handleValidateImportText = (text: string) => {
    setImportJsonText(text);
    if (!text.trim()) {
      setPreviewDiff(null);
      setValidationError(null);
      return;
    }

    const validation = validatePageJSON(text);
    if (!validation.isValid || !validation.data) {
      setValidationError(validation.error || "صيغة الملف غير صالحة");
      setPreviewDiff(null);
      return;
    }

    setValidationError(null);
    const diff = computePageDiff(currentSections, currentStyles, validation.data);
    setPreviewDiff(diff);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      handleValidateImportText(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importJsonText.trim()) return;

    const res = importPage(importJsonText, {
      pageKey: activePageKey,
      currentSections,
      currentStyles,
      confirm: true,
      onApply: (data) => {
        onApplyImport(data);
      },
    });

    if (res.success && res.applied) {
      toast.success(`تم استيراد محتوى صفحة "${activePageKey}" بنجاح ✨`);
      onClose();
    } else {
      toast.error(res.error || "فشل استيراد الصفحة");
      setValidationError(res.error || "فشل الاستيراد");
    }
  };

  return (
    <div
      data-testid="studio-export-import-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-[#2b2d35] bg-[#18191e] text-[#e8eaee] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2b2d35] px-5 py-4 bg-[#141519]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#60a5fa]">
              {activeTab === "export" ? (
                <ArrowDownTrayIcon className="h-4.5 w-4.5" />
              ) : (
                <ArrowUpTrayIcon className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">تصدير واستيراد صفحات المتجر</h2>
              <p className="text-xs text-[#9ba0a8]">
                الصفحة الحالية: <span className="font-semibold text-white">{activePageKey}</span> ({currentSections.length} أقسام)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-export-import-modal"
            className="rounded-lg p-1.5 text-[#9ba0a8] hover:bg-[#252830] hover:text-white transition-colors"
            title="إغلاق"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#2b2d35] bg-[#1a1b21] px-5 pt-2">
          <button
            type="button"
            data-testid="tab-export-page"
            onClick={() => setActiveTab("export")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "export"
                ? "border-[#2b6cf6] text-white"
                : "border-transparent text-[#9ba0a8] hover:text-white"
            }`}
          >
            تصدير الصفحة (Export)
          </button>
          <button
            type="button"
            data-testid="tab-import-page"
            onClick={() => setActiveTab("import")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "import"
                ? "border-[#2b6cf6] text-white"
                : "border-transparent text-[#9ba0a8] hover:text-white"
            }`}
          >
            استيراد قالب (Import)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "export" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9ba0a8]">
                  معاينة كود JSON للتصدير (يتضمن الأقسام + الستايلات + رقم الإصدار v1.0)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="copy-export-json-btn"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-[#32353b] bg-[#22242a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2c3038] transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                        <span>نسخ JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    data-testid="download-export-json-btn"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2b6cf6] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1d5ce6] transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                    <span>تنزيل الملف</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl border border-[#2b2d35] bg-[#121316] p-3 text-start">
                <pre
                  data-testid="exported-json-preview"
                  className="max-h-72 overflow-y-auto text-[11px] font-mono text-[#60a5fa] whitespace-pre-wrap break-all"
                  dir="ltr"
                >
                  {exportedJsonString}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white">
                  قم برفع ملف JSON أو لصق الكود:
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  data-testid="upload-import-file-input"
                  className="block w-full text-xs text-[#9ba0a8] file:mr-0 file:ml-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2b6cf6] file:text-white hover:file:bg-[#1d5ce6] cursor-pointer"
                />
              </div>

              <div>
                <textarea
                  data-testid="import-json-textarea"
                  value={importJsonText}
                  onChange={(e) => handleValidateImportText(e.target.value)}
                  placeholder='الصق محتوى JSON هنا (يجب أن يحتوي على "version": "1.0" و "sections": [...])'
                  className="w-full h-36 rounded-xl border border-[#2b2d35] bg-[#121316] p-3 text-xs font-mono text-white placeholder-[#6b7280] focus:border-[#2b6cf6] focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Validation Error Banner */}
              {validationError && (
                <div
                  data-testid="import-error-banner"
                  className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300"
                >
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Diff Preview Banner */}
              {previewDiff && (
                <div
                  data-testid="import-diff-preview"
                  className="rounded-xl border border-[#2b6cf6]/30 bg-[#1e2330] p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#60a5fa]">معاينة الفروقات قبل التطبيق:</span>
                    <span className="text-[11px] text-[#9ba0a8]">
                      إصدار القالب: v{STUDIO_PAGE_EXPORT_VERSION}
                    </span>
                  </div>
                  <p className="text-white font-medium">{previewDiff.summaryText}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#c3c7cd]">
                    <div className="rounded-lg bg-[#141519] p-2 border border-[#282a32]">
                      <span className="text-[#9ba0a8]">الأقسام الحالية:</span>{" "}
                      <b className="text-white">{previewDiff.currentSectionsCount}</b>
                    </div>
                    <div className="rounded-lg bg-[#141519] p-2 border border-[#282a32]">
                      <span className="text-[#9ba0a8]">الأقسام بعد الاستيراد:</span>{" "}
                      <b className="text-emerald-400">{previewDiff.incomingSectionsCount}</b>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-[#2b2d35] bg-[#141519] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-[#9ba0a8] hover:bg-[#22242a] hover:text-white transition-colors"
          >
            إلغاء
          </button>
          {activeTab === "import" && (
            <button
              type="button"
              data-testid="confirm-import-btn"
              onClick={handleConfirmImport}
              disabled={!previewDiff || Boolean(validationError)}
              className="flex items-center gap-1.5 rounded-lg bg-[#2b6cf6] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d5ce6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <CheckIcon className="h-4 w-4" />
              <span>تأكيد الاستيراد والتطبيق</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioExportImportModal;
