import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MODAL_INPUT_CLS, RadiologyReportTemplate } from "../shared";
import { CLINICAL_PHRASES, IMPRESSION_PHRASES } from "./constants";

interface RadiologyReportTemplateEditorProps {
  templates: RadiologyReportTemplate[];
  templateId: string;
  applyTemplate: (id: string) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  appendText: (suffix: string) => void;
  appendSection: (labelKey: string) => void;
  showPhrases: boolean;
  setShowPhrases: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RadiologyReportTemplateEditor: React.FC<RadiologyReportTemplateEditorProps> = ({
  templates,
  templateId,
  applyTemplate,
  text,
  setText,
  appendText,
  appendSection,
  showPhrases,
  setShowPhrases,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {templates.length > 0 ? (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t("radiology.reports.templates")}
          </label>
          <select
            className={MODAL_INPUT_CLS}
            value={templateId}
            onChange={(e) => applyTemplate(e.target.value)}
          >
            <option value="">{t("radiology.reports.noTemplate")}</option>
            {templates.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          {templateId ? (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t("radiology.reports.templateLoaded")}
            </p>
          ) : null}
        </div>
      ) : null}

      <textarea
        autoFocus
        className={`${MODAL_INPUT_CLS} min-h-[240px] resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("radiology.reports.reportTextPlaceholder") as string}
      />
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 tabular-nums">
        {text.length} {t("radiology.reports.characterCount")} ·{" "}
        {text.trim().split(/\s+/).filter(Boolean).length}{" "}
        {t("radiology.reports.wordCount")}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => appendSection("findingsLabel")}
          className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
        >
          {t("radiology.reports.findingsLabel")}
        </button>
        <button
          type="button"
          onClick={() => appendSection("impressionLabel")}
          className="px-3 py-1.5 text-xs border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
        >
          {t("radiology.reports.impressionLabel")}
        </button>
      </div>

      <div className="mt-2 border dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => setShowPhrases((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
        >
          <span>{t("radiology.reports.quickPhrases")}</span>
          {showPhrases ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showPhrases ? (
          <div className="px-3 pb-3 space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("radiology.reports.phrasesClinical")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CLINICAL_PHRASES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => appendText(p)}
                    className="px-2.5 py-1 text-xs border dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("radiology.reports.phrasesImpression")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {IMPRESSION_PHRASES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => appendText(p)}
                    className="px-2.5 py-1 text-xs border dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
