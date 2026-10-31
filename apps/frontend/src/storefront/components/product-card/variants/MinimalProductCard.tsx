import React from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';

export const MinimalProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    CardShell,
    isClosetOs,
    closetOsSlotLabel,
    closetOsCareLabel,
    closetOsPlannerSummary,
    discountPercentage,
    imageCandidates,
    name,
    renderImageFallback,
    categoryLabel,
    FloatingIcons,
    hasVariantChoices,
    isRtl,
    formattedPrice,
    formattedComparePrice,
    features,
    handleWishlist,
    finalWishlistLabel,
    isWishlisted,
    handleAddToCart,
    actionLabel,
    handleQuickView,
    detailLabel,
    isAirlume,
    isSoleaFemme,
  } = ctrl;

  if (isClosetOs) {
    return (
      <CardShell className="group flex flex-col overflow-hidden rounded-[1.7rem] border border-[#d8cfbf] bg-[#fffbf4] p-3 shadow-[0_24px_64px_-44px_rgba(34,49,45,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_78px_-42px_rgba(34,49,45,0.28)]">
        <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-[1.35rem] border border-[#d8cfbf] bg-[linear-gradient(180deg,#f3ebdd,#e7e0d2)]">
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-3">
            <span className="inline-flex rounded-full border border-[#c8beb0] bg-[#fff9f1]/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#22312d] shadow-sm">
              {closetOsSlotLabel}
            </span>
            {discountPercentage ? (
              <span className="inline-flex rounded-full bg-[#6f8e79] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_-24px_rgba(111,142,121,0.62)]">
                -{discountPercentage}%
              </span>
            ) : null}
          </div>

          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading="lazy"
            width="300"
            height="400"
            className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
            fallback={renderImageFallback()}
          />

          <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-2 rounded-[1.15rem] border border-white/40 bg-white/82 px-3 py-2 backdrop-blur">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#22312d]">
              {categoryLabel}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#6a756f]">
              {closetOsCareLabel}
            </span>
          </div>

          <FloatingIcons />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-[#d8cfbf] bg-[#f4ecde] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4e5f59]">
              {hasVariantChoices ? (isRtl ? 'مقاسات/ألوان' : 'Size + color') : (isRtl ? 'قرار سريع' : 'Quick pick')}
            </span>
            <span className="inline-flex rounded-full border border-[#d8cfbf] bg-[#fffbf4] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4e5f59]">
              {isRtl ? 'خطة الأسبوع' : 'Week plan'}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-[1.08rem] font-black leading-7 text-[#22312d]">
              {name}
            </h3>
            <p className="text-sm leading-7 text-[#5b6762]">
              {closetOsPlannerSummary}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <div dir="ltr" className="space-y-1 font-sans">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6a756f]">
                  {isRtl ? 'سعر الخزانة' : 'Closet price'}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-[#22312d]">{formattedPrice}</p>
                  {formattedComparePrice ? (
                    <p className="text-sm text-[#7f8a84] line-through">{formattedComparePrice}</p>
                  ) : null}
                </div>
              </div>
              {features.wishlistEnabled ? (
                <button
                  onClick={handleWishlist}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                    isWishlisted
                      ? 'border-[#6f8e79] bg-[#6f8e79] text-white'
                      : 'border-[#d8cfbf] bg-[#fffbf4] text-[#22312d] hover:border-[#6f8e79] hover:text-[#6f8e79]'
                  }`}
                  title={finalWishlistLabel}
                  aria-label={finalWishlistLabel}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#22312d] px-5 py-3 text-sm font-black text-[#fff8ee] shadow-[0_18px_44px_-26px_rgba(34,49,45,0.46)] transition-all hover:-translate-y-0.5 hover:bg-[#2a3a35]"
              >
                <ShoppingCart size={16} />
                {actionLabel}
              </button>
              {features.quickViewEnabled ? (
                <button
                  onClick={handleQuickView}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8cfbf] bg-[#fffbf4] px-5 py-3 text-sm font-bold text-[#22312d] transition-colors hover:border-[#6f8e79] hover:text-[#6f8e79]"
                >
                  <Eye size={16} />
                  {detailLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell
      className={`group flex flex-col ${
        isAirlume
          ? 'rounded-[1.6rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,246,255,0.82))] p-3 shadow-[0_28px_90px_-58px_hsl(var(--primary)/0.58)] transition-all hover:-translate-y-1'
          : isSoleaFemme
            ? 'rounded-[1.5rem] border border-primary/10 bg-card/90 p-3 shadow-[0_24px_80px_-52px_hsl(var(--primary)/0.85)] transition-all hover:-translate-y-1'
            : ''
      }`}
    >
      <div
        className={`relative mb-4 aspect-[3/4] overflow-hidden ${
          isAirlume
            ? 'rounded-[1.35rem] bg-[linear-gradient(180deg,hsl(var(--secondary)/0.75),hsl(var(--muted)))]'
            : isSoleaFemme
              ? 'rounded-[1.2rem] bg-[linear-gradient(180deg,hsl(var(--secondary)),hsl(var(--muted)))]'
              : 'rounded-[calc(var(--radius)-2px)] bg-muted'
        }`}
      >
        <StorefrontProductImage
          candidates={imageCandidates}
          alt={name}
          loading="lazy"
          width="300"
          height="400"
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          fallback={renderImageFallback()}
        />
        {isSoleaFemme || isAirlume ? (
          <>
            <div
              className={`absolute inset-0 ${
                isAirlume
                  ? 'bg-[linear-gradient(180deg,transparent_38%,rgba(15,23,42,0.28)_100%)]'
                  : 'bg-[linear-gradient(180deg,transparent_45%,rgba(24,20,16,0.14)_100%)]'
              }`}
            />
            <span
              className={`absolute end-3 bottom-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur ${
                isAirlume
                  ? 'border border-white/70 bg-white/88 text-slate-950 shadow-sm'
                  : 'bg-background/90 text-foreground'
              }`}
            >
              {categoryLabel}
            </span>
          </>
        ) : null}
        {features.gridDiscountBanner && discountPercentage ? (
          <span className="absolute start-3 top-3 inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-black text-accent-foreground shadow-sm">
            -{discountPercentage}%
          </span>
        ) : null}
        <FloatingIcons />
      </div>
      <div className="flex flex-col space-y-1">
        <h3
          className={`font-sans text-foreground underline-offset-4 decoration-muted-foreground/30 ${
            isAirlume
              ? 'text-base font-black leading-6 group-hover:decoration-primary/35 group-hover:underline'
              : isSoleaFemme
                ? 'text-base font-black group-hover:decoration-primary/35 group-hover:underline'
                : 'font-medium group-hover:underline'
          }`}
        >
          {name}
        </h3>
        <div dir="ltr" className="flex items-center gap-2 font-sans text-sm">
          <p
            className={`font-semibold ${
              isAirlume || isSoleaFemme ? 'text-primary' : 'text-foreground'
            }`}
          >
            {formattedPrice}
          </p>
          {formattedComparePrice ? (
            <p className="text-muted-foreground line-through">{formattedComparePrice}</p>
          ) : null}
        </div>
        {isSoleaFemme || isAirlume ? (
          <span
            className={`pt-1 text-xs font-bold uppercase tracking-[0.2em] ${
              isAirlume ? 'text-primary/80' : 'text-muted-foreground'
            }`}
          >
            {detailLabel}
          </span>
        ) : null}
      </div>
    </CardShell>
  );
};
