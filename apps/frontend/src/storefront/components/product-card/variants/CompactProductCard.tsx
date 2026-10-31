import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';

export const CompactProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    CardShell,
    isDistrictMarket,
    imageCandidates,
    name,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    renderImageFallback,
    DiscountBadge,
    isZenOrganic,
    discountPercentage,
    FloatingIcons,
    categoryLabel,
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
    features,
    handleQuickView,
    finalQuickViewLabel,
  } = ctrl;

  return (
    <CardShell
      className={`group flex h-full flex-col overflow-hidden transition-all duration-300 ${
        isDistrictMarket
          ? 'rounded-[1.3rem] border border-[#ecdcd0] bg-[linear-gradient(180deg,#fffdfa,#fff8f2)] shadow-[0_22px_54px_-40px_rgba(58,34,23,0.28)] hover:-translate-y-1 hover:shadow-[0_30px_72px_-38px_rgba(58,34,23,0.34)]'
          : 'rounded-[1.1rem] border border-border/80 bg-card/95 shadow-sm hover:-translate-y-1 hover:shadow-lg'
      }`}
    >
      <div className={isDistrictMarket ? 'px-3 pt-3' : ''}>
        <div
          className={`relative overflow-hidden ${
            isDistrictMarket
              ? 'aspect-[4/4.05] rounded-[1rem] border border-[#ead9cc] bg-[linear-gradient(180deg,#fffbf7,#f3e6d9)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'
              : 'bg-muted'
          } ${isDistrictMarket ? '' : 'aspect-[4/4.6]'} `}
        >
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading={resolvedImageLoading}
            fetchpriority={resolvedImageFetchPriority}
            requestedWidth={560}
            responsiveWidths={[240, 320, 480, 640]}
            responsiveSizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 20vw"
            imageQuality={72}
            width="320"
            height="360"
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04] object-cover"
            fallback={renderImageFallback()}
          />
          {isDistrictMarket ? (
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(66,42,30,0.08))]" />
          ) : null}
          <div className="absolute start-3 top-3 flex flex-wrap gap-2">
            <DiscountBadge />
            {isZenOrganic && !discountPercentage ? (
              <span className="inline-flex rounded-full bg-[#1a3328] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                جديد
              </span>
            ) : null}
          </div>
          {!isDistrictMarket ? <FloatingIcons /> : null}
        </div>
      </div>

      <div className={`flex flex-1 flex-col gap-3 ${isDistrictMarket ? 'p-4 pt-3.5' : 'p-3.5'}`}>
        <div className="space-y-1.5">
          <span
            className={`inline-flex text-[11px] font-bold uppercase tracking-[0.18em] ${
              isDistrictMarket ? 'text-[#8c6956]' : 'text-muted-foreground'
            }`}
          >
            {categoryLabel}
          </span>
          <h3 className="line-clamp-2 text-sm font-bold leading-6 text-foreground">
            {name}
          </h3>
          <div dir="ltr" className="flex items-center gap-2 font-sans text-sm">
            <p className="font-bold text-primary">{formattedPrice}</p>
            {formattedComparePrice ? (
              <p className="text-xs text-muted-foreground line-through">{formattedComparePrice}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className={`inline-flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold transition-colors ${
              isDistrictMarket
                ? 'rounded-[1rem] bg-[linear-gradient(135deg,#ee742f,#d95d1c)] text-white shadow-[0_18px_44px_-28px_rgba(217,93,28,0.62)] hover:brightness-105'
                : 'rounded-[0.9rem] bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <ShoppingCart size={15} />
            {actionLabel}
          </button>
          {features.quickViewEnabled && !isDistrictMarket ? (
            <button
              onClick={handleQuickView}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
              title={finalQuickViewLabel}
              aria-label={finalQuickViewLabel}
            >
              <Eye size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </CardShell>
  );
};
