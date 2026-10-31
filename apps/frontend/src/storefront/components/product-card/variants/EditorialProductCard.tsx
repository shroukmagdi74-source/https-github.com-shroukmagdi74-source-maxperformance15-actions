import React from 'react';
import { ShoppingCart, ArrowUpRight } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';

export const EditorialProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    variant,
    CardShell,
    isAirlume,
    isKhemetLuxe,
    isRtl,
    imageCandidates,
    name,
    renderImageFallback,
    featuredBadgeLabel,
    DiscountBadge,
    FloatingIcons,
    editorialEyebrow,
    shopperSummary,
    categoryLabel,
    hasVariantChoices,
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
    handleQuickView,
    detailLabel,
    discountPercentage,
    resolvedImageLoading,
    resolvedImageFetchPriority,
  } = ctrl;

  if (variant === 'editorial-bare') {
    if (isKhemetLuxe) {
      const sanitizedName = name.replace(/—/g, '·');
      return (
        <CardShell className="group relative flex h-full flex-col bg-transparent p-0 text-card-foreground transition-transform duration-200 hover:-translate-y-0.5">
          {discountPercentage ? (
            <span className="absolute start-3 top-3 z-20 inline-flex rounded-full bg-[#090b0e] border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm tabular-nums font-mono">
              -{discountPercentage}%
            </span>
          ) : null}

          <div className="overflow-hidden bg-[#f8f7f6] rounded-sm">
            <div className="aspect-square overflow-hidden">
              <StorefrontProductImage
                candidates={imageCandidates}
                alt={sanitizedName}
                loading={resolvedImageLoading}
                fetchpriority={resolvedImageFetchPriority}
                requestedWidth={520}
                responsiveWidths={[240, 320, 420, 520]}
                responsiveSizes="(max-width: 767px) 68vw, (max-width: 1279px) 28vw, 20vw"
                imageQuality={80}
                width="520"
                height="520"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                fallback={renderImageFallback('bg-[#f8f7f6]')}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col px-3.5 pb-3 pt-3.5 text-start">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {categoryLabel}
            </span>
            <h3 className="mt-1 line-clamp-1 font-heading text-[0.95rem] font-bold leading-6 text-[#121214]">
              {sanitizedName}
            </h3>
            <div dir="ltr" className="mt-2 flex items-baseline gap-2 font-sans leading-tight">
              {formattedComparePrice ? (
                <span className="text-xs text-neutral-400 line-through tabular-nums font-mono">
                  {formattedComparePrice}
                </span>
              ) : null}
              <span className="text-[1.05rem] font-bold text-[#090b0e] tabular-nums font-mono tracking-tight">
                {formattedPrice}
              </span>
            </div>

            <div className="mt-3 flex w-full flex-col pt-1">
              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#090b0e] hover:bg-black text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-transform duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-black/40"
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
    }

    return (
      <CardShell className="group relative flex h-full flex-col bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-0.5">
        {discountPercentage ? (
          <span className="absolute start-3 top-3 z-20 inline-flex min-w-[2rem] items-center justify-center rounded-full border border-white/40 bg-[#1d3025]/88 px-2.5 py-1 text-[10px] font-black tracking-[0.16em] text-[#f6e2a6] shadow-[0_18px_34px_-24px_rgba(14,24,18,0.62)] backdrop-blur">
            -{discountPercentage}%
          </span>
        ) : null}

        <div className="relative overflow-hidden bg-[#f2eeea]">
          <div className="aspect-square overflow-hidden">
            <StorefrontProductImage
              candidates={imageCandidates}
              alt={name}
              loading={resolvedImageLoading}
              fetchpriority={resolvedImageFetchPriority}
              width="520"
              height="520"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              fallback={renderImageFallback('bg-[#ebe5df]')}
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(17,24,20,0.12))]" />
        </div>

        <div className="flex flex-1 flex-col items-center px-2 pb-1 pt-5 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a7767]">
            {categoryLabel}
          </span>
          <h3 className="mt-2 line-clamp-2 font-heading text-[1.05rem] font-semibold leading-7 text-[#1d1917]">
            {name}
          </h3>

          <div dir="ltr" className="mt-3 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 font-sans leading-tight">
            {formattedComparePrice ? (
              <span className="shrink-0 text-sm text-[#b6a79d] line-through">
                {formattedComparePrice}
              </span>
            ) : null}
            <span className="min-w-0 text-[1rem] font-semibold text-[#7b5a2f]">
              {formattedPrice}
            </span>
          </div>
        </div>
      </CardShell>
    );
  }

  // variant === 'editorial'
  return (
    <CardShell
      className={`group grid h-full overflow-hidden rounded-[1.5rem] border md:grid-cols-[1.15fr_0.85fr] ${
        isAirlume
          ? 'border-primary/10 bg-[linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--secondary)/0.22)_100%)] shadow-[0_28px_90px_-56px_hsl(var(--primary)/0.58)] transition-all duration-500 hover:-translate-y-1'
          : 'border-border bg-card'
      }`}
    >
      <div className={`relative min-h-[280px] overflow-hidden ${isAirlume ? 'bg-[radial-gradient(circle_at_top,hsl(var(--background)),hsl(var(--secondary))_78%)]' : 'bg-muted'}`}>
        <StorefrontProductImage
          candidates={imageCandidates}
          alt={name}
          loading="lazy"
          width="520"
          height="620"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          fallback={renderImageFallback()}
        />
        <div className={`absolute inset-0 ${isAirlume ? 'bg-[linear-gradient(180deg,rgba(15,23,42,0.03)_0%,rgba(15,23,42,0.18)_42%,rgba(15,23,42,0.52)_100%)]' : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'}`} />
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] backdrop-blur ${isAirlume ? 'border border-white/60 bg-white/88 text-slate-950 shadow-sm' : 'bg-white/90 text-foreground'}`}>
            {isAirlume ? 'Airlume Edit' : featuredBadgeLabel}
          </span>
          <DiscountBadge />
        </div>
        <FloatingIcons />
      </div>

      <div className={`flex flex-col justify-between gap-5 p-5 md:p-6 ${isAirlume ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.86))]' : ''}`}>
        <div className="space-y-3">
          <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            {editorialEyebrow}
          </span>
          <h3 className="line-clamp-3 font-heading text-2xl font-black leading-tight text-foreground">
            {name}
          </h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {shopperSummary}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
            <span className={`rounded-full px-3 py-1 ${isAirlume ? 'border border-primary/10 bg-white/90 text-foreground shadow-sm' : 'bg-secondary'}`}>{categoryLabel}</span>
            {hasVariantChoices ? <span className={`rounded-full px-3 py-1 ${isAirlume ? 'border border-primary/10 bg-white/90 text-foreground shadow-sm' : 'bg-secondary'}`}>{isAirlume || isRtl ? 'خيارات متاحة' : 'Options available'}</span> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div dir="ltr" className="flex items-end gap-3 font-sans">
            <p className="text-2xl font-black text-primary">{formattedPrice}</p>
            {formattedComparePrice ? (
              <p className="pb-1 text-sm text-muted-foreground line-through">{formattedComparePrice}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors ${
                isAirlume
                  ? 'bg-[linear-gradient(135deg,#0f172a_0%,hsl(var(--primary))_55%,#60a5fa_100%)] text-white shadow-[0_24px_70px_-36px_hsl(var(--primary)/0.65)] hover:opacity-95'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <ShoppingCart size={16} />
              {actionLabel}
            </button>
            <button
              onClick={handleQuickView}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors ${
                isAirlume
                  ? 'border border-primary/12 bg-white/88 text-foreground shadow-sm hover:border-primary/30 hover:text-primary'
                  : 'border border-border text-foreground hover:border-primary hover:text-primary'
              }`}
            >
              <ArrowUpRight size={16} />
              {detailLabel}
            </button>
          </div>
        </div>
      </div>
    </CardShell>
  );
};
