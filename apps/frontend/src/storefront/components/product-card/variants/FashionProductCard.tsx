import React from 'react';
import { Heart, ShoppingCart, Eye, Plus, Star } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';
import { resolveNamedColorSwatch } from '../productCardHelpers';

export const FashionProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    variant,
    CardShell,
    imageCandidates,
    name,
    renderImageFallback,
    featuredBadgeLabel,
    DiscountBadge,
    FloatingIcons,
    isHovered,
    categoryLabel,
    shopperSummary,
    listSummary,
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
    features,
    handleWishlist,
    finalWishlistLabel,
    isWishlisted,
    handleQuickView,
    finalQuickViewLabel,
    detailLabel,
    discountPercentage,
    isVelaAccessoryDrivenCard,
    isVelaFashion,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    carryColorOptions,
    carrySizeOptions,
    ratingValue,
    reviewCount,
    hasVariantChoices,
    isRtl,
  } = ctrl;

  if (variant === 'glass') {
    return (
      <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/35 hover:bg-white/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
        <div className="relative aspect-[4/4.7] overflow-hidden border-b border-white/15 bg-white/10">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading="lazy"
            width="360"
            height="420"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            fallback={renderImageFallback()}
          />
          <div className="absolute start-3 top-3 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">
              {featuredBadgeLabel}
            </span>
            <DiscountBadge className="border border-white/20 bg-white/85 text-slate-900" />
          </div>
          <FloatingIcons forceVisible={isHovered} />
        </div>

        <div className="relative flex flex-1 flex-col gap-3 p-4 text-foreground">
          <div className="space-y-2">
            <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/65">
              {categoryLabel}
            </span>
            <h3 className="line-clamp-2 font-heading text-lg font-black leading-7 text-foreground">
              {name}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {shopperSummary}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div dir="ltr" className="space-y-1 font-sans">
              <p className="text-lg font-black text-foreground">{formattedPrice}</p>
              {formattedComparePrice ? (
                <p className="text-xs text-muted-foreground line-through">{formattedComparePrice}</p>
              ) : null}
            </div>
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/85 px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-white"
            >
              <ShoppingCart size={16} />
              {actionLabel}
            </button>
          </div>
        </div>
      </CardShell>
    );
  }

  if (variant === 'list') {
    return (
      <CardShell className="group grid h-full overflow-hidden rounded-[1.2rem] border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative h-full min-h-[220px] overflow-hidden bg-muted">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading="lazy"
            width="320"
            height="320"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fallback={renderImageFallback()}
          />
          <div className="absolute start-3 top-3 flex flex-wrap gap-2">
            <DiscountBadge />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {categoryLabel}
              </span>
              <h3 className="line-clamp-2 font-heading text-xl font-black leading-tight text-foreground">
                {name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {features.wishlistEnabled ? (
                <button
                  onClick={handleWishlist}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isWishlisted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary hover:text-primary'
                  }`}
                  title={finalWishlistLabel}
                  aria-label={finalWishlistLabel}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              ) : null}
              {features.quickViewEnabled ? (
                <button
                  onClick={handleQuickView}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
                  title={finalQuickViewLabel}
                  aria-label={finalQuickViewLabel}
                >
                  <Eye size={16} />
                </button>
              ) : null}
            </div>
          </div>

          <p className="text-sm leading-7 text-muted-foreground">
            {listSummary}
          </p>

          <div className="mt-auto flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div dir="ltr" className="space-y-1 font-sans">
              <p className="text-xl font-black text-primary">{formattedPrice}</p>
              {formattedComparePrice ? (
                <p className="text-sm text-muted-foreground line-through">{formattedComparePrice}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ShoppingCart size={16} />
                {actionLabel}
              </button>
              <button
                onClick={handleQuickView}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Eye size={16} />
                {detailLabel}
              </button>
            </div>
          </div>
        </div>
      </CardShell>
    );
  }

  if (variant === 'playful') {
    return (
      <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border-4 border-white bg-white/80 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-rotate-2 hover:scale-105 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-secondary/30">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading="lazy"
            width="400"
            height="400"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            fallback={renderImageFallback()}
          />
          <div className="absolute start-3 top-3 flex flex-wrap gap-2 z-20">
            <DiscountBadge className="rounded-2xl border-2 border-white shadow-md bg-yellow-400 text-black font-black" />
          </div>

          <div className="absolute -top-1 -right-1 z-20 h-12 w-12 rotate-12 drop-shadow-md">
            <svg viewBox="0 0 100 100" className="h-full w-full fill-pink-400">
              <path d="M50 0 L61 35 L98 35 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 L39 35 Z" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -left-2 z-20 h-10 w-10 -rotate-12 drop-shadow-md">
            <svg viewBox="0 0 100 100" className="h-full w-full fill-sky-400">
              <circle cx="50" cy="50" r="45" />
              <path d="M30 65 Q50 85 70 65" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
              <circle cx="35" cy="40" r="5" fill="white" />
              <circle cx="65" cy="40" r="5" fill="white" />
            </svg>
          </div>

          <FloatingIcons />
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            {categoryLabel}
          </span>
          <h3 className="line-clamp-2 font-heading text-lg font-black leading-tight text-foreground">
            {name}
          </h3>
          <div dir="ltr" className="flex items-center gap-2 font-sans">
            <p className="text-xl font-black text-primary">{formattedPrice}</p>
            {formattedComparePrice ? (
              <p className="text-sm text-muted-foreground line-through opacity-50">{formattedComparePrice}</p>
            ) : null}
          </div>
          <button
            onClick={handleAddToCart}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus size={18} />
            {actionLabel}
          </button>
        </div>
      </CardShell>
    );
  }

  if (variant === 'pastel-fashion') {
    return (
      <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[#ead8d0] bg-white p-3 text-card-foreground shadow-[0_18px_40px_-34px_rgba(86,58,58,0.16)] transition-all duration-300 hover:-translate-0.5 hover:shadow-[0_26px_56px_-34px_rgba(86,58,58,0.22)]">
        <div className="absolute start-3 top-3 z-20 flex items-center gap-2">
          {discountPercentage ? (
            <span className="inline-flex min-w-[2.2rem] items-center justify-center rounded-full bg-[#ef6d5b] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_14px_28px_-20px_rgba(239,109,91,0.62)]">
              %{discountPercentage}
            </span>
          ) : null}
        </div>

        <div
          className={`relative overflow-hidden rounded-[1rem] border border-[#efe2dc] ${
            isVelaAccessoryDrivenCard ? 'bg-[#fff8f4]' : 'bg-[#f8ede8]'
          }`}
        >
          {!isVelaFashion ? (
            <div className="absolute inset-y-3 end-3 z-20 flex flex-col gap-2">
              {features.quickViewEnabled ? (
                <button
                  onClick={handleQuickView}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-[#2f232d] shadow-[0_12px_24px_-18px_rgba(47,35,45,0.24)] transition-colors hover:text-[#ef6d5b]"
                  title={finalQuickViewLabel}
                  aria-label={finalQuickViewLabel}
                >
                  <Eye size={14} />
                </button>
              ) : null}
              <button
                onClick={handleAddToCart}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2f232d] text-white shadow-[0_12px_24px_-18px_rgba(47,35,45,0.34)] transition-colors hover:bg-[#4b363f]"
                title={actionLabel}
                aria-label={actionLabel}
              >
                <ShoppingCart size={14} />
              </button>
              {features.wishlistEnabled ? (
                <button
                  onClick={handleWishlist}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-[#6f5a60] shadow-[0_12px_24px_-18px_rgba(86,58,58,0.22)] transition-colors hover:text-[#ef6d5b] ${
                    isWishlisted ? 'text-[#ef6d5b]' : ''
                  }`}
                  title={finalWishlistLabel}
                  aria-label={finalWishlistLabel}
                >
                  <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              ) : null}
            </div>
          ) : null}

          <div
            className={`relative aspect-[4/5] overflow-hidden ${
              isVelaAccessoryDrivenCard ? 'p-4' : 'p-3'
            }`}
          >
            <StorefrontProductImage
              candidates={imageCandidates}
              alt={name}
              loading={resolvedImageLoading}
              fetchpriority={resolvedImageFetchPriority}
              width="420"
              height="520"
              className={`h-full w-full rounded-[0.85rem] transition-transform duration-500 group-hover:scale-[1.03] ${
                isVelaAccessoryDrivenCard
                  ? 'object-contain bg-[#fff8f4] p-3'
                  : 'object-cover'
              }`}
              fallback={renderImageFallback(
                `rounded-[0.85rem] ${
                  isVelaAccessoryDrivenCard ? 'bg-[#fff8f4]' : 'bg-[#f3e3dd]'
                }`,
              )}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-1 pb-1 pt-3">
          <span
            className={
              isVelaFashion
                ? 'text-[11px] font-semibold text-[#8b6f72]'
                : 'text-[10px] font-black uppercase tracking-[0.22em] text-[#a07b73]'
            }
          >
            {categoryLabel}
          </span>
          <h3 className="line-clamp-2 font-heading text-[1rem] font-black leading-6 text-[#2f232d]">
            {name}
          </h3>

          <div dir="ltr" className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans">
            <p className="text-[1.2rem] font-black tracking-[-0.03em] text-[#2f232d]">
              {formattedPrice}
            </p>
            {formattedComparePrice ? (
              <p className="text-xs font-bold text-[#8b7a7d] line-through">
                {formattedComparePrice}
              </p>
            ) : null}
          </div>

          {carryColorOptions.length || carrySizeOptions.length ? (
            <div className="space-y-2.5">
              {carrySizeOptions.length ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {carrySizeOptions.slice(0, 4).map((sizeOption, index) => (
                    <span
                      key={`${sizeOption}-${index}`}
                      className="inline-flex min-w-[2rem] items-center justify-center rounded-full border border-[#e4d2cb] bg-[#fff8f4] px-2.5 py-1 text-[10px] font-black text-[#3d2a2f]"
                    >
                      {sizeOption}
                    </span>
                  ))}
                </div>
              ) : null}

              {carryColorOptions.length ? (
                <div className="flex items-center gap-1.5">
                  {carryColorOptions.slice(0, 4).map((option, index) => (
                    <span
                      key={`${option}-${index}`}
                      className="inline-flex h-4 w-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(234,216,208,0.95)]"
                      style={{ backgroundColor: resolveNamedColorSwatch(option) }}
                      title={option}
                      aria-label={option}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            onClick={handleAddToCart}
            className={
              isVelaFashion
                ? 'mt-auto inline-flex min-h-[42px] w-full items-center justify-center rounded-full border border-[#171717] bg-[#171717] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d2d2d]'
                : 'mt-auto inline-flex min-h-[40px] w-full items-center justify-center rounded-full bg-[#2f232d] px-4 py-2 text-sm font-black text-white transition-colors hover:bg-[#45323d]'
            }
          >
            {actionLabel}
          </button>
        </div>
      </CardShell>
    );
  }

  // variant === 'boutique-air'
  return (
    <CardShell className="group relative flex h-full flex-col overflow-hidden rounded-[0.55rem] bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-[0.55rem] border border-[#efe4df] bg-[#f8f4f1] shadow-[0_14px_34px_-30px_rgba(59,33,28,0.12)]">
        {discountPercentage ? (
          <span className="absolute start-2 top-2 z-20 inline-flex items-center rounded-full bg-[#1e1916]/85 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm tabular-nums">
            -{discountPercentage}%
          </span>
        ) : null}

        {features.wishlistEnabled ? (
          <button
            onClick={handleWishlist}
            className={`absolute end-2 top-2 z-20 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-[#ece2dc] bg-white/96 text-[#9b8881] shadow-sm transition-colors hover:text-[#201915] ${
              isWishlisted ? 'text-[#d45463]' : ''
            }`}
            title={finalWishlistLabel}
            aria-label={finalWishlistLabel}
          >
            <Heart size={13} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        ) : null}

        <div className="aspect-[3/4] overflow-hidden p-1.5 sm:p-3">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading={resolvedImageLoading}
            fetchpriority={resolvedImageFetchPriority}
            responsiveWidths={[240, 320, 420, 520]}
            responsiveSizes="(max-width: 767px) 68vw, (max-width: 1279px) 28vw, 20vw"
            imageQuality={75}
            width="420"
            height="560"
            className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
            fallback={renderImageFallback('rounded-[0.35rem] bg-[#eee5e0]')}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center text-center px-0.5 sm:px-1">
        <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8d88]">
          {categoryLabel}
        </span>
        <h3 className="line-clamp-1 font-heading text-[0.88rem] sm:text-[0.95rem] font-bold leading-snug text-[#201915] mt-0.5">
          {name}
        </h3>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-xs">
          <div dir="ltr" className="flex items-center gap-1 font-sans">
            {formattedComparePrice ? (
              <span className="text-[#a89b94] line-through text-[10px] sm:text-[11px] tabular-nums">
                {formattedComparePrice}
              </span>
            ) : null}
            <span className="text-[0.92rem] sm:text-[0.96rem] font-bold text-[#b84838] tabular-nums">
              {formattedPrice}
            </span>
          </div>
        </div>

        {(ratingValue || reviewCount) ? (
          <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[#f4c94d]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`boutique-star-${index}`}
                size={9}
                fill={ratingValue && index < Math.round(ratingValue) ? 'currentColor' : 'none'}
              />
            ))}
            {reviewCount ? (
              <span className="ms-1 text-[9px] font-medium text-[#b49c94]">
                ({reviewCount})
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 flex w-full flex-col px-0.5">
          <button
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-1 rounded-full bg-[#201915] hover:bg-black text-white px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold shadow-sm transition-transform duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#201915]/40"
            title={actionLabel}
            aria-label={actionLabel}
          >
            <ShoppingCart size={13} />
            <span>{hasVariantChoices ? (isRtl ? 'اختيار المقاس والطلب' : 'Select Size & Order') : (isRtl ? 'أضف للسلة' : 'Add to Cart')}</span>
          </button>
        </div>
      </div>
    </CardShell>
  );
};
