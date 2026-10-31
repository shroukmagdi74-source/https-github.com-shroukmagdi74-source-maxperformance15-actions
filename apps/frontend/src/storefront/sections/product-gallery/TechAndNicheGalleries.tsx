import React from 'react';
import { OptimizedGalleryImage } from './galleryHelpers';
import { GallerySwipeHandlers } from './galleryTypes';

export const MirrorCarouselGallery: React.FC<{
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
  prefersArabicCopy?: boolean;
  onOpenZoom?: () => void;
  showWomenQuickBuyOverlay?: boolean;
  womenQuickBuyPrice?: string;
  womenQuickBuyOriginalPrice?: string | null;
  womenQuickBuyDiscount?: number | null;
  womenQuickBuyRating?: number | null;
  womenQuickBuyReviews?: number;
  onJumpToBuybox?: () => void;
}> = ({
  images,
  product,
  activeIndex,
  setActiveIndex,
  swipeHandlers,
  prefersArabicCopy,
  onOpenZoom,
  showWomenQuickBuyOverlay,
  womenQuickBuyPrice,
  womenQuickBuyOriginalPrice,
  womenQuickBuyDiscount,
  womenQuickBuyRating,
  womenQuickBuyReviews,
  onJumpToBuybox,
}) => (
  <div className="space-y-3">
    <div
      className="group relative overflow-hidden rounded-[1.65rem] bg-[#fff8f4] ring-1 ring-[#ead8cf] shadow-[0_28px_90px_-72px_rgba(76,42,44,0.38)] touch-pan-y"
      {...swipeHandlers}
    >
      <OptimizedGalleryImage
        source={images[activeIndex]}
        alt={`${product?.name} mirror view`}
        fetchpriority="high"
        loading="eager"
        decoding="sync"
        mode="hero"
        responsiveSizes="(min-width: 1024px) 50vw, 100vw"
        className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        productName={product?.name}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2f232d]/30 via-[#2f232d]/6 to-transparent" />
      <button
        type="button"
        onClick={onOpenZoom}
        className={`absolute inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-[#4f3b42] shadow-[0_18px_34px_-24px_rgba(79,59,66,0.45)] backdrop-blur transition-colors hover:bg-white ${
          showWomenQuickBuyOverlay
            ? 'start-4 top-4 sm:bottom-4 sm:start-4 sm:top-auto'
            : 'bottom-4 start-4'
        }`}
        aria-label={prefersArabicCopy ? 'تكبير الصورة' : 'Zoom image'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </svg>
        <span>{prefersArabicCopy ? 'تكبير' : 'Zoom'}</span>
      </button>
      {showWomenQuickBuyOverlay ? (
        <div className="absolute inset-x-3 bottom-3 z-10 sm:hidden">
          <div className="rounded-[1.3rem] border border-white/45 bg-white/88 p-3 shadow-[0_22px_50px_-28px_rgba(63,36,50,0.45)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-[13px] font-black text-[#3f2432]">
                  {product?.name}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-black leading-none text-[#3f2432]">
                    {womenQuickBuyPrice}
                  </span>
                  {womenQuickBuyOriginalPrice ? (
                    <span className="text-[12px] font-bold text-[#8d6a66] line-through decoration-[#d7b9bf]">
                      {womenQuickBuyOriginalPrice}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
                  {womenQuickBuyDiscount ? (
                    <span className="rounded-full bg-[#3f2432] px-2.5 py-1 text-white">
                      {prefersArabicCopy ? `وفر ${womenQuickBuyDiscount}%` : `Save ${womenQuickBuyDiscount}%`}
                    </span>
                  ) : null}
                  {womenQuickBuyRating ? (
                    <span className="rounded-full border border-[#ead8cf] bg-white px-2.5 py-1 text-[#6f5a50]">
                      ★ {womenQuickBuyRating.toFixed(1)}
                      {womenQuickBuyReviews ? ` · ${womenQuickBuyReviews}` : ''}
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#ead8cf] bg-white px-2.5 py-1 text-[#6f5a50]">
                      {prefersArabicCopy ? 'صور حقيقية + طلب سريع' : 'Real photos + quick order'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onJumpToBuybox}
                className="shrink-0 rounded-[1rem] bg-[#3f2432] px-4 py-3 text-[12px] font-black text-white shadow-[0_18px_34px_-24px_rgba(63,36,50,0.55)] transition-transform active:scale-[0.98]"
              >
                {prefersArabicCopy ? 'اختاري العرض' : 'Choose offer'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {images.length > 1 ? (
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between px-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((p: number) => (p === 0 ? images.length - 1 : p - 1));
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[#4f3b42] shadow-[0_14px_28px_-18px_rgba(79,59,66,0.5)] backdrop-blur transition-colors hover:bg-white hover:text-[#d86b55]"
            aria-label={prefersArabicCopy ? 'الصورة السابقة' : 'Previous image'}
          >
            <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((p: number) => (p === images.length - 1 ? 0 : p + 1));
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[#4f3b42] shadow-[0_14px_28px_-18px_rgba(79,59,66,0.5)] backdrop-blur transition-colors hover:bg-white hover:text-[#d86b55]"
            aria-label={prefersArabicCopy ? 'الصورة التالية' : 'Next image'}
          >
            <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>

    {images.length > 1 ? (
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {images.map((img: string, i: number) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`shrink-0 overflow-hidden rounded-[1rem] ring-1 transition-all duration-300 ${
              activeIndex === i
                ? 'ring-[#d86b55] shadow-[0_12px_34px_-26px_rgba(216,107,85,0.75)]'
                : 'ring-[#ead8cf] hover:ring-[#d86b55]/55'
            }`}
            aria-label={
              prefersArabicCopy
                ? `الانتقال إلى الصورة ${i + 1}`
                : `Go to image ${i + 1}`
            }
          >
            <div className="aspect-[4/5] w-[4.8rem] bg-white sm:w-[5.4rem]">
              <OptimizedGalleryImage
                source={img}
                alt=""
                loading="lazy"
                fetchpriority="low"
                decoding="async"
                mode="thumb"
                className="h-full w-full object-cover"
                productName={product?.name}
              />
            </div>
          </button>
        ))}
      </div>
    ) : null}
  </div>
);

export const PcHubCommandGallery: React.FC<{
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
  prefersArabicCopy?: boolean;
  onOpenZoom?: () => void;
}> = ({
  images,
  product,
  activeIndex,
  setActiveIndex,
  swipeHandlers,
  prefersArabicCopy,
  onOpenZoom,
}) => {
  const hasMultipleImages = images.length > 1;
  const proofCards = Array.isArray(product?.decisionProofs)
    ? product.decisionProofs.slice(0, 3)
    : [];
  const factCards = Array.isArray(product?.commandFacts)
    ? product.commandFacts.slice(0, 4)
    : [];
  const tags = Array.isArray(product?.tags) ? product.tags.slice(0, 3) : [];
  const stageBadge =
    product?.decisionBadge ||
    (prefersArabicCopy ? 'اختيار تقني أوضح' : 'Clearer tech pick');
  const stageTitle =
    product?.decisionTitle ||
    product?.modelLabel ||
    (prefersArabicCopy ? 'لقطة أقرب للمنتج' : 'Closer product view');
  const stageDescription =
    product?.decisionDescription ||
    (prefersArabicCopy
      ? 'صور المنتج الأساسية مع نقاط مختصرة تساعدك تفهم استخدامه المناسب قبل النزول لباقي التفاصيل.'
      : 'Core product imagery with concise decision cues before you scan the rest of the page.');
  const modelLabel =
    product?.modelLabel ||
    product?.category?.name ||
    (prefersArabicCopy ? 'موديل معتمد' : 'Verified model');
  const zoomLabel = prefersArabicCopy ? 'تكبير الصورة' : 'Zoom image';
  const previousLabel = prefersArabicCopy ? 'الصورة السابقة' : 'Previous image';
  const nextLabel = prefersArabicCopy ? 'الصورة التالية' : 'Next image';

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <div
          className="group relative overflow-hidden rounded-[1.9rem] border border-[#dce4ef] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)] shadow-[0_30px_90px_-72px_rgba(15,23,42,0.34)] touch-pan-y"
          {...swipeHandlers}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,194,23,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.1),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-[#111827]/16 to-transparent" />
          <div className="pointer-events-none absolute inset-y-6 end-5 w-px bg-gradient-to-b from-transparent via-[#f7b500]/30 to-transparent" />

          <OptimizedGalleryImage
            source={images[activeIndex]}
            alt={`${product?.name} command view`}
            fetchpriority="high"
            loading="eager"
            decoding="sync"
            mode="hero"
            responsiveSizes="(min-width: 1280px) 42vw, (min-width: 1024px) 48vw, 100vw"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            productName={product?.name}
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#f4d067] bg-[#101828] px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#fff3bf] shadow-[0_10px_24px_-18px_rgba(15,23,42,0.7)]">
                {stageBadge}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/70 bg-white/88 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-[#334155] backdrop-blur-md">
                {modelLabel}
              </span>
            </div>
            {hasMultipleImages ? (
              <span className="inline-flex items-center rounded-full border border-white/70 bg-white/88 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-[#0f172a] backdrop-blur-md">
                {prefersArabicCopy
                  ? `${activeIndex + 1} / ${images.length} صور`
                  : `${activeIndex + 1} / ${images.length} views`}
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(15,23,42,0)_0%,rgba(15,23,42,0.06)_24%,rgba(15,23,42,0.78)_100%)] px-4 pb-4 pt-16 text-white sm:px-5 sm:pb-5">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-white/78 backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mt-3 max-w-[22rem] text-xl font-black leading-tight sm:text-[1.55rem]">
              {stageTitle}
            </h3>
            <p className="mt-2 max-w-[26rem] text-sm leading-6 text-white/84 sm:text-[0.95rem]">
              {stageDescription}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenZoom}
                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3.5 py-2 text-xs font-black text-white backdrop-blur-md transition-colors hover:bg-white/16"
                aria-label={zoomLabel}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6" />
                  <path d="M8 11h6" />
                </svg>
                <span>{prefersArabicCopy ? 'شاهد أقرب' : 'Zoom in'}</span>
              </button>
              {factCards[0] ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f4d067]/40 bg-[#f7b500]/16 px-3.5 py-2 text-xs font-bold text-white">
                  <span className="text-white/62">{factCards[0].label}</span>
                  <span>{factCards[0].value}</span>
                </div>
              ) : null}
            </div>
          </div>

          {hasMultipleImages ? (
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((previous: number) =>
                    previous === 0 ? images.length - 1 : previous - 1,
                  );
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/86 text-[#0f172a] shadow-[0_18px_32px_-24px_rgba(15,23,42,0.65)] backdrop-blur-md transition-colors hover:bg-white"
                aria-label={previousLabel}
              >
                <svg
                  className="rtl:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((previous: number) =>
                    previous === images.length - 1 ? 0 : previous + 1,
                  );
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/86 text-[#0f172a] shadow-[0_18px_32px_-24px_rgba(15,23,42,0.65)] backdrop-blur-md transition-colors hover:bg-white"
                aria-label={nextLabel}
              >
                <svg
                  className="rtl:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>

        {proofCards.length ? (
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {proofCards.map((proof: any, proofIndex: number) => (
              <div
                key={`${proof?.title || 'proof'}-${proofIndex}`}
                className="rounded-[1.45rem] border border-[#dce4ef] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] p-4 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)]"
              >
                <p className="text-[10px] font-black tracking-[0.24em] text-[#b57900]">
                  {proof?.label || (prefersArabicCopy ? 'ميزة مهمة' : 'Key proof')}
                </p>
                <h4 className="mt-2 text-sm font-black leading-6 text-[#0f172a]">
                  {proof?.title ||
                    (prefersArabicCopy
                      ? 'تفصيلة تدعم قرار الشراء'
                      : 'A detail that supports the buying decision')}
                </h4>
                <p className="mt-2 text-[13px] leading-6 text-[#475569]">
                  {proof?.description ||
                    (prefersArabicCopy
                      ? 'رسالة مختصرة تربط الصورة بالاستخدام الحقيقي.'
                      : 'A short cue that connects the imagery to a real use case.')}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {factCards.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {factCards.map((fact: any, factIndex: number) => (
            <div
              key={`${fact?.label || 'fact'}-${factIndex}`}
              className="rounded-[1.35rem] border border-[#dce4ef] bg-white px-4 py-3.5 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.34)]"
            >
              <p className="text-[10px] font-black tracking-[0.22em] text-[#64748b]">
                {fact?.label || (prefersArabicCopy ? 'تفصيلة' : 'Detail')}
              </p>
              <p className="mt-2 text-sm font-black leading-6 text-[#0f172a]">
                {fact?.value ||
                  (prefersArabicCopy ? 'قيمة موضحة' : 'Clear value')}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {hasMultipleImages ? (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img: string, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group shrink-0 overflow-hidden rounded-[1.15rem] border bg-white transition-all duration-300 ${
                activeIndex === index
                  ? 'border-[#f4d067] shadow-[0_18px_36px_-26px_rgba(245,181,0,0.52)]'
                  : 'border-[#dce4ef] hover:border-[#f4d067]/70'
              }`}
              aria-label={
                prefersArabicCopy
                  ? `الانتقال إلى الصورة ${index + 1}`
                  : `Go to image ${index + 1}`
              }
            >
              <div className="flex items-center gap-3 p-2.5 pe-3">
                <div className="aspect-[4/5] w-[4.4rem] overflow-hidden rounded-[0.95rem] bg-[#f4f7fb]">
                  <OptimizedGalleryImage
                    source={img}
                    alt=""
                    loading="lazy"
                    fetchpriority="low"
                    decoding="async"
                    mode="thumb"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    productName={product?.name}
                  />
                </div>
                <div className="min-w-0 text-start">
                  <p className="text-[10px] font-black tracking-[0.22em] text-[#94a3b8]">
                    {prefersArabicCopy ? `لقطة ${index + 1}` : `View ${index + 1}`}
                  </p>
                  <p className="mt-1 max-w-[9rem] truncate text-sm font-bold text-[#0f172a]">
                    {index === activeIndex
                      ? prefersArabicCopy
                        ? 'الزاوية المعروضة الآن'
                        : 'Current angle'
                      : prefersArabicCopy
                        ? 'بدّل إلى هذه الزاوية'
                        : 'Switch to this angle'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const NeonGallery: React.FC<{
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
  prefersArabicCopy?: boolean;
}> = ({
  images,
  product,
  activeIndex,
  setActiveIndex,
  swipeHandlers,
  prefersArabicCopy,
}) => (
  <div className="space-y-6">
    <div
      className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden group bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] touch-pan-y"
      {...swipeHandlers}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <OptimizedGalleryImage
        source={images[activeIndex]}
        alt={`${product?.name} main view`}
        loading="eager"
        fetchpriority="high"
        decoding="sync"
        mode="hero"
        responsiveSizes="(min-width: 1024px) 50vw, 100vw"
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        productName={product?.name}
      />

      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex gap-4 pointer-events-auto">
          <button
            onClick={() =>
              setActiveIndex((p: number) =>
                p === 0 ? images.length - 1 : p - 1,
              )
            }
            className="text-white hover:text-primary transition-colors"
            aria-label={prefersArabicCopy ? 'السابق' : 'Previous'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-white/40 text-xs font-black self-center tracking-widest">
            {activeIndex + 1} / {images.length}
          </span>
          <button
            onClick={() =>
              setActiveIndex((p: number) =>
                p === images.length - 1 ? 0 : p + 1,
              )
            }
            className="text-white hover:text-primary transition-colors"
            aria-label={prefersArabicCopy ? 'التالي' : 'Next'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <div className="bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
          Rare Edition
        </div>
      </div>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {images.map((img: string, i: number) => (
        <button
          key={i}
          onClick={() => setActiveIndex(i)}
          className={`
            w-20 h-20 lg:w-24 lg:h-24 shrink-0 rounded-2xl overflow-hidden
            border-2 transition-all duration-300 relative
            ${
              activeIndex === i
                ? 'border-primary ring-4 ring-primary/20 scale-105'
                : 'border-white/5 hover:border-primary/40'
            }
          `}
        >
          <OptimizedGalleryImage
            source={img}
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            mode="thumb"
            className="w-full h-full object-cover"
            productName={product?.name}
          />
          {activeIndex !== i && (
            <div className="absolute inset-0 bg-black/40" />
          )}
        </button>
      ))}
    </div>
  </div>
);

export const CyberShowcaseGallery: React.FC<{
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
  prefersArabicCopy?: boolean;
}> = ({
  images,
  product,
  activeIndex,
  setActiveIndex,
  swipeHandlers,
  prefersArabicCopy,
}) => {
  const previewBadge = prefersArabicCopy ? 'اختيار Cyber' : 'Cyber Select';
  const categoryLabel =
    product?.category?.name ||
    (prefersArabicCopy ? 'تجميعة سايبر' : 'Cyber Loadout');
  const frameLabel = prefersArabicCopy
    ? `لقطة ${activeIndex + 1} من ${images.length}`
    : `Frame ${activeIndex + 1} / ${images.length}`;
  const mediaLabel = prefersArabicCopy ? 'معرض المنتج' : 'Product Media';
  const previousLabel = prefersArabicCopy ? 'السابق' : 'Previous';
  const nextLabel = prefersArabicCopy ? 'التالي' : 'Next';

  return (
    <div className="space-y-5">
      <div
        className="group relative isolate aspect-square overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),rgba(5,8,16,0.98)_58%)] shadow-[0_40px_130px_-90px_rgba(34,211,238,0.7)] touch-pan-y lg:aspect-[4/5]"
        {...swipeHandlers}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),transparent_34%,transparent_66%,rgba(59,130,246,0.16))]" />
        <div className="pointer-events-none absolute -top-10 start-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 end-6 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />

        <OptimizedGalleryImage
          source={images[activeIndex]}
          alt={`${product?.name} main view`}
          loading="eager"
          fetchpriority="high"
          decoding="sync"
          mode="hero"
          responsiveSizes="(min-width: 1024px) 50vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          productName={product?.name}
          categoryLabel={categoryLabel}
          fallbackVariant="cyber"
          prefersArabicCopy={prefersArabicCopy}
        />

        <div className="absolute start-5 top-5 flex flex-wrap gap-2">
          <div className="inline-flex items-center rounded-full border border-cyan-300/30 bg-slate-950/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.18)] backdrop-blur-md">
            {previewBadge}
          </div>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
            {categoryLabel}
          </div>
        </div>

        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-[linear-gradient(180deg,transparent,rgba(3,7,18,0.86))] p-5">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/75">
                {mediaLabel}
              </p>
              <p className="text-sm font-semibold text-white/90">{frameLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveIndex((p: number) => (p === 0 ? images.length - 1 : p - 1))
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition-colors hover:border-cyan-300/45 hover:text-cyan-100"
                aria-label={previousLabel}
              >
                <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() =>
                  setActiveIndex((p: number) =>
                    p === images.length - 1 ? 0 : p + 1,
                  )
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition-colors hover:border-cyan-300/45 hover:text-cyan-100"
                aria-label={nextLabel}
              >
                <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
          {images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`group relative overflow-hidden rounded-[1.2rem] border transition-all duration-300 ${
                activeIndex === i
                  ? 'border-cyan-300/60 shadow-[0_0_40px_rgba(34,211,238,0.22)]'
                  : 'border-white/10 hover:border-cyan-300/30'
              }`}
              aria-label={
                prefersArabicCopy
                  ? `الانتقال إلى الصورة ${i + 1}`
                  : `Go to image ${i + 1}`
              }
            >
              <div className="absolute start-2 top-2 z-10 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-white/10 bg-slate-950/75 px-1.5 text-[10px] font-black text-white/80 backdrop-blur-md">
                {i + 1}
              </div>
              <div className="aspect-square bg-black/50">
                <OptimizedGalleryImage
                  source={img}
                  alt=""
                  loading="lazy"
                  fetchpriority="low"
                  decoding="async"
                  mode="thumb"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  productName={product?.name}
                  categoryLabel={categoryLabel}
                  fallbackVariant="cyber"
                  prefersArabicCopy={prefersArabicCopy}
                />
              </div>
              {activeIndex !== i ? (
                <div className="absolute inset-0 bg-slate-950/35 transition-colors group-hover:bg-slate-950/15" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const ZenGallery: React.FC<{
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
}> = ({ images, product, activeIndex, setActiveIndex, swipeHandlers }) => (
  <div className="space-y-4">
    <div
      className="relative aspect-square lg:aspect-[4/5] rounded-[var(--radius)] overflow-hidden bg-[#f1f3ee] group touch-pan-y"
      {...swipeHandlers}
    >
      <OptimizedGalleryImage
        source={images[activeIndex]}
        alt={`${product?.name} main view`}
        loading="eager"
        fetchpriority="high"
        decoding="sync"
        mode="hero"
        responsiveSizes="(min-width: 1024px) 50vw, 100vw"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        productName={product?.name}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setActiveIndex((p: number) =>
                p === 0 ? images.length - 1 : p - 1,
              )
            }
            className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1a3328] shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#88a876] hover:text-white"
          >
            <svg
              className="rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() =>
              setActiveIndex((p: number) =>
                p === images.length - 1 ? 0 : p + 1,
              )
            }
            className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1a3328] shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#88a876] hover:text-white"
          >
            <svg
              className="rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>

    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {images.map((img: string, i: number) => (
        <button
          key={i}
          onClick={() => setActiveIndex(i)}
          className={`
            w-20 h-20 lg:w-24 lg:h-24 shrink-0 rounded-xl overflow-hidden
            border-2 transition-all duration-300
            ${
              activeIndex === i
                ? 'border-[#88a876] ring-2 ring-[#88a876]/20'
                : 'border-[#e9ebe5] hover:border-[#88a876]/50'
            }
          `}
        >
          <OptimizedGalleryImage
            source={img}
            alt=""
            loading="lazy"
            fetchpriority="low"
            decoding="async"
            mode="thumb"
            className="w-full h-full object-cover"
            productName={product?.name}
          />
        </button>
      ))}
    </div>
  </div>
);
