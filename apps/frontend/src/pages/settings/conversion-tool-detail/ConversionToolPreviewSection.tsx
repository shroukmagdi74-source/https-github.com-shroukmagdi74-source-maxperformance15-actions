import React from "react";
import { useTranslation } from "react-i18next";
import { Monitor, Smartphone } from "lucide-react";
import type {
  ConversionToolDefinition,
  ConversionToolMeta,
} from "../conversionToolMeta";
import {
  ConversionToolPreviewProvider,
  renderConversionToolPreview,
} from "../conversionToolPreviews";
import type { StorefrontThemeInput } from "../../../storefront/engine/themeResolver";
import { StoreCanvasFrame } from "./StoreCanvasFrame";
import type { CanvasView } from "./types";

interface ConversionToolPreviewSectionProps {
  tool: ConversionToolDefinition;
  meta: ConversionToolMeta;
  settings: Record<string, unknown>;
  loading: boolean;
  enabled: boolean;
  availability: { available: boolean; note?: string };
  saveIndicator: React.ReactNode;
  canvasView: CanvasView;
  merchantTheme?: StorefrontThemeInput;
  onChangeCanvasView: (view: CanvasView) => void;
}

export const ConversionToolPreviewSection: React.FC<ConversionToolPreviewSectionProps> = ({
  tool,
  meta,
  settings,
  loading,
  enabled,
  availability,
  saveIndicator,
  canvasView,
  merchantTheme,
  onChangeCanvasView,
}) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-950">
          {(
            [
              { id: "mobile", label: t("storeConversionSettings.viewMobile"), icon: Smartphone },
              { id: "desktop", label: t("storeConversionSettings.viewDesktop"), icon: Monitor },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeCanvasView(option.id)}
              aria-pressed={canvasView === option.id}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-black transition-colors ${
                canvasView === option.id
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <option.icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {saveIndicator}
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("storeConversionSettings.livePreviewBadge")}
          </span>
        </div>
      </div>

      {!enabled && availability.available && !loading ? (
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          {t("storeConversionSettings.expectedLookCaption")}
        </p>
      ) : null}

      {loading ? (
        <div className="min-h-[420px] animate-pulse space-y-4 rounded-2xl border border-stone-200/80 bg-stone-100/70 p-6 dark:border-stone-800 dark:bg-stone-900/60">
          <div className="h-8 w-1/3 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="h-24 rounded-xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-12 w-2/3 rounded-lg bg-stone-200 dark:bg-stone-800" />
        </div>
      ) : (
        <StoreCanvasFrame view={canvasView} displayKind={meta.displayKind}>
          <ConversionToolPreviewProvider initialTheme={merchantTheme}>
            {renderConversionToolPreview(tool.key, { settings })}
          </ConversionToolPreviewProvider>
        </StoreCanvasFrame>
      )}

      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
        {t(
          merchantTheme
            ? "storeConversionSettings.previewRealThemeCaption"
            : "storeConversionSettings.previewMockCaption"
        )}
      </p>
    </section>
  );
};
