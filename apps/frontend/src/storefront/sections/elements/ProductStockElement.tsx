import React from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useStorefrontDynamicContext } from '../../studio/utils/dynamicValues';
import { resolveProductFromContext } from './commerceElementHelpers';

export interface ProductStockElementSettings extends ElementTypographySettings {
  showBar?: boolean;
  lowStockThreshold?: number; // default 10
  inStockTemplate?: string; // default "متبقي {stock}"
  outOfStockText?: string; // default "غير متوفر"
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  className?: string;
}

export interface ProductStockElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: ProductStockElementSettings;
    product?: unknown;
    [key: string]: unknown;
  };
  settings?: ProductStockElementSettings;
  product?: unknown;
}

const ProductStockElement: React.FC<ProductStockElementProps> = ({
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

  // If the context is NOT a product -> do NOT render anything (do not display 0)
  if (!product) {
    return null;
  }

  const rawStock = product.stock;
  if (rawStock === undefined || rawStock === null || Number.isNaN(Number(rawStock))) {
    return null;
  }

  const stock = Number(rawStock);
  const isOutOfStock = stock <= 0;

  const showBar = mergedSettings?.showBar !== false;
  const lowStockThreshold = Number(mergedSettings?.lowStockThreshold ?? 10) || 10;
  const outOfStockText = mergedSettings?.outOfStockText || 'غير متوفر';
  const inStockTemplate = mergedSettings?.inStockTemplate || 'متبقي {stock}';

  const inStockText = inStockTemplate.replace('{stock}', String(stock));
  const displayText = isOutOfStock ? outOfStockText : inStockText;

  const rawAlign = String(mergedSettings?.align || 'start').trim().toLowerCase();
  const customClass = mergedSettings?.className || '';

  let alignClass = 'items-start text-start';
  if (rawAlign === 'center') {
    alignClass = 'items-center text-center';
  } else if (rawAlign === 'end' || rawAlign === 'right') {
    alignClass = 'items-end text-end';
  }

  const typoStyle = buildElementTypographyStyle(mergedSettings, displayText);
  const elementRef = useElementTypographyRef(typoStyle.letterSpacing);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--store-font-family, inherit)',
    ...typoStyle,
  };

  // Stock percentage for progress bar (clamped to 100%)
  const maxRef = Math.max(lowStockThreshold * 2, stock, 20);
  const progressPercent = isOutOfStock ? 0 : Math.min(100, Math.max(10, Math.round((stock / maxRef) * 100)));

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-storefront-element="product-stock"
      data-element="product-stock"
      data-product-id={product.id}
      data-stock={stock}
      data-out-of-stock={isOutOfStock}
      className={`storefront-product-stock flex flex-col gap-1.5 w-full ${alignClass} ${customClass}`.trim()}
      style={containerStyle}
    >
      <div className="flex items-center gap-2">
        <span
          data-stock-text="true"
          data-stock-status={isOutOfStock ? 'out-of-stock' : 'in-stock'}
          className={`text-xs font-semibold ${
            isOutOfStock
              ? 'text-red-600 dark:text-red-400'
              : stock <= lowStockThreshold
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {displayText}
        </span>
      </div>

      {showBar && (
        <div
          data-stock-bar-track="true"
          className="w-full max-w-xs h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={stock}
          aria-valuemin={0}
          aria-valuemax={maxRef}
        >
          <div
            data-stock-bar-fill="true"
            className={`h-full transition-all duration-300 rounded-full ${
              isOutOfStock
                ? 'bg-red-500 w-0'
                : stock <= lowStockThreshold
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductStockElement;
