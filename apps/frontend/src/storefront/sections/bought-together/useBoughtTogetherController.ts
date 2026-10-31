import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { useProduct } from '../../hooks/useProduct';
import { isMarketplaceThemePreview } from '../../preview/previewContext';
import { resolveActiveThemePreviewDataset } from '../../preview/themePreviewData';
import { usePdpSelectionStore } from '../../store/usePdpSelectionStore';
import {
  getStorefrontMarketplaceAppSettings,
  isStorefrontMarketplaceAppEnabled,
} from '../../utils/marketplaceApps';
import { trackStorefrontAppUsage } from '../../utils/appUsageTracking';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { resolveSectionContentAlign } from '../../utils/contentAlignment';

import {
  getProductVariants,
  normalizeVariant,
  parsePositiveNumber,
  resolveDirectionalCopy,
  type BoughtTogetherSectionProps,
} from './types';
import { useBoughtTogetherRecommendations } from './useBoughtTogetherRecommendations';
import { useBoughtTogetherSelections } from './useBoughtTogetherSelections';
import { useBoughtTogetherCartActions } from './useBoughtTogetherCartActions';

export const useBoughtTogetherController = ({
  section,
  settings,
}: BoughtTogetherSectionProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const { theme } = useStorefrontTheme();
  const { product, isLoading: productLoading } = useProduct(id);

  const previewDataset = useMemo(
    () => resolveActiveThemePreviewDataset(location.search),
    [location.search],
  );
  const isMarketplacePreview = useMemo(
    () => isMarketplaceThemePreview(location.search),
    [location.search],
  );

  const currentPdpSelection = usePdpSelectionStore(
    (state) => state.selection,
    (a, b) => {
      if (a === b) return true;
      if (!a || !b) return false;
      return (
        a.productId === b.productId &&
        a.variantId === b.variantId &&
        a.unitPrice === b.unitPrice &&
        a.isSelectionReady === b.isSelectionReady &&
        a.imageUrl === b.imageUrl
      );
    },
  );

  const conversionEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    'conversion-suite',
  );
  const conversionSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    'conversion-suite',
  );
  const modules = (conversionSettings['modules'] as Record<string, any> | undefined) || {};
  const ui = (conversionSettings['ui'] as Record<string, any> | undefined) || {};
  const copy = (conversionSettings['copy'] as Record<string, any> | undefined) || {};
  const boughtTogetherEnabled = conversionEnabled && modules['boughtTogether'] !== false;
  const limit = parsePositiveNumber(settings?.limit, 3);
  const currency =
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    'EGP';
  const prefersArabicCopy = theme.direction === 'rtl';
  const isPcHubTheme = theme.id === 'pc-hub-eg';
  const isWomenFashionTheme = theme.id === 'women-fashion-eg';
  const isSoleaFemmeTheme = theme.id === 'solea-femme';

  const productBundleTitle =
    typeof product?.['bundleTitle'] === 'string' && product['bundleTitle'].trim()
      ? product['bundleTitle'].trim()
      : undefined;
  const productBundleSubtitle =
    typeof product?.['bundleSubtitle'] === 'string' && product['bundleSubtitle'].trim()
      ? product['bundleSubtitle'].trim()
      : undefined;

  const sectionVariant = normalizeVariant(
    section?.variant,
    normalizeVariant(ui['boughtTogetherStyle'], 'stacked'),
  );
  const isContentCentered =
    resolveSectionContentAlign(settings?.contentAlign) === 'center';

  const title = resolveDirectionalCopy({
    value: (isPcHubTheme ? productBundleTitle : undefined) ?? settings?.title ?? copy['boughtTogetherTitle'],
    englishFallback: 'Frequently bought together',
    arabicFallback: 'يُشترى معه كثيرًا',
    prefersArabicCopy,
    legacyEnglishValues: ['Complete the setup'],
  });
  const subtitle = resolveDirectionalCopy({
    value:
      (isPcHubTheme ? productBundleSubtitle : undefined) ??
      settings?.subtitle ??
      copy['boughtTogetherDescription'],
    englishFallback: 'Curated add-ons that pair naturally with this product.',
    arabicFallback: 'اقتراحات مختارة بعناية لتكمل هذا المنتج وتزيد قيمة الطلب.',
    prefersArabicCopy,
    legacyEnglishValues: [
      'Popular pairings for this product',
      'Fast accessories and matching picks to add in the same flow.',
    ],
  });
  const addBundleText = resolveDirectionalCopy({
    value: settings?.addBundleText ?? copy['bundleAddLabel'],
    englishFallback: 'Add selected bundle',
    arabicFallback: 'أضف الباقة المحددة',
    prefersArabicCopy,
  });
  const totalLabel = resolveDirectionalCopy({
    value: settings?.totalLabel ?? copy['bundleTotalLabel'],
    englishFallback: 'Bundle total',
    arabicFallback: 'إجمالي الباقة',
    prefersArabicCopy,
  });
  const currentProductLabel = resolveDirectionalCopy({
    value: settings?.currentProductLabel ?? copy['bundleCurrentLabel'],
    englishFallback: 'Current product',
    arabicFallback: 'المنتج الحالي',
    prefersArabicCopy,
  });
  const recommendationLabel = resolveDirectionalCopy({
    value: settings?.recommendationLabel ?? copy['bundleRecommendationLabel'],
    englishFallback: 'Recommended add-on',
    arabicFallback: 'اقتراح مكمل',
    prefersArabicCopy,
  });
  const quickAddText = resolveDirectionalCopy({
    value: settings?.quickAddText ?? copy['quickAddLabel'],
    englishFallback: 'Quick add',
    arabicFallback: 'إضافة سريعة',
    prefersArabicCopy,
  });
  const bundleVariantHint = resolveDirectionalCopy({
    value: settings?.bundleVariantHint ?? copy['bundleVariantHint'],
    englishFallback:
      'Choose the color or size for each add-on from the same card before adding the bundle.',
    arabicFallback:
      'اختاري المقاس أو اللون للإضافات المحددة قبل إضافة الباقة.',
    prefersArabicCopy,
    legacyEnglishValues: [
      'Products with variants still need to be configured from their own product page.',
      'Choose the color or size for each add-on from the same card before adding the bundle.',
    ],
  });

  const { recommendations, loading } = useBoughtTogetherRecommendations({
    boughtTogetherEnabled,
    productId: product?.id,
    previewDataset,
    isMarketplacePreview,
    limit,
  });

  const selections = useBoughtTogetherSelections({
    recommendations,
  });

  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  useEffect(() => {
    setHasEnteredViewport(false);
  }, [product?.id]);

  useEffect(() => {
    if (hasEnteredViewport) return undefined;
    if (!boughtTogetherEnabled || productLoading || loading || !product?.id || recommendations.length === 0) {
      return undefined;
    }
    if (typeof window === 'undefined') return undefined;
    if (typeof window.IntersectionObserver !== 'function') {
      setHasEnteredViewport(true);
      return undefined;
    }
    const element = sectionRef.current;
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
  }, [boughtTogetherEnabled, hasEnteredViewport, loading, product?.id, productLoading, recommendations.length]);

  useEffect(() => {
    if (!hasEnteredViewport || !product?.id || loading || recommendations.length === 0) {
      return;
    }

    void trackStorefrontAppUsage({
      slug: 'conversion-suite',
      feature: 'bought_together_view',
      dedupeKey: `bought-together:${product.id}:${sectionVariant}`,
      metadata: {
        productId: product.id,
        recommendationCount: recommendations.length,
        variant: sectionVariant,
      },
    });
  }, [hasEnteredViewport, loading, product?.id, recommendations.length, sectionVariant]);

  const hasCurrentPdpSelection =
    Boolean(product?.id) && currentPdpSelection?.productId === product?.id;
  const currentProductSelectionReady =
    !product || !getProductVariants(product).length ||
    (hasCurrentPdpSelection && Boolean(currentPdpSelection?.isSelectionReady));

  const bundleTotal = useMemo(() => {
    const currentPrice =
      hasCurrentPdpSelection
        ? Number(currentPdpSelection?.unitPrice) || Number(product?.price) || 0
        : Number(product?.price) || 0;
    return (
      currentPrice +
      selections.selectedRecommendations.reduce((total, item) => {
        const selectedVariant = selections.selectedRecommendationVariants[item.id];
        const itemPrice =
          typeof selectedVariant?.price === 'number' && Number.isFinite(selectedVariant.price)
            ? selectedVariant.price
            : Number(item.price) || 0;

        return total + itemPrice;
      }, 0)
    );
  }, [
    hasCurrentPdpSelection,
    currentPdpSelection?.unitPrice,
    product?.id,
    product?.price,
    selections.selectedRecommendationVariants,
    selections.selectedRecommendations,
  ]);

  const bundleItems = useMemo(
    () => (product ? [product, ...recommendations] : recommendations),
    [product, recommendations],
  );

  const bundleGridClassName = useMemo(() => {
    const baseMobile =
      'mt-6 sm:mt-8 flex overflow-x-auto pb-4 pt-1 px-1 sm:p-0 sm:overflow-visible snap-x snap-mandatory gap-3.5 sm:gap-5 scrollbar-none';
    if (bundleItems.length <= 1) {
      return 'mt-6 sm:mt-8 mx-auto grid max-w-sm grid-cols-1 gap-4';
    }
    if (bundleItems.length === 2) {
      return `${baseMobile} max-w-2xl mx-auto sm:grid sm:grid-cols-2`;
    }
    if (bundleItems.length === 3) {
      return `${baseMobile} max-w-5xl mx-auto sm:grid sm:grid-cols-2 lg:grid-cols-3`;
    }
    return `${baseMobile} sm:grid sm:grid-cols-2 lg:grid-cols-4`;
  }, [bundleItems.length]);

  const cartActions = useBoughtTogetherCartActions({
    product,
    hasCurrentPdpSelection,
    currentPdpSelection,
    currentProductSelectionReady,
    selectedRecommendations: selections.selectedRecommendations,
    prefersArabicCopy,
    getSelectedRecommendationVariant: selections.getSelectedRecommendationVariant,
    getRecommendationPrice: selections.getRecommendationPrice,
    getRecommendationAttributes: selections.getRecommendationAttributes,
    getRecommendationImage: selections.getRecommendationImage,
  });

  const isPairingRail = sectionVariant === 'pairing-rail';
  const isCompactPairingRail =
    isPairingRail && (isWomenFashionTheme || isSoleaFemmeTheme);

  const effectiveBundleGridClassName = isCompactPairingRail
    ? bundleGridClassName.replace('mt-6 sm:mt-8', 'mt-4 sm:mt-6').replaceAll('gap-5', 'gap-3.5')
    : bundleGridClassName;

  const selectedCountText = prefersArabicCopy
    ? `1 + ${selections.selectedRecommendations.length} عنصر محدد`
    : `1 + ${selections.selectedRecommendations.length} items selected`;
  const includedText = prefersArabicCopy
    ? 'يتم تضمين هذا المنتج تلقائيًا عند إضافة الباقة.'
    : 'Included automatically when you add the bundle.';
  const selectedStateText = prefersArabicCopy ? 'محدد في الباقة' : 'Selected';
  const selectStateText = prefersArabicCopy ? 'أضف للباقة' : 'Add to bundle';
  const bundleSummaryText = prefersArabicCopy
    ? `تشمل الباقة المنتج الحالي + ${selections.selectedRecommendations.length} إضافة`
    : `Bundle includes the current product + ${selections.selectedRecommendations.length} add-ons`;
  const bundleHelpText = prefersArabicCopy
    ? 'اختر الإضافات التي تريدها، ثم أضف الباقة بالكامل بخطوة واحدة.'
    : 'Select the add-ons you want, then add the bundle in one step.';

  return {
    sectionRef,
    product,
    productLoading,
    loading,
    boughtTogetherEnabled,
    recommendations,
    selectedIds: selections.selectedIds,
    selectedRecommendations: selections.selectedRecommendations,
    selectableRecommendations: recommendations,
    bundleItems,
    bundleTotal,
    currency,
    sectionVariant,
    isContentCentered,
    isCompactPairingRail,
    effectiveBundleGridClassName,
    prefersArabicCopy,
    isSoleaFemmeTheme,
    title,
    subtitle,
    totalLabel,
    currentProductLabel,
    recommendationLabel,
    quickAddText,
    addBundleText,
    bundleVariantHint,
    selectedCountText,
    includedText,
    selectedStateText,
    selectStateText,
    bundleSummaryText,
    bundleHelpText,
    handleToggleSelection: selections.handleToggleSelection,
    handleQuickAdd: cartActions.handleQuickAdd,
    handleAddBundle: cartActions.handleAddBundle,
    getSelectedRecommendationVariant: selections.getSelectedRecommendationVariant,
    getRecommendationPrice: selections.getRecommendationPrice,
    getRecommendationAttributes: selections.getRecommendationAttributes,
    getRecommendationImageCandidates: selections.getRecommendationImageCandidates,
    updateRecommendationAttributes: selections.updateRecommendationAttributes,
  };
};

export type BoughtTogetherController = ReturnType<typeof useBoughtTogetherController>;
