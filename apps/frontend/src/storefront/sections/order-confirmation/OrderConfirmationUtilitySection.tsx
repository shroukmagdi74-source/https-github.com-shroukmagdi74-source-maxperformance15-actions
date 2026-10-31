import React from 'react';
import Button from '../../components/Button';
import { formatStorefrontCurrency } from '../../utils/currency';
import {
  getOrderStatusClassName,
  getOrderStatusText,
  getPaymentMethodText,
  type PcHubStatusExperience,
  type TrackedOrderSummary,
} from './types';

interface OrderConfirmationUtilitySectionProps {
  showTrackOrder: boolean;
  showReorder: boolean;
  utilityCardClassName: string;
  accentOverlineClassName: string;
  prefersArabicCopy: boolean;
  trackOrderTitle: string;
  trackOrderDescription: string;
  handleTrackOrderSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  trackOrderPhoneLabel: string;
  trackPhone: string;
  setTrackPhone: (phone: string) => void;
  trackOrderPhonePlaceholder: string;
  trackInputClassName: string;
  subtleButtonClassName: string;
  resolvedOrderReference: string;
  trackOrderLoading: boolean;
  trackOrderButtonText: string;
  trackOrderError: string;
  errorMessageClassName: string;
  effectiveTrackedOrder: TrackedOrderSummary | null;
  nestedPanelClassName: string;
  isPcHub: boolean;
  pcHubStatusExperience: PcHubStatusExperience | null;
  nestedCardClassName: string;
  currency: string;
  purchaseTotal: number;
  purchaseItemsCount: number;
  trackedOrderLocation: string;
  isRoseBoutique: boolean;
  reorderTitle: string;
  reorderDescription: string;
  reorderableItemsCount: number;
  reorderQuantity: number;
  reorderButtonClassName: string;
  handleReorder: () => void;
  reorderButtonText: string;
  reorderMessage: string;
  successMessageClassName: string;
  reorderError: string;
}

export const OrderConfirmationUtilitySection: React.FC<OrderConfirmationUtilitySectionProps> = ({
  showTrackOrder,
  showReorder,
  utilityCardClassName,
  accentOverlineClassName,
  prefersArabicCopy,
  trackOrderTitle,
  trackOrderDescription,
  handleTrackOrderSubmit,
  trackOrderPhoneLabel,
  trackPhone,
  setTrackPhone,
  trackOrderPhonePlaceholder,
  trackInputClassName,
  subtleButtonClassName,
  resolvedOrderReference,
  trackOrderLoading,
  trackOrderButtonText,
  trackOrderError,
  errorMessageClassName,
  effectiveTrackedOrder,
  nestedPanelClassName,
  isPcHub,
  pcHubStatusExperience,
  nestedCardClassName,
  currency,
  purchaseTotal,
  purchaseItemsCount,
  trackedOrderLocation,
  isRoseBoutique,
  reorderTitle,
  reorderDescription,
  reorderableItemsCount,
  reorderQuantity,
  reorderButtonClassName,
  handleReorder,
  reorderButtonText,
  reorderMessage,
  successMessageClassName,
  reorderError,
}) => {
  if (!showTrackOrder && !showReorder) return null;

  return (
    <div className="grid gap-6 border-t border-border/40 pt-10 text-start lg:grid-cols-[1.1fr_0.9fr]">
      {showTrackOrder ? (
        <div className={utilityCardClassName}>
          <div className="space-y-2">
            <p className={`text-xs font-black uppercase tracking-[0.22em] ${accentOverlineClassName}`}>
              {prefersArabicCopy ? 'تحديثات الطلب' : 'Order updates'}
            </p>
            <h2 className="font-heading text-2xl font-black tracking-tight text-foreground">
              {trackOrderTitle}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">{trackOrderDescription}</p>
          </div>

          <form className="space-y-3" onSubmit={handleTrackOrderSubmit}>
            <label
              htmlFor="thank-you-track-phone"
              className="block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {trackOrderPhoneLabel}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="thank-you-track-phone"
                type="tel"
                value={trackPhone}
                onChange={(event) => setTrackPhone(event.target.value)}
                placeholder={trackOrderPhonePlaceholder}
                className={trackInputClassName}
              />
              <Button
                type="submit"
                variant="secondary"
                className={subtleButtonClassName}
                disabled={!resolvedOrderReference || trackOrderLoading}
              >
                {trackOrderLoading
                  ? prefersArabicCopy
                    ? 'جارٍ التحقق...'
                    : 'Checking...'
                  : trackOrderButtonText}
              </Button>
            </div>
          </form>

          {trackOrderError ? (
            <div className={errorMessageClassName}>{trackOrderError}</div>
          ) : null}

          {effectiveTrackedOrder ? (
            <div className={nestedPanelClassName}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className={`text-xs font-black uppercase tracking-[0.18em] ${accentOverlineClassName}`}>
                    {prefersArabicCopy ? 'آخر حالة' : 'Latest status'}
                  </div>
                  <div className="mt-1 font-mono text-lg font-black text-foreground tabular-nums">
                    #{effectiveTrackedOrder.orderNumber}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getOrderStatusClassName(
                    effectiveTrackedOrder.status,
                  )}`}
                >
                  {getOrderStatusText(effectiveTrackedOrder.status, undefined, prefersArabicCopy)}
                </span>
              </div>

              {isPcHub && pcHubStatusExperience ? (
                <div className={`${nestedCardClassName} space-y-2`}>
                  <div className={`text-xs font-black uppercase tracking-[0.18em] ${accentOverlineClassName}`}>
                    {pcHubStatusExperience.spotlightEyebrow}
                  </div>
                  <h3 className="text-sm font-black text-foreground">
                    {pcHubStatusExperience.spotlightTitle}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {pcHubStatusExperience.spotlightDescription}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className={nestedCardClassName}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {prefersArabicCopy ? 'طريقة الدفع' : 'Payment'}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-foreground">
                    {getPaymentMethodText(effectiveTrackedOrder.paymentMethod, prefersArabicCopy)}
                  </div>
                </div>
                {effectiveTrackedOrder.storePromotionDiscount ? (
                  <div className={nestedCardClassName}>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {effectiveTrackedOrder.storePromotionLabel || (prefersArabicCopy ? 'خصم الكمية' : 'Qty discount')}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-green-600 tabular-nums">
                      -{formatStorefrontCurrency(effectiveTrackedOrder.storePromotionDiscount, currency)}
                    </div>
                  </div>
                ) : null}
                <div className={nestedCardClassName}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {prefersArabicCopy ? 'إجمالي الطلب' : 'Order total'}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-foreground tabular-nums">
                    {formatStorefrontCurrency(
                      Number(effectiveTrackedOrder.finalTotal || effectiveTrackedOrder.total || purchaseTotal),
                      currency,
                    )}
                  </div>
                </div>
                <div className={nestedCardClassName}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {prefersArabicCopy ? 'عدد الأصناف' : 'Items'}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-foreground tabular-nums">
                    {Number(effectiveTrackedOrder.items?.length || purchaseItemsCount || 0)}
                  </div>
                </div>
              </div>

              {trackedOrderLocation ? (
                <div className={nestedCardClassName}>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {prefersArabicCopy ? 'عنوان التوصيل' : 'Shipping destination'}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-foreground">
                    {trackedOrderLocation}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {showReorder ? (
        <div className={utilityCardClassName}>
          <div className="space-y-2">
            <p className={`text-xs font-black uppercase tracking-[0.22em] ${accentOverlineClassName}`}>
              {isRoseBoutique
                ? (prefersArabicCopy ? 'إعادة التنسيق' : 'Rebuild the look')
                : (prefersArabicCopy ? 'إعادة الطلب' : 'Reorder flow')}
            </p>
            <h2 className="font-heading text-2xl font-black tracking-tight text-foreground">
              {reorderTitle}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {reorderDescription}
            </p>
          </div>

          <div className={nestedPanelClassName}>
            <div className={`flex items-center justify-between gap-3 ${nestedCardClassName}`}>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {prefersArabicCopy ? 'أصناف جاهزة' : 'Ready items'}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {prefersArabicCopy
                    ? 'الأصناف التي يمكن إعادتها إلى السلة فورًا.'
                    : 'Products that can go back to cart instantly.'}
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tabular-nums">
                {reorderableItemsCount}
              </div>
            </div>

            <div className={`flex items-center justify-between gap-3 ${nestedCardClassName}`}>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {prefersArabicCopy ? 'إجمالي الكمية' : 'Total quantity'}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {prefersArabicCopy
                    ? 'الكمية التي ستعود إلى السلة في الخطوة التالية.'
                    : 'Quantity that will be added in the next step.'}
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tabular-nums">
                {reorderQuantity}
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className={reorderButtonClassName}
            onClick={handleReorder}
            disabled={!reorderableItemsCount}
          >
            {reorderButtonText}
          </Button>

          {reorderMessage ? (
            <div className={successMessageClassName}>{reorderMessage}</div>
          ) : null}

          {reorderError ? (
            <div className={errorMessageClassName}>{reorderError}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default OrderConfirmationUtilitySection;
