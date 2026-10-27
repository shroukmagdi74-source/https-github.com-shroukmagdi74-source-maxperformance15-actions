import React, { useState } from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useCartStore } from '../../store/useCartStore';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { storefrontApi } from '../../../utils/storefrontApi';
import { formatStorefrontCurrency } from '../../utils/currency';

export interface CouponElementSettings extends ElementTypographySettings {
  placeholder?: string;
  buttonLabel?: string;
  appliedLabel?: string;
  removeLabel?: string;
  className?: string;
}

export interface CouponElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: CouponElementSettings;
    [key: string]: unknown;
  };
  settings?: CouponElementSettings;
  companyId?: string;
}

const CouponElement: React.FC<CouponElementProps> = ({
  section,
  settings: directSettings,
  companyId: propCompanyId,
}) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const typographyRef = useElementTypographyRef(mergedSettings);
  const typographyStyle = buildElementTypographyStyle(mergedSettings);

  const { items, getSubtotal } = useCartStore();
  const { appliedCoupon, setAppliedCoupon, clearAppliedCoupon } = useCheckoutStore();
  const { settings: storefrontSettings } = useStorefrontSettings();

  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Strict Rule: Hide coupon element entirely when cart is empty (0 buttons in empty cart)
  if (!items || items.length === 0) {
    return null;
  }

  const storefrontConfig = storefrontSettings?.storefront?.settings as Record<string, unknown> | undefined;
  const companyId =
    propCompanyId ||
    storefrontSettings?.company?.id ||
    (storefrontConfig?.['companyId'] ? String(storefrontConfig['companyId']) : '');

  const currency =
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    'EGP';

  const placeholder = mergedSettings?.placeholder || 'أدخل كود الخصم';
  const buttonLabel = mergedSettings?.buttonLabel || 'تطبيق';
  const removeLabel = mergedSettings?.removeLabel || 'إزالة';

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim();
    if (!cleanCode) return;

    setIsLoading(true);
    setErrorMessage(null);

    const subtotal = getSubtotal();
    const targetCompanyId = String(companyId || '');

    try {
      if (storefrontApi?.validateCoupon && targetCompanyId) {
        const response = await storefrontApi.validateCoupon(targetCompanyId, cleanCode, subtotal);
        const couponData = response?.data?.coupon || response?.data || response;
        const discountAmount = Number(couponData?.discountAmount || couponData?.discount || 0);

        setAppliedCoupon({
          code: cleanCode.toUpperCase(),
          name: couponData?.name || cleanCode,
          discountAmount,
          orderAmount: subtotal,
          finalAmount: Math.max(0, subtotal - discountAmount),
        });
        setInputCode('');
      } else {
        // Fallback or preview mode
        setAppliedCoupon({
          code: cleanCode.toUpperCase(),
          discountAmount: 0,
          orderAmount: subtotal,
        });
        setInputCode('');
      }
    } catch (err: unknown) {
      const errCandidate = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMessage(
        errCandidate?.response?.data?.error || errCandidate?.message || 'كود الخصم غير صالح أو منتهي الصلاحية',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearAppliedCoupon();
    setErrorMessage(null);
  };

  return (
    <div
      ref={typographyRef}
      style={typographyStyle}
      data-testid="coupon-element"
      className={`w-full ${mergedSettings?.className || ''}`}
    >
      {appliedCoupon ? (
        <div
          data-testid="applied-coupon-card"
          className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600"
              aria-hidden="true"
            >
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
            <div>
              <span data-testid="applied-coupon-code" className="font-mono font-bold text-sm tracking-wider">
                {appliedCoupon.code}
              </span>
              {appliedCoupon.discountAmount > 0 && (
                <span className="mr-2 text-xs font-semibold text-emerald-600">
                  (خصم {formatStorefrontCurrency(appliedCoupon.discountAmount, currency)})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            data-testid="remove-coupon-button"
            onClick={handleRemoveCoupon}
            className="text-xs font-bold text-destructive hover:underline p-1 cursor-pointer transition-transform active:scale-95"
            aria-label="إزالة كود الخصم"
          >
            {removeLabel}
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              data-testid="coupon-input"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={placeholder}
              aria-label="كود الخصم"
              disabled={isLoading}
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none uppercase"
            />
            <button
              type="submit"
              data-testid="apply-coupon-button"
              disabled={isLoading || !inputCode.trim()}
              className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {isLoading ? '...' : buttonLabel}
            </button>
          </div>

          {errorMessage && (
            <p data-testid="coupon-error-message" className="text-xs font-medium text-destructive px-1">
              {errorMessage}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default CouponElement;
