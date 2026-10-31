import React from "react";
import TierProgressBanner from "../../components/TierProgressBanner";
import { formatStorefrontCurrency } from "../../utils/currency";

export interface OrderSummaryTotalsCardProps {
  subtotal: number;
  currency: string;
  subtotalLabel: string;
  shippingLabel: string;
  totalLabel: string;
  resolvedShippingValueText: string;
  resolvedShippingHelpText: string;
  shippingCost: number;
  checkoutFreeShippingActive: boolean;
  loyaltyFreeShipping: boolean;
  trimmedGovernorate?: string;
  isShippingLoading: boolean;
  loyaltyDiscount: number;
  loyaltyDiscountPercent: number;
  tiersEnabled: boolean;
  voucherDiscount: number;
  tierProgress: any;
  couponDiscount: number;
  activeCoupon: any;
  storePromotionDiscount: number;
  storePromotionTier: any;
  walletDiscount: number;
  walletDiscountPercent: number;
  walletDiscountEnabled: boolean;
  walletPaymentSettings: any;
  estimatedTotal: number;
  isCommandSummary: boolean;
  isKhemetLuxe: boolean;
  isBoutiqueSummary: boolean;
  isMarketSummary: boolean;
  hasNatureSummaryTone: boolean;
  isWomenFashionSummary: boolean;
  isFittingRoomSummary: boolean;
  isSproutRoom: boolean;
}

export const OrderSummaryTotalsCard: React.FC<OrderSummaryTotalsCardProps> = ({
  subtotal,
  currency,
  subtotalLabel,
  shippingLabel,
  totalLabel,
  resolvedShippingValueText,
  resolvedShippingHelpText,
  shippingCost,
  checkoutFreeShippingActive,
  loyaltyFreeShipping,
  trimmedGovernorate,
  isShippingLoading,
  loyaltyDiscount,
  loyaltyDiscountPercent,
  tiersEnabled,
  voucherDiscount,
  tierProgress,
  couponDiscount,
  activeCoupon,
  storePromotionDiscount,
  storePromotionTier,
  walletDiscount,
  walletDiscountPercent,
  walletDiscountEnabled,
  walletPaymentSettings,
  estimatedTotal,
  isCommandSummary,
  isKhemetLuxe,
  isBoutiqueSummary,
  isMarketSummary,
  hasNatureSummaryTone,
  isWomenFashionSummary,
  isFittingRoomSummary,
  isSproutRoom,
}) => {
  const totalsCardClassName = isWomenFashionSummary
    ? "space-y-2.5 rounded-[1.25rem] border border-[#ead8cf] bg-white/95 p-3.5 shadow-[0_16px_44px_-40px_rgba(107,33,49,0.1)]"
    : isFittingRoomSummary
      ? "space-y-3 border-t border-[#f0ebe6] pt-4 text-sm"
      : isKhemetLuxe
        ? "space-y-3 rounded-[0.95rem] border border-[#e7ddd0] bg-transparent p-0 shadow-none"
        : isCommandSummary
          ? "space-y-3 rounded-[1.5rem] border border-[#ead8b1] bg-white/94 p-4 shadow-[0_18px_50px_-42px_rgba(90,62,24,0.16)]"
          : isBoutiqueSummary
            ? "space-y-3 rounded-[1.5rem] border border-[#ead8cf] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(107,33,49,0.12)]"
            : isMarketSummary
              ? "space-y-3 rounded-[1.5rem] border border-[#f0d4b0] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(154,93,34,0.12)]"
              : isSproutRoom
                ? "space-y-3 border border-[#d8e6d8] bg-white p-4 text-sm"
                : hasNatureSummaryTone
                  ? "space-y-3 rounded-[1.5rem] border border-[#dbe3d4] bg-white/95 p-4 shadow-[0_18px_50px_-42px_rgba(26,51,40,0.12)]"
                  : "space-y-3 text-sm";

  const shippingHelpClassName = isWomenFashionSummary
    ? "text-[11px] leading-5 text-muted-foreground"
    : isFittingRoomSummary
      ? "text-[11px] leading-5 text-[#a69f98]"
      : isKhemetLuxe
        ? "text-xs leading-5 text-[#7b6d58]"
        : "text-xs text-muted-foreground";

  return (
    <>
      <div className="mb-3">
        <TierProgressBanner />
      </div>
      <div className={totalsCardClassName}>
        <div className="flex justify-between text-foreground">
          <span className="text-[#6f6455]">{subtotalLabel}</span>
          <span className="tabular-nums font-mono">
            {formatStorefrontCurrency(subtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between text-foreground">
          <span className="text-[#6f6455]">{shippingLabel}</span>
          <span
            className={
              (checkoutFreeShippingActive || loyaltyFreeShipping) &&
              trimmedGovernorate &&
              !isShippingLoading
                ? "text-emerald-600 font-mono tabular-nums"
                : "text-[#6f6455] font-mono tabular-nums"
            }
          >
            {loyaltyFreeShipping && Number(shippingCost) > 0
              ? "مجاني (مستوى الولاء)"
              : resolvedShippingValueText}
          </span>
        </div>
        {loyaltyDiscount > 0 ? (
          <div className="flex justify-between text-foreground">
            <span className="text-[#6f6455]">
              {tiersEnabled ? "خصم مستوى " : ""}
              <span className="tabular-nums">{loyaltyDiscountPercent}</span>%
            </span>
            <span className="text-emerald-600 font-mono tabular-nums">
              -{formatStorefrontCurrency(loyaltyDiscount, currency)}
            </span>
          </div>
        ) : null}
        {voucherDiscount > 0 ? (
          <div className="flex justify-between text-foreground">
            <span className="text-[#6f6455]">
              خصم الكوبون ({tierProgress?.activeVoucher?.percent}%)
            </span>
            <span className="text-emerald-600 font-mono tabular-nums">
              -{formatStorefrontCurrency(voucherDiscount, currency)}
            </span>
          </div>
        ) : null}
        {couponDiscount > 0 ? (
          <div className="flex justify-between text-foreground">
            <span className="text-[#6f6455]">
              {activeCoupon?.name || activeCoupon?.code || "كوبون"}
            </span>
            <span className="text-emerald-600 font-mono tabular-nums">
              -{formatStorefrontCurrency(couponDiscount, currency)}
            </span>
          </div>
        ) : null}
        {storePromotionDiscount > 0 ? (
          <div className="flex justify-between text-foreground">
            <span className="text-[#6f6455]">
              {storePromotionTier?.label || "عرض الكمية"}
            </span>
            <span className="text-emerald-600 font-mono tabular-nums">
              -{formatStorefrontCurrency(storePromotionDiscount, currency)}
            </span>
          </div>
        ) : null}
        {walletDiscount > 0 &&
        walletPaymentSettings?.showDiscountBadge !== false ? (
          <div className="flex justify-between text-foreground">
            <span className="inline-flex items-center gap-1.5 text-[#6f6455]">
              <span>🏷️</span>
              <span>
                خصم الدفع الإلكتروني ({walletDiscountPercent}%)
              </span>
            </span>
            <span className="text-emerald-600 font-mono tabular-nums">
              -{formatStorefrontCurrency(walletDiscount, currency)}
            </span>
          </div>
        ) : walletDiscount === 0 &&
          walletDiscountEnabled &&
          walletDiscountPercent > 0 &&
          walletPaymentSettings?.showDiscountBadge !== false &&
          (Number(subtotal) || 0) > 0 ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50/80 px-2.5 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40">
            <span className="flex items-center gap-1 font-medium">
              <span>🎁</span>
              <span>
                خصم {walletDiscountPercent}% بالدفع الإلكتروني
              </span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              وفر{" "}
              {formatStorefrontCurrency(
                ((Number(subtotal) || 0) * walletDiscountPercent) / 100,
                currency,
              )}
            </span>
          </div>
        ) : null}
        <div
          className={`flex justify-between border-t pt-3 text-[1.05rem] font-bold text-foreground ${
            isCommandSummary
              ? "border-[#ead8b1]"
              : isKhemetLuxe
                ? "border-[#d9c8ad]"
                : isBoutiqueSummary
                  ? "border-[#ead8cf]"
                  : isMarketSummary
                    ? "border-[#f0d4b0]"
                    : hasNatureSummaryTone
                      ? "border-[#dbe3d4]"
                      : "border-border"
          }`}
        >
          <span>{totalLabel}</span>
          <span
            className={`font-mono tabular-nums ${
              isCommandSummary
                ? "text-[#6d5527]"
                : isKhemetLuxe
                  ? "text-[#725523]"
                  : isBoutiqueSummary
                    ? "text-[#8b5f59]"
                    : isMarketSummary
                      ? "text-[#8b6037]"
                      : hasNatureSummaryTone
                        ? "text-[#4a6843]"
                        : ""
            }`}
          >
            {formatStorefrontCurrency(estimatedTotal, currency)}
          </span>
        </div>
      </div>

      <p className={shippingHelpClassName}>{resolvedShippingHelpText}</p>
    </>
  );
};

export default OrderSummaryTotalsCard;
