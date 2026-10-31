import React, { useState } from 'react';
import type { ProductInfoController } from '../productInfoTypes';
import ProductDescription from '../components/ProductDescription';
import {
  STOREFRONT_PRODUCT_DESCRIPTION_ID,
  STOREFRONT_REVIEWS_SECTION_ID,
  handleQuickScroll,
} from '../productInfoHelpers';
import { CheckCircle2, Sparkles, BadgeCheck } from 'lucide-react';

export interface ElessiMainLowerPanelsProps {
  ctrl: ProductInfoController;
}

export const ElessiMainLowerPanels: React.FC<ElessiMainLowerPanelsProps> = ({ ctrl }) => {
  const {
    product,
    prefersArabicCopy,
    descriptionTitle,
    safeDescription,
    descriptionPreviewText,
  } = ctrl;

  const [elessiLowerSection, setElessiLowerSection] = useState<'details' | 'support'>('details');

  if (!product) return null;

  const reviewsTabLabel = prefersArabicCopy ? 'المراجعات' : 'Reviews';
  const featureHighlights = (Array.isArray(product['featureHighlights']) ? product['featureHighlights'] : []) as Array<{
    title: string;
    description: string;
  }>;
  const safeCheckoutItems = (Array.isArray(product['safeCheckoutItems']) ? product['safeCheckoutItems'] : []) as string[];
  const elessiMetadataRows = (Array.isArray(product['elessiMetadataRows']) ? product['elessiMetadataRows'] : []) as Array<{
    label: string;
    value: string;
  }>;

  const elessiExtendedSupportCards = [
    {
      label: prefersArabicCopy ? 'شحن سريع' : 'Fast shipping',
      title: prefersArabicCopy ? 'توصيل موثوق' : 'Reliable delivery',
      description: prefersArabicCopy
        ? 'رسوم الشحن والتوصيل تظهر بوضوح داخل المسار.'
        : 'Shipping cost and delivery details stay visible in the flow.',
    },
    {
      label: prefersArabicCopy ? 'معاينة وقياس' : 'Inspection',
      title: prefersArabicCopy ? 'اطمئنان كامل' : 'Complete peace of mind',
      description: prefersArabicCopy
        ? 'يمكنك معاينة المنتج والتأكد من الجودة قبل الاستلام.'
        : 'Inspect the item and verify quality before receiving.',
    },
    {
      label: prefersArabicCopy ? 'خدمة متميزة' : 'Dedicated service',
      title: prefersArabicCopy ? 'دعم مستمر' : 'Continuous support',
      description: prefersArabicCopy
        ? 'سياسة الاستبدال والدعم أقرب لقرار الشراء.'
        : 'Exchange policy and support stay close to the purchase decision.',
    },
  ];

  return (
    <section id="khemet-pdp-lower-panels" className="w-full px-1 pb-3 sm:pb-4">
      <div className="space-y-4 sm:space-y-5 border-t border-[#ead8ca] pt-4 sm:pt-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setElessiLowerSection('details')}
            className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-black transition-colors ${
              elessiLowerSection === 'details'
                ? 'border-[#d3b8a9] bg-[#fff8f2] text-[#2d211e]'
                : 'border-[#ead8ca] bg-white text-[#6f5a54] hover:border-[#d3b8a9] hover:bg-[#fff8f2] hover:text-[#2d211e]'
            }`}
          >
            {descriptionTitle}
          </button>
          <button
            type="button"
            onClick={() => handleQuickScroll(STOREFRONT_REVIEWS_SECTION_ID, 'start')}
            className="inline-flex items-center justify-center rounded-full border border-[#ead8ca] bg-white px-4 py-2 text-xs font-black text-[#2d211e] transition-colors hover:border-[#d3b8a9] hover:bg-[#fff8f2]"
          >
            {reviewsTabLabel}
          </button>
          <button
            type="button"
            onClick={() => setElessiLowerSection('support')}
            className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-black transition-colors ${
              elessiLowerSection === 'support'
                ? 'border-[#d3b8a9] bg-[#fff8f2] text-[#2d211e]'
                : 'border-[#ead8ca] bg-white text-[#6f5a54] hover:border-[#d3b8a9] hover:bg-[#fff8f2] hover:text-[#2d211e]'
            }`}
          >
            {prefersArabicCopy ? 'الضمان والخدمة' : 'Support & warranty'}
          </button>
        </div>

        {elessiLowerSection === 'details' ? (
          <div id={STOREFRONT_PRODUCT_DESCRIPTION_ID} className="space-y-4 border-b border-[#ead8ca] pb-5">
            <ProductDescription
              safeDescription={safeDescription}
              emptyText={descriptionPreviewText}
            />
            {featureHighlights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {featureHighlights.slice(0, 3).map((item) => (
                  <div
                    key={item.title}
                    className="space-y-2 border-s-2 border-[#ead8ca] ps-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#8f5c44]" />
                      <p className="text-sm font-black text-[#2d211e]">{item.title}</p>
                    </div>
                    <p className="text-sm leading-6 text-[#6f5a54]">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {elessiLowerSection === 'support' ? (
          <div id="khemet-pdp-support" className="space-y-4">
            {safeCheckoutItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {safeCheckoutItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ead8ca] bg-[#fffaf6] px-3 py-2 text-xs font-black text-[#5f473e]"
                  >
                    <BadgeCheck className="h-4 w-4 text-[#8f5c44]" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 border-b border-[#ead8ca] pb-5 md:grid-cols-3">
              {elessiExtendedSupportCards.map((item) => (
                <div
                  key={`${item.title}-${item.label}`}
                  className="space-y-2 border-s-2 border-[#ead8ca] ps-3"
                >
                  {item.label ? (
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                      {item.label}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#8f5c44]" />
                    <p className="text-sm font-black text-[#2d211e]">{item.title}</p>
                  </div>
                  <p className="text-sm leading-6 text-[#6f5a54]">{item.description}</p>
                </div>
              ))}
            </div>

            {elessiMetadataRows.length > 0 ? (
              <div className="space-y-3">
                <div className="divide-y divide-[#ead8ca] border-y border-[#ead8ca]">
                  {elessiMetadataRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8f5c44]">
                        {row.label}
                      </span>
                      <span className="text-sm font-medium text-[#2d211e]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};
