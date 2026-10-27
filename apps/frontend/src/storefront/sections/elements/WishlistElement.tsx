import React, { useState, useEffect } from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useStorefrontDynamicContext } from '../../studio/utils/dynamicValues';
import { wishlistApi } from '../../../utils/wishlistApi';
import { resolveProductFromContext } from './commerceElementHelpers';

const WISHLIST_STORAGE_KEY = 'sf-wishlist-items';
const memoryWishlist = new Set<string>();

function getLocalWishlist(): string[] {
  if (typeof window === 'undefined') return Array.from(memoryWishlist);
  try {
    const raw = window.localStorage?.getItem(WISHLIST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : Array.from(memoryWishlist);
  } catch {
    return Array.from(memoryWishlist);
  }
}

function setLocalWishlist(ids: string[]): void {
  memoryWishlist.clear();
  ids.forEach((id) => memoryWishlist.add(id));
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new Event('wishlistUpdated'));
}

export interface WishlistElementSettings extends ElementTypographySettings {
  showLabel?: boolean;
  label?: string; // default "المفضلة"
  activeLabel?: string; // default "في المفضلة"
  variant?: 'icon' | 'button' | string;
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  className?: string;
}

export interface WishlistElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: WishlistElementSettings;
    product?: unknown;
    [key: string]: unknown;
  };
  settings?: WishlistElementSettings;
  product?: unknown;
}

const WishlistElement: React.FC<WishlistElementProps> = ({
  section,
  settings: directSettings,
  product: directProduct,
}) => {
  const dynamicCtx = useStorefrontDynamicContext();
  const mergedSettings = { ...section?.settings, ...directSettings };

  const product = resolveProductFromContext(
    dynamicCtx,
    directProduct ?? section?.product,
  );

  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const current = getLocalWishlist();
    setIsInWishlist(current.includes(String(product.id)));

    const handleSync = () => {
      const updated = getLocalWishlist();
      setIsInWishlist(updated.includes(String(product.id)));
    };

    window.addEventListener('wishlistUpdated', handleSync);
    return () => {
      window.removeEventListener('wishlistUpdated', handleSync);
    };
  }, [product?.id]);

  // If the context is NOT a product -> do NOT render anything (do not display 0)
  if (!product) {
    return null;
  }

  const showLabel = Boolean(mergedSettings?.showLabel);
  const defaultLabel = mergedSettings?.label || 'المفضلة';
  const activeLabel = mergedSettings?.activeLabel || 'في المفضلة';
  const labelText = isInWishlist ? activeLabel : defaultLabel;
  const rawVariant = String(mergedSettings?.variant || 'icon').trim().toLowerCase();
  const rawAlign = String(mergedSettings?.align || 'start').trim().toLowerCase();
  const customClass = mergedSettings?.className || '';

  let alignClass = 'justify-start';
  if (rawAlign === 'center') {
    alignClass = 'justify-center';
  } else if (rawAlign === 'end' || rawAlign === 'right') {
    alignClass = 'justify-end';
  }

  const typoStyle = buildElementTypographyStyle(mergedSettings, labelText);
  const elementRef = useElementTypographyRef(typoStyle.letterSpacing);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--store-font-family, inherit)',
    ...typoStyle,
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = String(product.id);
    const current = getLocalWishlist();
    const willBeIn = !current.includes(productId);

    const next = willBeIn
      ? [...current, productId]
      : current.filter((id) => id !== productId);

    setLocalWishlist(next);
    setIsInWishlist(willBeIn);

    // Try server API in background
    try {
      if (willBeIn) {
        await wishlistApi.addToWishlist(productId);
      } else {
        await wishlistApi.removeFromWishlist(productId);
      }
    } catch {
      // Offline or preview fallback
    }
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-storefront-element="wishlist"
      data-element="wishlist"
      data-product-id={product.id}
      data-in-wishlist={isInWishlist}
      className={`storefront-wishlist flex items-center ${alignClass} ${customClass}`.trim()}
      style={containerStyle}
    >
      <button
        type="button"
        onClick={handleToggleWishlist}
        data-wishlist-button="true"
        aria-pressed={isInWishlist}
        aria-label={labelText}
        title={labelText}
        className={`inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none ${
          rawVariant === 'button'
            ? 'px-3 py-1.5 border border-border bg-background hover:bg-muted/30 text-xs font-medium'
            : 'p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
        } ${isInWishlist ? 'text-red-500' : ''}`}
      >
        <svg
          className="h-5 w-5 shrink-0 transition-transform active:scale-125"
          viewBox="0 0 24 24"
          fill={isInWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>

        {showLabel && <span data-wishlist-label="true">{labelText}</span>}
      </button>
    </div>
  );
};

export default WishlistElement;
