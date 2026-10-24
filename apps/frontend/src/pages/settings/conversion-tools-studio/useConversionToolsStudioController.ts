import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuthSimple";
import { storefrontSettingsService } from "../../../services/storefrontSettingsService";
import type { StorefrontThemeInput } from "../../../storefront/engine/themeResolver";
import { buildStorefrontPreviewPath } from "../../../storefront/utils/paths";
import {
  ALL_CONVERSION_TOOLS,
  type ConversionToolEntry,
} from "../conversionToolMeta";
import {
  isAppOperational,
  useConversionTools,
} from "../useConversionTools";
import {
  STORE_CONVERSION_APP_LABELS,
  STORE_CONVERSION_PAGES,
  type ManagedMarketplaceAppSlug,
  type StoreConversionToolConfig,
} from "../storeConversionSettingsConfig";
import type { CategoryTabItem, StatusFilter } from "./types";

export function useConversionToolsStudioController() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const appSlugs = useMemo(
    () =>
      Array.from(
        new Set(ALL_CONVERSION_TOOLS.map((entry) => entry.tool.appSlug)),
      ) as ManagedMarketplaceAppSlug[],
    [],
  );

  const {
    loading,
    savingToolKey,
    managedApps,
    getToolEnabled,
    handleToolToggle,
  } = useConversionTools(appSlugs);

  const [merchantTheme, setMerchantTheme] = useState<StorefrontThemeInput | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const isToolAvailable = (tool: StoreConversionToolConfig) => {
    const appState = managedApps[tool.appSlug];
    return Boolean(appState?.app && isAppOperational(appState.app));
  };

  const totalTools = ALL_CONVERSION_TOOLS.length;

  const activeToolsCount = useMemo(() => {
    return ALL_CONVERSION_TOOLS.filter((entry) => {
      return isToolAvailable(entry.tool) && getToolEnabled(entry.tool);
    }).length;
  }, [managedApps, getToolEnabled]);

  const activeAppsCount = useMemo(() => {
    return appSlugs.filter((slug) => {
      const appState = managedApps[slug];
      return Boolean(appState?.app && isAppOperational(appState.app));
    }).length;
  }, [appSlugs, managedApps]);

  const storePreviewPath = user?.companySlug
    ? buildStorefrontPreviewPath("/", {
        subdomain: user.companySlug,
        previewSessionToken: user.companySlug,
      })
    : null;

  const categoryTabs: CategoryTabItem[] = useMemo(() => {
    return [
      {
        id: "all",
        label: "الكل",
        count: totalTools,
      },
      ...STORE_CONVERSION_PAGES.map((page) => ({
        id: page.id,
        label: t(page.navLabel),
        count: ALL_CONVERSION_TOOLS.filter((e) => e.page.id === page.id).length,
      })),
    ];
  }, [t, totalTools]);

  const filteredTools: ConversionToolEntry[] = useMemo(() => {
    return ALL_CONVERSION_TOOLS.filter((entry) => {
      if (selectedCategory !== "all" && entry.page.id !== selectedCategory) {
        return false;
      }

      const available = isToolAvailable(entry.tool);
      const enabled = available && getToolEnabled(entry.tool);

      if (statusFilter === "active" && !enabled) {
        return false;
      }
      if (statusFilter === "inactive" && enabled) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const label = t(`storeConversionSettings.tool.${entry.tool.key}.label`, {
          defaultValue: entry.tool.label,
        }).toLowerCase();
        const benefit = t(`storeConversionSettings.tool.${entry.tool.key}.benefit`, {
          defaultValue: entry.tool.description,
        }).toLowerCase();
        const key = entry.tool.key.toLowerCase();
        const appName = (STORE_CONVERSION_APP_LABELS[entry.tool.appSlug] || "").toLowerCase();

        return (
          label.includes(query) ||
          benefit.includes(query) ||
          key.includes(query) ||
          appName.includes(query)
        );
      }

      return true;
    });
  }, [selectedCategory, statusFilter, searchQuery, t, managedApps, getToolEnabled]);

  const hasActiveFilters =
    selectedCategory !== "all" || statusFilter !== "all" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return {
    t,
    loading,
    savingToolKey,
    merchantTheme,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    appSlugs,
    totalTools,
    activeToolsCount,
    activeAppsCount,
    storePreviewPath,
    categoryTabs,
    filteredTools,
    hasActiveFilters,
    resetFilters,
    isToolAvailable,
    getToolEnabled,
    handleToolToggle,
  };
}
