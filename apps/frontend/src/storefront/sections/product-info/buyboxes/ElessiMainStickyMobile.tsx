import React, { useState } from 'react';
import type { ProductInfoController } from '../productInfoTypes';
import MobileVariantSheet from '../../../components/MobileVariantSheet';
import {
  formatStorefrontCurrency,
  calculateVolumeDiscountPricing,
  getProductVolumeDiscounts,
  shouldProductInfoMobileStickyOpenVariantSheet,
} from '../productInfoHelpers';

export interface ElessiMainStickyMobileProps {
  ctrl: ProductInfoController;
}

export const ElessiMainStickyMobile: React.FC<ElessiMainStickyMobileProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    displayPrice,
    selectedOptionSummary,
    selectedVariant,
    selectedAttributes,
    setSelectedAttributes,
    variantSettings,
    quantity,
    setQuantity,
    addToCartText,
    buyNowText,
    handleAddToCart,
    handleBuyNow,
    sizeGuideText,
    canOpenSizeGuide,
    openSizeGuideModal,
    stockStatusLabel,
    currency,
    isStickyAddToCartEnabled,
    isElessiCareBuybox,
    shouldRenderPrimaryBuyBox,
    externalOnlyProduct,
    isCartOpen,
  } = ctrl;

  const [isMobileVariantSheetOpen, setIsMobileVariantSheetOpen] = useState(false);
  const [mobileVariantSheetMode, setMobileVariantSheetMode] = useState<'cart' | 'checkout'>('cart');

  if (!product) return null;

  const isKhemetLuxeTheme = true;
  const showStickyMobileAddToCart =
    isStickyAddToCartEnabled &&
    isElessiCareBuybox &&
    shouldRenderPrimaryBuyBox &&
    !externalOnlyProduct &&
    !isCartOpen;

  if (!showStickyMobileAddToCart) return null;

  const canOpenMobileVariantSheet = Boolean(product.productVariants?.length);
  const shouldOpenMobileVariantSheetFromSticky = shouldProductInfoMobileStickyOpenVariantSheet(
    canOpenMobileVariantSheet,
    Boolean(selectedVariant),
  );

  const mobileBulkDiscountSource =
    selectedVariant && getProductVolumeDiscounts(selectedVariant).length > 0
      ? getProductVolumeDiscounts(selectedVariant)
      : getProductVolumeDiscounts(product);

  const mobileBulkSavingsOffers = (() => {
    const unitPrice =
      typeof selectedVariant?.price === 'number' && Number.isFinite(selectedVariant.price)
        ? selectedVariant.price
        : Number(product.price) || 0;

    if (unitPrice <= 0) return [];

    const breakpointQuantities = Array.from(
      new Set([1, ...mobileBulkDiscountSource.map((d) => Math.max(1, d.minQuantity))]),
    )
      .sort((a, b) => a - b)
      .slice(0, 3);

    if (breakpointQuantities.length <= 1) return [];

    const nextBreakpoints = [...breakpointQuantities.slice(1), Number.POSITIVE_INFINITY];

    return breakpointQuantities.map((offerQuantity, index) => {
      const pricing = calculateVolumeDiscountPricing({
        unitPrice,
        quantity: offerQuantity,
        discounts: mobileBulkDiscountSource,
      });
      const nextBreakpoint = nextBreakpoints[index];
      const isSelected =
        quantity >= offerQuantity &&
        (Number.isFinite(nextBreakpoint) ? quantity < nextBreakpoint : true);

      return {
        id: `mobile-bulk-${offerQuantity}`,
        quantity: offerQuantity,
        label:
          offerQuantity === 1
            ? prefersArabicCopy
              ? 'قطعة 1'
              : 'BUY 1'
            : Number.isFinite(nextBreakpoint)
              ? prefersArabicCopy
                ? `${offerQuantity} قطع`
                : `BUY ${offerQuantity}`
              : prefersArabicCopy
                ? `${offerQuantity}+ قطع`
                : `BUY ${offerQuantity}+`,
        unitPriceText: prefersArabicCopy
          ? `${formatStorefrontCurrency(pricing.effectiveUnitPrice, currency)} للوحدة`
          : `${formatStorefrontCurrency(pricing.effectiveUnitPrice, currency)} each`,
        helperText:
          pricing.totalDiscount > 0
            ? prefersArabicCopy
              ? `وفري ${formatStorefrontCurrency(pricing.totalDiscount, currency)}`
              : `Save ${formatStorefrontCurrency(pricing.totalDiscount, currency)}`
            : undefined,
        isSelected,
      };
    });
  })();

  const selectedPrimaryImage = product.images?.[0] || '';

  return (
    <>
      {canOpenMobileVariantSheet ? (
        <MobileVariantSheet
          open={isMobileVariantSheetOpen}
          onOpenChange={setIsMobileVariantSheetOpen}
          mode={mobileVariantSheetMode}
          productName={product.name}
          imageUrl={selectedPrimaryImage}
          displayPrice={displayPrice}
          selectedOptionSummary={selectedOptionSummary}
          variants={product.productVariants || []}
          selectedAttributes={selectedAttributes}
          onVariantChange={setSelectedAttributes}
          variantSettings={variantSettings}
          quantity={quantity}
          onQuantityChange={setQuantity}
          primaryActionText={
            mobileVariantSheetMode === 'checkout' ? buyNowText : addToCartText
          }
          onPrimaryAction={
            mobileVariantSheetMode === 'checkout' ? handleBuyNow : handleAddToCart
          }
          sizeGuideText={sizeGuideText}
          onOpenSizeGuide={canOpenSizeGuide ? openSizeGuideModal : undefined}
          availabilityText={stockStatusLabel}
          prefersArabicCopy={prefersArabicCopy}
          bulkSavingsOffers={mobileBulkSavingsOffers}
          onSelectBulkSavingsOffer={setQuantity}
        />
      ) : null}

      <div
        className={
          isKhemetLuxeTheme
            ? 'h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden'
            : 'h-28 lg:hidden'
        }
        aria-hidden="true"
      />
      <div
        className={
          isKhemetLuxeTheme
            ? 'fixed inset-x-0 bottom-0 z-40 border-t border-[#ead8ca] bg-[rgba(255,251,247,0.96)] pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_46px_-36px_rgba(91,57,40,0.28)] backdrop-blur lg:hidden'
            : 'fixed inset-x-0 bottom-0 z-40 border-t border-[#ead8ca] bg-[rgba(255,251,247,0.96)] px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-24px_60px_-40px_rgba(91,57,40,0.32)] backdrop-blur lg:hidden'
        }
      >
        {!isKhemetLuxeTheme ? (
          <div className="mx-auto mb-2 flex max-w-md items-center justify-between gap-3 px-0.5 text-start">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black leading-5 text-[#2d211e]">
                {product.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-[#8f5c44]">
                {displayPrice}
                {selectedOptionSummary ? ` / ${selectedOptionSummary}` : ''}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#d8c3b4] bg-white px-2.5 py-1 text-[10px] font-black text-[#5f473e]">
              {prefersArabicCopy ? 'جاهز للشحن' : 'Ready'}
            </span>
          </div>
        ) : null}
        {shouldOpenMobileVariantSheetFromSticky ? (
          <div
            className={
              isKhemetLuxeTheme
                ? 'w-full'
                : 'mx-auto max-w-md overflow-hidden rounded-[1.1rem] shadow-[0_18px_44px_-30px_rgba(91,57,40,0.24)]'
            }
          >
            <div className="grid grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMobileVariantSheetMode('cart');
                  setIsMobileVariantSheetOpen(true);
                }}
                className={`${isKhemetLuxeTheme ? 'h-14 text-sm tracking-normal' : 'h-12 text-[11px] uppercase tracking-[0.18em]'} bg-primary px-4 font-black text-primary-foreground transition-opacity hover:opacity-95 active:opacity-90`}
              >
                {addToCartText}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileVariantSheetMode('checkout');
                  setIsMobileVariantSheetOpen(true);
                }}
                className={`${isKhemetLuxeTheme ? 'h-14 text-sm tracking-normal' : 'h-12 text-[11px] uppercase tracking-[0.18em]'} border-s border-white/10 bg-[#78aa00] px-4 font-black text-white transition-colors hover:bg-[#6d9a01]`}
              >
                {buyNowText}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              isKhemetLuxeTheme
                ? 'w-full'
                : 'mx-auto max-w-md overflow-hidden rounded-[1.1rem] shadow-[0_18px_44px_-30px_rgba(91,57,40,0.24)]'
            }
          >
            <div className="grid grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`${isKhemetLuxeTheme ? 'h-14 tracking-normal' : 'h-12 uppercase tracking-[0.18em]'} bg-primary px-4 text-sm font-black text-primary-foreground transition-opacity hover:opacity-95 active:opacity-90`}
              >
                {addToCartText}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className={`${isKhemetLuxeTheme ? 'h-14 tracking-normal' : 'h-12 uppercase tracking-[0.18em]'} border-s border-white/10 bg-[#78aa00] px-4 text-sm font-black text-white transition-colors hover:bg-[#6d9a01]`}
              >
                {buyNowText}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
