import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProduct';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import {
  getStorefrontMarketplaceAppSettings,
  isStorefrontMarketplaceAppEnabled,
} from '../../utils/marketplaceApps';
import { isProductPageCheckoutEnabledForProduct } from '../../../utils/productPageCheckout';
import { resolveSectionContentAlign } from '../../utils/contentAlignment';

import {
  asRecord,
  formatCountdownParts,
  normalizeConversionStackVariant,
  parseBooleanSetting,
  resolveDirectionalCopy,
  resolveStandaloneConversionBlock,
  URGENCY_PRIORITY,
  type ConversionStackProps,
  type UrgencyBlockId,
} from './types';
import { useConversionBlocks } from './useConversionBlocks';
import { useConversionSocialProof } from './useConversionSocialProof';
import { resolveConversionLabels } from './resolveConversionLabels';
import { useConversionTracking } from './useConversionTracking';

export const useConversionStackController = ({
  section,
  settings: sectionSettings,
}: ConversionStackProps) => {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading } = useProduct(id);
  const { settings: storefrontSettings } = useStorefrontSettings();
  const { theme } = useStorefrontTheme();
  const isPcHubTheme = theme.id === 'pc-hub-eg';
  const sectionType =
    typeof section?.type === 'string' && section.type.trim()
      ? section.type.trim().toLowerCase()
      : 'conversion-stack';
  const standaloneBlockId = resolveStandaloneConversionBlock(sectionType);
  const isNovaMobile = theme.id === 'nova-mobile';
  const prefersArabicCopy = theme.direction === 'rtl';
  const variant = normalizeConversionStackVariant(section?.variant);
  const conversionEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    'conversion-suite',
  );
  const conversionSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    'conversion-suite',
  );
  const commerceAdvancedEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    'commerce-advanced',
  );
  const commerceAdvancedSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    'commerce-advanced',
  );

  const modules = useMemo(() => asRecord(conversionSettings['modules']), [conversionSettings]);
  const general = useMemo(() => asRecord(conversionSettings['general']), [conversionSettings]);
  const ui = useMemo(() => asRecord(conversionSettings['ui']), [conversionSettings]);
  const copy = useMemo(() => asRecord(conversionSettings['copy']), [conversionSettings]);
  const thresholds = useMemo(() => asRecord(conversionSettings['thresholds']), [conversionSettings]);
  const countdown = useMemo(() => asRecord(conversionSettings['countdown']), [conversionSettings]);
  const estimatedDelivery = useMemo(
    () => asRecord(conversionSettings['estimatedDelivery']),
    [conversionSettings],
  );

  const productMetadata = product?.['metadata'];
  const metadata = useMemo(() => {
    try {
      return typeof productMetadata === 'string'
        ? asRecord(JSON.parse(productMetadata))
        : asRecord(productMetadata);
    } catch {
      return {};
    }
  }, [productMetadata]);

  const fakeVisitorCounterEnabled = Boolean(modules['fakeVisitorCounter']);

  const proof = useConversionSocialProof({
    product: product as Record<string, unknown> | null | undefined,
    metadata,
    thresholds,
    fakeVisitorCounterEnabled,
  });

  const commerceModules = asRecord(commerceAdvancedSettings['modules']);
  const commerceCopy = asRecord(commerceAdvancedSettings['copy']);

  const showLowStock =
    modules['lowStockNotice'] &&
    proof.lowStockDisplayCount !== null &&
    proof.lowStockDisplayCount > 0 &&
    proof.lowStockDisplayCount <= Math.max(proof.lowStockLimit, 8);

  const countdownParts = formatCountdownParts(String(countdown['endsAt'] || ''));
  const showCountdown = modules['saleCountdown'] && Boolean(countdownParts);
  const showEstimatedDelivery =
    modules['estimatedDelivery'] &&
    Number.isFinite(Number(estimatedDelivery['minDays'])) &&
    Number.isFinite(Number(estimatedDelivery['maxDays']));
  const isPreOrder = Boolean(product?.['isPreOrder'] || metadata?.['isPreOrder']);
  const showPreOrder =
    commerceAdvancedEnabled && Boolean(commerceModules['preOrder']) && isPreOrder;

  const showBackInStock =
    modules['backInStock'] && proof.stockCount !== null && proof.stockCount <= 0 && !showPreOrder;
  const showTrustedBadges = Boolean(modules['trustedBadges']);
  const showFakeVisitor = modules['fakeVisitorCounter'] && proof.viewerCount > 0;
  const showSoldCounter = modules['soldCounter'] && proof.soldCount > 0;
  const showPurchaseFomo = modules['purchaseFomo'] && proof.purchaseFomoCount > 0;
  const renderInTemplates = general['renderInTemplates'] !== false;

  const activeUrgencyIds = [
    showCountdown ? 'countdown' : null,
    showLowStock ? 'low-stock' : null,
    showPreOrder ? 'pre-order' : null,
    showSoldCounter ? 'sold-counter' : null,
    showPurchaseFomo ? 'purchase-fomo' : null,
    showFakeVisitor ? 'fake-visitor' : null,
  ].filter(Boolean) as UrgencyBlockId[];

  const dominantUrgencyId =
    URGENCY_PRIORITY.find((blockId) => activeUrgencyIds.includes(blockId)) || null;

  const labels = resolveConversionLabels({
    sectionSettings: sectionSettings as Record<string, unknown> | undefined,
    ui,
    copy,
    countdown,
    estimatedDelivery,
    commerceCopy,
    prefersArabicCopy,
    isPcHubTheme,
    product: product as Record<string, unknown> | null | undefined,
    viewerCount: proof.viewerCount,
    soldCount: proof.soldCount,
    purchaseFomoSource: proof.purchaseFomoSource,
    purchaseFomoCount: proof.purchaseFomoCount,
    purchaseFomoRecentPurchaseWindowHours: proof.purchaseFomoRecentPurchaseWindowHours,
    purchaseFomoCartWindowHours: proof.purchaseFomoCartWindowHours,
    countdownParts,
    showLowStock: Boolean(showLowStock),
    lowStockDisplayCount: proof.lowStockDisplayCount,
    lowStockLimit: proof.lowStockLimit,
    showEstimatedDelivery: Boolean(showEstimatedDelivery),
    showPreOrder: Boolean(showPreOrder),
    storefrontCurrency:
      storefrontSettings?.storefront?.settings?.currency ||
      storefrontSettings?.company?.currency,
  });

  const productPageCheckoutEnabled = isProductPageCheckoutEnabledForProduct(
    product as { metadata?: unknown } | null,
    storefrontSettings,
  );
  const showPulseRow = parseBooleanSetting(
    sectionSettings?.['showPulseRow'],
    !productPageCheckoutEnabled,
  );
  const showUrgencyTicker = parseBooleanSetting(sectionSettings?.['showUrgencyTicker'], true);
  const showConfidenceGrid = parseBooleanSetting(sectionSettings?.['showConfidenceGrid'], true);

  useConversionTracking({
    isLoading,
    productId: product?.id,
    conversionEnabled,
    renderInTemplates,
    sectionType,
    standaloneBlockId,
    variant,
    showCountdown: Boolean(showCountdown),
    countdownStyle: labels.countdownStyle,
    showLowStock: Boolean(showLowStock),
    lowStockStyle: labels.lowStockStyle,
    showEstimatedDelivery: Boolean(showEstimatedDelivery),
    estimatedDeliveryStyle: labels.estimatedDeliveryStyle,
    showPreOrder: Boolean(showPreOrder),
    showBackInStock: Boolean(showBackInStock),
    backInStockStyle: labels.backInStockStyle,
    showFakeVisitor: Boolean(showFakeVisitor),
    fakeVisitorStyle: labels.fakeVisitorStyle,
    showTrustedBadges,
    showSoldCounter: Boolean(showSoldCounter),
    soldCounterStyle: labels.soldCounterStyle,
    showPurchaseFomo: Boolean(showPurchaseFomo),
    purchaseFomoStyle: labels.purchaseFomoStyle,
    purchaseFomoSource: proof.purchaseFomoSource,
    showPulseRow,
    showUrgencyTicker,
    showConfidenceGrid,
    dominantUrgencyId,
  });

  const blocks = useConversionBlocks({
    showEstimatedDelivery: Boolean(showEstimatedDelivery),
    estimatedDeliveryStyle: labels.estimatedDeliveryStyle,
    estimatedDeliveryLabel: labels.estimatedDeliveryLabel,
    deliveryRange: labels.deliveryRange,
    isNovaMobile,
    showPreOrder: Boolean(showPreOrder),
    dominantUrgencyId,
    preOrderTitle: labels.preOrderTitle,
    preOrderDescription: labels.preOrderDescription,
    showBackInStock: Boolean(showBackInStock),
    product,
    backInStockStyle: labels.backInStockStyle,
    copy,
    prefersArabicCopy,
    variant,
    showTrustedBadges,
    trustedBadgeStyle: labels.trustedBadgeStyle,
    trustedBadgeItems: labels.trustedBadgeItems,
    trustedBadgeTitle: resolveDirectionalCopy({
      value:
        (isPcHubTheme ? product?.['trustedBadgeTitle'] : undefined) ??
        sectionSettings?.trustedBadgeTitle ??
        copy['trustedBadgeTitle'],
      englishFallback: 'Trusted checkout',
      arabicFallback: 'دفع آمن وموثوق',
      prefersArabicCopy,
    }),
    trustedBadgeSubtitle: resolveDirectionalCopy({
      value:
        (isPcHubTheme ? product?.['trustedBadgeSubtitle'] : undefined) ??
        sectionSettings?.trustedBadgeSubtitle ??
        copy['trustedBadgeSubtitle'],
      englishFallback:
        'Secure payment methods and reassurance messages connected to your store policy.',
      arabicFallback: 'طرق دفع آمنة ورسائل طمأنة مرتبطة بسياسات متجرك.',
      prefersArabicCopy,
    }),
    showCountdown: Boolean(showCountdown),
    countdownLabel: labels.countdownLabel,
    countdownSummary: labels.countdownSummary,
    showLowStock: Boolean(showLowStock),
    lowStockDisplayCount: proof.lowStockDisplayCount,
    lowStockLabel: labels.lowStockLabel,
    lowStockStyle: labels.lowStockStyle,
    lowStockProgress: labels.lowStockProgress,
    showSoldCounter: Boolean(showSoldCounter),
    soldCount: proof.soldCount,
    soldCounterMessage: labels.soldCounterMessage,
    showPurchaseFomo: Boolean(showPurchaseFomo),
    purchaseFomoCount: proof.purchaseFomoCount,
    purchaseFomoMessage: labels.purchaseFomoMessage,
    showFakeVisitor: Boolean(showFakeVisitor),
    viewerCount: proof.viewerCount,
    fakeVisitorMessage: labels.fakeVisitorMessage,
    showUrgencyTicker,
    showPulseRow,
    showConfidenceGrid,
    standaloneBlockId,
    bulkSavingsEnabled: Boolean(modules['bulkSavings']),
  });

  const heading =
    (typeof sectionSettings?.title === 'string' && sectionSettings.title.trim()) || '';
  const subtitle =
    (typeof sectionSettings?.subtitle === 'string' && sectionSettings.subtitle.trim()) || '';

  const surfaceClass =
    isNovaMobile
      ? 'space-y-5'
      : variant === 'seamless'
        ? 'space-y-10 bg-transparent py-2'
        : variant === 'couture-minimal'
          ? 'space-y-3 rounded-[1.7rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f4_100%)] p-4 shadow-[0_24px_80px_-62px_rgba(107,33,49,0.16)]'
        : variant === 'editorial'
          ? 'space-y-4 rounded-[1.75rem] border border-primary/10 bg-[linear-gradient(145deg,hsl(var(--background)),hsl(var(--secondary)/0.4))] p-5 shadow-[0_24px_90px_-60px_hsl(var(--primary)/0.55)]'
        : variant === 'minimal'
          ? 'space-y-3'
          : 'space-y-4';

  const primaryShellClass =
    isNovaMobile
      ? 'space-y-4'
      : variant === 'seamless'
        ? 'rounded-[1.75rem] border border-border/40 bg-background/40 p-6 backdrop-blur-sm'
        : variant === 'couture-minimal'
          ? 'space-y-3'
        : variant === 'minimal'
          ? 'space-y-3'
          : variant === 'editorial'
            ? 'rounded-[1.6rem] border border-border/70 bg-background/75 p-5'
            : 'rounded-[1.45rem] border border-border/70 bg-background/80 p-4';

  const headerClass =
    variant === 'minimal' || variant === 'seamless' || variant === 'couture-minimal'
      ? 'mb-3 flex flex-col gap-1'
      : 'mb-5 flex flex-col gap-2';

  const resolvedPrimaryGridClass =
    variant === 'minimal' || variant === 'seamless' || variant === 'couture-minimal'
      ? 'grid gap-2.5 sm:grid-cols-2'
      : variant === 'editorial' || blocks.visiblePrimaryBlocks.length > 2
        ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-2'
        : 'grid gap-3';

  const primaryUsesMultiColumnLayout =
    isNovaMobile ||
    (variant !== 'minimal' &&
      variant !== 'couture-minimal' &&
      (variant === 'editorial' || blocks.visiblePrimaryBlocks.length > 2));

  const leadStackClass =
    variant === 'minimal' || variant === 'seamless' ? 'space-y-3' : 'space-y-4';

  const isContentCentered =
    resolveSectionContentAlign(sectionSettings?.contentAlign) === 'center';

  const sectionTestId = standaloneBlockId
    ? `conversion-section-${sectionType}`
    : 'conversion-stack';

  const shouldRender = !(
    isLoading ||
    !product ||
    !conversionEnabled ||
    !renderInTemplates ||
    (blocks.visiblePrimaryBlocks.length === 0 &&
      !blocks.dominantUrgency &&
      blocks.secondaryProofBlocks.length === 0 &&
      !modules['bulkSavings'])
  );

  return {
    shouldRender,
    isLoading,
    product,
    conversionEnabled,
    renderInTemplates,
    standaloneBlockId,
    standaloneSectionNode: blocks.standaloneSectionNode,
    sectionTestId,
    variant,
    heading,
    subtitle,
    isContentCentered,
    headerClass,
    surfaceClass,
    leadStackClass,
    primaryShellClass,
    resolvedPrimaryGridClass,
    primaryUsesMultiColumnLayout,
    secondaryProofBlocks: blocks.secondaryProofBlocks,
    dominantUrgency: blocks.dominantUrgency,
    dominantUrgencyId,
    urgencyBlocks: blocks.urgencyBlocks,
    showConfidenceGrid,
    visiblePrimaryBlocks: blocks.visiblePrimaryBlocks,
    modules,
    prefersArabicCopy,
  };
};

export type ConversionStackController = ReturnType<typeof useConversionStackController>;
