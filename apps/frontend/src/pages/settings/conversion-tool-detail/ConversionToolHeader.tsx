import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ExternalLink } from "lucide-react";

interface ConversionToolHeaderProps {
  toolLabel: string;
  storePreviewUrl: string;
  onBack: () => void;
}

export const ConversionToolHeader: React.FC<ConversionToolHeaderProps> = ({
  toolLabel,
  storePreviewUrl,
  onBack,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 font-bold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowRight className="h-4 w-4" />
          {t("storeConversionSettings.backToTools")}
        </button>
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <span className="font-black text-gray-900 dark:text-white">{toolLabel}</span>
      </div>
      {storePreviewUrl ? (
        <a
          href={storePreviewUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("storeConversionSettings.viewOnStore")}
        </a>
      ) : null}
    </div>
  );
};
