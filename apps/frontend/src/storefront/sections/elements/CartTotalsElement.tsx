import React from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useCartStore, type CartItem } from '../../store/useCartStore';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { useCheckoutShippingQuote } from '../../hooks/useCheckoutShippingQuote';
import { calculateCartTotals } from './cartElementHelpers';
import { formatStorefrontCurrency } from '../../utils/currency';

export interface CartTotalsElementSettings extends ElementTypographySettings {
  subtotalLabel?: string;
  shippingLabel?: string;
  discountLabel?: string;
  totalLabel?: string;
  shippingCost?: number;
  showSubtotal?: boolean;
  showShipping?: boolean;
  showDiscount?: boolean;
  emptyText?: string;
  className?: string;
}

export interface CartTotalsElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: CartTotalsElementSettings;
    [key: string]: unknown;
  };
  settings?: CartTotalsElementSettings;
  items?: CartItem[];
  shippingCost?: number | null;
  shipping?: number | null;
  discount?: number | null;
  currency?: string;
  subtotal?: number | null;
}

const CartTotalsElement: React.FC<CartTotalsElementProps> = ({
  section,
  settings: directSettings,
  items: directItems,
  shippingCost: propShippingCost,
  shipping: propShipping,
  discount: propDiscount,
  currency: propCurrency,
  subtotal: propSubtotal,
}) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const typographyRef = useElementTypographyRef(mergedSettings);
  const typographyStyle = buildElementTypographyStyle(mergedSettings);

  const { items: storeItems } = useCartStore();
  const { appliedCoupon } = useCheckoutStore();
  const { settings: storefrontSettings } = useStorefrontSettings();

  const items = directItems ?? storeItems;

  const { shippingCost: liveShippingQuote } = useCheckoutShippingQuote({
    shippingPromptText: '',
    shippingCalculatedText: '',
    noShippingChargeText: '',
    shippingErrorText: '',
    storefrontLoadingText: '',
  });

  const currency =
    propCurrency ||
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    'EGP';

  // 1. Empty state guard: Do not display a silent "0 EGP"
  if (!items || items.length === 0) {
    const emptyText =
      mergedSettings?.emptyText || 'سلة المشتريات فارغة - لا توجد مبالغ مستحقة';
    return (
      <div
        ref={typographyRef}
        style={typographyStyle}
        data-testid="cart-totals-empty"
        className={`w-full py-4 px-3.5 text-center rounded-xl border border-dashed border-border/70 text-xs text-muted-foreground ${mergedSettings?.className || ''}`}
      >
        <span data-testid="cart-totals-empty-message">{emptyText}</span>
      </div>
    );
  }

  // 2. Resolve Shipping
  const resolvedShipping =
    propShippingCost !== undefined && propShippingCost !== null
      ? Number(propShippingCost)
      : propShipping !== undefined && propShipping !== null
        ? Number(propShipping)
        : mergedSettings?.shippingCost !== undefined && mergedSettings?.shippingCost !== null
          ? Number(mergedSettings.shippingCost)
          : Number(liveShippingQuote) || 0;

  // 3. Resolve Discount
  const resolvedDiscount =
    propDiscount !== undefined && propDiscount !== null
      ? Number(propDiscount)
      : Number(appliedCoupon?.discountAmount) || 0;

  // 4. Calculate Totals using shared pure selector helper
  const calculation = calculateCartTotals({
    items,
    shippingCost: resolvedShipping,
    discountAmount: resolvedDiscount,
    currency,
  });

  // If propSubtotal was explicitly passed, override subtotal & re-derive total
  const finalSubtotal =
    propSubtotal !== undefined && propSubtotal !== null
      ? Number(propSubtotal)
      : calculation.subtotal;
  const finalTotal = Math.max(0, finalSubtotal + resolvedShipping - resolvedDiscount);

  const subtotalLabel = mergedSettings?.subtotalLabel || 'المجموع الفرعي';
  const shippingLabel = mergedSettings?.shippingLabel || 'الشحن والتوصيل';
  const discountLabel = mergedSettings?.discountLabel || 'الخصم والكوبون';
  const totalLabel = mergedSettings?.totalLabel || 'الإجمالي النهائي';

  const showSubtotal = mergedSettings?.showSubtotal !== false;
  const showShipping = mergedSettings?.showShipping !== false;
  const showDiscount = mergedSettings?.showDiscount !== false && resolvedDiscount > 0;

  return (
    <div
      ref={typographyRef}
      style={typographyStyle}
      data-testid="cart-totals-element"
      className={`w-full space-y-2.5 p-4 rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs ${mergedSettings?.className || ''}`}
    >
      {/* Subtotal */}
      {showSubtotal && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{subtotalLabel}</span>
          <span data-testid="cart-subtotal-value" className="font-medium text-foreground tabular-nums">
            {formatStorefrontCurrency(finalSubtotal, currency)}
          </span>
        </div>
      )}

      {/* Shipping */}
      {showShipping && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{shippingLabel}</span>
          <span data-testid="cart-shipping-value" className="font-medium text-foreground tabular-nums">
            {resolvedShipping === 0
              ? 'مجاني'
              : formatStorefrontCurrency(resolvedShipping, currency)}
          </span>
        </div>
      )}

      {/* Discount */}
      {showDiscount && (
        <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
          <span>{discountLabel}</span>
          <span data-testid="cart-discount-value" className="tabular-nums">
            − {formatStorefrontCurrency(resolvedDiscount, currency)}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border/60 my-1.5" />

      {/* Grand Total */}
      <div
        data-testid="cart-total"
        className="flex items-center justify-between text-sm sm:text-base font-bold text-foreground"
      >
        <span>{totalLabel}</span>
        <span
          data-testid="cart-total-value"
          data-value={finalTotal}
          className="text-primary tabular-nums"
        >
          {formatStorefrontCurrency(finalTotal, currency)}
        </span>
      </div>
    </div>
  );
};

export default CartTotalsElement;
