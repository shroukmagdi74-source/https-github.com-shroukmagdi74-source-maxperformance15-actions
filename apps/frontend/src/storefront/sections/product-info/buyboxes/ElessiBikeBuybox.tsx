import React from 'react';
import { Truck, MessageCircle } from 'lucide-react';
import type { ProductInfoController } from '../productInfoTypes';
import { STOREFRONT_REVIEWS_SECTION_ID } from '../productInfoHelpers';

export interface ElessiBikeBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiBikeBuybox: React.FC<ElessiBikeBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    discount,
    displayPrice,
    originalPrice,
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

  const bikeRating = typeof product.rating === 'number' ? product.rating : 0;
  const bikeReviewsCount =
    typeof product.reviewCount === 'number'
      ? product.reviewCount
      : 0;

  const bikeStatusChips = [
    discount && discount > 0
      ? prefersArabicCopy
        ? `وفر ${discount}%`
        : `Save ${discount}%`
      : prefersArabicCopy
        ? 'جاهز للشحن'
        : 'Ready to ship',
    prefersArabicCopy ? 'شحن سريع' : 'Fast shipping',
    commonVariantSelector ? (prefersArabicCopy ? 'مقاسات متعددة' : 'Multi sizes') : prefersArabicCopy ? 'اختيار سريع' : 'Quick pick',
  ];

  const bikeDecisionFacts = [
    {
      label: prefersArabicCopy ? 'الاستعمال' : 'Use case',
      value: product.category?.name || (prefersArabicCopy ? 'دراجات ومعدات' : 'Bikes & gear'),
    },
    {
      label: prefersArabicCopy ? 'التوصيل' : 'Delivery',
      value: prefersArabicCopy ? 'يظهر قبل الدفع' : 'Shown before checkout',
    },
    {
      label: prefersArabicCopy ? 'الخدمة' : 'Support',
      value:
        guaranteeItems[0]?.title?.trim() ||
        (prefersArabicCopy ? 'تركيب وضمان أقرب للشراء' : 'Assembly and warranty support'),
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
    <section className="w-full border-y border-[#e3e7eb] bg-white py-2">
      <div className="space-y-6">
        <div className="border-b border-[#e3e7eb] pb-5">
          <div className="flex flex-wrap gap-2">
            {bikeStatusChips.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="border border-[#d9dee4] bg-[#f8fafb] px-3 py-1.5 text-xs font-bold text-[#516170]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-4">
            {bikeRating ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#60717f]">
                <span className="text-[#f4b74a]">
                  {'★★★★★'.slice(0, Math.round(bikeRating))}
                </span>
                <span className="font-bold text-[#1d2a33]">
                  {bikeRating.toFixed(1)}
                </span>
                <span>
                  {prefersArabicCopy
                    ? `(${bikeReviewsCount} مراجعة)`
                    : `(${bikeReviewsCount} reviews)`}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-[#1d2a33] md:text-4xl">
                {displayPrice}
              </span>
              {originalPrice ? (
                <span className="text-base font-semibold text-[#80909f] line-through">
                  {originalPrice}
                </span>
              ) : null}
            </div>

            <p className="max-w-3xl text-sm leading-7 text-[#60717f] md:text-base">
              {shortDescription || descriptionPreviewText}
            </p>
          </div>

          {commonVariantSelector ? (
            <div className="border-b border-[#e3e7eb] pb-5">
              {commonVariantSelector}
            </div>
          ) : null}

          <div className="border-y border-[#e3e7eb] py-5">
            {commonActions}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#60717f]">
            <button
              type="button"
              onClick={openShippingModal}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#1d2a33]"
            >
              <Truck className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'الشحن والاستبدال' : 'Delivery & return'}</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToReviews}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#1d2a33]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'راجع التقييمات' : 'View reviews'}</span>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {bikeDecisionFacts.map((fact) => (
              <div key={fact.label} className="space-y-2 border-b border-[#e3e7eb] pb-3 sm:border-b-0 sm:pb-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a97a2]">
                  {fact.label}
                </p>
                <p className="text-sm font-black leading-6 text-[#1d2a33]">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 border-t border-[#e3e7eb] pt-5 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#1d2a33]">{shippingTitle}</h3>
              <p className="text-sm leading-7 text-[#60717f]">{shippingText}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#1d2a33]">{guaranteesTitle}</h3>
              {showGuarantees ? (
                <div className="space-y-3">
                  {guaranteeItems.slice(0, 3).map((item, index) => (
                    <div key={`${item.title}-${index}`} className="border-b border-[#e3e7eb] pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm font-bold text-[#1d2a33]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#60717f]">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[#60717f]">{guaranteesSubtitle}</p>
              )}
            </div>
          </div>

          {specs.length > 0 ? (
            <div className="border-t border-[#e3e7eb] pt-5">
              <p className="text-sm font-black text-[#1d2a33]">
                {prefersArabicCopy ? 'تفاصيل الدراجة' : 'Bike details'}
              </p>
              <div className="mt-3 space-y-2">
                {specs.slice(0, 4).map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className="flex items-start justify-between gap-3 border-b border-[#e3e7eb] py-2 last:border-b-0"
                  >
                    <span className="text-sm font-bold text-[#60717f]">{spec.label}</span>
                    <span className="text-sm font-black text-[#1d2a33]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-[#e3e7eb] pt-5">
            <p className="text-sm font-black text-[#1d2a33]">
              {prefersArabicCopy ? 'دفع آمن' : 'Guaranteed safe checkout'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['VISA', 'PayPal', 'Apple Pay', 'COD'].map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center border border-[#d9dee4] bg-white px-3 py-2 text-xs font-black text-[#516170]"
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

export default ElessiBikeBuybox;
