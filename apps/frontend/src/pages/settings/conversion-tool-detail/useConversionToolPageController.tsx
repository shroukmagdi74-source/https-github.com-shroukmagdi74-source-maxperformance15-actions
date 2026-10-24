import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "../../../hooks/useAuthSimple";
import { buildStorefrontPreviewPath } from "../../../storefront/utils/paths";
import { findToolById } from "../conversionToolMeta";
import type { StorefrontThemeInput } from "../../../storefront/engine/themeResolver";
import { storefrontSettingsService } from "../../../services/storefrontSettingsService";
import { useConversionTools } from "../useConversionTools";
import type { CanvasView } from "./types";

export function useConversionToolPageController() {
  const { toolId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [canvasView, setCanvasView] = useState<CanvasView>("mobile");
  const [merchantTheme, setMerchantTheme] = useState<StorefrontThemeInput | undefined>();

  useEffect(() => {
    let active = true;
    storefrontSettingsService
      .getSettings()
      .then((response) => {
        if (!active) return;
        const settings = response?.data as Record<string, unknown> | undefined;
        const themeId =
          (typeof settings?.themeId === "string" && settings.themeId.trim()) ||
          (() => {
            const tokens = settings?.designTokens as Record<string, unknown> | undefined;
            return typeof tokens?.themeId === "string" ? tokens.themeId.trim() : "";
          })();
        if (themeId) {
          setMerchantTheme({ themeId } as StorefrontThemeInput);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const entry = findToolById(toolId);
  const tool = entry?.tool;
  const meta = entry?.meta;

  const appSlugs = useMemo(() => (tool ? [tool.appSlug] : []), [tool?.appSlug]);
  const {
    loading,
    savingToolKey,
    lastSavedAt,
    managedApps,
    getToolAvailability,
    getToolEnabled,
    handleToolToggle,
    handleToolFieldSave,
  } = useConversionTools(appSlugs);

  const toolLabel = tool
    ? t(`storeConversionSettings.tool.${tool.key}.label`, { defaultValue: tool.label })
    : "";
  const toolBenefit = tool
    ? t(`storeConversionSettings.tool.${tool.key}.benefit`, {
        defaultValue: tool.description,
      })
    : "";

  const availability = tool ? getToolAvailability(tool) : { available: false, note: "" };
  const enabled = tool ? getToolEnabled(tool) : false;
  const saving = tool ? savingToolKey === tool.key : false;
  const isFieldSaving =
    typeof savingToolKey === "string" && savingToolKey.includes(":");
  const appState = tool ? managedApps[tool.appSlug] : undefined;
  const settings = appState?.settings || {};

  const storeSlug = user?.company?.slug?.trim();
  const storePreviewUrl =
    storeSlug || user?.companyId
      ? buildStorefrontPreviewPath("/", {
          companySlug: storeSlug || undefined,
          companyId: storeSlug ? undefined : user?.companyId || undefined,
        })
      : "";

  const saveIndicator =
    saving || isFieldSaving ? (
      <span className="flex items-center gap-1.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
        {t("storeConversionSettings.savingIndicator")}
      </span>
    ) : lastSavedAt ? (
      <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
        <Check className="h-3.5 w-3.5" />
        {t("storeConversionSettings.savedIndicator")}
      </span>
    ) : (
      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
        {t("storeConversionSettings.autoSaveLabel")}
      </span>
    );

  return {
    t,
    navigate,
    entry,
    tool,
    meta,
    loading,
    saving,
    savingToolKey,
    enabled,
    availability,
    settings,
    toolLabel,
    toolBenefit,
    storePreviewUrl,
    saveIndicator,
    canvasView,
    setCanvasView,
    merchantTheme,
    handleToolToggle,
    handleToolFieldSave,
  };
}
