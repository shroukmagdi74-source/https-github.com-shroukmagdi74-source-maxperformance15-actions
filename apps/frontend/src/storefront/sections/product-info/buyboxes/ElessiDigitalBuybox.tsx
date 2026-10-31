import React from 'react';
import type { ProductInfoController } from '../productInfoTypes';
import StickyMobileCTA from '../components/StickyMobileCTA';

export interface ElessiDigitalBuyboxProps {
  ctrl: ProductInfoController;
}

export const ElessiDigitalBuybox: React.FC<ElessiDigitalBuyboxProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    displayPrice,
    specs,
    guaranteeItems,
    discount,
    stockStatusLabel,
    productTagValues,
    shortDescription,
    descriptionPreviewText,
    commonPrice,
    commonVariantSelector,
    commonActions,
    shippingTitle,
    shippingText,
    guaranteesTitle,
    guaranteesSubtitle,
    isStickyAddToCartEnabled,
    shouldRenderPrimaryBuyBox,
    externalOnlyProduct,
    isCartOpen,
    activePrice,
    currency,
    handleAddToCart,
    showStickyCta,
  } = ctrl;

  if (!product) return null;

  const commandFacts = specs.length > 0 ? specs : [];
  const digitalFacts = (
    commandFacts.length > 0
      ? commandFacts
      : [
          {
            label: prefersArabicCopy ? 'السعر الحالي' : 'Current price',
            value: displayPrice,
          },
          {
            label: prefersArabicCopy ? 'الضمان' : 'Warranty',
            value: prefersArabicCopy ? 'موضح قبل الطلب' : 'Shown before checkout',
          },
          {
            label: prefersArabicCopy ? 'الشحن' : 'Shipping',
            value: prefersArabicCopy ? '24-48 ساعة' : '24-48 hours',
          },
          {
            label: prefersArabicCopy ? 'الدعم' : 'Support',
            value:
              guaranteeItems[0]?.title?.trim() ||
              (prefersArabicCopy ? 'دعم واضح بعد الشراء' : 'Clear post-purchase support'),
          },
        ]
  ).slice(0, 4);

  const digitalSupportCards = (
    guaranteeItems.length
      ? guaranteeItems
      : [
          {
            title: prefersArabicCopy ? 'شحن سريع' : 'Fast shipping',
            description: prefersArabicCopy
              ? 'خيارات التوصيل والرسوم تظهر بوضوح قبل إغلاق الطلب.'
              : 'Delivery choices and cost stay visible before checkout closes.',
          },
          {
            title: prefersArabicCopy ? 'ضمان موثق' : 'Documented warranty',
            description: prefersArabicCopy
              ? 'مدة الضمان والدعم الفني أقرب لزر الإضافة.'
              : 'Warranty duration and support stay close to the add-to-cart action.',
          },
          {
            title: prefersArabicCopy ? 'اختيار أسهل' : 'Faster selection',
            description: prefersArabicCopy
              ? 'المواصفات والنسخ الأساسية تبقى ظاهرة طوال مسار القرار.'
              : 'Core specs and configurations remain visible throughout the decision flow.',
          },
        ]
  ).slice(0, 3);

  const digitalStatusChips = [
    discount && discount > 0
      ? prefersArabicCopy
        ? `وفر ${discount}%`
        : `Save ${discount}%`
      : null,
    stockStatusLabel,
    ...productTagValues.slice(0, 2),
  ].filter(Boolean) as string[];

  const showStickyMobileAddToCart =
    isStickyAddToCartEnabled &&
    shouldRenderPrimaryBuyBox &&
    !externalOnlyProduct &&
    !isCartOpen;

  return (
    <section className="w-full overflow-hidden px-1 py-4">
      <div className="overflow-hidden border border-[#e4e9f0] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] shadow-[0_30px_86px_-64px_rgba(15,23,42,0.18)]">
        <div className="space-y-5 px-5 py-5">
          <div className="space-y-3">
            <span className="inline-flex border border-[#dce3ec] bg-white px-3 py-1 text-[11px] font-black tracking-[0.14em] text-[#516170]">
              {prefersArabicCopy ? 'اختيار تقني موثوق' : 'Trusted tech pick'}
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[#161c26] md:text-[2.2rem]">
              {product.name}
            </h1>
            <div className="flex flex-wrap gap-2 pt-1">
              {digitalStatusChips.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="border border-[#e4e9f0] bg-[#fbfcfe] px-3 py-1.5 text-xs font-bold text-[#516170]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-[#e4e9f0] bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.08)]">
            <div className="space-y-3">
              {commonPrice}
              <p className="text-sm leading-7 text-[#536172]">
                {shortDescription || descriptionPreviewText}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {digitalFacts.map((fact, index) => (
              <div
                key={`${String(fact.label)}-${index}`}
                className="border border-[#dce3ec] bg-[#fbfcfe] px-4 py-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.08)]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a8595]">
                  {fact.label}
                </p>
                <p className="mt-2 text-sm font-black leading-6 text-[#161c26]">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          {commonVariantSelector ? (
            <div className="border border-[#e4e9f0] bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.08)]">
              {commonVariantSelector}
            </div>
          ) : null}

          <div className="border border-[#e4e9f0] bg-white p-5 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.14)]">
            {commonActions}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-[#e4e9f0] bg-[#fbfcfe] p-4">
              <p className="text-sm font-black text-[#161c26]">{shippingTitle}</p>
              <p className="mt-2 text-sm leading-7 text-[#536172]">{shippingText}</p>
            </div>

            <div className="border border-[#e4e9f0] bg-white p-4">
              <p className="text-sm font-black text-[#161c26]">{guaranteesTitle}</p>
              <p className="mt-1 text-sm leading-6 text-[#607184]">{guaranteesSubtitle}</p>
              <div className="mt-3 space-y-2">
                {digitalSupportCards.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="border border-[#edf1f6] bg-[#fbfcfe] px-3 py-3">
                    <p className="text-sm font-bold text-[#161c26]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#536172]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {specs.length > 0 ? (
            <div className="border border-[#e4e9f0] bg-[#fbfcfe] p-4">
              <p className="text-sm font-black text-[#161c26]">
                {prefersArabicCopy ? 'تفاصيل سريعة' : 'Quick details'}
              </p>
              <div className="mt-3 space-y-2">
                {specs.slice(0, 4).map((spec, index) => (
                  <div
                    key={`${spec.label}-${index}`}
                    className="flex items-start justify-between gap-3 border border-[#e4e9f0] bg-white px-3 py-3"
                  >
                    <span className="text-sm font-bold text-[#516170]">{spec.label}</span>
                    <span className="text-sm font-black text-[#161c26]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showStickyMobileAddToCart ? (
        <StickyMobileCTA
          activePrice={activePrice}
          currency={currency}
          onAddToCart={handleAddToCart}
          isVisible={showStickyCta}
          label={prefersArabicCopy ? 'ابدئي الطلب' : 'Start checkout'}
        />
      ) : null}
    </section>
  );
};
