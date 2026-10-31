import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStorefrontTheme } from '../engine/ThemeProvider';
import { useStorefrontSettings } from '../hooks/useStorefrontSettings';
import { useStorefrontProductRouteScrollReset } from '../hooks/useStorefrontProductRouteScrollReset';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useSearch } from '../hooks/useSearch';
import { useDeferredStorefrontConversionHosts } from '../hooks/useDeferredStorefrontConversionHosts';
import { useCategories } from '../hooks/useCategories';
import { getStorefrontLocale, getLocaleDirection, type StorefrontLocale } from '../i18n';
import { setStorefrontMoneyLocale } from '../utils/currency';
import { resolveStorefrontDocumentLanguage } from '../components/header/StorefrontHeader';
import { createStorefrontThemeTextReplacer } from '../utils/runtimeBrandText';
import { captureStorefrontAttribution } from '../utils/orderAttribution';
import { useCheckoutStore } from '../store/useCheckoutStore';
import tokenManager from '../../utils/tokenManager';
import { hasShopStudioConfig, extractShopStudioConfig, resolveShopPageLayoutHint } from '../../utils/shopPageStudioConfig';
import { resolveActivePageKeyFromPath, resolvePageStyleVars } from '../engine/themeResolverCore';
import { isRevealEnabledTheme } from '../layout/StorefrontSectionFrame';
import { isKhemetLuxeTheme } from '../utils/navigationGuards';
import { getStorefrontProductRouteKey } from '../utils/paths';
import { resolveLegacyProductSlugAlias } from '../utils/productSlugAliases';
import type { StorefrontPageLayout } from '../types/theme.types';
import type { StorefrontLayoutProps } from './shellTypes';

export const useStorefrontLayoutController = ({
  previewThemeId,
  activePageKey: propActivePageKey,
}: StorefrontLayoutProps) => {
  const { theme } = useStorefrontTheme();
  const { settings } = useStorefrontSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useStorefrontProductRouteScrollReset();
  useScrollReveal(isRevealEnabledTheme(theme?.id) ? { enabled: true } : { enabled: false });

  const search = useSearch();
  const canRenderConversionHosts = useDeferredStorefrontConversionHosts();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const currentLocale = useMemo(
    () => getStorefrontLocale(location.search),
    [location.search],
  );

  const currentDirection = useMemo(
    () => getLocaleDirection(currentLocale),
    [currentLocale],
  );

  setStorefrontMoneyLocale(currentLocale);

  const documentLanguage = useMemo(
    () => (currentLocale === 'en' ? 'en' : resolveStorefrontDocumentLanguage(theme)),
    [currentLocale, theme],
  );

  const runtimeText = useMemo(
    () =>
      createStorefrontThemeTextReplacer({
        theme,
        settings,
        isThemePreview: searchParams.has('previewTheme'),
      }),
    [searchParams, settings, theme],
  );

  const globalTokens = useMemo(() => {
    const themeGlobal = (theme as any)?.global || (theme as any)?.designTokens?.global;
    const settingsGlobal =
      (settings?.storefront?.designTokens as any)?.global ||
      (settings?.designTokens as any)?.global ||
      (settings?.storefront?.settings?.['designTokens'] as any)?.global;
    return themeGlobal || settingsGlobal || {};
  }, [theme, settings]);

  const globalHeader = globalTokens?.header;
  const globalFooter = globalTokens?.footer;

  useEffect(() => {
    captureStorefrontAttribution(settings?.companyId);

    const urlCoupon = searchParams.get('coupon') || searchParams.get('apply_coupon');
    if (urlCoupon) {
      useCheckoutStore.getState().setPendingCouponCode(urlCoupon.trim().toUpperCase());
    }
    const urlPhone = searchParams.get('phone');
    if (urlPhone) {
      useCheckoutStore.getState().updateFormData({ phone: urlPhone.trim() });
    }
    const urlName = searchParams.get('name') || searchParams.get('customerName');
    if (urlName) {
      useCheckoutStore.getState().updateFormData({ customerName: urlName.trim() });
    }
    const urlToken = searchParams.get('token');
    if (urlToken) {
      tokenManager.setAccessToken(urlToken);
    }
  }, [location.pathname, location.search, searchParams, settings?.companyId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      try {
        if (location.hash) {
          const targetId = decodeURIComponent(location.hash.slice(1));
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ block: 'start' });
          }
          return;
        }

        const isJsdom =
          typeof navigator !== 'undefined' &&
          navigator.userAgent.toLowerCase().includes('jsdom');
        if (!isJsdom) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      } catch {
        // Some test browsers do not implement scrolling APIs.
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlDir = html.getAttribute('dir');
    const previousHtmlLang = html.getAttribute('lang');
    const previousBodyDir = body?.getAttribute('dir') ?? null;

    html.setAttribute('dir', currentDirection);
    html.setAttribute('lang', documentLanguage);
    body?.setAttribute('dir', currentDirection);

    return () => {
      if (previousHtmlDir === null) {
        html.removeAttribute('dir');
      } else {
        html.setAttribute('dir', previousHtmlDir);
      }

      if (previousHtmlLang === null) {
        html.removeAttribute('lang');
      } else {
        html.setAttribute('lang', previousHtmlLang);
      }

      if (!body) {
        return;
      }

      if (previousBodyDir === null) {
        body.removeAttribute('dir');
      } else {
        body.setAttribute('dir', previousBodyDir);
      }
    };
  }, [currentDirection, documentLanguage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<{ locale?: StorefrontLocale; direction?: string }>).detail;
      if (detail && typeof document !== 'undefined') {
        if (detail.direction) {
          document.documentElement.dir = detail.direction;
          document.body?.setAttribute('dir', detail.direction);
        }
        if (detail.locale) {
          document.documentElement.lang = detail.locale;
        }
      }
    };
    window.addEventListener('storefront:locale-change', handleLocaleChange);
    return () => window.removeEventListener('storefront:locale-change', handleLocaleChange);
  }, []);

  const shopLayoutFallback = useMemo(() => {
    if (!hasShopStudioConfig(settings?.storefront)) {
      return 'sidebar-left' as StorefrontPageLayout;
    }

    return resolveShopPageLayoutHint(
      extractShopStudioConfig(settings?.storefront),
      'sidebar-left',
    );
  }, [settings]);

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const routePageKey = `${normalizedPath}${location.search}`;
  const layoutRouteSegments = normalizedPath.split('/').filter(Boolean);
  const layoutStorefrontSegments =
    layoutRouteSegments[0] === 'store'
      ? layoutRouteSegments.slice(1)
      : layoutRouteSegments;

  const activePageKey = useMemo(() => {
    if (propActivePageKey) return propActivePageKey;
    return resolveActivePageKeyFromPath(location.pathname);
  }, [propActivePageKey, location.pathname]);

  const pageStyleVars = useMemo(() => {
    return resolvePageStyleVars(theme, activePageKey);
  }, [theme, activePageKey]);

  const isProductImageLandingPage =
    layoutStorefrontSegments[0] === 'lp' ||
    layoutStorefrontSegments[0] === 'landing';
  const isFunnelPage =
    layoutStorefrontSegments[0] === 'funnel' ||
    layoutStorefrontSegments[0] === 'p';

  const shouldWarmLayoutCategories =
    layoutStorefrontSegments.length === 0 ||
    layoutStorefrontSegments[0] === 'shop' ||
    layoutStorefrontSegments[0] === 'collections' ||
    layoutStorefrontSegments[0] === 'sale';

  useCategories(undefined, { enabled: shouldWarmLayoutCategories });

  const isPostPurchaseOfferPage = normalizedPath.endsWith('/order-offer');
  const isMinimal =
    isProductImageLandingPage ||
    isFunnelPage ||
    normalizedPath.endsWith('/checkout') ||
    isPostPurchaseOfferPage ||
    normalizedPath.endsWith('/thank-you');

  const isKhemetLuxe = isKhemetLuxeTheme(theme.id);
  const isKhemetLuxeInnerRoute =
    isKhemetLuxe &&
    normalizedPath !== '/' &&
    !normalizedPath.endsWith('/store') &&
    !isMinimal;
  const isKhemetMinimalCommerce =
    isKhemetLuxe && normalizedPath.endsWith('/checkout');

  const isIntruderNft = theme.id === 'intruder-nft';
  const isBiteRush = theme.id === 'restaurant-demo';
  const isMenShoes = theme.id === 'men-shoes-eg';
  const isElessiPackTheme = theme.id?.startsWith('elessi-') === true;
  const isProductPreview =
    searchParams.get('productPreview') === '1' ||
    searchParams.get('preview') === '1';
  const previewProductId = searchParams.get('previewProductId');
  const isFastlyTheme = theme.id === 'fastly-eg';
  const isGracefulTheme = theme.id === 'soft-graceful';

  const productRouteKey = getStorefrontProductRouteKey(normalizedPath);
  const legacyProductSlugAliasTarget = useMemo(
    () =>
      resolveLegacyProductSlugAlias(productRouteKey, {
        companyId: searchParams.get('companyId') || settings?.company?.id,
        companySlug: settings?.company?.slug,
        hostname:
          typeof window === 'undefined' ? null : window.location.hostname,
      }),
    [
      productRouteKey,
      searchParams,
      settings?.company?.id,
      settings?.company?.slug,
    ],
  );

  useEffect(() => {
    if (!legacyProductSlugAliasTarget) {
      return;
    }

    const basePath = normalizedPath.startsWith('/store') ? '/store' : '';
    navigate(
      `${basePath}/product/${encodeURIComponent(legacyProductSlugAliasTarget)}${location.search}${location.hash}`,
      { replace: true },
    );
  }, [
    legacyProductSlugAliasTarget,
    location.hash,
    location.search,
    navigate,
    normalizedPath,
  ]);

  const isProductDetailPage = Boolean(productRouteKey);
  const [previewProductName, setPreviewProductName] = useState<string | null>(null);

  useEffect(() => {
    if (!productRouteKey || !previewThemeId) {
      setPreviewProductName(null);
      return;
    }

    let cancelled = false;

    void import('../preview/marketplaceSampleData').then(
      ({ getMarketplacePreviewProduct }) => {
        if (cancelled) {
          return;
        }

        const product = getMarketplacePreviewProduct(
          productRouteKey,
          previewThemeId,
        );
        setPreviewProductName(product?.name || null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [productRouteKey, previewThemeId]);

  const previewProduct = previewProductName
    ? { name: previewProductName }
    : null;

  const isDistrictMarketShopRoute =
    theme.id === 'district-market' && normalizedPath.endsWith('/shop');

  const showMobileBottomNav =
    !isMinimal &&
    !isProductDetailPage &&
    !isDistrictMarketShopRoute &&
    !isElessiPackTheme &&
    !isFastlyTheme &&
    !isGracefulTheme;

  const showPreviewThemeBanner =
    Boolean(previewThemeId) &&
    !isKhemetMinimalCommerce &&
    !isKhemetLuxeInnerRoute;

  const showFooter = !isKhemetMinimalCommerce && !isProductImageLandingPage;

  const activeStorefrontTemplates = (
    (settings as any)?.templates ||
    (settings as any)?.storefrontSettings?.templates ||
    (settings as any)?.designTokens?.templates ||
    (theme as any)?.designTokens?.templates ||
    (theme as any)?.templates ||
    []
  );

  return {
    theme,
    settings,
    location,
    navigate,
    search,
    canRenderConversionHosts,
    currentLocale,
    currentDirection,
    documentLanguage,
    runtimeText,
    globalHeader,
    globalFooter,
    shopLayoutFallback,
    routePageKey,
    activePageKey,
    pageStyleVars,
    isProductImageLandingPage,
    isPostPurchaseOfferPage,
    isMinimal,
    isKhemetLuxe,
    isIntruderNft,
    isBiteRush,
    isMenShoes,
    isElessiPackTheme,
    isProductPreview,
    previewProductId,
    isFastlyTheme,
    isGracefulTheme,
    legacyProductSlugAliasTarget,
    previewProduct,
    showMobileBottomNav,
    showPreviewThemeBanner,
    showFooter,
    activeStorefrontTemplates,
  };
};

export type StorefrontLayoutController = ReturnType<typeof useStorefrontLayoutController>;
