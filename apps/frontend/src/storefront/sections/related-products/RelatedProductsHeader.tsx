import React from 'react';
import { Link } from 'react-router-dom';

export interface RelatedProductsHeaderProps {
  isFastlyOfferWallRelated: boolean;
  fastlyCtaPath: string | null;
  title: string;
  subtitle: string;
  ctaText: string;
  isWomenFashionClosetPairings: boolean;
  isContentCentered: boolean;
  isElessiOrganicRelated: boolean;
  isElessiDigitalRelated: boolean;
  isElessiPlantRelated: boolean;
  isElessiBikeRelated: boolean;
  isElessiCompleteSet: boolean;
  isElessiMerchRail: boolean;
  isElessiDiscoveryStrip: boolean;
  isScentCircle: boolean;
  isClosetPairings: boolean;
  isCommandAlternatives: boolean;
  prefersArabicCopy: boolean;
  commandHeaderTitle: string;
  commandHeaderSubtitle: string;
  currentProductFacts: Array<{ label?: string; value?: string }>;
}

export const RelatedProductsHeader: React.FC<RelatedProductsHeaderProps> = ({
  isFastlyOfferWallRelated,
  fastlyCtaPath,
  title,
  subtitle,
  ctaText,
  isWomenFashionClosetPairings,
  isContentCentered,
  isElessiOrganicRelated,
  isElessiDigitalRelated,
  isElessiPlantRelated,
  isElessiBikeRelated,
  isElessiCompleteSet,
  isElessiMerchRail,
  isElessiDiscoveryStrip,
  isScentCircle,
  isClosetPairings,
  isCommandAlternatives,
  prefersArabicCopy,
  commandHeaderTitle,
  commandHeaderSubtitle,
  currentProductFacts,
}) => {
  if (isFastlyOfferWallRelated) {
    return (
      <div className="mb-6 border-b border-[#111111] pb-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-2xl font-black tracking-tight text-[#111111]">
            {title}
          </h2>
          {fastlyCtaPath ? (
            <Link
              to={fastlyCtaPath}
              className="text-lg font-semibold text-[#111111] transition-colors hover:text-[#555555]"
            >
              {ctaText}
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isWomenFashionClosetPairings ? 'mb-5 space-y-1.5 sm:mb-8 sm:space-y-2' : 'mb-8 space-y-2'} ${
        isContentCentered ? 'mx-auto max-w-3xl text-center' : ''
      } ${
        isElessiOrganicRelated
          ? 'border-b border-[#eadfcd] pb-5'
          : isElessiDigitalRelated
          ? 'border-b border-[#e4e9f0] pb-5'
          : isElessiPlantRelated
          ? 'border-b border-[#d8e6d8] pb-5'
          : isElessiBikeRelated
          ? 'border-b border-[#e3e7eb] pb-5'
          : isElessiCompleteSet
          ? 'border-b border-[#ead8ca] pb-5'
          : isElessiMerchRail || isElessiDiscoveryStrip
          ? 'rounded-[1.8rem] border border-[#ead8ca] bg-white/92 px-5 py-5 shadow-[0_24px_70px_-58px_rgba(91,57,40,0.14)]'
          : isScentCircle
          ? 'rounded-[1.8rem] border border-[#eadfd7] bg-white/90 px-5 py-5 shadow-[0_24px_70px_-58px_rgba(61,41,44,0.14)]'
          : isClosetPairings
          ? isWomenFashionClosetPairings
            ? 'rounded-[1.35rem] border border-[#ead9d8] bg-white/88 px-4 py-4 shadow-[0_18px_50px_-44px_rgba(107,33,49,0.14)] sm:rounded-[1.8rem] sm:px-5 sm:py-5'
            : 'rounded-[1.8rem] border border-[#ead9d8] bg-white/88 px-5 py-5 shadow-[0_24px_70px_-58px_rgba(107,33,49,0.18)]'
          : isCommandAlternatives
          ? 'rounded-[1.9rem] border border-[#dce4ef] bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)] px-5 py-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.16)]'
          : ''
      }`}
    >
      {isElessiOrganicRelated ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfcd] bg-white px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#8a6546] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#d39c4d]" />
          من نفس الحصاد
        </span>
      ) : isElessiPlantRelated ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#d8e6d8] bg-white px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#6b8a74] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#6b8a74]" />
          Grow together
        </span>
      ) : isElessiBikeRelated ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#d9dee4] bg-[#f8fafb] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#516170] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#d97706]" />
          Ride essentials
        </span>
      ) : isElessiMerchRail ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#ead8ca] bg-[#fff7f1] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#8f5c44] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#8f5c44]" />
          {prefersArabicCopy ? 'اختيارات تكمل الطلب' : 'Complete your order'}
        </span>
      ) : isElessiCompleteSet ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#ead8ca] bg-[#fff7f1] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#8f5c44] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#8f5c44]" />
          {prefersArabicCopy ? 'مجموعة متناسقة' : 'Complete set'}
        </span>
      ) : isElessiDiscoveryStrip ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#ead8ca] bg-[#fff7f1] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#8f5c44] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#8f5c44]" />
          {prefersArabicCopy ? 'اكتشافات قريبة' : 'More to discover'}
        </span>
      ) : isScentCircle ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfd7] bg-[#fff8f2] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#8b623e] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#8b623e]" />
          روائح قريبة
        </span>
      ) : isClosetPairings ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#f3c8c1] bg-[#fff3ef] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#8b3d33] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#ea580c]" />
          تنسيق قريب
        </span>
      ) : isCommandAlternatives ? (
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#f4d067] bg-[#101828] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#fff3bf] ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-[#f7b500]" />
          بدائل القرار
        </span>
      ) : null}

      <h2
        className={`font-heading text-2xl font-black tracking-tight ${
          isElessiOrganicRelated
            ? 'text-[#2d3b27]'
            : isElessiPlantRelated
            ? 'text-[#203528]'
            : isElessiMerchRail || isElessiCompleteSet || isElessiDiscoveryStrip
            ? 'text-[#2d211e]'
            : 'text-foreground'
        } ${isWomenFashionClosetPairings ? 'text-[1.35rem] sm:text-2xl' : ''}`}
      >
        {isCommandAlternatives ? commandHeaderTitle : title}
      </h2>

      <p
        className={`${
          isWomenFashionClosetPairings
            ? 'line-clamp-2 text-[12px] leading-6 sm:line-clamp-none sm:text-sm md:text-base'
            : 'text-sm leading-7 md:text-base'
        } ${
          isElessiOrganicRelated
            ? 'text-[#67705e]'
            : isElessiPlantRelated
            ? 'text-[#56715e]'
            : isElessiMerchRail || isElessiCompleteSet || isElessiDiscoveryStrip
            ? 'text-[#6f5a54]'
            : 'text-muted-foreground'
        } ${isContentCentered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}
      >
        {isCommandAlternatives ? commandHeaderSubtitle : subtitle}
      </p>

      {isElessiOrganicRelated ? (
        <div
          className={`flex flex-wrap gap-2 pt-1 ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          <span className="rounded-full border border-[#eadfcd] bg-[#fff8ef] px-3 py-1 text-xs font-bold text-[#6c5b49]">
            صناديق مكملة
          </span>
          <span className="rounded-full border border-[#eadfcd] bg-white px-3 py-1 text-xs font-bold text-[#6c5b49]">
            إضافات مطبخ
          </span>
        </div>
      ) : isElessiPlantRelated ? (
        <div
          className={`flex flex-wrap gap-2 pt-1 ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          <span className="rounded-full border border-[#d8e6d8] bg-[#f7fbf6] px-3 py-1 text-xs font-bold text-[#56715e]">
            أصص وإضافات
          </span>
          <span className="rounded-full border border-[#d8e6d8] bg-white px-3 py-1 text-xs font-bold text-[#56715e]">
            نباتات مكملة
          </span>
        </div>
      ) : isElessiMerchRail || isElessiCompleteSet || isElessiDiscoveryStrip ? (
        <div
          className={`flex flex-wrap gap-2 pt-1 ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          <span className="rounded-full border border-[#ead8ca] bg-[#fff7f1] px-3 py-1 text-xs font-bold text-[#7a5d60]">
            {isElessiCompleteSet ? 'سلة مكملة' : 'اختيارات قريبة'}
          </span>
          <span className="rounded-full border border-[#ead8ca] bg-white px-3 py-1 text-xs font-bold text-[#7a5d60]">
            {isElessiDiscoveryStrip ? 'تصفح دافئ' : 'قرار أسرع'}
          </span>
        </div>
      ) : isScentCircle ? (
        <div
          className={`flex flex-wrap gap-2 pt-1 ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          <span className="rounded-full border border-[#eadfd7] bg-[#fff8f2] px-3 py-1 text-xs font-bold text-[#7a5d60]">
            أحجام قريبة
          </span>
          <span className="rounded-full border border-[#eadfd7] bg-white px-3 py-1 text-xs font-bold text-[#7a5d60]">
            اختيارات أصلية واضحة
          </span>
        </div>
      ) : isClosetPairings ? (
        <div
          className={`flex flex-wrap gap-2 pt-1 ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          <span className="rounded-full border border-[#ead9d8] bg-[#fff8f6] px-3 py-1 text-xs font-bold text-[#7a4a46]">
            بدائل لنفس الإحساس
          </span>
          <span className="hidden rounded-full border border-[#ead9d8] bg-white px-3 py-1 text-xs font-bold text-[#7a4a46] sm:inline-flex">
            تبديل سريع قبل الحسم
          </span>
        </div>
      ) : isCommandAlternatives ? (
        <div
          className={`flex flex-wrap gap-2 pt-1 ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          {currentProductFacts.length > 0
            ? currentProductFacts.map((fact, index) => (
                <span
                  key={`${fact.label || 'fact'}-${index}`}
                  className="rounded-full border border-[#dce4ef] bg-white px-3 py-1 text-xs font-bold text-[#475569]"
                >
                  <span className="text-[#94a3b8]">{fact.label}</span>
                  {' : '}
                  <span className="text-[#0f172a]">{fact.value}</span>
                </span>
              ))
            : (
              <>
                <span className="rounded-full border border-[#dce4ef] bg-white px-3 py-1 text-xs font-bold text-[#475569]">
                  بدائل ضمن نفس الفئة
                </span>
                <span className="rounded-full border border-[#dce4ef] bg-white px-3 py-1 text-xs font-bold text-[#475569]">
                  مقارنة أسرع قبل الحسم
                </span>
              </>
            )}
        </div>
      ) : null}
    </div>
  );
};
