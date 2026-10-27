import { formatStorefrontCurrency } from '../../utils/currency';
import type { CartItem } from '../../store/useCartStore';

export interface CartCalculationOptions {
  items: CartItem[];
  shippingCost?: number | null;
  discountAmount?: number | null;
  currency?: string | null;
  locale?: string | null;
}

export interface CartTotalsCalculationResult {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  totalItems: number;
  formattedSubtotal: string;
  formattedShipping: string;
  formattedDiscount: string;
  formattedTotal: string;
}

/**
 * Pure calculation helper for cart totals without side effects.
 * Matches existing storefront selectors (subtotal, shipping, discounts, total).
 */
export function calculateCartTotals({
  items,
  shippingCost = 0,
  discountAmount = 0,
  currency = 'EGP',
  locale = 'ar-EG',
}: CartCalculationOptions): CartTotalsCalculationResult {
  const safeItems = Array.isArray(items) ? items : [];

  const subtotal = safeItems.reduce((acc, item) => {
    const unitPrice = Number(item.basePrice ?? item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + unitPrice * qty;
  }, 0);

  const roundedSubtotal = Number(subtotal.toFixed(2));
  const shipping = Math.max(0, Number(shippingCost) || 0);
  const discount = Math.max(0, Number(discountAmount) || 0);
  const total = Math.max(0, Number((roundedSubtotal + shipping - discount).toFixed(2)));
  const totalItems = safeItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

  return {
    subtotal: roundedSubtotal,
    shipping,
    discount,
    total,
    totalItems,
    formattedSubtotal: formatStorefrontCurrency(roundedSubtotal, currency, locale),
    formattedShipping:
      shipping === 0 ? 'مجاني' : formatStorefrontCurrency(shipping, currency, locale),
    formattedDiscount: formatStorefrontCurrency(discount, currency, locale),
    formattedTotal: formatStorefrontCurrency(total, currency, locale),
  };
}
