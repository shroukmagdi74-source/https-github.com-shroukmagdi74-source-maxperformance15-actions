import React from 'react';
import { Heart, Plus, Eye, Star } from 'lucide-react';
import StorefrontProductImage from '../../StorefrontProductImage';
import { ProductCardController } from '../productCardTypes';
import { sanitizeProductCopy, truncateProductCopy } from '../../../utils/productCopy';

export const SpecialtyFrameProductCard: React.FC<{ ctrl: ProductCardController }> = ({ ctrl }) => {
  const {
    variant,
    product,
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
    formattedPrice,
    formattedComparePrice,
    handleAddToCart,
    actionLabel,
    categoryLabel,
    handleQuickView,
    finalQuickViewLabel,
    hasDiscount,
    hasVariantChoices,
    isRtl,
    carryCardSummary,
    carryColorOptions,
    carrySizeOptions,
    ratingValue,
    reviewCount,
  } = ctrl;

  const productDescription = sanitizeProductCopy(product.description);

  if (variant === 'plant-bare') {
    const sizeOptions = (product.productVariants || [])
      .map((productVariant) =>
        String(
          productVariant.attributes?.['الحجم'] ||
            productVariant.attributes?.['المقاس'] ||
            productVariant.attributes?.size ||
            productVariant.attributes?.Size ||
            productVariant.name ||
            '',
        ).trim(),
      )
      .filter(Boolean)
      .slice(0, 2);

    return (
      <CardShell
        className="group relative flex h-full flex-col items-stretch bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-0.5"
        style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
      >
        {discountPercentage ? (
          <span className="absolute start-0 top-0 z-20 inline-flex rounded-full bg-[#84b815] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_12px_24px_-18px_rgba(118,178,13,0.72)]">
            -{discountPercentage}%
          </span>
        ) : null}

        {features.wishlistEnabled ? (
          <button
            onClick={handleWishlist}
            className={`absolute end-0 top-0 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#95a08f] shadow-[0_10px_24px_-18px_rgba(32,53,40,0.24)] transition-all hover:scale-105 hover:text-[#203528] ${
              isWishlisted ? 'text-[#e15b67]' : ''
            }`}
            title={finalWishlistLabel}
            aria-label={finalWishlistLabel}
          >
            <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        ) : null}

        <div className="mb-5 flex aspect-square items-center justify-center overflow-hidden bg-white">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={name}
            loading={resolvedImageLoading}
            fetchpriority={resolvedImageFetchPriority}
            width="520"
            height="520"
            className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-[1.03]"
            fallback={renderImageFallback('bg-white')}
          />
        </div>

        <div className="flex flex-1 flex-col items-center text-center">
          <h3 className="line-clamp-2 font-heading text-[1.02rem] font-bold leading-7 text-[#203528]">
            {name}
          </h3>

          <div dir="ltr" className="mt-2 flex items-center gap-2 font-sans">
            {formattedComparePrice ? (
              <span className="text-sm text-[#adb4a8] line-through">
                {formattedComparePrice}
              </span>
            ) : null}
            <span className="text-[1.05rem] font-bold text-[#203528]">
              {formattedPrice}
            </span>
          </div>

          {sizeOptions.length ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {sizeOptions.map((sizeOption, index) => (
                <span
                  key={`${sizeOption}-${index}`}
                  className="inline-flex min-w-[2rem] items-center justify-center rounded-[0.35rem] border border-[#d7dfd2] px-2 py-1 text-[11px] font-medium text-[#73806f]"
                >
                  {sizeOption}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex w-full items-center justify-between gap-3">
            <button
              onClick={handleAddToCart}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7db40e] text-white shadow-[0_16px_28px_-18px_rgba(125,180,14,0.72)] transition-colors hover:bg-[#6ca10a]"
              title={actionLabel}
              aria-label={actionLabel}
            >
              <Plus size={16} />
            </button>
            <span className="text-[11px] font-medium tracking-[0.1em] text-[#9aa292]">
              {categoryLabel}
            </span>
          </div>
        </div>
      </CardShell>
    );
  }

  if (variant === 'harvest-crate') {
    const harvestSizeOptions = Array.from(
      new Set(
        (product.productVariants || [])
          .map((productVariant) =>
            String(
              productVariant.attributes?.['الحجم'] ||
                productVariant.attributes?.['العبوة'] ||
                productVariant.attributes?.size ||
                productVariant.attributes?.Size ||
                productVariant.name ||
                '',
            ).trim(),
          )
          .filter(Boolean),
      ),
    ).slice(0, 2);
    const harvestTags = (Array.isArray(product.tags) ? product.tags : [])
      .map((tag) => String(tag || '').trim())
      .filter(Boolean)
      .slice(0, 2);
    const harvestSummary = productDescription
      ? truncateProductCopy(productDescription, 84)
      : hasVariantChoices
        ? isRtl
          ? 'اختر حجم الصندوق أو العبوة ثم أضف الطلب اليومي بسرعة.'
          : 'Choose the box or pack size, then add your recurring order quickly.'
        : hasDiscount && discountPercentage
          ? isRtl
            ? `وفر ${discountPercentage}% على اختيار طازج جاهز للدخول في السلة.`
            : `Save ${discountPercentage}% on a fresh pick ready for cart.`
          : isRtl
            ? 'اختيار يومي واضح السعر والحجم قبل فتح صفحة المنتج.'
            : 'A fresh daily pick with price and size clarity before opening the PDP.';

    return (
      <CardShell className="group relative flex h-full flex-col bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-0.5">
        <div className="relative flex h-full flex-col overflow-hidden border border-[#e8dfd3] bg-white shadow-[0_20px_52px_-40px_rgba(45,59,39,0.12)] transition-shadow duration-300 group-hover:shadow-[0_28px_66px_-38px_rgba(45,59,39,0.18)]">
          {discountPercentage ? (
            <span className="absolute start-3 top-3 z-20 inline-flex items-center rounded-full bg-[#2d3b27] px-3 py-1 text-[10px] font-black tracking-[0.16em] text-white shadow-[0_14px_34px_-24px_rgba(45,59,39,0.56)]">
              -{discountPercentage}%
            </span>
          ) : null}

          {features.wishlistEnabled ? (
            <button
              onClick={handleWishlist}
              className={`absolute end-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e8dfd3] bg-white/96 text-[#7c766d] shadow-[0_14px_28px_-24px_rgba(45,59,39,0.16)] transition-colors hover:text-[#2d3b27] ${
                isWishlisted ? 'text-[#d45463]' : ''
              }`}
              title={finalWishlistLabel}
              aria-label={finalWishlistLabel}
            >
              <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          ) : null}

          <div className="border-b border-[#efe6da] bg-[#fbf7f0] p-5">
            <div className="aspect-[4/4.1] overflow-hidden">
              <StorefrontProductImage
                candidates={imageCandidates}
                alt={name}
                loading={resolvedImageLoading}
                fetchpriority={resolvedImageFetchPriority}
                width="520"
                height="540"
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                fallback={renderImageFallback('bg-[#fbf7f0]')}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-2">
              <span className="inline-flex w-fit text-[10px] font-black uppercase tracking-[0.22em] text-[#8b7d6d]">
                {categoryLabel}
              </span>
              <h3 className="line-clamp-2 font-heading text-[1.08rem] font-black leading-7 text-[#2d3b27]">
                {name}
              </h3>
              <p className="line-clamp-2 text-sm leading-6 text-[#67705e]">
                {harvestSummary}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(harvestSizeOptions.length
                ? harvestSizeOptions
                : harvestTags.length
                  ? harvestTags
                  : [hasVariantChoices ? (isRtl ? 'عبوات متعددة' : 'Multiple packs') : isRtl ? 'جاهز للطلب' : 'Ready to order']
              ).map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center rounded-full border border-[#e8dfd3] bg-[#fffaf4] px-3 py-1 text-[11px] font-bold text-[#5f5a50]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div dir="ltr" className="mt-auto flex items-center gap-2 font-sans">
              <span className="text-[1.05rem] font-black text-[#2d3b27]">
                {formattedPrice}
              </span>
              {formattedComparePrice ? (
                <span className="text-sm text-[#a79f94] line-through">
                  {formattedComparePrice}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAddToCart}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#2d3b27] px-4 text-sm font-black text-white transition-colors hover:bg-[#202a1c]"
                title={actionLabel}
                aria-label={actionLabel}
              >
                {actionLabel}
              </button>
              {features.quickViewEnabled ? (
                <button
                  onClick={handleQuickView}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e8dfd3] bg-white text-[#6c5b49] transition-colors hover:border-[#d39c4d] hover:text-[#8c5d1e]"
                  title={finalQuickViewLabel}
                  aria-label={finalQuickViewLabel}
                >
                  <Eye size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </CardShell>
    );
  }

  if (variant === 'carry-frame') {
    return (
      <CardShell className="group relative flex h-full flex-col bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-1">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[#eadfd4] bg-[linear-gradient(180deg,#f9f1ea,#f3e8de)] shadow-[0_24px_60px_-48px_rgba(61,37,25,0.26)] transition-shadow duration-300 group-hover:shadow-[0_30px_72px_-46px_rgba(61,37,25,0.32)]">
          {discountPercentage ? (
            <span className="absolute start-3 top-3 z-20 inline-flex items-center rounded-full bg-[#241815] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-24px_rgba(36,24,21,0.7)]">
              -{discountPercentage}%
            </span>
          ) : null}

          {features.wishlistEnabled ? (
            <button
              onClick={handleWishlist}
              className={`absolute end-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd4] bg-white/96 text-[#8a6b5c] shadow-[0_14px_28px_-24px_rgba(61,37,25,0.28)] transition-colors hover:text-[#241815] ${
                isWishlisted ? 'text-[#d45463]' : ''
              }`}
              title={finalWishlistLabel}
              aria-label={finalWishlistLabel}
            >
              <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          ) : null}

          <div className="aspect-[4/5] overflow-hidden p-4 sm:p-5">
            <StorefrontProductImage
              candidates={imageCandidates}
              alt={name}
              loading={resolvedImageLoading}
              fetchpriority={resolvedImageFetchPriority}
              width="520"
              height="640"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
              fallback={renderImageFallback('rounded-[1rem] bg-[#efe2d7]')}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-1 pt-4">
          <div className="space-y-2">
            <span className="inline-flex w-fit text-[10px] font-black uppercase tracking-[0.24em] text-[#9a7666]">
              {categoryLabel}
            </span>
            <h3 className="line-clamp-2 font-heading text-[1.08rem] font-black leading-7 text-[#241815]">
              {name}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-[#6f5a50]">
              {carryCardSummary}
            </p>
          </div>

          <div dir="ltr" className="flex items-center gap-2 font-sans">
            <span className="text-[1.02rem] font-black text-[#241815]">
              {formattedPrice}
            </span>
            {formattedComparePrice ? (
              <span className="text-sm text-[#af9b90] line-through">
                {formattedComparePrice}
              </span>
            ) : null}
          </div>

          {carryColorOptions.length > 0 || carrySizeOptions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {carryColorOptions.map((option, index) => (
                <span
                  key={`${option}-${index}`}
                  className="inline-flex items-center rounded-full border border-[#eadfd4] bg-white px-3 py-1 text-[11px] font-bold text-[#6f5a50]"
                >
                  {option}
                </span>
              ))}
              {carrySizeOptions.map((option, index) => (
                <span
                  key={`${option}-${index}`}
                  className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full border border-[#eadfd4] bg-[#fff8f2] px-3 py-1 text-[11px] font-bold text-[#8f5d47]"
                >
                  {option}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center gap-2 pt-2">
            <button
              onClick={handleAddToCart}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#241815] px-4 text-sm font-black text-white transition-colors hover:bg-[#3a2a25]"
              title={actionLabel}
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
            {features.quickViewEnabled ? (
              <button
                onClick={handleQuickView}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfd4] bg-white text-[#6f5a50] transition-colors hover:border-[#c9ab95] hover:text-[#241815]"
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
  }

  if (variant === 'pedal-frame') {
    const pedalFitOptions = (product.productVariants || [])
      .map((productVariant) =>
        String(
          productVariant.attributes?.['المقاس'] ||
            productVariant.attributes?.['الحجم'] ||
            productVariant.attributes?.['العجلة'] ||
            productVariant.attributes?.size ||
            productVariant.attributes?.Size ||
            productVariant.name ||
            '',
        ).trim(),
      )
      .filter(Boolean)
      .slice(0, 2);

    return (
      <CardShell className="group relative flex h-full flex-col bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-0.5">
        <div className="relative flex h-full flex-col overflow-hidden border border-[#e3e7eb] bg-white shadow-[0_18px_42px_-34px_rgba(18,34,48,0.12)] transition-shadow duration-300 group-hover:shadow-[0_26px_58px_-32px_rgba(18,34,48,0.18)]">
          {discountPercentage ? (
            <span className="absolute start-3 top-3 z-20 inline-flex items-center rounded-full bg-[#1d2a33] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-24px_rgba(18,34,48,0.56)]">
              -{discountPercentage}%
            </span>
          ) : null}

          {features.wishlistEnabled ? (
            <button
              onClick={handleWishlist}
              className={`absolute end-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e3e7eb] bg-white/96 text-[#6d7b87] shadow-[0_14px_28px_-24px_rgba(18,34,48,0.18)] transition-colors hover:text-[#1d2a33] ${
                isWishlisted ? 'text-[#d45463]' : ''
              }`}
              title={finalWishlistLabel}
              aria-label={finalWishlistLabel}
            >
              <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          ) : null}

          <div className="border-b border-[#edf1f4] bg-[#f7f9fb] p-5">
            <div className="aspect-[4/4.2] overflow-hidden">
              <StorefrontProductImage
                candidates={imageCandidates}
                alt={name}
                loading={resolvedImageLoading}
                fetchpriority={resolvedImageFetchPriority}
                width="520"
                height="560"
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                fallback={renderImageFallback('bg-[#f7f9fb]')}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-2">
              <span className="inline-flex w-fit text-[10px] font-black uppercase tracking-[0.22em] text-[#7d8894]">
                {categoryLabel}
              </span>
              <h3 className="line-clamp-2 font-heading text-[1.06rem] font-black leading-7 text-[#1d2a33]">
                {name}
              </h3>
              <p className="line-clamp-2 text-sm leading-6 text-[#60717f]">
                {carryCardSummary}
              </p>
            </div>

            {(ratingValue || reviewCount) ? (
              <div className="flex items-center gap-1.5 text-[#f4b74a]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`pedal-star-${index}`}
                    size={11}
                    fill={ratingValue && index < Math.round(ratingValue) ? 'currentColor' : 'none'}
                  />
                ))}
                {reviewCount ? (
                  <span className="ms-1 text-[10px] font-medium text-[#8a97a2]">
                    ({reviewCount})
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {(pedalFitOptions.length
                ? pedalFitOptions
                : [hasVariantChoices ? (isRtl ? 'مقاسات متعددة' : 'Multi sizes') : isRtl ? 'جاهز للرحلة' : 'Ready to ride']
              ).map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center border border-[#e3e7eb] bg-[#f8fafb] px-3 py-1 text-[11px] font-bold text-[#516170]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div dir="ltr" className="mt-auto flex items-center gap-2 font-sans">
              <span className="text-[1.02rem] font-black text-[#1d2a33]">
                {formattedPrice}
              </span>
              {formattedComparePrice ? (
                <span className="text-sm text-[#9aa6af] line-through">
                  {formattedComparePrice}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAddToCart}
                className="inline-flex h-11 flex-1 items-center justify-center bg-[#1d2a33] px-4 text-sm font-black text-white transition-colors hover:bg-[#121d24]"
                title={actionLabel}
                aria-label={actionLabel}
              >
                {actionLabel}
              </button>
              {features.quickViewEnabled ? (
                <button
                  onClick={handleQuickView}
                  className="inline-flex h-11 w-11 items-center justify-center border border-[#d9dee4] bg-white text-[#516170] transition-colors hover:border-[#d97706] hover:text-[#b45309]"
                  title={finalQuickViewLabel}
                  aria-label={finalQuickViewLabel}
                >
                  <Eye size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </CardShell>
    );
  }

  // variant === 'signal-rack'
  const signalFacts = (
    Array.isArray(product.commandFacts)
      ? (product.commandFacts as Array<{ label?: string; value?: string }>)
          .map((fact) => String(fact?.value || '').trim())
          .filter(Boolean)
      : []
  ).slice(0, 2);
  const signalOptions = Array.from(
    new Set(
      (product.productVariants || [])
        .flatMap((productVariant) => Object.values(productVariant.attributes || {}))
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  ).slice(0, 2);
  const signalTags = signalFacts.length
    ? signalFacts
    : signalOptions.length
      ? signalOptions
      : [hasVariantChoices ? (isRtl ? 'خيارات متعددة' : 'Multiple options') : isRtl ? 'جاهز للطلب' : 'Ready to order'];

  return (
    <CardShell className="group relative flex h-full flex-col bg-transparent p-0 text-card-foreground transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative flex h-full flex-col overflow-hidden border border-[#e4e9f0] bg-white shadow-[0_20px_46px_-36px_rgba(15,23,42,0.14)] transition-shadow duration-300 group-hover:shadow-[0_28px_64px_-34px_rgba(15,23,42,0.18)]">
        {discountPercentage ? (
          <span className="absolute start-3 top-3 z-20 inline-flex items-center bg-[#161c26] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-24px_rgba(15,23,42,0.46)]">
            -{discountPercentage}%
          </span>
        ) : null}

        {features.wishlistEnabled ? (
          <button
            onClick={handleWishlist}
            className={`absolute end-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center border border-[#dce3ec] bg-white/96 text-[#607184] shadow-[0_14px_28px_-24px_rgba(15,23,42,0.14)] transition-colors hover:text-[#161c26] ${
              isWishlisted ? 'text-[#d45463]' : ''
            }`}
            title={finalWishlistLabel}
            aria-label={finalWishlistLabel}
          >
            <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        ) : null}

        <div className="border-b border-[#edf1f6] bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] p-5">
          <div className="aspect-[4/3.2] overflow-hidden">
            <StorefrontProductImage
              candidates={imageCandidates}
              alt={name}
              loading={resolvedImageLoading}
              fetchpriority={resolvedImageFetchPriority}
              width="560"
              height="420"
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
              fallback={renderImageFallback('bg-[#f7f9fc]')}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-2">
            <span className="inline-flex w-fit text-[10px] font-black uppercase tracking-[0.22em] text-[#7a8595]">
              {categoryLabel}
            </span>
            <h3 className="line-clamp-2 font-heading text-[1.06rem] font-black leading-7 text-[#161c26]">
              {name}
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-[#536172]">
              {carryCardSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {signalTags.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-2 border border-[#e4e9f0] bg-[#fbfcfe] px-3 py-1 text-[11px] font-bold text-[#516170]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                {item}
              </span>
            ))}
          </div>

          {(ratingValue || reviewCount) ? (
            <div className="flex items-center gap-1.5 text-[#f4b74a]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`signal-star-${index}`}
                  size={11}
                  fill={ratingValue && index < Math.round(ratingValue) ? 'currentColor' : 'none'}
                />
              ))}
              {reviewCount ? (
                <span className="ms-1 text-[10px] font-medium text-[#8a97a2]">
                  ({reviewCount})
                </span>
              ) : null}
            </div>
          ) : null}

          <div dir="ltr" className="mt-auto flex items-center gap-2 font-sans">
            <span className="text-[1.02rem] font-black text-[#161c26]">
              {formattedPrice}
            </span>
            {formattedComparePrice ? (
              <span className="text-sm text-[#9aa6af] line-through">
                {formattedComparePrice}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="inline-flex h-11 flex-1 items-center justify-center bg-[#161c26] px-4 text-sm font-black text-white transition-colors hover:bg-[#0d1219]"
              title={actionLabel}
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
            {features.quickViewEnabled ? (
              <button
                onClick={handleQuickView}
                className="inline-flex h-11 w-11 items-center justify-center border border-[#dce3ec] bg-white text-[#607184] transition-colors hover:border-[#f59e0b] hover:text-[#b45309]"
                title={finalQuickViewLabel}
                aria-label={finalQuickViewLabel}
              >
                <Eye size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </CardShell>
  );
};
