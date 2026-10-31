import React from 'react';
import { Truck, MessageCircle } from 'lucide-react';
import type { ProductInfoController } from '../productInfoTypes';
import { STOREFRONT_REVIEWS_SECTION_ID } from '../productInfoHelpers';

export interface ElessiPlantBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiPlantBuybox: React.FC<ElessiPlantBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
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

  const plantRating =
    typeof product.rating === 'number'
      ? product.rating
      : typeof product.reviewSummary?.averageRating === 'number'
        ? product.reviewSummary.averageRating
        : typeof product.reviewAverage === 'number'
          ? product.reviewAverage
          : null;

  const plantReviewsCount =
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
  const plantStatusChips = [
    prefersArabicCopy ? 'نبات طبيعي' : 'Natural Plant',
    ...productTagValues.slice(0, 2),
  ].filter(Boolean) as string[];

  const plantDecisionFacts = [
    {
      label: prefersArabicCopy ? 'الاختيار' : 'Selection',
      value:
        selectedOptionSummary ||
        (product.productVariants && product.productVariants.length > 0
          ? prefersArabicCopy
            ? 'متوفر بأكثر من خيار'
            : 'Multiple options available'
          : prefersArabicCopy
            ? 'جاهز للشراء مباشرة'
            : 'Ready to add'),
    },
    {
      label: prefersArabicCopy ? 'الحالة' : 'Availability',
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
    <section className="w-full border-y border-[#e7efe4] bg-white py-2">
      <div className="space-y-6">
        <div className="border-b border-[#e7efe4] pb-5">
          <div className="flex flex-wrap gap-2">
            {plantStatusChips.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-[#d8e6d8] bg-white px-3 py-1.5 text-xs font-bold text-[#43604b]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-4">
            {plantRating ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#56715e]">
                <span className="text-[#f5a623]">
                  {'★★★★★'.slice(0, Math.round(plantRating))}
                </span>
                <span className="font-bold text-[#203528]">
                  {plantRating.toFixed(1)}
                </span>
                <span>
                  {prefersArabicCopy
                    ? `(${plantReviewsCount} مراجعة)`
                    : `(${plantReviewsCount} reviews)`}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-[#203528] md:text-4xl">
                {displayPrice}
              </span>
              {originalPrice ? (
                <span className="text-base font-semibold text-[#768a7b] line-through">
                  {originalPrice}
                </span>
              ) : null}
            </div>

            <p className="max-w-3xl text-sm leading-7 text-[#56715e] md:text-base">
              {shortDescription || descriptionPreviewText}
            </p>
          </div>

          {commonVariantSelector ? (
            <div className="border-b border-[#e7efe4] pb-5">
              {commonVariantSelector}
            </div>
          ) : null}

          <div className="border-y border-[#e7efe4] py-5">
            {commonActions}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#56715e]">
            <button
              type="button"
              onClick={openShippingModal}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#203528]"
            >
              <Truck className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'الشحن والاستبدال' : 'Delivery & Return'}</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToReviews}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#203528]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'اسأل أو راجع التقييمات' : 'Ask or view reviews'}</span>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {plantDecisionFacts.map((fact) => (
              <div key={fact.label} className="space-y-2 border-b border-[#e7efe4] pb-3 sm:border-b-0 sm:pb-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#99a392]">
                  {fact.label}
                </p>
                <p className="text-sm font-black leading-6 text-[#203528]">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 border-t border-[#e7efe4] pt-5 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#203528]">{shippingTitle}</h3>
              <p className="text-sm leading-7 text-[#56715e]">{shippingText}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#203528]">{guaranteesTitle}</h3>
              {showGuarantees ? (
                <div className="space-y-3">
                  {guaranteeItems.slice(0, 3).map((item, index) => (
                    <div key={`${item.title}-${index}`} className="border-b border-[#e7efe4] pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm font-bold text-[#203528]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#56715e]">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[#56715e]">{guaranteesSubtitle}</p>
              )}
            </div>
          </div>

          {specs.length > 0 ? (
            <div className="border-t border-[#e7efe4] pt-5">
              <p className="text-sm font-black text-[#203528]">
                {prefersArabicCopy ? 'تفاصيل النبات' : 'Plant details'}
              </p>
              <div className="mt-3 space-y-2">
                {specs.slice(0, 4).map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className="flex items-start justify-between gap-3 border-b border-[#e7efe4] py-2 last:border-b-0"
                  >
                    <span className="text-sm font-bold text-[#56715e]">{spec.label}</span>
                    <span className="text-sm font-black text-[#203528]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-[#e7efe4] pt-5">
            <p className="text-sm font-black text-[#203528]">
              {prefersArabicCopy ? 'دفع آمن' : 'Guaranteed safe checkout'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['VISA', 'PayPal', 'Apple Pay', 'COD'].map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center rounded-[0.45rem] border border-[#d8e6d8] bg-white px-3 py-2 text-xs font-black text-[#43604b]"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElessiPlantBuybox;
