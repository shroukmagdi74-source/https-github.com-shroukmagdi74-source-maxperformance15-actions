import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { headingStyle, mutedStyle } from "./styles";

export interface FacebookPostCreatorHeaderProps {
  onCancel: () => void;
}

export const FacebookPostCreatorHeader: React.FC<
  FacebookPostCreatorHeaderProps
> = ({ onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold" style={headingStyle}>
          {t("facebookPostCreator.pageTitle")}
        </h1>
        <p className="mt-1 text-sm" style={mutedStyle}>
          {t("facebookPostCreator.pageSubtitle")}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="business-chip-button flex items-center gap-1 px-4 py-2"
        aria-label={t("facebookPostCreator.cancel")}
      >
        <XMarkIcon className="h-5 w-5" />
        {t("facebookPostCreator.cancel")}
      </button>
    </div>
  );
};
