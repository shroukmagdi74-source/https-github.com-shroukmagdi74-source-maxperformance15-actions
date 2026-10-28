import React from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useStorefrontDynamicContext } from '../../studio/utils/dynamicValues';
import { resolveProductFromContext } from './commerceElementHelpers';
import { formatNumber } from '../../utils/localeFormat';

export interface ProductRatingElementSettings extends ElementTypographySettings {
  showCount?: boolean;
  showNumber?: boolean;
  starColor?: string;
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  className?: string;
}

export interface ProductRatingElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: ProductRatingElementSettings;
    product?: unknown;
    [key: string]: unknown;
  };
  settings?: ProductRatingElementSettings;
  product?: unknown;
}

const ProductRatingElement: React.FC<ProductRatingElementProps> = ({
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

  const rawRating = product.rating;
  const ratingValue =
    typeof rawRating === 'number' && !Number.isNaN(rawRating)
      ? Math.max(0, Math.min(5, rawRating))
      : 5;

  const countRaw =
    product.ratingCount ??
    (product as Record<string, unknown>).reviewsCount ??
    (product as Record<string, unknown>).ratingsCount;

  const count =
    countRaw !== undefined && countRaw !== null && !Number.isNaN(Number(countRaw))
      ? Number(countRaw)
      : null;

  const showCount = mergedSettings?.showCount !== false;
  const showNumber = mergedSettings?.showNumber !== false;
  const starColor = mergedSettings?.starColor || '#f59e0b'; // amber-500
  const rawAlign = String(mergedSettings?.align || 'start').trim().toLowerCase();
  const customClass = mergedSettings?.className || '';

  let alignClass = 'justify-start';
  if (rawAlign === 'center') {
    alignClass = 'justify-center';
  } else if (rawAlign === 'end' || rawAlign === 'right') {
    alignClass = 'justify-end';
  }

  const typoStyle = buildElementTypographyStyle(mergedSettings, String(ratingValue));
  const elementRef = useElementTypographyRef(typoStyle.letterSpacing);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--store-font-family, inherit)',
    ...typoStyle,
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-storefront-element="product-rating"
      data-element="product-rating"
      data-product-id={product.id}
      data-rating={ratingValue}
      data-rating-count={count ?? undefined}
      className={`storefront-product-rating flex items-center gap-1.5 ${alignClass} ${customClass}`.trim()}
      style={containerStyle}
    >
      {/* 5 Stars */}
      <div className="flex items-center gap-0.5" aria-label={`تقييم ${ratingValue} من 5`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = ratingValue >= starIndex;
          const half = !filled && ratingValue >= starIndex - 0.5;

          return (
            <svg
              key={starIndex}
              className="h-4 w-4 shrink-0"
              viewBox="0 0 20 20"
              fill={filled || half ? starColor : 'none'}
              stroke={starColor}
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          );
        })}
      </div>

      {showNumber && (
        <span
          data-rating-number="true"
          className="text-xs font-semibold tabular-nums text-foreground"
        >
          {formatNumber(ratingValue, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
      )}

      {showCount && count !== null && (
        <span
          data-rating-count="true"
          className="text-xs text-muted-foreground tabular-nums"
        >
          ({formatNumber(count, { maximumFractionDigits: 0 })})
        </span>
      )}
    </div>
  );
};

export default ProductRatingElement;
