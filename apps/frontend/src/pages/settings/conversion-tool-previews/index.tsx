import React, { useMemo } from "react";
import type { ConversionToolPreviewContext } from "./types";
import { LightPreviewScope } from "./ConversionToolPreviewProvider";
import {
  SaleCountdownPreview,
  LowStockPreview,
  SoldCounterPreview,
  PurchaseFomoPreview,
  DeliveryPreview,
  FakeVisitorPreview,
  PreOrderPreview,
} from "./BlockPreviews";
import {
  TrustedBadgesPreview,
  BackInStockPreview,
} from "./ComponentPreviews";
import {
  StickyAddToCartPreview,
  CrossSellPreview,
  BoughtTogetherPreview,
  BulkSavingsPreview,
  BuyMoreSaveMorePreview,
  FreeShippingBarPreview,
} from "./CommercePreviews";
import {
  ExitIntentPopupPreview,
  FakeSalePopupPreview,
  ExternalAffiliatePreview,
  PhotoReviewsPreview,
  VideoReviewsPreview,
  VerifiedBadgePreview,
} from "./PopupReviewPreviews";
import {
  InactiveTabDemo,
  ProductWishlistPreview,
  ProductComparisonPreview,
} from "./InteractivePreviews";

export * from "./types";
export * from "./ConversionToolPreviewProvider";
export * from "./BlockPreviews";
export * from "./ComponentPreviews";
export * from "./CommercePreviews";
export * from "./PopupReviewPreviews";
export * from "./InteractivePreviews";

export type ToolPreviewRenderer = (context: ConversionToolPreviewContext) => React.ReactNode;

export const CONVERSION_TOOL_PREVIEWS: Record<string, ToolPreviewRenderer> = {
  saleCountdown: () => <SaleCountdownPreview />,
  lowStockNotice: () => <LowStockPreview />,
  soldCounter: () => <SoldCounterPreview />,
  purchaseFomo: () => <PurchaseFomoPreview />,
  estimatedDelivery: () => <DeliveryPreview />,
  fakeVisitorCounter: () => <FakeVisitorPreview />,
  preOrder: () => <PreOrderPreview />,
  trustedBadges: () => <TrustedBadgesPreview />,
  backInStock: () => <BackInStockPreview />,
  productWishlist: () => <ProductWishlistPreview />,
  productComparison: () => <ProductComparisonPreview />,
  stickyAddToCart: () => <StickyAddToCartPreview />,
  crossSell: (context) => <CrossSellPreview settings={context.settings} />,
  boughtTogether: (context) => <BoughtTogetherPreview settings={context.settings} />,
  bulkSavings: () => <BulkSavingsPreview />,
  buyMoreSaveMore: () => <BuyMoreSaveMorePreview />,
  freeShippingBar: (context) => <FreeShippingBarPreview settings={context.settings} />,
  inactiveTab: () => <InactiveTabDemo />,
  exitIntentPopup: (context) => <ExitIntentPopupPreview settings={context.settings} />,
  fakeSalePopup: () => <FakeSalePopupPreview />,
  externalAffiliate: () => <ExternalAffiliatePreview />,
  photoReviews: () => <PhotoReviewsPreview />,
  videoReviews: () => <VideoReviewsPreview />,
  verifiedBadge: () => <VerifiedBadgePreview />,
};

export const renderConversionToolPreview = (
  toolKey: string,
  context: ConversionToolPreviewContext,
): React.ReactNode => {
  const renderer = CONVERSION_TOOL_PREVIEWS[toolKey];
  if (!renderer) {
    return null;
  }
  return (
    <LightPreviewScope className="rounded-xl p-1">
      {renderer(context)}
    </LightPreviewScope>
  );
};

/** نسخة مصغّرة لكارت الفهرس — نفس المعاينة داخل حاوية مصغرة ثابتة */
export const renderConversionToolMiniPreview = (toolKey: string): React.ReactNode => {
  const renderer = CONVERSION_TOOL_PREVIEWS[toolKey];
  if (!renderer) {
    return null;
  }

  return (
    <div className="pointer-events-none w-full select-none" aria-hidden="true">
      <LightPreviewScope className="rounded-xl p-2">
        {renderer({ settings: { thresholds: { freeShippingAmount: 750 } } })}
      </LightPreviewScope>
    </div>
  );
};

export const useConversionToolPreviewCount = () =>
  useMemo(() => Object.keys(CONVERSION_TOOL_PREVIEWS).length, []);
