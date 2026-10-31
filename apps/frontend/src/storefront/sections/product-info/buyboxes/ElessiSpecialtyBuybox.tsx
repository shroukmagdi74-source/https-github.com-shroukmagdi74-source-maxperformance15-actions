import React from 'react';
import type { ProductInfoController } from '../productInfoTypes';
import { formatStorefrontCurrency } from '../../../utils/currency';

export interface ElessiSpecialtyBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiSpecialtyBuybox: React.FC<ElessiSpecialtyBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    discount,
    displayPrice,
    originalPrice,
    currency,
    selectedOptionSummary,
    shortDescription,
    commonVariantSelector,
    commonActions,
    shippingTitle,
    shippingText,
    guaranteesTitle,
    guaranteesSubtitle,
    guaranteeItems,
    specs,
    isElessiPetBuybox,
    isElessiWatchBuybox,
    isElessiGarageBuybox,
    handleAddToCart,
    addToCartText,
    isStickyAddToCartEnabled,
    shouldRenderPrimaryBuyBox,
    externalOnlyProduct,
    isCartOpen,
  } = ctrl;

  if (!product) return null;

  const isPetCommerce = isElessiPetBuybox;
  const isWatchCommerce = isElessiWatchBuybox;
  const isGarageCommerce = isElessiGarageBuybox;

  const productTagValues = Array.isArray(product.tags) ? product.tags : [];
  const giftStatusChips = [
    discount && discount > 0
      ? prefersArabicCopy
        ? `وفر ${discount}%`
        : `Save ${discount}%`
      : null,
    selectedOptionSummary,
    ...productTagValues.slice(0, 1),
  ].filter(Boolean) as string[];

  const giftFactCards = (
    specs.length > 0
      ? specs
      : [
          {
            label: prefersArabicCopy ? 'السعر الحالي' : 'Current price',
            value: displayPrice,
          },
          {
            label: prefersArabicCopy ? 'الشحن' : 'Shipping',
            value: prefersArabicCopy ? 'يظهر قبل الدفع' : 'Shown before checkout',
          },
          {
            label: prefersArabicCopy ? 'التخصيص' : 'Options',
            value:
              product.productVariants && product.productVariants.length > 0
                ? prefersArabicCopy
                  ? 'متاح باختيارات متعددة'
                  : 'Multiple variants available'
                : prefersArabicCopy
                  ? 'جاهز للشراء مباشرة'
                  : 'Ready for direct purchase',
          },
          {
            label: prefersArabicCopy ? 'الدعم' : 'Support',
            value:
              guaranteeItems[0]?.title?.trim() ||
              (prefersArabicCopy ? 'دعم واضح بعد الشراء' : 'Clear post-purchase support'),
          },
        ]
  ).slice(0, 4);

  const giftSupportCards = (
    guaranteeItems.length
      ? guaranteeItems
      : [
          {
            title: isPetCommerce
              ? prefersArabicCopy ? 'روتين أوضح' : 'Clearer routine'
              : isGarageCommerce
                ? prefersArabicCopy ? 'توافق أوضح' : 'Clearer fitment'
              : isWatchCommerce
                ? prefersArabicCopy ? 'مقارنة أسرع' : 'Faster comparison'
              : prefersArabicCopy ? 'تغليف مرتب' : 'Tidy packaging',
            description: prefersArabicCopy
              ? isPetCommerce
                ? 'الحجم، الوجبة، أو الاستخدام يبقون قريبين من قرار الشراء المتكرر.'
                : isGarageCommerce
                  ? 'المقاس، التوافق، ونوع الاستخدام يظلون قريبين من قرار الإضافة حتى تقل أخطاء الطلب.'
                : isWatchCommerce
                  ? 'الحجم، اللمعة، أو النسخة يبقون أمام العميل في مسار أقصر وأوضح.'
                : 'التغليف والهدية وخيارات التوصيل يبقون قريبين من قرار الشراء.'
              : isPetCommerce
                ? 'Size, meal, or usage cues stay close to the repeat-purchase decision.'
                : isGarageCommerce
                  ? 'Fitment, size, and use-case cues stay close to the add-to-cart decision to reduce ordering mistakes.'
                : isWatchCommerce
                  ? 'Size, finish, or model cues stay visible in a shorter, clearer decision path.'
                : 'Packaging, gifting, and delivery details stay close to the purchase decision.',
          },
          {
            title: prefersArabicCopy ? 'خدمة بعد الشراء' : 'After-purchase support',
            description: prefersArabicCopy
              ? 'الاستبدال والمتابعة يظلان واضحين قبل إغلاق الطلب.'
              : 'Exchange and follow-up support remain clear before checkout closes.',
          },
        ]
  ).slice(0, 3);

  const showStickyMobileAddToCart =
    isStickyAddToCartEnabled &&
    shouldRenderPrimaryBuyBox &&
    !externalOnlyProduct &&
    !isCartOpen;

  return (
    <>
      <section className="w-full px-1 py-4">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[1.9rem] border border-[#ead8ca] bg-[linear-gradient(180deg,#fffefb_0%,#f9f0e8_100%)] p-5 shadow-[0_30px_80px_-62px_rgba(91,57,40,0.22)]">
            <span className="inline-flex rounded-full border border-[#ead8ca] bg-white px-3 py-1 text-[11px] font-black tracking-[0.14em] text-[#8f5c44]">
              {isPetCommerce
                ? prefersArabicCopy ? 'روتين الشراء' : 'Routine setup'
                : isGarageCommerce
                  ? prefersArabicCopy ? 'قرار القطعة' : 'Part setup'
                : isWatchCommerce
                  ? prefersArabicCopy ? 'قرار الساعة' : 'Watch setup'
                : prefersArabicCopy ? 'اختيار الهدية' : 'Gift setup'}
            </span>
            <h2 className="mt-4 text-[2rem] font-black leading-[1.02] tracking-tight text-[#2d211e] md:text-[2.35rem]">
              {isPetCommerce
                ? prefersArabicCopy ? 'اختيارات أقرب لروتين المربي' : 'Choices closer to the pet routine'
                : isGarageCommerce
                  ? prefersArabicCopy ? 'اعرف التوافق قبل الشراء' : 'Confirm fit before checkout'
                : isWatchCommerce
                  ? prefersArabicCopy ? 'قرار شراء دافئ ومباشر' : 'A warm, direct watch decision'
                : prefersArabicCopy ? 'سلة هدية أقرب للحسم' : 'A gift setup closer to checkout'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f5a54] md:text-base">
              {shortDescription ||
                (prefersArabicCopy
                  ? 'القطعة، السعر، وخيارات الشراء يظلون أمام العميل في مسار أقصر وأهدأ حتى يقرر بسرعة.'
                  : 'The piece, price, and options stay together in a calmer, shorter purchase path.')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {giftStatusChips.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-full border border-[#ead8ca] bg-white/92 px-3 py-1.5 text-xs font-bold text-[#6b4a3c]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.65rem] border border-[#ead8ca] bg-white/96 p-5 shadow-[0_22px_60px_-48px_rgba(91,57,40,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8f5c44]">
                  {prefersArabicCopy ? 'المنتج المختار' : 'Selected item'}
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-[#2d211e]">
                  {product.name}
                </h3>
              </div>
              {selectedOptionSummary ? (
                <span className="rounded-full border border-[#ead8ca] bg-[#fffaf6] px-3 py-2 text-xs font-bold text-[#6b4a3c]">
                  {selectedOptionSummary}
                </span>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black text-[#2d211e] md:text-4xl">
                  {displayPrice}
                </span>
                {originalPrice ? (
                  <span className="text-base font-semibold text-[#8a766c] line-through">
                    {originalPrice}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {giftFactCards.map((fact, index) => (
                <div
                  key={`${String(fact.label)}-${index}`}
                  className="rounded-[1.1rem] border border-[#ead8ca] bg-[#fffaf6] px-4 py-3"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-sm font-black leading-6 text-[#2d211e]">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {commonVariantSelector ? (
            <div className="rounded-[1.65rem] border border-[#ead8ca] bg-white/96 p-5 shadow-[0_22px_60px_-48px_rgba(91,57,40,0.14)]">
              {commonVariantSelector}
            </div>
          ) : null}

          <div className="rounded-[1.65rem] border border-[#ead8ca] bg-[linear-gradient(180deg,#fffefb,#fff7f0)] p-5 shadow-[0_24px_64px_-50px_rgba(91,57,40,0.18)]">
            {commonActions}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-[1.45rem] border border-[#ead8ca] bg-[#fffaf6] p-4">
              <p className="text-sm font-black text-[#2d211e]">{shippingTitle}</p>
              <p className="mt-2 text-sm leading-7 text-[#6f5a54]">{shippingText}</p>
            </div>
            <div className="rounded-[1.45rem] border border-[#ead8ca] bg-[#fffaf6] p-4">
              <p className="text-sm font-black text-[#2d211e]">{guaranteesTitle}</p>
              <div className="mt-3 space-y-2">
                {giftSupportCards.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-[1rem] border border-[#efe0d4] bg-white/88 px-3 py-3"
                  >
                    <p className="text-sm font-bold text-[#2d211e]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#6f5a54]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {specs.length > 0 ? (
            <div className="rounded-[1.45rem] border border-[#ead8ca] bg-white/96 p-4 shadow-[0_18px_44px_-34px_rgba(91,57,40,0.12)]">
              <p className="text-sm font-black text-[#2d211e]">
                {prefersArabicCopy ? 'تفاصيل المنتج' : 'Product details'}
              </p>
              <div className="mt-3 space-y-2">
                {specs.slice(0, 4).map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className="flex items-start justify-between gap-3 rounded-[1rem] border border-[#efe0d4] bg-[#fffaf6] px-3 py-3"
                  >
                    <span className="text-sm font-bold text-[#6b4a3c]">{spec.label}</span>
                    <span className="text-sm font-black text-[#2d211e]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {showStickyMobileAddToCart ? (
        <>
          <div className="h-24 lg:hidden" aria-hidden="true" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ead8ca] bg-[rgba(255,251,247,0.96)] px-3 py-3 shadow-[0_-24px_60px_-40px_rgba(91,57,40,0.32)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-md items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                  {prefersArabicCopy ? 'السعر الحالي' : 'Current price'}
                </p>
                <p className="mt-1 text-sm font-black text-[#2d211e]">{displayPrice}</p>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-xl bg-primary px-4 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground shadow-[0_18px_44px_-26px_hsl(var(--primary)/0.48)] transition-transform hover:opacity-95 active:scale-[0.98]"
              >
                {addToCartText}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ElessiSpecialtyBuybox;
