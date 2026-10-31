import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { PublishResult } from "./types";
import {
  headingStyle,
  panelStyle,
  successBannerStyle,
  errorBannerStyle,
} from "./styles";

export interface FacebookPublishResultCardProps {
  result: PublishResult;
  isScheduled: boolean;
}

export const FacebookPublishResultCard: React.FC<
  FacebookPublishResultCardProps
> = ({ result, isScheduled }) => {
  const { t } = useTranslation();

  return (
    <div
      className="animate-fade-in overflow-hidden rounded-xl"
      style={{ ...panelStyle, ...successBannerStyle }}
    >
      <div
        className="p-4"
        style={{
          ...successBannerStyle,
          borderBottom:
            "1px solid color-mix(in srgb, var(--business-success) 18%, transparent)",
        }}
      >
        <h3
          className="flex items-center font-bold text-sm"
          style={{ color: "var(--business-success)" }}
        >
          <CheckCircleIcon className="w-5 h-5 ml-2" />
          {t("facebookPostCreator.successTitle")}
        </h3>
      </div>
      <div className="p-4">
        {result.message && (
          <p className="mb-3 text-sm" style={headingStyle}>
            {result.message}
          </p>
        )}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {result.results?.map((res, idx) => (
            <div
              key={idx}
              className="rounded border p-2 text-xs"
              style={res.success ? successBannerStyle : errorBannerStyle}
            >
              <div className="flex justify-between">
                <span className="font-bold">{res.pageName}</span>
                <span>
                  {res.success
                    ? isScheduled
                      ? t("facebookPostCreator.scheduled")
                      : t("facebookPostCreator.published")
                    : t("facebookPostCreator.failed")}
                </span>
              </div>
              {!res.success && res.error && (
                <div
                  className="mt-1"
                  style={{ color: "var(--business-danger)" }}
                >
                  {res.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
