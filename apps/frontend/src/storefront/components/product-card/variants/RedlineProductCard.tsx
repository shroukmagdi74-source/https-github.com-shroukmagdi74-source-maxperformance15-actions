import React from 'react';
import { Heart, Star, ShoppingCart, Zap } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';

export const RedlineProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    CardShell,
    discountPercentage,
    features,
    handleWishlist,
    finalWishlistLabel,
    isWishlisted,
    imageCandidates,
    name,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    renderImageFallback,
    prefersArabicCopy,
    categoryLabel,
    ratingValue,
    reviewCount,
    formattedPrice,
    formattedComparePrice,
    savingsAmount,
    formattedSavings,
    handleAddToCart,
    actionLabel,
    hasVariantChoices,
    handleQuickBuy,
  } = ctrl;

  return (
    <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white text-card-foreground shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.12)]">
      {/* Top Image Zone */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#fafafa] p-3 sm:p-4 flex items-center justify-center border-b border-neutral-100">
        {discountPercentage ? (
          <span className="absolute start-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-neutral-950 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm tabular-nums tracking-tight">
            -{discountPercentage}%
          </span>
        ) : null}

        {features.wishlistEnabled ? (
          <button
            onClick={handleWishlist}
            className={`absolute end-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/80 bg-white/95 text-neutral-400 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:text-rose-600 hover:border-rose-200 active:scale-95 ${
              isWishlisted ? 'text-rose-600 border-rose-200' : ''
            }`}
            title={finalWishlistLabel}
            aria-label={finalWishlistLabel}
          >
            <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        ) : null}

        <div className="flex h-full w-full items-center justify-center">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading={resolvedImageLoading}
            fetchpriority={resolvedImageFetchPriority}
            requestedWidth={520}
            responsiveWidths={[240, 320, 420, 520]}
            responsiveSizes="(max-width: 767px) 68vw, (max-width: 1279px) 28vw, 20vw"
            imageQuality={85}
            width="520"
            height="520"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
            fallback={renderImageFallback('rounded-xl bg-neutral-100')}
          />
        </div>

        {/* Micro badge: OEM precision fit */}
        <div className="absolute bottom-2.5 start-3 z-20 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 shadow-sm backdrop-blur-sm border border-neutral-200/70">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
          <span>{prefersArabicCopy ? 'تفصيل فابريقة بالمللي' : 'Custom OEM Fit'}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 text-start">
        {/* Category & Trust indicator */}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-rose-600 uppercase tracking-wide">
            {categoryLabel || (prefersArabicCopy ? 'إكسسوارات سيارات' : 'Car Accessories')}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
            {prefersArabicCopy ? 'معاينة قبل الدفع' : 'Inspect before pay'}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="mt-1.5 line-clamp-2 text-sm sm:text-[15px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-rose-600 font-heading">
          {name}
        </h3>

        {/* Rating if available */}
        {(ratingValue || reviewCount) ? (
          <div className="mt-1.5 flex items-center gap-1 text-[#f4c94d]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`redline-star-${index}`}
                size={11}
                fill={ratingValue && index < Math.round(ratingValue) ? 'currentColor' : 'none'}
              />
            ))}
            {reviewCount ? (
              <span className="ms-1 text-[11px] font-semibold tabular-nums text-neutral-500">
                ({reviewCount})
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Price Row */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-base sm:text-lg font-extrabold text-neutral-950">
              {formattedPrice}
            </span>
            {formattedComparePrice ? (
              <span className="text-xs sm:text-sm text-neutral-400 line-through">
                {formattedComparePrice}
              </span>
            ) : null}
          </div>
          {savingsAmount && savingsAmount > 0 ? (
            <span className="text-[11px] font-bold text-rose-600 tabular-nums">
              {prefersArabicCopy ? `وفّر ${formattedSavings}` : `Save ${formattedSavings}`}
            </span>
          ) : null}
        </div>

        {/* Action Buttons: Unified High-Converting Cockpit */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 py-2.5 px-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-500"
            title={actionLabel}
            aria-label={actionLabel}
          >
            <ShoppingCart size={15} className="text-neutral-300" />
            <span>
              {hasVariantChoices
                ? (prefersArabicCopy ? 'تحديد السيارة والطلب' : 'Select Car & Order')
                : (prefersArabicCopy ? 'أضف للسلة' : 'Add to Cart')}
            </span>
          </button>

          <button
            onClick={handleQuickBuy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-500"
            title={prefersArabicCopy ? 'طلب سريع فوري' : 'Instant Checkout'}
            aria-label={prefersArabicCopy ? 'طلب سريع فوري' : 'Instant Checkout'}
          >
            <Zap size={16} />
          </button>
        </div>
      </div>
    </CardShell>
  );
};
