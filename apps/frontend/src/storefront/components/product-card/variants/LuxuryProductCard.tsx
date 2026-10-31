import React from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';

export const LuxuryProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    CardShell,
    isFakhama,
    imageCandidates,
    name,
    renderImageFallback,
    luxuryTopBadge,
    DiscountBadge,
    FloatingIcons,
    isHovered,
    categoryLabel,
    luxuryAssistLabel,
    luxurySummary,
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
  } = ctrl;

  return (
    <CardShell
      className={`group flex h-full flex-col overflow-hidden rounded-[1.35rem] border bg-card transition-all duration-500 hover:-translate-y-1.5 ${
        isFakhama
          ? 'border-primary/15 shadow-[0_22px_60px_-38px_rgba(0,0,0,0.35)] hover:shadow-[0_30px_70px_-34px_rgba(0,0,0,0.4)]'
          : 'border-border shadow-[0_18px_55px_-40px_rgba(0,0,0,0.28)] hover:shadow-[0_24px_64px_-36px_rgba(0,0,0,0.34)]'
      }`}
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))] p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] border border-white/40 bg-muted">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading="lazy"
            width="420"
            height="520"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            fallback={renderImageFallback()}
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="inline-flex rounded-full border border-white/40 bg-background/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-foreground backdrop-blur">
              {luxuryTopBadge}
            </span>
            <DiscountBadge />
          </div>
          <FloatingIcons forceVisible={isHovered} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 pt-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              {categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              <Sparkles size={12} /> {luxuryAssistLabel}
            </span>
          </div>
          <h3 className="line-clamp-2 font-heading text-lg font-black leading-7 text-foreground">
            {name}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {luxurySummary}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-border/80 pt-4">
          <div dir="ltr" className="space-y-1 font-sans">
            <p className="text-lg font-black text-primary">{formattedPrice}</p>
            {formattedComparePrice ? (
              <p className="text-xs text-muted-foreground line-through">{formattedComparePrice}</p>
            ) : null}
          </div>
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/92"
          >
            <ShoppingCart size={16} />
            {actionLabel}
          </button>
        </div>
      </div>
    </CardShell>
  );
};
