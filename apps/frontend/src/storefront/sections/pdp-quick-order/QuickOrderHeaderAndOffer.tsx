import React from 'react';
import { formatStorefrontCurrency } from '../../utils/currency';
import type { PdpQuickOrderController } from './usePdpQuickOrderController';

export const QuickOrderHeaderAndOffer: React.FC<{
  ctrl: PdpQuickOrderController;
}> = ({ ctrl }) => {
  return (
    <div className={ctrl.isCompactMergedQuickOrder ? 'space-y-1.5' : 'space-y-2'}>
      {!ctrl.hideHeader && ctrl.configuredBadgeText && !ctrl.isMergedBuyboxSurface ? (
        <span className="inline-flex items-center rounded-full border border-[#ead9c7] bg-[#fff8f1] px-3 py-1 text-[11px] font-black tracking-[0.16em] text-[#b45309]">
          {ctrl.configuredBadgeText}
        </span>
      ) : null}
      {!ctrl.hideHeader && ctrl.title ? (
        <h2
          className={`font-heading font-black text-foreground ${
            ctrl.isCompactMergedQuickOrder
              ? 'text-[15px] sm:text-base'
              : ctrl.isMergedBuyboxSurface
                ? 'text-base sm:text-lg'
                : ctrl.isMenShoesQuickOrder
                  ? 'text-xl sm:text-[1.7rem]'
                  : 'text-2xl sm:text-[2rem]'
          }`}
        >
          {ctrl.title}
        </h2>
      ) : null}
      {!ctrl.hideHeader && ctrl.subtitle ? (
        <p
          className={
            ctrl.isCompactMergedQuickOrder
              ? 'text-[12px] leading-5 text-muted-foreground'
              : 'text-sm leading-7 text-muted-foreground'
          }
        >
          {ctrl.subtitle}
        </p>
      ) : null}
      {ctrl.showAttributeSummary ? (
        <p
          className={
            ctrl.isCompactMergedQuickOrder
              ? 'text-[12px] leading-5 text-muted-foreground'
              : 'text-sm leading-7 text-muted-foreground'
          }
        >
          {ctrl.attributeSummary}
        </p>
      ) : null}
      {ctrl.selectionHint ? (
        <div
          className={`border border-amber-200 bg-amber-50 font-medium text-amber-800 ${
            ctrl.isCompactMergedQuickOrder
              ? 'rounded-[0.95rem] px-3 py-2.5 text-[12px] leading-5'
              : 'rounded-[1rem] px-4 py-3 text-sm'
          }`}
        >
          {ctrl.selectionHint}
        </div>
      ) : null}
      {ctrl.shouldShowQuantityOfferSummary && ctrl.activeQuantityOffer ? (
        <div
          className={
            ctrl.isWomenFashionQuickOrder
              ? 'space-y-1.5 border-b border-[#eadcc7] pb-2.5'
              : ctrl.isSoleaFemmeQuickOrder
                ? 'space-y-2 border-b border-[#ead8cf] pb-3'
                : `rounded-[1rem] border border-[#eadcc7] bg-[#fff9f2] px-3 py-3 ${
                    ctrl.isMergedBuyboxSurface ? 'space-y-2' : 'space-y-2.5'
                  }`
          }
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-black text-[#8a4b14]">
              {ctrl.quantityOfferSummaryTitle}
            </span>
            <span
              className={`px-2.5 py-1 text-[11px] font-black text-[#8a4b14] ${
                ctrl.isWomenFashionQuickOrder
                  ? 'rounded-full border border-[#eadcc7] bg-transparent'
                  : ctrl.isSoleaFemmeQuickOrder
                    ? 'rounded-full border border-[#ead8cf] bg-[#fff6ee] text-[#6f5448]'
                    : 'rounded-full bg-white'
              }`}
            >
              {ctrl.prefersArabicCopy
                ? ctrl.activeQuantityOffer.offerQuantity === 1
                  ? 'قطعة واحدة'
                  : ctrl.activeQuantityOffer.offerQuantity === 2
                    ? 'قطعتان'
                    : `${ctrl.activeQuantityOffer.offerQuantity} قطع`
                : `${ctrl.activeQuantityOffer.offerQuantity} items`}
            </span>
            {ctrl.activeQuantityOffer.savings > 0 && !ctrl.isWomenFashionQuickOrder ? (
              <span
                className={`px-2.5 py-1 text-[11px] font-black text-emerald-700 ${
                  ctrl.isWomenFashionQuickOrder
                    ? 'rounded-full border border-emerald-200 bg-transparent'
                    : 'rounded-full bg-emerald-500/10'
                }`}
              >
                {ctrl.prefersArabicCopy
                  ? `وفر ${formatStorefrontCurrency(
                      ctrl.activeQuantityOffer.savings,
                      ctrl.currency,
                    )}`
                  : `Save ${formatStorefrontCurrency(
                      ctrl.activeQuantityOffer.savings,
                      ctrl.currency,
                    )}`}
              </span>
            ) : null}
          </div>
          <p className="text-sm font-semibold leading-6 text-foreground">
            {ctrl.activeQuantityOffer.offerLabel}
          </p>
          {ctrl.shouldShowQuantityOfferSummaryHelper ? (
            <p className="text-[12px] leading-5 text-muted-foreground">
              {ctrl.quantityOfferSummaryHelper}
            </p>
          ) : null}
        </div>
      ) : null}
      {ctrl.validationErrors.length > 0 ? (
        <div
          className={`rounded-[1rem] border border-red-200 bg-red-50 text-red-700 ${
            ctrl.isCompactMergedQuickOrder
              ? 'px-3.5 py-2.5 text-[13px]'
              : 'px-4 py-3 text-sm'
          }`}
        >
          <ul className="space-y-1">
            {ctrl.validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
