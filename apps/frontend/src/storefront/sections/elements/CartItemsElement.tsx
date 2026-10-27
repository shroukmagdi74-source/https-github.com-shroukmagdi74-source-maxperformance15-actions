import React, { useState } from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useCartStore, type CartItem } from '../../store/useCartStore';
import { storefrontApi } from '../../../utils/storefrontApi';
import { formatStorefrontCurrency } from '../../utils/currency';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { getCartItemImageCandidates } from '../../utils/productImages';

export interface CartItemsElementSettings extends ElementTypographySettings {
  emptyTitle?: string;
  emptySubtitle?: string;
  showImage?: boolean;
  showAttributes?: boolean;
  showLineTotal?: boolean;
  className?: string;
}

export interface CartItemsElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: CartItemsElementSettings;
    [key: string]: unknown;
  };
  settings?: CartItemsElementSettings;
  items?: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  updateCartItem?: (productId: string, payload: { quantity: number; variantId?: string | null }) => Promise<unknown> | void;
  onRemoveItem?: (id: string) => void;
  currency?: string;
}

const CartItemsElement: React.FC<CartItemsElementProps> = ({
  section,
  settings: directSettings,
  items: directItems,
  onUpdateQuantity,
  updateCartItem: propUpdateCartItem,
  onRemoveItem,
  currency: propCurrency,
}) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const typographyRef = useElementTypographyRef(mergedSettings);
  const typographyStyle = buildElementTypographyStyle(mergedSettings);

  const { items: storeItems, updateQuantity: storeUpdateQuantity, removeItem: storeRemoveItem } = useCartStore();
  const { settings: storefrontSettings } = useStorefrontSettings();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const items = directItems ?? storeItems;
  const currency =
    propCurrency ||
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    'EGP';

  const emptyTitle = mergedSettings?.emptyTitle || 'سلة التسوق فارغة';
  const emptySubtitle =
    mergedSettings?.emptySubtitle || 'لم تقم بإضافة أي منتجات إلى سلة المشتريات حتى الآن.';
  const showImage = mergedSettings?.showImage !== false;
  const showAttributes = mergedSettings?.showAttributes !== false;
  const showLineTotal = mergedSettings?.showLineTotal !== false;

  // 1. Empty state: Clear message + 0 buttons (strict law: no buttons in empty cart)
  if (!items || items.length === 0) {
    return (
      <div
        ref={typographyRef}
        style={typographyStyle}
        data-testid="cart-items-empty"
        className={`w-full py-10 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 ${mergedSettings?.className || ''}`}
      >
        <div data-testid="cart-empty-message" className="space-y-1.5 max-w-sm mx-auto">
          <p className="text-base font-bold text-foreground">{emptyTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{emptySubtitle}</p>
        </div>
      </div>
    );
  }

  // 2. Quantity adjustment handler
  const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    setLoadingItemId(item.id);

    // Update local store immediately for instant UI feedback
    storeUpdateQuantity(item.id, nextQuantity);
    onUpdateQuantity?.(item.id, nextQuantity);

    const targetProductId = String(item.productId || item.id);
    const targetPayload = {
      quantity: nextQuantity,
      variantId: item.variantId ?? null,
    };

    try {
      if (propUpdateCartItem) {
        await propUpdateCartItem(targetProductId, targetPayload);
      } else if (storefrontApi?.updateCartItem) {
        await storefrontApi.updateCartItem(targetProductId, targetPayload);
      }
    } catch {
      // Keep optimistic UI update
    } finally {
      setLoadingItemId(null);
    }
  };

  // 3. Remove item handler
  const handleRemove = async (item: CartItem) => {
    storeRemoveItem(item.id);
    onRemoveItem?.(item.id);

    const targetProductId = String(item.productId || item.id);
    try {
      if (storefrontApi?.removeCartItem) {
        await storefrontApi.removeCartItem(targetProductId, item.variantId ?? null);
      }
    } catch {
      // Keep optimistic removal
    }
  };

  return (
    <div
      ref={typographyRef}
      style={typographyStyle}
      data-testid="cart-items-element"
      className={`w-full space-y-3 ${mergedSettings?.className || ''}`}
    >
      {items.map((item) => {
        const itemPrice = Number(item.basePrice ?? item.price) || 0;
        const lineTotal = itemPrice * (Number(item.quantity) || 1);
        const attributeEntries = item.attributes ? Object.entries(item.attributes) : [];
        const isItemLoading = loadingItemId === item.id;

        return (
          <div
            key={item.id}
            data-testid="cart-item"
            data-item-id={item.id}
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/70 bg-card text-card-foreground shadow-xs transition-colors hover:border-border"
          >
            {/* Product Image */}
            {showImage && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                <StorefrontProductImage
                  candidates={getCartItemImageCandidates(item)}
                  alt={item.name}
                  loading="lazy"
                  width="64"
                  height="64"
                  className="h-full w-full object-cover"
                  fallback="IMG"
                />
              </div>
            )}

            {/* Product Meta */}
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-sm font-semibold text-foreground truncate" title={item.name}>
                {item.name}
              </h4>

              {showAttributes && attributeEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  {attributeEntries.map(([k, v]) => (
                    <span key={k} className="bg-muted/60 px-1.5 py-0.5 rounded">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs font-medium text-muted-foreground tabular-nums">
                {formatStorefrontCurrency(itemPrice, currency)}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50">
              <button
                type="button"
                data-testid="decrease-quantity"
                aria-label={`تقليل كمية ${item.name}`}
                disabled={item.quantity <= 1 || isItemLoading}
                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                className="h-7 w-7 flex items-center justify-center rounded text-sm font-bold text-foreground/80 hover:bg-background hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                −
              </button>
              <span
                data-testid="item-quantity"
                className="w-6 text-center text-xs font-bold text-foreground tabular-nums select-none"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                data-testid="increase-quantity"
                aria-label={`زيادة كمية ${item.name}`}
                disabled={isItemLoading}
                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                className="h-7 w-7 flex items-center justify-center rounded text-sm font-bold text-foreground/80 hover:bg-background hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                +
              </button>
            </div>

            {/* Line Subtotal */}
            {showLineTotal && (
              <div className="w-20 text-end text-sm font-bold text-foreground tabular-nums">
                {formatStorefrontCurrency(lineTotal, currency)}
              </div>
            )}

            {/* Delete Button */}
            <button
              type="button"
              data-testid="remove-item"
              aria-label={`حذف ${item.name}`}
              onClick={() => handleRemove(item)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-95"
              title="حذف البند"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CartItemsElement;
