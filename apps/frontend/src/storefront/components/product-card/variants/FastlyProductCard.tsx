import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';
import { formatNumber } from '../../../utils/localeFormat';

export const FastlyProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    CardShell,
    numericPrice,
    formattedPrice,
    features,
    isFastlyTheme,
    handleWishlist,
    finalWishlistLabel,
    isWishlisted,
    imageCandidates,
    name,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    renderImageFallback,
    handleAddToCart,
    actionLabel,
  } = ctrl;

  const displayNumericPrice = Number.isFinite(numericPrice)
    ? formatNumber(numericPrice, { maximumFractionDigits: 2 })
    : formattedPrice;

  return (
    <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-[0.55rem] border-2 border-[#111111] bg-white text-card-foreground shadow-none transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative border-b-2 border-[#111111] bg-white p-2.5">
        {features.wishlistEnabled && !isFastlyTheme ? (
          <button
            onClick={handleWishlist}
            className={`absolute end-2.5 top-2.5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-[0.45rem] border-2 border-[#111111] bg-white text-[#111111] transition-colors hover:bg-[#111111] hover:text-white ${
              isWishlisted ? 'bg-[#111111] text-white' : ''
            }`}
            title={finalWishlistLabel}
            aria-label={finalWishlistLabel}
          >
            <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        ) : null}

        <div className="aspect-square overflow-hidden bg-white">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading={resolvedImageLoading}
            fetchpriority={resolvedImageFetchPriority}
            width="400"
            height="400"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fallback={renderImageFallback('bg-[#f5f5f5]')}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <h3 className="line-clamp-3 min-h-[4.5rem] font-body text-[0.95rem] font-bold leading-6 text-[#111111]">
          {name}
        </h3>

        <p dir="ltr" className="mt-auto font-sans text-[1.45rem] font-black leading-none text-[#cf1620]">
          {displayNumericPrice}
        </p>

        {isFastlyTheme ? (
          <div className="flex items-center gap-2">
            {features.wishlistEnabled ? (
              <button
                onClick={handleWishlist}
                className={`inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[0.45rem] border-2 border-[#111111] bg-white text-[#111111] transition-colors hover:bg-[#111111] hover:text-white ${
                  isWishlisted ? 'bg-[#111111] text-white' : ''
                }`}
                title={finalWishlistLabel}
                aria-label={finalWishlistLabel}
              >
                <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
              </button>
            ) : null}
            <button
              onClick={handleAddToCart}
              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-[0.45rem] border-2 border-[#111111] bg-white px-4 py-2 text-sm font-bold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
              title={actionLabel}
              aria-label={actionLabel}
            >
              <span>{actionLabel}</span>
              <ShoppingCart size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="inline-flex min-h-[42px] w-full items-center justify-center rounded-[0.45rem] border-2 border-[#111111] bg-white px-4 py-2 text-sm font-bold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </CardShell>
  );
};
