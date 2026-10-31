import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveActivePageKeyFromPath } from '../engine/themeResolverCore';
import { useCategories } from '../hooks/useCategories';
import { useStorefrontSettings } from '../hooks/useStorefrontSettings';
import type { StorefrontThemeInput } from '../engine/runtimeThemeResolver';
import { useFacebookPixel } from '../../hooks/useFacebookPixel';
import { useTikTokPixel } from '../../hooks/useTikTokPixel';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { useClarityAnalytics } from '../../hooks/useClarityAnalytics';
import { useStorefrontVisitTracking } from '../hooks/useStorefrontVisitTracking';
import {
  readLocaleFormatSettingsFromSettings,
  setLocaleFormatDefaults,
} from '../utils/localeFormat';
import type { StorefrontShellProps } from './shellTypes';

export const useStorefrontShellController = (_props: StorefrontShellProps) => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const routeSegments = normalizedPath.split('/').filter(Boolean);

  const activePageKey = useMemo(() => {
    return resolveActivePageKeyFromPath(location.pathname);
  }, [location.pathname]);

  const storefrontSegments =
    routeSegments[0] === 'store' ? routeSegments.slice(1) : routeSegments;

  const isStandaloneProductLanding =
    storefrontSegments[0] === 'lp' || storefrontSegments[0] === 'landing';
  const isStandaloneFunnel =
    storefrontSegments[0] === 'funnel' || storefrontSegments[0] === 'p';

  const shouldPrefetchCategories =
    storefrontSegments.length === 0 ||
    storefrontSegments[0] === 'shop' ||
    storefrontSegments[0] === 'collections' ||
    storefrontSegments[0] === 'sale';

  // Keep catalog data warm on browsing pages, but avoid competing with PDP critical requests.
  useCategories(undefined, { enabled: shouldPrefetchCategories });

  const { settings, isLoading, error, previewThemeId } =
    useStorefrontSettings({ enabled: !isStandaloneProductLanding && !isStandaloneFunnel });

  const initialTheme = useMemo(
    () => (settings?.storefront || undefined) as StorefrontThemeInput | undefined,
    [settings],
  );

  // TOKENS-1 — merchant-authored `--sf-*` variables (theme switch must never drop them).
  const storefrontVariables = useMemo<Record<string, unknown> | undefined>(() => {
    type VariablesCarrier = {
      variables?: Record<string, unknown>;
      global?: { variables?: Record<string, unknown> };
      designTokens?: { variables?: Record<string, unknown>; global?: { variables?: Record<string, unknown> } };
    };
    const raw = settings as unknown as
      | (VariablesCarrier & {
          storefront?: VariablesCarrier;
          storefrontSettings?: VariablesCarrier;
        })
      | undefined;
    const candidate =
      raw?.storefront?.designTokens?.variables ??
      raw?.storefront?.designTokens?.global?.variables ??
      raw?.storefront?.variables ??
      raw?.storefront?.global?.variables ??
      raw?.designTokens?.variables ??
      raw?.designTokens?.global?.variables ??
      raw?.storefrontSettings?.designTokens?.variables ??
      raw?.storefrontSettings?.designTokens?.global?.variables ??
      raw?.storefrontSettings?.variables ??
      raw?.storefrontSettings?.global?.variables;
    return candidate && typeof candidate === 'object' ? candidate : undefined;
  }, [settings]);

  useFacebookPixel(settings?.storefrontSettings ?? null);
  useTikTokPixel(settings?.company?.id);
  useGoogleAnalytics(settings?.storefrontSettings ?? null);
  useClarityAnalytics(settings?.storefrontSettings ?? null);
  useStorefrontVisitTracking(settings);

  // LOCALE-1 — publish store locale preferences (number digits, currency position,
  // units, calendar) so every section formats through the unified locale helpers.
  useEffect(() => {
    setLocaleFormatDefaults(
      readLocaleFormatSettingsFromSettings(
        settings?.storefrontSettings,
        settings?.storefront,
        settings,
      ),
    );
  }, [settings]);

  return {
    location,
    activePageKey,
    isStandaloneProductLanding,
    isStandaloneFunnel,
    settings,
    isLoading,
    error,
    previewThemeId,
    initialTheme,
    storefrontVariables,
  };
};

export type StorefrontShellController = ReturnType<typeof useStorefrontShellController>;
