import React from 'react';
import { Sparkles } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';

export const ButcherProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    product,
    CardShell,
    imageCandidates,
    name,
    resolvedImageLoading,
    resolvedImageFetchPriority,
    renderImageFallback,
    prefersArabicCopy,
    hasDiscount,
    hasVariantChoices,
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
  } = ctrl;

  const butcherWeightOptions = Array.from(
    new Set(
      (product.productVariants || [])
        .map((v) =>
          String(
            v.attributes?.['الوزن'] ||
              v.attributes?.weight ||
              v.attributes?.Weight ||
              v.name ||
              '',
          ).trim(),
        )
        .filter(Boolean),
    ),
  ).slice(0, 3);

  const butcherCutType =
    typeof product.category?.name === 'string' && product.category.name.trim()
      ? product.category.name.trim()
      : 'Prime Cut';
  const butcherFreshBadge = prefersArabicCopy ? 'طازج يومياً' : 'DAILY FRESH';

  return (
    <CardShell
      className="group flex h-full flex-col overflow-hidden border border-[#3f0c0d]/20 bg-[#3f0c0d] transition-all duration-700 hover:-translate-y-1 hover:border-[#c5a059]/40 hover:shadow-[0_40px_100px_-40px_rgba(63,12,13,0.6)]"
      style={{ borderRadius: '1.5rem' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1a0506]">
        <StorefrontProductImage
          candidates={imageCandidates}
          alt={name}
          loading={resolvedImageLoading}
          fetchpriority={resolvedImageFetchPriority}
          requestedWidth={560}
          responsiveWidths={[240, 320, 480, 640]}
          responsiveSizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
          imageQuality={85}
          width="400"
          height="500"
          className="h-full w-full object-cover opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
          fallback={renderImageFallback('bg-[#2a0809]')}
        />
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3f0c0d] via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-sm bg-[#c5a059] px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#3f0c0d] shadow-lg">
            {butcherFreshBadge}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[#c5a059] backdrop-blur-md">
            <Sparkles size={14} />
          </div>
        </div>

        {/* Price Floating */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-xl font-black text-[#c5a059]">{formattedPrice}</p>
            {formattedComparePrice && (
              <p className="text-xs text-white/40 line-through">{formattedComparePrice}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]/60">
            {butcherCutType}
          </span>
          <h3 className="font-heading text-lg font-black leading-tight text-white group-hover:text-[#c5a059] transition-colors">
            {name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {butcherWeightOptions.map((w) => (
            <span key={w} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-bold text-white/60">
              {w}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleAddToCart}
            className="group/btn relative h-12 w-full overflow-hidden rounded-xl border border-[#c5a059]/30 bg-transparent text-[10px] font-black uppercase tracking-[0.25em] text-[#c5a059] transition-all hover:bg-[#c5a059] hover:text-[#3f0c0d]"
          >
            <span className="relative z-10">{actionLabel}</span>
            <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform group-hover/btn:translate-x-0" />
          </button>
        </div>
      </div>
    </CardShell>
  );
};
