import React from 'react';
import TierProgressBanner from '../../components/TierProgressBanner';
import { formatStorefrontCurrency } from '../../utils/currency';

interface PaymentSummaryCardProps {
  showSummaryCard: boolean;
  showCompactInlineSummary: boolean;
  summaryWrapperClassName: string;
  inlineSummaryClassName: string;
  summaryTitle: string;
  summaryDescription: string;
  subtotalLabel: string;
  subtotal: number;
  currency: string;
  shippingLabel: string;
  checkoutFreeShippingActive: boolean;
  loyaltyFreeShipping: boolean;
  trimmedGovernorate?: string;
  isShippingLoading: boolean;
  summaryShippingValueText: string;
  loyaltyDiscount: number;
  tiersEnabled: boolean;
  loyaltyDiscountPercent: number;
  voucherDiscount: number;
  tierProgress: any;
  couponDiscount: number;
  activeCoupon: any;
  walletDiscount: number;
  showWalletDiscountBadge: boolean;
  walletDiscountPercent: number;
  totalLabel: string;
  total: number;
  shippingMessage: string;
  requiresShippingSelection: boolean;
  governorateRequiredText: string;
  isEmailValid: boolean;
  invalidEmailText: string;
  formDataPhone?: string;
  isPhoneValid: boolean;
  invalidPhoneText: string;
  shippingPromptText: string;
  isBoutiquePayment: boolean;
  isMarketPayment: boolean;
  hasNaturePaymentTone: boolean;
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  showSummaryCard,
  showCompactInlineSummary,
  summaryWrapperClassName,
  inlineSummaryClassName,
  summaryTitle,
  summaryDescription,
  subtotalLabel,
  subtotal,
  currency,
  shippingLabel,
  checkoutFreeShippingActive,
  loyaltyFreeShipping,
  trimmedGovernorate,
  isShippingLoading,
  summaryShippingValueText,
  loyaltyDiscount,
  tiersEnabled,
  loyaltyDiscountPercent,
  voucherDiscount,
  tierProgress,
  couponDiscount,
  activeCoupon,
  walletDiscount,
  showWalletDiscountBadge,
  walletDiscountPercent,
  totalLabel,
  total,
  shippingMessage,
  requiresShippingSelection,
  governorateRequiredText,
  isEmailValid,
  invalidEmailText,
  formDataPhone,
  isPhoneValid,
  invalidPhoneText,
  shippingPromptText,
  isBoutiquePayment,
  isMarketPayment,
  hasNaturePaymentTone,
}) => {
  return (
    <>
      {showSummaryCard ? (
        <div className={summaryWrapperClassName}>
          <div className="mb-3">
            <TierProgressBanner />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {summaryTitle}
            </h3>
            <p className="text-sm text-muted-foreground">{summaryDescription}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{subtotalLabel}</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatStorefrontCurrency(subtotal, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{shippingLabel}</span>
            <span
              className={`font-medium ${
                (checkoutFreeShippingActive || loyaltyFreeShipping) &&
                trimmedGovernorate &&
                !isShippingLoading
                  ? 'text-emerald-600'
                  : 'text-foreground'
              }`}
            >
              {summaryShippingValueText}
            </span>
          </div>
          {loyaltyDiscount > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {tiersEnabled ? 'خصم مستوى ' : ''}
                <span className="tabular-nums">{loyaltyDiscountPercent}%</span>
              </span>
              <span className="font-medium text-emerald-600 tabular-nums">
                -{formatStorefrontCurrency(loyaltyDiscount, currency)}
              </span>
            </div>
          ) : null}
          {voucherDiscount > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                خصم الكوبون (<span className="tabular-nums">{tierProgress?.activeVoucher?.percent}%</span>)
              </span>
              <span className="font-medium text-emerald-600 tabular-nums">
                -{formatStorefrontCurrency(voucherDiscount, currency)}
              </span>
            </div>
          ) : null}
          {couponDiscount > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {activeCoupon?.name || activeCoupon?.code || 'كوبون'}
              </span>
              <span className="font-medium text-emerald-600 tabular-nums">
                -{formatStorefrontCurrency(couponDiscount, currency)}
              </span>
            </div>
          ) : null}
          {walletDiscount > 0 && showWalletDiscountBadge ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                خصم الدفع الإلكتروني (<span className="tabular-nums">{walletDiscountPercent}%</span>)
              </span>
              <span className="font-medium text-emerald-600 tabular-nums">
                -{formatStorefrontCurrency(walletDiscount, currency)}
              </span>
            </div>
          ) : null}
          <div
            className={`mt-2 flex justify-between border-t pt-4 text-lg font-bold ${
              isBoutiquePayment
                ? 'border-[#ead8cf]'
                : isMarketPayment
                  ? 'border-[#f0d4b0]'
                  : hasNaturePaymentTone
                    ? 'border-[#dbe3d4]'
                    : 'border-border'
            }`}
          >
            <span className="text-foreground">{totalLabel}</span>
            <span
              className={`tabular-nums ${
                isBoutiquePayment
                  ? 'text-[#8b5f59]'
                  : isMarketPayment
                    ? 'text-[#8b6037]'
                    : hasNaturePaymentTone
                      ? 'text-[#4a6843]'
                      : 'text-primary'
              }`}
            >
              {formatStorefrontCurrency(total, currency)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{shippingMessage}</p>
          {requiresShippingSelection ? (
            <p className="text-xs font-medium text-amber-600">{governorateRequiredText}</p>
          ) : null}
          {!isEmailValid ? (
            <p className="text-xs font-medium text-amber-600">{invalidEmailText}</p>
          ) : null}
          {!!formDataPhone && !isPhoneValid ? (
            <p className="text-xs font-medium text-amber-600">{invalidPhoneText}</p>
          ) : null}
        </div>
      ) : null}

      {showCompactInlineSummary ? (
        <div className={inlineSummaryClassName}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b5f59]">
                آخر مراجعة
              </p>
              <p className="text-sm text-[#72545b]">
                {trimmedGovernorate
                  ? `الشحن إلى ${trimmedGovernorate} ظاهر قبل التأكيد.`
                  : 'اختاري المحافظة لظهور الشحن قبل التأكيد.'}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[11px] text-muted-foreground">{totalLabel}</p>
              <p className="text-base font-black text-[#8b5f59] tabular-nums">
                {formatStorefrontCurrency(total, currency)}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-[0.95rem] border border-[#f1dfdc] bg-[#fffaf8] px-2 py-2">
              <p className="text-muted-foreground">{subtotalLabel}</p>
              <p className="mt-1 font-bold text-foreground tabular-nums">
                {formatStorefrontCurrency(subtotal, currency)}
              </p>
            </div>
            <div className="rounded-[0.95rem] border border-[#f1dfdc] bg-[#fffaf8] px-2 py-2">
              <p className="text-muted-foreground">{shippingLabel}</p>
              <p
                className={`mt-1 font-bold ${
                  checkoutFreeShippingActive && trimmedGovernorate && !isShippingLoading
                    ? 'text-emerald-600'
                    : 'text-foreground'
                }`}
              >
                {summaryShippingValueText}
              </p>
            </div>
            <div className="rounded-[0.95rem] border border-[#f1dfdc] bg-[#fffaf8] px-2 py-2">
              <p className="text-muted-foreground">الخصم</p>
              <p className="mt-1 font-bold text-foreground tabular-nums">
                {couponDiscount > 0
                  ? `-${formatStorefrontCurrency(couponDiscount, currency)}`
                  : walletDiscount > 0 && showWalletDiscountBadge
                    ? `-${formatStorefrontCurrency(walletDiscount, currency)}`
                    : 'لا يوجد'}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            {shippingMessage || shippingPromptText}
          </p>
        </div>
      ) : null}
    </>
  );
};

export default PaymentSummaryCard;
