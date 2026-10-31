import React from 'react';
import { Link, type Location } from 'react-router-dom';
import type { QueryClient } from '@tanstack/react-query';
import type { Product } from '../../hooks/useProducts';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { buildStorefrontImageCandidates } from '../../utils/productImages';
import { buildStorefrontPath } from '../../utils/paths';
import { formatStorefrontCurrency } from '../../utils/currency';
import { formatNumber } from '../../utils/localeFormat';
import { fetchStorefrontProduct, getStorefrontProductQueryKey } from '../../hooks/useProduct';
import { InlineStars } from './relatedProductsHelpers';

export interface ElessiCompleteSetCardProps {
  relatedProduct: Product;
  location: Location;
  queryClient: QueryClient;
  currency: string;
  prefersArabicCopy: boolean;
  shouldForceDocumentNavigation?: boolean;
}

export const ElessiCompleteSetCard: React.FC<ElessiCompleteSetCardProps> = ({
  relatedProduct,
  location,
  queryClient,
  currency,
  prefersArabicCopy,
  shouldForceDocumentNavigation = false,
}) => {
  const productPath = buildStorefrontPath(
    location.pathname,
    `/product/${relatedProduct.slug || relatedProduct.id}`,
    location.search,
  );
  const imageCandidates = buildStorefrontImageCandidates(
    relatedProduct.images,
    relatedProduct.mainImage,
    (relatedProduct as Record<string, unknown>)['image'],
  );
  const numericPrice =
    typeof relatedProduct.price === 'string'
      ? Number(relatedProduct.price)
      : Number(relatedProduct.price);
  const numericComparePrice =
    typeof relatedProduct.comparePrice === 'string'
      ? Number(relatedProduct.comparePrice)
      : Number(relatedProduct.comparePrice);
  const hasComparePrice =
    Number.isFinite(numericComparePrice) &&
    Number.isFinite(numericPrice) &&
    numericComparePrice > numericPrice;
  const formattedPrice = Number.isFinite(numericPrice)
    ? formatStorefrontCurrency(numericPrice, currency)
    : '';
  const formattedComparePrice = hasComparePrice
    ? formatStorefrontCurrency(numericComparePrice, currency)
    : '';
  const cardTags = Array.isArray(relatedProduct.tags)
    ? relatedProduct.tags
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .slice(0, 2)
    : [];
  const rawVariants = (relatedProduct as Record<string, unknown>)['variants'];
  const hasVariantChoices = Boolean(
    relatedProduct.productVariants?.length ||
      (Array.isArray(rawVariants) ? rawVariants.length : 0),
  );

  const prefetchTarget = relatedProduct.slug || relatedProduct.id;
  const handlePrefetch = () => {
    if (!prefetchTarget) return;
    void queryClient.prefetchQuery({
      queryKey: getStorefrontProductQueryKey(prefetchTarget),
      queryFn: () => fetchStorefrontProduct(prefetchTarget),
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Link
      key={relatedProduct.id}
      to={productPath}
      reloadDocument={shouldForceDocumentNavigation}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="group block space-y-3 text-[#2d211e] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden bg-[#f3ece6]">
        {formattedComparePrice ? (
          <span className="absolute start-3 top-3 z-20 inline-flex rounded-full border border-white/70 bg-white/92 px-2.5 py-1 text-[10px] font-black tracking-[0.16em] text-[#8f5c44]">
            {prefersArabicCopy ? 'عرض' : 'Sale'}
          </span>
        ) : null}
        <div className="aspect-square overflow-hidden">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={relatedProduct.name}
            loading="lazy"
            requestedWidth={360}
            responsiveWidths={[200, 280, 360, 420]}
            responsiveSizes="(max-width: 767px) 46vw, (max-width: 1279px) 24vw, 18vw"
            imageQuality={72}
            width="520"
            height="520"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-[#ece4dd] px-4 text-center text-sm font-semibold text-[#8f7b73]">
                {relatedProduct.name}
              </div>
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f5c44]">
            {relatedProduct.category?.name || (prefersArabicCopy ? 'منتج مرتبط' : 'Related item')}
          </p>
          <h3 className="line-clamp-2 text-[15px] font-black leading-6 text-[#2d211e]">
            {relatedProduct.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {typeof relatedProduct.rating === 'number' ? (
            <>
              <InlineStars rating={relatedProduct.rating} />
              <span className="text-xs font-bold text-[#6f5a54]">
                {formatNumber(relatedProduct.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
            </>
          ) : null}
          {relatedProduct.reviewCount ? (
            <span className="text-xs text-[#8f7b73]">
              {prefersArabicCopy
                ? `${formatNumber(relatedProduct.reviewCount, { maximumFractionDigits: 0 })} تقييم`
                : `${formatNumber(relatedProduct.reviewCount, { maximumFractionDigits: 0 })} reviews`}
            </span>
          ) : null}
        </div>

        <div dir="ltr" className="flex items-center gap-2 font-sans">
          {formattedComparePrice ? (
            <span className="text-sm text-[#b29e92] line-through">{formattedComparePrice}</span>
          ) : null}
          <span className="text-base font-black text-[#7b5a2f]">{formattedPrice}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cardTags.map((tag) => (
            <span
              key={`${relatedProduct.id}-${tag}`}
              className="rounded-full border border-[#ead8ca] bg-[#fffaf6] px-2.5 py-1 text-[10px] font-bold text-[#6f5a54]"
            >
              {tag}
            </span>
          ))}
          <span className="text-[11px] font-bold text-[#8f5c44]">
            {hasVariantChoices
              ? prefersArabicCopy
                ? 'اختاري المقاس'
                : 'Choose options'
              : prefersArabicCopy
                ? 'شوفي التفاصيل'
                : 'View details'}
          </span>
        </div>
      </div>
    </Link>
  );
};
