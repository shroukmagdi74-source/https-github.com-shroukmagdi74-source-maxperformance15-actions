import React from 'react';
import { Link } from 'react-router-dom';
import { FeaturedCollectionsController } from '../useFeaturedCollectionsController';
import {
  getCollectionImageAttributes,
  resolveTechDecisionLaneMeta,
  resolveTravelPostcardMeta,
  resolveDistrictMarketLaneNote,
  resolveDistrictMarketCellClass,
} from '../featuredCollectionsHelpers';

export const SpecializedLanesVariants: React.FC<{
  ctrl: FeaturedCollectionsController;
}> = ({ ctrl }) => {
  const {
    variant,
    collectionCards,
    theme,
    isWomenFashion,
    isDistrictMarket,
    hideCardDescriptions,
    hideCardCtas,
  } = ctrl;

  if (variant === 'fragrance-ledger') {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {collectionCards[0] ? (
          <Link
            to={collectionCards[0].href}
            className="group overflow-hidden rounded-[1.9rem] border border-[#eadfd6] bg-[linear-gradient(180deg,#fffefb,#f8f1ea)] shadow-[0_30px_90px_-68px_rgba(61,41,44,0.24)]"
          >
            <div className="relative min-h-[18rem] overflow-hidden">
              <img
                src={collectionCards[0].image}
                alt={collectionCards[0].name}
                loading="lazy"
                width="760"
                height="860"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(49,33,38,0.08)_0%,rgba(49,33,38,0.62)_100%)]" />
              <div className="absolute inset-x-5 bottom-5 space-y-3 text-white">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black tracking-[0.22em] backdrop-blur">
                  البداية الأقرب
                </span>
                <h3 className="font-heading text-[1.85rem] font-black leading-tight">
                  {collectionCards[0].name}
                </h3>
                <p className="max-w-md text-sm leading-7 text-white/82">
                  {collectionCards[0].description}
                </p>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {collectionCards.slice(1).map((collection, index) => (
            <Link
              key={collection.id}
              to={collection.href}
              className="group rounded-[1.5rem] border border-[#eadfd6] bg-white/95 p-4 shadow-[0_22px_70px_-58px_rgba(61,41,44,0.18)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_84px_-56px_rgba(61,41,44,0.24)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex rounded-full border border-[#efe2d7] bg-[#fff8f3] px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#8a5b48]">
                  {`المسار ${index + 2}`}
                </span>
                <span className="text-sm font-black text-[#312126]">←</span>
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="font-heading text-xl font-black text-[#312126]">
                  {collection.name}
                </h3>
                <p className="text-sm leading-7 text-[#6e5a57]">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'catalog-pills') {
    return (
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
        {collectionCards.map((collection) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="inline-flex shrink-0 snap-start items-center rounded-full border border-[#e5e7eb] bg-white px-4 py-2.5 text-[13px] font-medium text-[#374151] shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:border-[#111827] hover:bg-[#111827] hover:text-white sm:px-5 sm:py-3 sm:text-sm"
          >
            {collection.name}
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'pastel-category-lane') {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {collectionCards.map((collection) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group overflow-hidden rounded-[1rem] border border-[#ead8d0] bg-white shadow-[0_18px_40px_-34px_rgba(90,54,57,0.14)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f8ede8]">
              <img
                {...getCollectionImageAttributes(collection.image, {
                  widths: [320, 480, 640, 800],
                  fallbackWidth: 640,
                  sizes: '(max-width: 767px) 92vw, (max-width: 1279px) 31vw, 24vw',
                  quality: 72,
                })}
                alt={collection.name}
                loading="lazy"
                width="720"
                height="900"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(44,31,35,0.22))]" />
            </div>
            <div className="border-t border-[#ead8d0] bg-[#fff8f4] px-3 py-2.5 text-center">
              <h3 className="text-sm font-black text-[#2c2426]">
                {collection.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'retail-category-tiles') {
    return (
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {collectionCards.map((collection) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="overflow-hidden rounded-[1.15rem] border-2 border-[#111111] bg-white shadow-[0_16px_38px_-28px_rgba(17,17,17,0.14)] transition-transform hover:-translate-y-0.5"
          >
            <div className="aspect-square overflow-hidden bg-[#f8f1e5]">
              <img
                src={collection.image}
                alt={collection.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="border-t border-[#111111] bg-[#fff1c7] px-3 py-2.5 text-center">
              <p className="text-sm font-black text-[#111111]">
                {collection.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'tech-decision-lanes') {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {collectionCards.map((collection, index) => {
          const laneMeta = resolveTechDecisionLaneMeta(collection, index);

          return (
            <Link
              key={collection.id}
              to={collection.href}
              className={`group overflow-hidden rounded-[1.95rem] border border-[#d9cba8] bg-[linear-gradient(180deg,#fffef9,#f6eddc)] p-4 shadow-[0_28px_90px_-64px_rgba(31,36,44,0.24)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_110px_-68px_rgba(31,36,44,0.32)] ${
                index === 0 ? 'xl:col-span-2' : ''
              }`}
            >
              <div
                className={`grid gap-4 ${
                  index === 0
                    ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center'
                    : 'lg:grid-cols-[minmax(0,1fr)_15rem]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#1f242c]/10 bg-white/88 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#1f242c]">
                      {laneMeta.eyebrow}
                    </span>
                    <span className="inline-flex rounded-full bg-[#ffd400] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#1f242c]">
                      {laneMeta.routeLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="max-w-[16ch] font-heading text-[1.8rem] font-black tracking-tight text-[#1f242c] sm:text-[2rem]">
                      {collection.name}
                    </h3>
                    <p className="max-w-2xl text-sm leading-7 text-[#4c5563] md:text-base">
                      {collection.description}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {laneMeta.bullets.map((bullet) => (
                      <div
                        key={`${collection.id}-${bullet}`}
                        className="rounded-[1.1rem] border border-[#1f242c]/8 bg-white/78 px-3 py-3 shadow-[0_18px_36px_-34px_rgba(31,36,44,0.24)]"
                      >
                        <p className="text-[11px] font-black leading-5 text-[#1f242c]">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.3rem] border border-[#1f242c]/10 bg-[#1f242c] px-4 py-3 text-[#fff4d1] shadow-[0_24px_70px_-52px_rgba(31,36,44,0.82)]">
                    <p className="max-w-xl text-sm leading-6 text-[#fff4d1]/82">
                      {laneMeta.footer}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-black">
                      ادخل هذا المسار
                      <span className="transition-transform duration-300 group-hover:-translate-x-1">
                        ←
                      </span>
                    </span>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.55rem] border border-[#1f242c]/12 bg-[#1f242c] shadow-[0_32px_80px_-58px_rgba(31,36,44,0.82)]">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    width="520"
                    height="420"
                    className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05] ${
                      index === 0 ? 'aspect-[16/10]' : 'aspect-[4/5] lg:aspect-[5/6]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,36,44,0.04),rgba(31,36,44,0.74))]" />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] border border-white/10 bg-black/28 px-4 py-3 text-white backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffd400]">
                      {index === 0 ? 'decision lane' : `lane 0${index + 1}`}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/76">
                      {laneMeta.bullets[0]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'legacy-circle-categories') {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 md:gap-x-8">
        {collectionCards.slice(0, 4).map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group flex flex-col items-center text-center"
          >
            <div className="relative w-full max-w-[11rem] overflow-hidden rounded-full border border-[#111111]/10 bg-[#f6f6f6] shadow-[0_18px_46px_-36px_rgba(17,17,17,0.22)]">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="360"
                height="360"
                className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-[0.98rem] font-semibold tracking-tight text-[#111111] md:text-[1.08rem]">
                {collection.name}
              </h3>
              {!hideCardDescriptions ? (
                <p className="mx-auto max-w-[14rem] text-xs leading-6 text-[#6a6a6a] md:text-sm">
                  {collection.description}
                </p>
              ) : null}
            </div>
            {!hideCardCtas ? (
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#111111]">
                {index === 0 ? 'Shop now' : 'View more'}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'gallery-columns') {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
        {collectionCards.slice(0, 3).map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className="group block"
          >
            <div className="relative overflow-hidden bg-[#ebe2d8] shadow-[0_26px_60px_-52px_rgba(63,42,29,0.32)]">
              <img
                {...getCollectionImageAttributes(collection.image, {
                  widths: [320, 480, 640, 800],
                  fallbackWidth: 640,
                  sizes: '(max-width: 767px) 92vw, (max-width: 1279px) 31vw, 24vw',
                  quality: 72,
                })}
                alt={collection.name}
                loading="lazy"
                width="720"
                height="960"
                className="aspect-[3/4] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,19,0.02),rgba(19,20,19,0.14))]" />
            </div>

            <div className="space-y-3 px-1 pb-1 pt-5 text-center">
              <span className="inline-flex border-b border-[#d7ba86] pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b7452]">
                {index === 0 ? 'Runway' : index === 1 ? 'Everyday' : 'Craft'}
              </span>
              <h3 className="font-heading text-[1.45rem] font-semibold tracking-tight text-[#1f1916]">
                {collection.name}
              </h3>
              <p className="mx-auto max-w-[18rem] text-sm leading-7 text-[#6c5e54]">
                {collection.description}
              </p>
              <span className="inline-flex items-center gap-2 border-b border-[#1f1916] pb-1 text-sm font-semibold text-[#1f1916] transition-colors group-hover:border-[#8a6a3c] group-hover:text-[#8a6a3c]">
                {theme?.direction === 'rtl' ? 'ادخلي المجموعة' : 'Enter collection'}
                <span aria-hidden="true">←</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'travel-postcards') {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {collectionCards.map((collection, index) => {
          const travelMeta = resolveTravelPostcardMeta(index);

          return (
            <Link
              key={collection.id}
              to={collection.href}
              className={`group overflow-hidden rounded-[1.75rem] border border-[#dfcfbf] bg-[linear-gradient(135deg,#fffdfb_0%,#f7efe5_100%)] p-4 shadow-[0_28px_86px_-64px_rgba(96,72,52,0.26)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_102px_-60px_rgba(96,72,52,0.3)] ${
                index === 0 ? 'xl:col-span-2' : ''
              }`}
            >
              <div
                className={`grid gap-4 ${
                  index === 0
                    ? 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center'
                    : 'sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#e6d7c8] bg-white/94 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#8b654d]">
                      {travelMeta.stamp}
                    </span>
                    <span className="inline-flex rounded-full bg-[#1f3a36] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#f6ead9]">
                      {travelMeta.routeLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading text-[1.7rem] font-black tracking-tight text-[#2f251f] sm:text-[1.9rem]">
                      {collection.name}
                    </h3>
                    <p className="max-w-2xl text-sm leading-7 text-[#6e5a4c] md:text-base">
                      {collection.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#e6d7c8] bg-[#fffaf4] px-3 py-1 text-xs font-bold text-[#5b4638]">
                      {travelMeta.packingNote}
                    </span>
                    <span className="inline-flex rounded-full border border-[#d7cabd] bg-white px-3 py-1 text-xs font-bold text-[#8b654d]">
                      {index === 0 ? 'ابدئي من هذا الخط' : 'مسار جاهز'}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {travelMeta.bullets.map((bullet) => (
                      <div
                        key={`${collection.id}-${bullet}`}
                        className="rounded-[1.1rem] border border-[#eadccf] bg-white/88 px-3 py-3 shadow-[0_14px_34px_-30px_rgba(96,72,52,0.18)]"
                      >
                        <p className="text-[11px] font-black leading-5 text-[#3f3128]">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.25rem] border border-[#d9cabd] bg-[#fff9f2] px-4 py-3">
                    <p className="text-sm leading-6 text-[#5f4a3d]">
                      {travelMeta.footer}
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.45rem] border border-white/70 bg-[#eadfd3] shadow-[0_22px_60px_-46px_rgba(96,72,52,0.26)]">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    width="620"
                    height="720"
                    className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
                      index === 0 ? 'aspect-[16/11]' : 'aspect-[4/5]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,20,20,0.02),rgba(18,20,20,0.52))]" />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.15rem] border border-white/18 bg-black/28 px-4 py-3 text-white backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f6ddba]">
                      {index === 0 ? 'travel postcard' : `route 0${index + 1}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/78">
                      {travelMeta.bullets[0]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === 'occasion-ribbon') {
    if (isWomenFashion) {
      return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
          {collectionCards[0] ? (
            <Link
              to={collectionCards[0].href}
              className="group relative overflow-hidden rounded-[1.9rem] border border-[#eadcd4] bg-[linear-gradient(180deg,#fffdfb,#fff7f1)] shadow-[0_30px_90px_-66px_rgba(76,42,44,0.26)]"
            >
              <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[17rem] overflow-hidden md:min-h-[22rem]">
                  <img
                    src={collectionCards[0].image}
                    alt={collectionCards[0].name}
                    loading="lazy"
                    width="720"
                    height="820"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,16,23,0.04)_0%,rgba(21,16,23,0.58)_100%)]" />
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-[10px] font-black tracking-[0.22em] text-white backdrop-blur-md">
                      المسار الأوضح
                    </span>
                    <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[10px] font-black text-white/88 backdrop-blur-md">
                      ابدئي من هنا
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
                  <div className="space-y-3">
                    <span className="inline-flex w-fit rounded-full border border-[#ecd8d3] bg-white px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#8b3d33]">
                      المسار 01
                    </span>
                    <h3 className="font-heading text-[1.8rem] font-black leading-tight text-foreground">
                      {collectionCards[0].name}
                    </h3>
                    <p className="text-sm leading-7 text-[#6c5860] md:text-base">
                      {collectionCards[0].description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-[#eadcd4] bg-white px-3 py-1.5 text-xs font-bold text-[#5d4a52]">
                      صور حقيقية
                    </span>
                    <span className="inline-flex rounded-full border border-[#eadcd4] bg-white px-3 py-1.5 text-xs font-bold text-[#5d4a52]">
                      قرار أسرع
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-black text-primary">
                    افتحي هذا المسار
                    <span className="transition-transform duration-300 group-hover:-translate-x-1">
                      ←
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="grid gap-3">
            {collectionCards.slice(1).map((collection, index) => (
              <Link
                key={collection.id}
                to={collection.href}
                className="group grid grid-cols-[6.25rem_minmax(0,1fr)] items-center gap-3 rounded-[1.45rem] border border-[#eadcd4] bg-white/92 p-3 shadow-[0_22px_58px_-52px_rgba(76,42,44,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_66px_-50px_rgba(76,42,44,0.2)] sm:grid-cols-[7rem_minmax(0,1fr)]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.1rem] border border-[#f0dfd6] bg-[#f9efe8]">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    width="220"
                    height="220"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-[#fff1ec] px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-[#8b3d33]">
                      {`0${index + 2}`}
                    </span>
                    <span className="text-[10px] font-black tracking-[0.2em] text-[#8b3d33]">
                      {index === 0
                        ? 'لوك جاهز'
                        : index === 1
                          ? 'حذاء مناسب'
                          : 'خروجات أسهل'}
                    </span>
                  </div>
                  <h3 className="truncate font-heading text-lg font-black text-foreground">
                    {collection.name}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-6 text-[#6c5860]">
                    {collection.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {collectionCards.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className={`group overflow-hidden rounded-[1.65rem] border border-[#eadcd4] bg-[linear-gradient(180deg,#fffdfb,#fff7f1)] p-4 shadow-[0_28px_90px_-66px_rgba(76,42,44,0.26)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_100px_-62px_rgba(76,42,44,0.3)] ${
              index === 0 ? 'xl:col-span-2' : ''
            }`}
          >
            <div
              className={`grid gap-4 ${
                index === 0
                  ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center'
                  : 'sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center'
              }`}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-[#eed9ce] bg-white/92 px-3 py-1 text-[11px] font-black tracking-[0.22em] text-[#8f4d41]">
                    {index === 0 ? 'الأقرب للطلب' : `مسار ${index + 1}`}
                  </span>
                  <span className="inline-flex rounded-full bg-[#241d24] px-3 py-1 text-[11px] font-black text-white">
                    {index === 0
                      ? 'من أول نظرة'
                      : index % 2 === 0
                        ? 'مقاسات أوضح'
                        : 'لون ولوك'}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-[1.55rem] font-black tracking-tight text-foreground sm:text-[1.7rem]">
                    {collection.name}
                  </h3>
                  <p className="max-w-2xl text-sm leading-7 text-[#6c5860] md:text-base">
                    {collection.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-[#eadcd4] bg-white px-3 py-1.5 text-xs font-bold text-[#5d4a52]">
                    {index === 0 ? 'صور حقيقية' : 'ترشيح سريع'}
                  </span>
                  <span className="inline-flex rounded-full border border-[#eadcd4] bg-white px-3 py-1.5 text-xs font-bold text-[#5d4a52]">
                    {index === 0 ? 'سعر أوضح' : 'اختيار أنعم'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-black text-primary">
                  افتحي هذا المسار
                  <span className="transition-transform duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[1.4rem] border border-[#f0dfd6] bg-[#f9efe8] shadow-[0_20px_50px_-38px_rgba(76,42,44,0.24)]">
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  width="520"
                  height="420"
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
                    index === 0
                      ? 'aspect-[16/10]'
                      : 'aspect-[4/5] sm:aspect-[5/4]'
                  }`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(23,17,23,0.76))] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-white/88">
                      {theme?.direction === 'rtl'
                        ? index === 0
                          ? 'حسب المناسبة'
                          : 'جاهزة للتصفح'
                        : index === 0
                          ? 'Shop by occasion'
                          : 'Ready to browse'}
                    </span>
                    <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-black text-white backdrop-blur-md">
                      {index === 0 ? 'أسرع طريق' : 'دخول مباشر'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (isDistrictMarket && variant === 'fast-nav-grid') {
    return (
      <div className="grid grid-cols-1 overflow-hidden rounded-[1.8rem] border border-primary/10 bg-card shadow-[0_24px_72px_-58px_hsl(var(--primary)/0.28)] xl:grid-cols-2">
        {collectionCards.map((collection, index) => (
          <Link
            key={collection.id}
            to={collection.href}
            className={resolveDistrictMarketCellClass(
              index,
              collectionCards.length,
            )}
          >
            <div className="relative min-h-[8.75rem] overflow-hidden rounded-[1.35rem] border border-[#ead8cb] bg-[linear-gradient(180deg,#fffbf6,#f3e6d9)] shadow-[0_18px_40px_-30px_rgba(61,37,25,0.22)] sm:min-h-[10.5rem]">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                width="280"
                height="220"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
            </div>
            <div className="min-w-0 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  {`المسار 0${index + 1}`}
                </span>
                <span className="text-[11px] font-black text-foreground/62">
                  {index === 0
                    ? 'ابدأ من هنا'
                    : index === 1
                      ? 'للاحتياج اليومي'
                      : index === 2
                        ? 'حسم أسرع'
                        : 'تجديد خفيف'}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-[1.35rem] font-black tracking-tight text-foreground sm:text-[1.5rem]">
                  {collection.name}
                </h3>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  {collection.description}
                </p>
              </div>

              <div className="grid gap-2 text-sm leading-6 text-foreground/76">
                <div className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                  <span>
                    {resolveDistrictMarketLaneNote(collection, index)}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-black text-primary">
                ادخل هذا المسار
                <span className="text-base transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return null;
};
