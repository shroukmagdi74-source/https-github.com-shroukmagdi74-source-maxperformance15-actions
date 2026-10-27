import React from 'react';
import {
  buildElementTypographyStyle,
  useElementTypographyRef,
  type ElementTypographySettings,
} from './elementTypography';
import { useStorefrontDynamicContext } from '../../studio/utils/dynamicValues';
import {
  formatProductPrice,
  resolveProductFromContext,
} from './commerceElementHelpers';

export interface ProductPriceElementSettings extends ElementTypographySettings {
  currency?: string;
  locale?: string;
  showCompareAt?: boolean;
  showDiscountBadge?: boolean;
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  className?: string;
}

export interface ProductPriceElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: ProductPriceElementSettings;
    product?: unknown;
    [key: string]: unknown;
  };
  settings?: ProductPriceElementSettings;
  product?: unknown;
}

const ProductPriceElement: React.FC<ProductPriceElementProps> = ({
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

  const currency =
    mergedSettings?.currency ||
    dynamicCtx.store?.currency ||
    dynamicCtx.currency ||
    'EGP';
  const locale = mergedSettings?.locale || dynamicCtx.locale || 'ar-EG';

  const priceResult = formatProductPrice(product, currency, locale);
  if (!priceResult) {
    return null;
  }

  const {
    price,
    comparePrice,
    formattedPrice,
    formattedComparePrice,
    discountPercent,
    isDiscounted,
  } = priceResult;

  const showCompareAt = mergedSettings?.showCompareAt !== false;
  const showDiscountBadge = Boolean(mergedSettings?.showDiscountBadge);
  const rawAlign = String(mergedSettings?.align || 'start').trim().toLowerCase();
  const customClass = mergedSettings?.className || '';

  let alignClass = 'justify-start';
  if (rawAlign === 'center') {
    alignClass = 'justify-center';
  } else if (rawAlign === 'end' || rawAlign === 'right') {
    alignClass = 'justify-end';
  }

  const typoStyle = buildElementTypographyStyle(mergedSettings, formattedPrice);
  const elementRef = useElementTypographyRef(typoStyle.letterSpacing);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--store-font-family, inherit)',
    ...typoStyle,
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-storefront-element="product-price"
      data-element="product-price"
      data-product-id={product.id}
      data-price={price}
      data-compare-price={comparePrice ?? undefined}
      data-currency={currency}
      className={`storefront-product-price-wrapper flex items-baseline gap-2 ${alignClass} ${customClass}`.trim()}
      style={containerStyle}
    >
      <span
        data-storefront-price="true"
        className="font-bold text-[var(--store-price-color,#111827)] dark:text-white"
      >
        {formattedPrice}
      </span>

      {showCompareAt && isDiscounted && formattedComparePrice && (
        <del
          data-storefront-compare-price="true"
          className="line-through text-sm font-normal text-muted-foreground opacity-75"
        >
          {formattedComparePrice}
        </del>
      )}

      {showDiscountBadge && isDiscounted && discountPercent > 0 && (
        <span
          data-storefront-discount-badge="true"
          className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-semibold dark:bg-red-950/40 dark:text-red-400"
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};

export default ProductPriceElement;
