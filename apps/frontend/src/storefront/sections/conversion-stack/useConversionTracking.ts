import { useEffect } from 'react';
import { trackStorefrontAppUsage } from '../../utils/appUsageTracking';
import type { UrgencyBlockId } from './types';

interface TrackingParams {
  isLoading: boolean;
  productId: string | undefined;
  conversionEnabled: boolean;
  renderInTemplates: boolean;
  sectionType: string;
  standaloneBlockId: string | null;
  variant: string;
  showCountdown: boolean;
  countdownStyle: string;
  showLowStock: boolean;
  lowStockStyle: string;
  showEstimatedDelivery: boolean;
  estimatedDeliveryStyle: string;
  showPreOrder: boolean;
  showBackInStock: boolean;
  backInStockStyle: string;
  showFakeVisitor: boolean;
  fakeVisitorStyle: string;
  showTrustedBadges: boolean;
  showSoldCounter: boolean;
  soldCounterStyle: string;
  showPurchaseFomo: boolean;
  purchaseFomoStyle: string;
  purchaseFomoSource: string | null;
  showPulseRow: boolean;
  showUrgencyTicker: boolean;
  showConfidenceGrid: boolean;
  dominantUrgencyId: UrgencyBlockId | null;
}

export const useConversionTracking = ({
  isLoading,
  productId,
  conversionEnabled,
  renderInTemplates,
  sectionType,
  standaloneBlockId,
  variant,
  showCountdown,
  countdownStyle,
  showLowStock,
  lowStockStyle,
  showEstimatedDelivery,
  estimatedDeliveryStyle,
  showPreOrder,
  showBackInStock,
  backInStockStyle,
  showFakeVisitor,
  fakeVisitorStyle,
  showTrustedBadges,
  showSoldCounter,
  soldCounterStyle,
  showPurchaseFomo,
  purchaseFomoStyle,
  purchaseFomoSource,
  showPulseRow,
  showUrgencyTicker,
  showConfidenceGrid,
  dominantUrgencyId,
}: TrackingParams) => {
  useEffect(() => {
    if (isLoading || !productId || !conversionEnabled || !renderInTemplates) {
      return;
    }

    void trackStorefrontAppUsage({
      slug: 'conversion-suite',
      feature: 'conversion_stack_view',
      dedupeKey: `conversion-stack:${sectionType}:${productId}:${variant}`,
      metadata: {
        productId,
        sectionType,
        standaloneBlock: standaloneBlockId || 'stack',
        variant,
        countdown: Boolean(showCountdown),
        countdownStyle,
        lowStock: Boolean(showLowStock),
        delivery: Boolean(showEstimatedDelivery),
        preOrder: Boolean(showPreOrder),
        backInStock: Boolean(showBackInStock),
        backInStockStyle,
        fakeVisitor: Boolean(showFakeVisitor),
        fakeVisitorStyle,
        trustedBadges: Boolean(showTrustedBadges),
        soldCounter: Boolean(showSoldCounter),
        soldCounterStyle,
        lowStockStyle,
        estimatedDeliveryStyle,
        purchaseFomo: Boolean(showPurchaseFomo),
        purchaseFomoStyle,
        purchaseFomoSource: purchaseFomoSource || 'none',
        pulseRow: Boolean(showPulseRow),
        urgencyTicker: Boolean(showUrgencyTicker),
        confidenceGrid: Boolean(showConfidenceGrid),
        dominantUrgency: dominantUrgencyId || 'none',
      },
    });
  }, [
    conversionEnabled,
    dominantUrgencyId,
    isLoading,
    productId,
    renderInTemplates,
    showCountdown,
    showBackInStock,
    backInStockStyle,
    countdownStyle,
    estimatedDeliveryStyle,
    fakeVisitorStyle,
    lowStockStyle,
    showEstimatedDelivery,
    showFakeVisitor,
    showLowStock,
    showPreOrder,
    showPurchaseFomo,
    purchaseFomoStyle,
    showPulseRow,
    showUrgencyTicker,
    showConfidenceGrid,
    showSoldCounter,
    soldCounterStyle,
    showTrustedBadges,
    purchaseFomoSource,
    sectionType,
    standaloneBlockId,
    variant,
  ]);
};
