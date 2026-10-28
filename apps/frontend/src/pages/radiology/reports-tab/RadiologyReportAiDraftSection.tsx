import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Sparkles } from "lucide-react";

interface RadiologyReportAiDraftSectionProps {
  aiFocus: string;
  setAiFocus: (val: string) => void;
  generating: boolean;
  generateDraft: () => Promise<void>;
  hasText: boolean;
  aiMeta: { model?: string; provider?: string } | null;
}

export const RadiologyReportAiDraftSection: React.FC<RadiologyReportAiDraftSectionProps> = ({
  aiFocus,
  setAiFocus,
  generating,
  generateDraft,
  hasText,
  aiMeta,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {t("radiology.aiDraft.focus")}
        </span>
        <select
          className="border dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-100 cursor-pointer"
          value={aiFocus}
          onChange={(e) => setAiFocus(e.target.value)}
        >
          <option value="full">{t("radiology.aiDraft.full")}</option>
          <option value="findings">{t("radiology.aiDraft.findings")}</option>
          <option value="impression">{t("radiology.aiDraft.impression")}</option>
        </select>
        <button
          type="button"
          onClick={() => void generateDraft()}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
        >
          {generating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {generating
            ? t("radiology.aiDraft.generating")
            : hasText
            ? t("radiology.aiDraft.regenerate")
            : t("radiology.aiDraft.generate")}
        </button>
      </div>
      {aiMeta ? (
        <p className="mt-1.5 text-xs text-violet-600 dark:text-violet-400">
          {t("radiology.aiDraft.disclaimer")}
          {aiMeta.model ? ` — ${t("radiology.aiDraft.model")}: ${aiMeta.model}` : ""}
          {aiMeta.provider ? ` (${aiMeta.provider})` : ""}
        </p>
      ) : null}
    </div>
  );
};
