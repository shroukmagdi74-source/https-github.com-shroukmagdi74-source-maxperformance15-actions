import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { FacebookPage } from "./types";
import {
  headingStyle,
  mutedStyle,
  panelStyle,
  selectedSurfaceStyle,
  idleSurfaceStyle,
  controlInputStyle,
} from "./styles";

export interface FacebookPageSelectorProps {
  pages: FacebookPage[];
  selectedPages: string[];
  loading: boolean;
  onTogglePageSelection: (pageId: string) => void;
  onSelectAll: () => void;
}

export const FacebookPageSelector: React.FC<FacebookPageSelectorProps> = ({
  pages,
  selectedPages,
  loading,
  onTogglePageSelection,
  onSelectAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="business-page-panel p-5" style={panelStyle}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="flex items-center font-bold" style={headingStyle}>
          <span
            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-xs"
            style={{
              background:
                "color-mix(in srgb, var(--color-primary) 12%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            1
          </span>
          {t("facebookPostCreator.selectPages")}
        </h2>
        <button
          onClick={onSelectAll}
          className="text-sm font-medium transition-colors hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          {selectedPages.length === pages.length
            ? t("facebookPostCreator.deselectAll")
            : t("facebookPostCreator.selectAll")}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div
            className="h-10 rounded"
            style={{
              background:
                "color-mix(in srgb, var(--shell-control-bg) 82%, var(--color-background) 18%)",
            }}
          ></div>
          <div
            className="h-10 rounded"
            style={{
              background:
                "color-mix(in srgb, var(--shell-control-bg) 82%, var(--color-background) 18%)",
            }}
          ></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => onTogglePageSelection(page.pageId)}
              className="flex cursor-pointer items-center rounded-lg border p-3 transition-all"
              style={
                selectedPages.includes(page.pageId)
                  ? selectedSurfaceStyle
                  : idleSurfaceStyle
              }
            >
              <div
                className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors"
                style={
                  selectedPages.includes(page.pageId)
                    ? {
                        background: "var(--color-primary)",
                        color:
                          "color-mix(in srgb, var(--color-background) 96%, transparent)",
                      }
                    : controlInputStyle
                }
              >
                {selectedPages.includes(page.pageId) && (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
              </div>
              <span className="truncate font-medium text-sm" style={headingStyle}>
                {page.pageName}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs tabular-nums" style={mutedStyle}>
        {t("facebookPostCreator.selectedCount", { count: selectedPages.length })}
      </p>
    </div>
  );
};
