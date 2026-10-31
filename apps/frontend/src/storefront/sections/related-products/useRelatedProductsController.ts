import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { storefrontFetch } from '../../../utils/storefrontApi';
import { fetchStorefrontProduct, getStorefrontProductQueryKey, useProduct } from '../../hooks/useProduct';
import { useProducts, type Product } from '../../hooks/useProducts';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { shouldStorefrontForceDocumentNavigation } from '../../utils/navigationGuards';
import { isMarketplaceThemePreview } from '../../preview/previewContext';
import {
  getThemePreviewProductRecommendations,
  resolveActiveThemePreviewDataset,
} from '../../preview/themePreviewData';
import {
  getStorefrontMarketplaceAppSettings,
  isStorefrontMarketplaceAppEnabled,
} from '../../utils/marketplaceApps';
import { trackStorefrontAppUsage } from '../../utils/appUsageTracking';
import { buildStorefrontPath } from '../../utils/paths';
import { resolveSectionContentAlign } from '../../utils/contentAlignment';
import { useDeferredSectionActivation } from '../../hooks/useDeferredSectionActivation';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import type { RelatedProductsProps, StorefrontProductPayload } from './relatedProductsTypes';
import {
  DEFAULT_SUBTITLE,
  DEFAULT_TITLE,
  getRelatedGridClassName,
  normalizeRecommendation,
  normalizeRelatedProductsVariant,
  parsePositiveNumber,
  resolveDirectionalCopy,
  resolveRelatedProductsVariant,
} from './relatedProductsHelpers';

export const useRelatedProductsController = ({ section, settings }: RelatedProductsProps) => {
  const queryClient = useQueryClient();
  const shouldForceDocumentNavigation = shouldStorefrontForceDocumentNavigation();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const { theme } = useStorefrontTheme();

  const limit = parsePositiveNumber(settings?.limit, 4);
  const mobileLimit = parsePositiveNumber(settings?.mobileLimit, limit);
  const sectionVariant = normalizeRelatedProductsVariant(section?.variant);
  const cardVariant = resolveRelatedProductsVariant(sectionVariant) ?? 'standard';
  const isElessiCompleteSet = sectionVariant === 'elessi-complete-set';

  const { isActive, sectionRef } = useDeferredSectionActivation({
    idleTimeout: isElessiCompleteSet ? 3500 : 10000,
    rootMargin: isElessiCompleteSet ? '1800px 0px' : '420px 0px',
  });

  const { product, isLoading: productLoading } = useProduct(id);
  const viewElementRef = useRef<HTMLElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const previewDataset = useMemo(
    () => resolveActiveThemePreviewDataset(location.search),
    [location.search],
  );

  const isMarketplacePreview = useMemo(
    () => isMarketplaceThemePreview(location.search),
    [location.search],
  );

  const conversionEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    'conversion-suite',
  );
  const conversionSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    'conversion-suite',
  );
  const modules = (conversionSettings['modules'] as Record<string, unknown> | undefined) || {};
  const copy = (conversionSettings['copy'] as Record<string, unknown> | undefined) || {};
  const crossSellEnabled = conversionEnabled && modules['crossSell'] !== false;

  const { products, isLoading, error } = useProducts(
    {
      limit: limit + 1,
      category: product?.categoryId,
    },
    undefined,
    {
      enabled: isActive && Boolean(product?.categoryId) && !crossSellEnabled,
    },
  );

  const prefersArabicCopy = theme.direction === 'rtl';
  const isWomenFashionTheme = theme.id === 'women-fashion-eg';
  const isContentCentered = resolveSectionContentAlign(settings?.contentAlign) === 'center';

  useEffect(() => {
    if (!isActive || !product?.id) {
      setRecommendedProducts([]);
      setRecommendationsLoading(false);
      return;
    }

    const themePreviewRecommendations = previewDataset
      ? getThemePreviewProductRecommendations(
          previewDataset,
          product.id,
          'related',
          limit,
        )
      : [];
    if (themePreviewRecommendations.length > 0) {
      setRecommendationsLoading(false);
      setRecommendedProducts(themePreviewRecommendations.slice(0, limit));
      return;
    }

    if (!crossSellEnabled && !isMarketplacePreview) {
      setRecommendedProducts([]);
      setRecommendationsLoading(false);
      return;
    }

    let cancelled = false;

    const loadRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        if (isMarketplacePreview) {
          const { getMarketplacePreviewRecommendations } = await import(
            '../../preview/marketplaceSampleData'
          );
          const marketplacePreviewRecommendations =
            getMarketplacePreviewRecommendations(product.id, 'related');

          if (marketplacePreviewRecommendations?.length) {
            if (!cancelled) {
              setRecommendedProducts(
                marketplacePreviewRecommendations.slice(0, limit),
              );
              setRecommendationsLoading(false);
            }
            return;
          }
        }

        const response = await storefrontFetch(
          `/products/${encodeURIComponent(product.id)}/related`,
          {
            query: { limit },
          },
        );

        if (cancelled) {
          return;
        }

        const nextProducts = Array.isArray(response?.data)
          ? response.data.map((item: StorefrontProductPayload) => normalizeRecommendation(item))
          : [];
        setRecommendedProducts(nextProducts);
      } catch (fetchError) {
        if (!cancelled) {
          console.error('Failed to load related product recommendations:', fetchError);
          setRecommendedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setRecommendationsLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [
    crossSellEnabled,
    isActive,
    isMarketplacePreview,
    limit,
    previewDataset,
    product?.id,
  ]);

  const fallbackProducts = useMemo(
    () =>
      products
        .filter((item) => item.id !== product?.id && item.slug !== product?.slug)
        .slice(0, limit),
    [limit, product?.id, product?.slug, products],
  );

  const apiRecommendations = useMemo(
    () =>
      recommendedProducts
        .filter((item) => item.id !== product?.id && item.slug !== product?.slug)
        .slice(0, limit),
    [limit, product?.id, product?.slug, recommendedProducts],
  );

  const relatedProducts = apiRecommendations.length > 0 ? apiRecommendations : fallbackProducts;

  const title = resolveDirectionalCopy({
    value: settings?.title ?? (crossSellEnabled ? copy['crossSellTitle'] : undefined),
    englishFallback: 'You may also want',
    arabicFallback: DEFAULT_TITLE,
    prefersArabicCopy,
    legacyEnglishValues: ['Cross Sell'],
  });

  const subtitle = resolveDirectionalCopy({
    value: settings?.subtitle ?? (crossSellEnabled ? copy['crossSellDescription'] : undefined),
    englishFallback: 'Add complementary picks',
    arabicFallback: DEFAULT_SUBTITLE,
    prefersArabicCopy,
    legacyEnglishValues: [
      'A focused set of complementary picks that keeps the product page clean.',
    ],
  });

  const ctaText = typeof settings?.ctaText === 'string' ? settings.ctaText.trim() : '';
  const ctaLink = typeof settings?.ctaLink === 'string' ? settings.ctaLink.trim() : '';
  const shouldShowLoading =
    !isActive ||
    productLoading ||
    recommendationsLoading ||
    (relatedProducts.length === 0 && isLoading);

  const relatedGridClass = getRelatedGridClassName(
    cardVariant,
    shouldShowLoading ? limit : relatedProducts.length,
  );

  const isElessiMerchRail = sectionVariant === 'elessi-merch-rail';
  const isElessiDiscoveryStrip = sectionVariant === 'elessi-discovery-strip';
  const isElessiOrganicRelated = sectionVariant === 'elessi-organic-related';
  const isElessiDigitalRelated = sectionVariant === 'elessi-digital-related';
  const isElessiPlantRelated = sectionVariant === 'elessi-plant-related';
  const isElessiBikeRelated = sectionVariant === 'elessi-bike-related';
  const isClosetPairings = sectionVariant === 'closet-pairings';
  const isScentCircle = sectionVariant === 'scent-circle';
  const isCommandAlternatives = sectionVariant === 'command-alternatives';
  const isFastlyOfferWallRelated = sectionVariant === 'fastly-offer-wall';
  const isWomenFashionClosetPairings = isWomenFashionTheme && isClosetPairings;
  const effectiveCardVariant = isWomenFashionClosetPairings ? 'compact' : cardVariant;
  const isGracefulRelated = section?.variant === 'graceful-related';
  const effectiveRelatedGridClass = isWomenFashionClosetPairings
    ? relatedGridClass.replaceAll('gap-5', 'gap-3')
    : relatedGridClass;

  const fastlyCtaPath =
    isFastlyOfferWallRelated && ctaText && ctaLink
      ? buildStorefrontPath(location.pathname, ctaLink, location.search)
      : null;

  const currentProductFacts = Array.isArray(product?.['commandFacts'])
    ? (product['commandFacts'] as Array<{ label?: string; value?: string }>).slice(0, 3)
    : [];

  const commandHeaderTitle =
    isCommandAlternatives && typeof product?.['bundleTitle'] === 'string' && product['bundleTitle'].trim()
      ? product['bundleTitle'].trim()
      : title;

  const commandHeaderSubtitle =
    isCommandAlternatives &&
    typeof product?.['bundleSubtitle'] === 'string' &&
    product['bundleSubtitle'].trim()
      ? product['bundleSubtitle'].trim()
      : subtitle;

  const companySettings =
    storefrontSettings &&
    typeof storefrontSettings === 'object' &&
    'company' in storefrontSettings &&
    storefrontSettings.company &&
    typeof storefrontSettings.company === 'object'
      ? (storefrontSettings.company as Record<string, unknown>)
      : undefined;

  const currency =
    typeof companySettings?.currency === 'string' && companySettings.currency.trim()
      ? companySettings.currency
      : 'EGP';

  const elessiCompleteSetGridClass =
    shouldShowLoading || relatedProducts.length > 2
      ? 'grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4'
      : 'grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-2';

  useEffect(() => {
    setHasEnteredViewport(false);
  }, [product?.id]);

  useEffect(() => {
    if (hasEnteredViewport) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (typeof window.IntersectionObserver !== 'function') {
      setHasEnteredViewport(true);
      return undefined;
    }
    const element = viewElementRef.current;
    if (!element) return undefined;

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasEnteredViewport, product?.id, relatedProducts.length, shouldShowLoading]);

  useEffect(() => {
    if (
      !hasEnteredViewport ||
      !crossSellEnabled ||
      !product?.id ||
      shouldShowLoading ||
      relatedProducts.length === 0
    ) {
      return;
    }

    void trackStorefrontAppUsage({
      slug: 'conversion-suite',
      feature: 'cross_sell_section_view',
      dedupeKey: `cross-sell:${product.id}:${apiRecommendations.length > 0 ? 'api' : 'fallback'}`,
      metadata: {
        productId: product.id,
        recommendationCount: relatedProducts.length,
        source: apiRecommendations.length > 0 ? 'api' : 'fallback',
      },
    });
  }, [
    apiRecommendations.length,
    crossSellEnabled,
    hasEnteredViewport,
    product?.id,
    relatedProducts.length,
    shouldShowLoading,
  ]);

  return {
    sectionRef,
    viewElementRef,
    queryClient,
    location,
    product,
    relatedProducts,
    limit,
    mobileLimit,
    title,
    subtitle,
    ctaText,
    fastlyCtaPath,
    currency,
    shouldShowLoading,
    error,
    isContentCentered,
    prefersArabicCopy,
    isWomenFashionClosetPairings,
    isElessiCompleteSet,
    isElessiOrganicRelated,
    isElessiPlantRelated,
    isElessiBikeRelated,
    isElessiMerchRail,
    isElessiDiscoveryStrip,
    isScentCircle,
    isClosetPairings,
    isCommandAlternatives,
    isFastlyOfferWallRelated,
    isElessiDigitalRelated,
    commandHeaderTitle,
    commandHeaderSubtitle,
    currentProductFacts,
    effectiveCardVariant,
    isGracefulRelated,
    effectiveRelatedGridClass,
    elessiCompleteSetGridClass,
    shouldForceDocumentNavigation,
  };
};
