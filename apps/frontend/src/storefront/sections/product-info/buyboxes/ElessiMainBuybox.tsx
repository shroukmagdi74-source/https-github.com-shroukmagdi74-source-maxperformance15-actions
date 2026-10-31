import React from 'react';
import type { ProductInfoController } from '../productInfoTypes';
import { ElessiMainStickyMobile } from './ElessiMainStickyMobile';
import { ElessiMainLowerPanels } from './ElessiMainLowerPanels';
import {
  ElessiSocialProofTickerDisplay,
  ElessiSaleCountdownDisplay,
} from '../components/ElessiDynamicConversionWidgets';
import {
  STOREFRONT_REVIEWS_SECTION_ID,
  handleQuickScroll,
} from '../productInfoHelpers';
import { Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export interface ElessiMainBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiMainBuybox: React.FC<ElessiMainBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    commonHeader,
    commonPrice,
    commonVariantSelector,
    commonActions,
    shortDescription,
    descriptionPreviewText,
    currency,
    canOpenSizeGuide,
    sizeGuideDialog,
    shippingPolicyDialog,
    questionDialog,
    isLowStockNoticeEnabled,
    stockStatusLabel,
    stockLevelCount,
    isKhemetInlineQuickOrderBuybox,
    isRedlineAuto,
    mergedInlinePdpQuickOrder,
    inlineQuantityOffers,
    isPrimaryQuantityOffersDecision,
  } = ctrl;

  if (!product) return null;

  const isKhemetLuxeTheme = true;
  const commonRatingValue =
    typeof product.rating === 'number'
      ? product.rating
      : typeof product.reviewSummary?.averageRating === 'number'
        ? product.reviewSummary.averageRating
        : null;
  const commonReviewCount = product.reviewCount || product.reviewsCount || 0;

  const elessiRatingSummary = commonRatingValue ? (
    <button
      type="button"
      onClick={() => handleQuickScroll(STOREFRONT_REVIEWS_SECTION_ID, 'start')}
      className="inline-flex items-center gap-2 rounded-full border border-[#e7d8c8] bg-[#fffdfb] px-3 py-1.5 text-sm text-[#6f5a54] shadow-[0_1px_0_rgba(45,33,30,0.02)] transition-colors hover:border-[#d3b8a9] hover:text-[#2d211e]"
    >
      <span className="text-[#d49011] tracking-tight">★★★★★</span>
      <span className="font-black text-[#2d211e]">{commonRatingValue.toFixed(1)}</span>
      <span className="text-muted-foreground">
        {prefersArabicCopy
          ? `(${commonReviewCount} تقييم)`
          : `(${commonReviewCount} reviews)`}
      </span>
    </button>
  ) : null;

  return (
    <>
      {canOpenSizeGuide ? sizeGuideDialog : null}
      {shippingPolicyDialog}
      {questionDialog}
      <ElessiMainStickyMobile ctrl={ctrl} />

      <section className="w-full overflow-hidden px-3 sm:px-5 py-1.5 sm:py-4">
        <div className={isKhemetLuxeTheme ? 'space-y-2.5 sm:space-y-4' : 'space-y-3.5 sm:space-y-5'}>
          <div className="space-y-2.5 sm:space-y-3 border-b border-[#ead8ca] pb-3 sm:pb-4">
            {commonHeader}
            {commonPrice}
          </div>

          {elessiRatingSummary ? (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 border-b border-[#ead8ca] pb-2.5 sm:pb-4">
              {elessiRatingSummary}
            </div>
          ) : null}

          <div className="space-y-2.5 sm:space-y-4">
            {!isKhemetInlineQuickOrderBuybox ? (
              <ElessiSocialProofTickerDisplay
                productId={product.id}
                prefersArabicCopy={prefersArabicCopy}
                recentOrderCount={ctrl.recentSalesCount}
                activeCartPressure={ctrl.currentViewerCount}
                soldCounterEnabled={ctrl.isSoldCounterEnabled}
                purchaseFomoEnabled={ctrl.isPurchaseFomoEnabled}
              />
            ) : null}

            {isLowStockNoticeEnabled && stockLevelCount > 0 ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-[#b4534b]">
                <span>{stockStatusLabel}</span>
              </div>
            ) : null}

            {!isKhemetInlineQuickOrderBuybox && !isRedlineAuto ? (
              <p className="text-sm leading-7 text-[#6f5a54]">
                {shortDescription || descriptionPreviewText}
              </p>
            ) : null}

            {ctrl.saleCountdown ? (
              <ElessiSaleCountdownDisplay
                targetTimestamp={Date.now() + 86400000}
                prefersArabicCopy={prefersArabicCopy}
                currency={currency}
              />
            ) : null}
          </div>

          <div
            className={`space-y-4 pb-5 border-b ${
              isRedlineAuto ? 'border-slate-200 dark:border-slate-800' : 'border-[#ead8ca]'
            }`}
          >
            {!isPrimaryQuantityOffersDecision && commonVariantSelector ? (
              <div>{commonVariantSelector}</div>
            ) : null}

            {inlineQuantityOffers ? (
              <div
                className={
                  !isPrimaryQuantityOffersDecision && product.productVariants?.length
                    ? `pt-3 sm:pt-4 border-t ${
                        isRedlineAuto
                          ? 'border-slate-200 dark:border-slate-800'
                          : 'border-[#efe0d4]'
                      }`
                    : ''
                }
              >
                {inlineQuantityOffers}
              </div>
            ) : null}

            <div
              className={`pt-3 sm:pt-4 border-t ${
                isRedlineAuto ? 'border-slate-200 dark:border-slate-800' : 'border-[#efe0d4]'
              }`}
            >
              {!isKhemetInlineQuickOrderBuybox || !mergedInlinePdpQuickOrder ? commonActions : null}
              {mergedInlinePdpQuickOrder ? (
                <div className="pt-3 sm:pt-4">
                  {mergedInlinePdpQuickOrder}
                </div>
              ) : null}

              <div
                className={`mt-3.5 flex flex-wrap items-center justify-around gap-2 rounded-xl border px-3 py-2.5 text-[11px] font-bold sm:text-xs ${
                  isRedlineAuto
                    ? 'border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                    : 'border-[#ead8ca]/70 bg-[#fffdfa] text-[#6f5a54]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Truck className={`h-3.5 w-3.5 ${isRedlineAuto ? 'text-red-600' : 'text-[#8f5c44]'}`} />
                  <span>{prefersArabicCopy ? 'شحن 48 ساعة' : '48h Shipping'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className={`h-3.5 w-3.5 ${isRedlineAuto ? 'text-red-600' : 'text-[#8f5c44]'}`} />
                  <span>{prefersArabicCopy ? 'معاينة وقياس مع المندوب' : 'Inspect before paying'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className={`h-3.5 w-3.5 ${isRedlineAuto ? 'text-red-600' : 'text-[#8f5c44]'}`} />
                  <span>{prefersArabicCopy ? 'استبدال 14 يوم' : '14-Day Exchange'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ElessiMainLowerPanels ctrl={ctrl} />
    </>
  );
};
