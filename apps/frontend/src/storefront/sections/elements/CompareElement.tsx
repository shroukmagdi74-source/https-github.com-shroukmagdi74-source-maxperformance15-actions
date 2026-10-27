import React, { useState, useEffect } from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useStorefrontDynamicContext } from '../../studio/utils/dynamicValues';
import { resolveProductFromContext } from './commerceElementHelpers';

const COMPARE_STORAGE_KEY = 'sf-compare-products';
const memoryCompare = new Set<string>();

function getLocalCompare(): string[] {
  if (typeof window === 'undefined') return Array.from(memoryCompare);
  try {
    const raw = window.localStorage?.getItem(COMPARE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : Array.from(memoryCompare);
  } catch {
    return Array.from(memoryCompare);
  }
}

function setLocalCompare(ids: string[]): void {
  memoryCompare.clear();
  ids.forEach((id) => memoryCompare.add(id));
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new Event('compareUpdated'));
}

export interface CompareElementSettings extends ElementTypographySettings {
  showLabel?: boolean;
  label?: string; // default "مقارنة"
  activeLabel?: string; // default "في المقارنة"
  variant?: 'icon' | 'button' | string;
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  className?: string;
}

export interface CompareElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: CompareElementSettings;
    product?: unknown;
    [key: string]: unknown;
  };
  settings?: CompareElementSettings;
  product?: unknown;
}

const CompareElement: React.FC<CompareElementProps> = ({
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

  const [isInCompare, setIsInCompare] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const current = getLocalCompare();
    setIsInCompare(current.includes(String(product.id)));

    const handleSync = () => {
      const updated = getLocalCompare();
      setIsInCompare(updated.includes(String(product.id)));
    };

    window.addEventListener('compareUpdated', handleSync);
    return () => {
      window.removeEventListener('compareUpdated', handleSync);
    };
  }, [product?.id]);

  // If the context is NOT a product -> do NOT render anything (do not display 0)
  if (!product) {
    return null;
  }

  const showLabel = Boolean(mergedSettings?.showLabel);
  const defaultLabel = mergedSettings?.label || 'مقارنة';
  const activeLabel = mergedSettings?.activeLabel || 'في المقارنة';
  const labelText = isInCompare ? activeLabel : defaultLabel;
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

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = String(product.id);
    const current = getLocalCompare();
    const willBeIn = !current.includes(productId);

    const next = willBeIn
      ? [...current, productId]
      : current.filter((id) => id !== productId);

    setLocalCompare(next);
    setIsInCompare(willBeIn);
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-storefront-element="compare"
      data-element="compare"
      data-product-id={product.id}
      data-in-compare={isInCompare}
      className={`storefront-compare flex items-center ${alignClass} ${customClass}`.trim()}
      style={containerStyle}
    >
      <button
        type="button"
        onClick={handleToggleCompare}
        data-compare-button="true"
        aria-pressed={isInCompare}
        aria-label={labelText}
        title={labelText}
        className={`inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none ${
          rawVariant === 'button'
            ? 'px-3 py-1.5 border border-border bg-background hover:bg-muted/30 text-xs font-medium'
            : 'p-2 text-muted-foreground hover:text-[var(--store-accent,#2563eb)] hover:bg-black/5 dark:hover:bg-white/5'
        } ${isInCompare ? 'text-[var(--store-accent,#2563eb)]' : ''}`}
      >
        <svg
          className="h-5 w-5 shrink-0 transition-transform active:scale-125"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>

        {showLabel && <span data-compare-label="true">{labelText}</span>}
      </button>
    </div>
  );
};

export default CompareElement;
