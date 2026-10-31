import React from "react";
import { VideoCameraIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { TabType, MediaPreview } from "./types";
import { headingStyle, mutedStyle, panelStyle } from "./styles";

export interface FacebookPostPreviewCardProps {
  message: string;
  linkUrl: string;
  activeTab: TabType;
  mediaPreviews: MediaPreview[];
}

export const FacebookPostPreviewCard: React.FC<
  FacebookPostPreviewCardProps
> = ({ message, linkUrl, activeTab, mediaPreviews }) => {
  const { t } = useTranslation();

  return (
    <div
      className="business-page-panel sticky top-6 overflow-hidden"
      style={panelStyle}
    >
      <div
        className="flex items-center justify-between p-4"
        style={{
          borderBottom: "1px solid var(--business-card-border)",
          background:
            "color-mix(in srgb, var(--color-background) 80%, var(--shell-control-bg) 20%)",
        }}
      >
        <h3 className="font-bold text-sm" style={headingStyle}>
          {t("facebookPostCreator.previewTitle")}
        </h3>
        <span className="text-xs font-mono" style={mutedStyle}>
          Desktop Preview
        </span>
      </div>
      <div className="p-4">
        <div
          className="rounded-lg border p-4"
          style={{
            ...panelStyle,
            background:
              "color-mix(in srgb, var(--color-background) 88%, var(--shell-control-bg) 12%)",
          }}
        >
          {/* Fake Header */}
          <div className="flex items-center mb-3">
            <div
              className="mr-3 h-10 w-10 rounded-full shrink-0"
              style={{
                background:
                  "color-mix(in srgb, var(--shell-control-bg) 78%, var(--color-background) 22%)",
              }}
            ></div>
            <div className="flex-1">
              <div
                className="mb-2 h-4 w-24 rounded"
                style={{
                  background:
                    "color-mix(in srgb, var(--shell-control-bg) 78%, var(--color-background) 22%)",
                }}
              ></div>
              <div
                className="h-3 w-16 rounded"
                style={{
                  background:
                    "color-mix(in srgb, var(--shell-control-bg) 84%, var(--color-background) 16%)",
                }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p
              className="dir-auto whitespace-pre-line text-sm"
              style={headingStyle}
            >
              {message || t("facebookPostCreator.previewPlaceholder")}
            </p>

            {linkUrl && activeTab === "LINK" && (
              <div
                className="rounded-lg border p-3"
                style={{
                  ...panelStyle,
                  background:
                    "color-mix(in srgb, var(--shell-control-bg) 82%, var(--color-background) 18%)",
                }}
              >
                <div
                  className="truncate text-sm"
                  style={{ color: "var(--color-primary)" }}
                >
                  {linkUrl}
                </div>
                <div
                  className="mt-2 h-20 rounded"
                  style={{
                    background:
                      "color-mix(in srgb, var(--shell-control-bg) 78%, var(--color-background) 22%)",
                  }}
                ></div>
              </div>
            )}

            {/* Media Grid Preview */}
            {mediaPreviews.length > 0 && (
              <div
                className={`grid gap-1 overflow-hidden rounded-lg border ${
                  mediaPreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
                style={panelStyle}
              >
                {mediaPreviews.slice(0, 4).map((p, i) => (
                  <div
                    key={i}
                    className={`relative h-40 ${
                      mediaPreviews.length === 3 && i === 0
                        ? "col-span-2"
                        : ""
                    }`}
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-foreground) 82%, transparent)",
                    }}
                  >
                    {p.type === "video" ? (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-foreground) 70%, transparent)",
                          color:
                            "color-mix(in srgb, var(--color-background) 96%, transparent)",
                        }}
                      >
                        <VideoCameraIcon className="w-8 h-8" />
                      </div>
                    ) : (
                      <img
                        src={p.url}
                        alt="media preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
                {mediaPreviews.length > 4 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-foreground) 42%, transparent)",
                      color:
                        "color-mix(in srgb, var(--color-background) 96%, transparent)",
                    }}
                  >
                    +{mediaPreviews.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
