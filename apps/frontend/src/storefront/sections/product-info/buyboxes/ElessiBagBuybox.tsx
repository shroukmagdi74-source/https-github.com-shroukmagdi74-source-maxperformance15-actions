import React from 'react';
import { Truck, MessageCircle } from 'lucide-react';
import type { ProductInfoController } from '../productInfoTypes';
import { STOREFRONT_REVIEWS_SECTION_ID } from '../productInfoHelpers';

export interface ElessiBagBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiBagBuybox: React.FC<ElessiBagBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    discount,
    displayPrice,
    originalPrice,
    selectedOptionSummary,
    shortDescription,
    descriptionPreviewText,
    commonVariantSelector,
    commonActions,
    shippingTitle,
    shippingText,
    guaranteesTitle,
    guaranteesSubtitle,
    guaranteeItems,
    showGuarantees,
    specs,
    openShippingModal,
  } = ctrl;

  if (!product) return null;

  const bagRating =
    typeof product.rating === 'number'
      ? product.rating
      : typeof product.reviewSummary?.averageRating === 'number'
        ? product.reviewSummary.averageRating
        : typeof product.reviewAverage === 'number'
          ? product.reviewAverage
          : null;

  const bagReviewsCount =
    typeof product.reviewCount === 'number'
      ? product.reviewCount
      : typeof product.reviewsCount === 'number'
        ? product.reviewsCount
        : typeof product.ratingCount === 'number'
          ? product.ratingCount
          : typeof product.reviewSummary?.totalReviews === 'number'
            ? product.reviewSummary.totalReviews
            : 0;

  const productTagValues = Array.isArray(product.tags) ? product.tags : [];
  const bagStatusChips = [
    discount && discount > 0
      ? prefersArabicCopy
        ? `وفر ${discount}%`
        : `Save ${discount}%`
      : null,
    ...productTagValues.slice(0, 2),
  ].filter(Boolean) as string[];

  const bagDecisionFacts = [
    {
      label: prefersArabicCopy ? 'الاختيار' : 'Selection',
      value:
        selectedOptionSummary ||
        (product.productVariants && product.productVariants.length > 0
          ? prefersArabicCopy
            ? 'ألوان ومقاسات متعددة'
            : 'Multiple colors and sizes'
          : prefersArabicCopy
            ? 'جاهزة للإضافة مباشرة'
            : 'Ready to add'),
    },
    {
      label: prefersArabicCopy ? 'التوفر' : 'Availability',
      value: prefersArabicCopy ? 'متاح الآن' : 'Available now',
    },
    {
      label: prefersArabicCopy ? 'التوصيل' : 'Delivery',
      value: prefersArabicCopy ? 'يظهر قبل الدفع' : 'Shown before checkout',
    },
  ];

  const handleScrollToReviews = () => {
    if (typeof document === 'undefined') return;
    const target = document.getElementById(STOREFRONT_REVIEWS_SECTION_ID);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="w-full border-y border-[#efe2d7] bg-white py-2">
      <div className="space-y-6">
        <div className="border-b border-[#efe2d7] pb-5">
          <div className="flex flex-wrap gap-2">
            {bagStatusChips.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-[#eadfd4] bg-white px-3 py-1.5 text-xs font-bold text-[#6f5a50]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-4">
            {bagRating ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6f5a50]">
                <span className="text-[#d89d35]">
                  {'★★★★★'.slice(0, Math.round(bagRating))}
                </span>
                <span className="font-bold text-[#241815]">
                  {bagRating.toFixed(1)}
                </span>
                <span>
                  {prefersArabicCopy
                    ? `(${bagReviewsCount} مراجعة)`
                    : `(${bagReviewsCount} reviews)`}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-[#241815] md:text-4xl">
                {displayPrice}
              </span>
              {originalPrice ? (
                <span className="text-base font-semibold text-[#8a766c] line-through">
                  {originalPrice}
                </span>
              ) : null}
            </div>

            <p className="max-w-3xl text-sm leading-7 text-[#6f5a50] md:text-base">
              {shortDescription || descriptionPreviewText}
            </p>
          </div>

          {commonVariantSelector ? (
            <div className="border-b border-[#efe2d7] pb-5">
              {commonVariantSelector}
            </div>
          ) : null}

          <div className="rounded-[1.6rem] border border-[#eadfd4] bg-[linear-gradient(180deg,#fffdfa,#f8f0e8)] p-4 shadow-[0_24px_64px_-52px_rgba(61,37,25,0.2)] md:p-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#9a7666]">
                  {prefersArabicCopy ? 'اختيار الشراء' : 'Purchase setup'}
                </p>
                <p className="text-sm leading-7 text-[#6f5a50]">
                  {prefersArabicCopy
                    ? 'اختَر اللون أو المقاس، ثم أكمل الإضافة أو راجع الشحن والاستبدال من نفس السطح.'
                    : 'Choose the right color or size, then complete the add-to-cart decision from the same surface.'}
                </p>
              </div>

              {commonActions}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {bagDecisionFacts.map((fact) => (
              <div
                key={fact.label}
                className="space-y-2 border-b border-[#efe2d7] pb-3 sm:border-b-0 sm:pb-0"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a7666]">
                  {fact.label}
                </p>
                <p className="text-sm font-black leading-6 text-[#241815]">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#6f5a50]">
            <button
              type="button"
              onClick={openShippingModal}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#241815]"
            >
              <Truck className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'الشحن والاستبدال' : 'Delivery & Return'}</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToReviews}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#241815]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'آراء العملاء' : 'Customer reviews'}</span>
            </button>
          </div>

          <div className="grid gap-5 border-t border-[#efe2d7] pt-5 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#241815]">{shippingTitle}</h3>
              <p className="text-sm leading-7 text-[#6f5a50]">{shippingText}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#241815]">{guaranteesTitle}</h3>
              {showGuarantees ? (
                <div className="space-y-3">
                  {guaranteeItems.slice(0, 3).map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="border-b border-[#efe2d7] pb-3 last:border-b-0 last:pb-0"
                    >
                      <p className="text-sm font-bold text-[#241815]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#6f5a50]">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[#6f5a50]">{guaranteesSubtitle}</p>
              )}
            </div>
          </div>

          {specs.length > 0 ? (
            <div className="border-t border-[#efe2d7] pt-5">
              <p className="text-sm font-black text-[#241815]">
                {prefersArabicCopy ? 'تفاصيل سريعة' : 'Quick details'}
              </p>
              <div className="mt-3 space-y-2">
                {specs.slice(0, 4).map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className="flex items-start justify-between gap-3 border-b border-[#efe2d7] py-2 last:border-b-0"
                  >
                    <span className="text-sm font-bold text-[#6f5a50]">{spec.label}</span>
                    <span className="text-sm font-black text-[#241815]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ElessiBagBuybox;
