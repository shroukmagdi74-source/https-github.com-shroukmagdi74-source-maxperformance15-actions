import React from 'react';
import { Truck, MessageCircle } from 'lucide-react';
import type { ProductInfoController } from '../productInfoTypes';
import { STOREFRONT_REVIEWS_SECTION_ID } from '../productInfoHelpers';

export interface ElessiOrganicBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiOrganicBuybox: React.FC<ElessiOrganicBuyboxProps> = ({ ctrl }) => {
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

  const organicRating =
    typeof product.rating === 'number'
      ? product.rating
      : typeof product.reviewSummary?.averageRating === 'number'
        ? product.reviewSummary.averageRating
        : typeof product.reviewAverage === 'number'
          ? product.reviewAverage
          : null;

  const organicReviewsCount =
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
  const organicStatusChips = [
    discount && discount > 0
      ? prefersArabicCopy
        ? `وفر ${discount}%`
        : `Save ${discount}%`
      : null,
    ...productTagValues.slice(0, 2),
  ].filter(Boolean) as string[];

  const organicDecisionFacts = [
    {
      label: prefersArabicCopy ? 'الحجم' : 'Pack',
      value:
        selectedOptionSummary ||
        (product.productVariants && product.productVariants.length > 0
          ? prefersArabicCopy
            ? 'أكثر من عبوة متاحة'
            : 'Multiple pack sizes'
          : prefersArabicCopy
            ? 'عبوة جاهزة'
            : 'Ready pack'),
    },
    {
      label: prefersArabicCopy ? 'الطزاجة' : 'Freshness',
      value: prefersArabicCopy ? 'تجهيز سريع حسب التوفر' : 'Quick prep subject to stock',
    },
    {
      label: prefersArabicCopy ? 'التخزين' : 'Storage',
      value:
        specs[0]?.value ||
        (prefersArabicCopy ? 'يحفظ في مكان بارد أو الثلاجة حسب النوع' : 'Store in a cool place or refrigerate by product type'),
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
    <section className="w-full border-y border-[#eadfcd] bg-white py-2">
      <div className="space-y-6">
        <div className="border-b border-[#efe4d6] pb-5">
          <div className="flex flex-wrap gap-2">
            {organicStatusChips.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full border border-[#eadfcd] bg-[#fff9f2] px-3 py-1.5 text-xs font-bold text-[#6c5b49]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-4">
            {organicRating ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6c5b49]">
                <span className="text-[#d39c4d]">
                  {'★★★★★'.slice(0, Math.round(organicRating))}
                </span>
                <span className="font-bold text-[#2d3b27]">
                  {organicRating.toFixed(1)}
                </span>
                <span>
                  {prefersArabicCopy
                    ? `(${organicReviewsCount} مراجعة)`
                    : `(${organicReviewsCount} reviews)`}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-[#2d3b27] md:text-4xl">
                {displayPrice}
              </span>
              {originalPrice ? (
                <span className="text-base font-semibold text-[#8b7d6d] line-through">
                  {originalPrice}
                </span>
              ) : null}
            </div>

            <p className="max-w-3xl text-sm leading-7 text-[#67705e] md:text-base">
              {shortDescription || descriptionPreviewText}
            </p>
          </div>

          {commonVariantSelector ? (
            <div className="border-b border-[#efe4d6] pb-5">
              {commonVariantSelector}
            </div>
          ) : null}

          <div className="rounded-[1.6rem] border border-[#eadfcd] bg-[linear-gradient(180deg,#fffdf9,#f8f1e8)] p-4 shadow-[0_24px_64px_-52px_rgba(45,59,39,0.18)] md:p-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8a6546]">
                  {prefersArabicCopy ? 'اختيار الطلب' : 'Order setup'}
                </p>
                <p className="text-sm leading-7 text-[#67705e]">
                  {prefersArabicCopy
                    ? 'اختر العبوة أو الصندوق المناسب، ثم أضف المنتج أو راجع الشحن والاستبدال من نفس السطح.'
                    : 'Choose the right pack or crate, then complete the add-to-cart decision from the same surface.'}
                </p>
              </div>

              {commonActions}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {organicDecisionFacts.map((fact) => (
              <div
                key={fact.label}
                className="space-y-2 border-b border-[#efe4d6] pb-3 sm:border-b-0 sm:pb-0"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7d6d]">
                  {fact.label}
                </p>
                <p className="text-sm font-black leading-6 text-[#2d3b27]">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-[#6c5b49]">
            <button
              type="button"
              onClick={openShippingModal}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#2d3b27]"
            >
              <Truck className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'الشحن والاستبدال' : 'Delivery & Return'}</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToReviews}
              className="inline-flex items-center gap-2 font-bold transition-colors hover:text-[#2d3b27]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{prefersArabicCopy ? 'آراء العملاء' : 'Customer reviews'}</span>
            </button>
          </div>

          <div className="grid gap-5 border-t border-[#efe4d6] pt-5 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#2d3b27]">{shippingTitle}</h3>
              <p className="text-sm leading-7 text-[#67705e]">{shippingText}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#2d3b27]">{guaranteesTitle}</h3>
              {showGuarantees ? (
                <div className="space-y-3">
                  {guaranteeItems.slice(0, 3).map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="border-b border-[#efe4d6] pb-3 last:border-b-0 last:pb-0"
                    >
                      <p className="text-sm font-bold text-[#2d3b27]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#67705e]">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[#67705e]">{guaranteesSubtitle}</p>
              )}
            </div>
          </div>

          {specs.length > 0 ? (
            <div className="border-t border-[#efe4d6] pt-5">
              <p className="text-sm font-black text-[#2d3b27]">
                {prefersArabicCopy ? 'تفاصيل سريعة' : 'Quick details'}
              </p>
              <div className="mt-3 space-y-2">
                {specs.slice(0, 4).map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className="flex items-start justify-between gap-3 border-b border-[#efe4d6] py-2 last:border-b-0"
                  >
                    <span className="text-sm font-bold text-[#6c5b49]">{spec.label}</span>
                    <span className="text-sm font-black text-[#2d3b27]">{spec.value}</span>
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

export default ElessiOrganicBuybox;
