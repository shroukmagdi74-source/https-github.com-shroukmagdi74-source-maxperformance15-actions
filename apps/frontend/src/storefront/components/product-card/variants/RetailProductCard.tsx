import React from 'react';
import { Heart, Star, Plus } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';
import { formatNumber } from '../../../utils/localeFormat';

export const RetailProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    variant,
    CardShell,
    features,
    handleWishlist,
    finalWishlistLabel,
    isWishlisted,
    imageCandidates,
    name,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    renderImageFallback,
    categoryLabel,
    ratingValue,
    reviewCount,
    isRtl,
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
  } = ctrl;

  if (variant === 'retail-direct') {
    return (
      <CardShell
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[#121212] bg-[#fffdf8] p-3 text-card-foreground shadow-[0_20px_44px_-30px_rgba(18,18,18,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_58px_-28px_rgba(18,18,18,0.26)] sm:rounded-[1.45rem] sm:p-4"
      >
        <div className="absolute end-3 top-3 z-20">
          {features.wishlistEnabled ? (
            <button
              onClick={handleWishlist}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1f1f1f] bg-white text-[#1f1f1f] shadow-sm transition-all hover:scale-105 hover:bg-[#fff1e5] hover:text-[#c15d12] ${
                isWishlisted ? 'border-[#c15d12] bg-[#fff1e5] text-[#c15d12]' : ''
              }`}
              title={finalWishlistLabel}
              aria-label={finalWishlistLabel}
            >
              <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          ) : null}
        </div>

        <div className="mb-3 overflow-hidden rounded-[1rem] border border-[#121212] bg-white">
          <div className="relative aspect-square overflow-hidden bg-[#f7f0e6]">
            <StorefrontProductImage
              candidates={imageCandidates}
              alt={name}
              loading={resolvedImageLoading}
              fetchpriority={resolvedImageFetchPriority}
              width="400"
              height="400"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fallback={renderImageFallback('rounded-[1rem] bg-[#f3eadf]')}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#73573e]">
            {categoryLabel}
          </span>
          <h3 className="line-clamp-2 font-heading text-[1rem] font-black leading-6 text-[#171717]">
            {name}
          </h3>

          {(ratingValue || reviewCount) ? (
            <div className="flex items-center gap-1 text-xs">
              <div className="flex items-center gap-0.5 text-[#f59e0b]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`retail-direct-star-${index}`}
                    size={12}
                    fill={ratingValue && index < Math.round(ratingValue) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              {reviewCount ? (
                <span className="font-sans text-[11px] text-[#5f5a54]">
                  {isRtl
                    ? `${formatNumber(reviewCount, { maximumFractionDigits: 0 })} تقييم`
                    : `${formatNumber(reviewCount, { maximumFractionDigits: 0 })} reviews`}
                </span>
              ) : null}
            </div>
          ) : null}

          <div dir="ltr" className="mt-auto flex items-center gap-2 font-sans">
            <div className="space-y-1">
              <p className="text-[1.2rem] font-black tracking-[-0.03em] text-[#121212]">
                {formattedPrice}
              </p>
              {formattedComparePrice ? (
                <p className="text-xs text-[#6d655f] line-through">
                  {formattedComparePrice}
                </p>
              ) : null}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-2 inline-flex min-h-[42px] w-full items-center justify-center rounded-full border border-[#121212] bg-[#121212] px-4 py-2 text-sm font-black text-white transition-colors hover:bg-[#2a2a2a]"
          >
            {actionLabel}
          </button>
        </div>
      </CardShell>
    );
  }

  // variant === 'retail-air'
  return (
    <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#e8ebf0] bg-white p-3 text-card-foreground shadow-[0_18px_42px_-28px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-28px_rgba(15,23,42,0.18)] sm:rounded-[1.55rem] sm:p-4">
      <div className="absolute end-3 top-3 z-20 sm:end-4 sm:top-4">
        {features.wishlistEnabled ? (
          <button
            onClick={handleWishlist}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe1ea] bg-white text-[#6b7280] shadow-sm transition-all hover:scale-105 hover:border-[#f59e0b] hover:text-[#ef4444] sm:h-9 sm:w-9 ${
              isWishlisted ? 'border-[#ef4444] bg-[#fff1f2] text-[#ef4444]' : ''
            }`}
            title={finalWishlistLabel}
            aria-label={finalWishlistLabel}
          >
            <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        ) : null}
      </div>

      <div className="mb-3 rounded-[1rem] bg-[#f6f7fb] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:mb-4 sm:rounded-[1.2rem] sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-[0.95rem] sm:rounded-[1rem]">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading="lazy"
            width="400"
            height="400"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04] sm:p-3"
            fallback={renderImageFallback('rounded-[1rem] bg-[#eef2f7]')}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <span className="mb-1.5 text-[10px] font-medium text-[#6b7280] sm:mb-2 sm:text-[11px]">
          {categoryLabel}
        </span>
        <h3 className="line-clamp-2 text-[0.94rem] font-medium leading-6 text-[#111827] sm:text-[1.02rem] sm:leading-7">
          {name}
        </h3>

        {ratingValue || reviewCount ? (
          <div className="mt-2.5 flex items-center gap-1 text-xs sm:mt-3 sm:text-sm">
            <div className="flex items-center gap-0.5 text-[#f59e0b]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`star-${index}`}
                  size={12}
                  fill={ratingValue && index < Math.round(ratingValue) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            {reviewCount ? (
              <span className="font-sans text-[11px] text-[#6b7280] sm:text-xs">
                {isRtl
                  ? `${formatNumber(reviewCount, { maximumFractionDigits: 0 })} تقييم`
                  : `${formatNumber(reviewCount, { maximumFractionDigits: 0 })} reviews`}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2.5 pt-4 sm:gap-3 sm:pt-5">
          <div dir="ltr" className="space-y-1 font-sans">
            <p className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[1.55rem]">
              {formattedPrice}
            </p>
            {formattedComparePrice ? (
              <p className="text-xs font-light text-[#9ca3af] line-through sm:text-sm">
                {formattedComparePrice}
              </p>
            ) : null}
          </div>

          <button
            onClick={handleAddToCart}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#facc15] text-[#111827] shadow-[0_16px_30px_-18px_rgba(250,204,21,0.75)] transition-all hover:scale-105 hover:bg-[#f5c000] sm:h-11 sm:w-11"
            title={actionLabel}
            aria-label={actionLabel}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </CardShell>
  );
};
