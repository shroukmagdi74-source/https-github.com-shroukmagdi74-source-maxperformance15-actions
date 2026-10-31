import React from 'react';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { GalleryImageFallback, OptimizedGalleryImage } from './galleryHelpers';
import { GallerySwipeHandlers } from './galleryTypes';

export const GracefulGallery: React.FC<{
  images: string[];
  product?: any;
  isLoading?: boolean;
  prefersArabicCopy?: boolean;
}> = ({ images, product, isLoading, prefersArabicCopy }) => {
  if (isLoading) {
    return (
      <div className="aspect-[4/5] w-full animate-pulse rounded-[10px] bg-[#f0f0f0]" />
    );
  }

  if (!product || images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[10px] bg-[#f5f5f5]">
        <GalleryImageFallback
          productName={product?.name}
          prefersArabicCopy={prefersArabicCopy}
        />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-full">
        <div className="relative overflow-hidden rounded-[10px] bg-[#f5f5f5]">
          <StorefrontProductImage
            candidates={[images[0]!]}
            alt={product.name}
            loading="eager"
            fetchpriority="high"
            requestedWidth={1200}
            responsiveWidths={[640, 960, 1280, 1600]}
            responsiveSizes="(min-width: 1024px) 46vw, 92vw"
            imageQuality={82}
            className="aspect-[4/5] w-full object-cover"
            fallback={<div className="aspect-[4/5] w-full bg-[#eee]" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-3 md:grid-cols-2">
      {images.map((imageSrc, imageIdx) => (
        <div
          key={`${imageSrc}-${imageIdx}`}
          className="relative overflow-hidden rounded-[10px] bg-[#f5f5f5]"
        >
          <StorefrontProductImage
            candidates={[imageSrc]}
            alt={`${product.name} — image ${imageIdx + 1}`}
            loading={imageIdx === 0 ? 'eager' : 'lazy'}
            fetchpriority={imageIdx === 0 ? 'high' : undefined}
            requestedWidth={900}
            responsiveWidths={[480, 720, 960]}
            responsiveSizes="(min-width: 1024px) 23vw, 46vw"
            imageQuality={80}
            className="aspect-[4/5] w-full object-cover"
            fallback={<div className="aspect-[4/5] w-full bg-[#eee]" />}
          />
        </div>
      ))}
    </div>
  );
};

export const BoutiquePortraitStageGallery: React.FC<{
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
  const categoryLabel =
    typeof product?.category?.name === 'string' && product.category.name.trim()
      ? product.category.name.trim()
      : prefersArabicCopy
        ? 'مختارات البوتيك'
        : 'Boutique edit';
  const editorialBadge =
    typeof product?.editorialBadge === 'string' && product.editorialBadge.trim()
      ? product.editorialBadge.trim()
      : prefersArabicCopy
        ? 'اختيار روزا'
        : 'Roza select';
  const editorialNote =
    typeof product?.editorialNote === 'string' && product.editorialNote.trim()
      ? product.editorialNote.trim()
      : prefersArabicCopy
        ? 'لقطة أقرب للقماش والحركة حتى يبقى القرار هادئًا وواضحًا قبل الشراء.'
        : 'A calmer portrait stage that keeps fabric and movement visible before checkout.';

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#ead9d2] bg-[radial-gradient(circle_at_74%_22%,rgba(220,178,191,0.32),transparent_18%),linear-gradient(180deg,#fffdfb_0%,#fff7f2_100%)] p-4 shadow-[0_34px_96px_-72px_rgba(86,58,58,0.18)] md:p-5">
        <div className="pointer-events-none absolute -right-10 top-10 h-28 w-28 rounded-full bg-[#efc9d4]/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-4 left-10 h-24 w-24 rounded-full bg-[#f5e6de] blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-6 h-3 w-3 rounded-full border border-[#d7b5bf]/70 bg-white/70" />
        <div className="pointer-events-none absolute right-16 top-14 h-2.5 w-2.5 rounded-full border border-[#e7cdd2]/70 bg-white/80" />

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[5.25rem_minmax(0,1fr)] lg:gap-5">
          {images.length > 1 ? (
            <div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`group relative h-20 min-w-[4.8rem] overflow-hidden rounded-[1.15rem] border transition-all duration-300 lg:h-[5.4rem] lg:min-w-0 ${
                    activeIndex === i
                      ? 'border-[#c891a0] bg-white shadow-[0_18px_36px_-24px_rgba(122,77,89,0.22)]'
                      : 'border-[#eadad4] bg-white/74 hover:border-[#d7b0bb]'
                  }`}
                  aria-label={
                    prefersArabicCopy
                      ? `الانتقال إلى الصورة ${i + 1}`
                      : `Go to image ${i + 1}`
                  }
                >
                  <OptimizedGalleryImage
                    source={img}
                    alt=""
                    loading="lazy"
                    fetchpriority="low"
                    decoding="async"
                    mode="thumb"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    productName={product?.name}
                  />
                  {activeIndex !== i ? (
                    <div className="absolute inset-0 bg-white/22 transition-colors group-hover:bg-white/10" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <div className="order-1 space-y-3 lg:order-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-[#e6c7d0] bg-white/90 px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#9c6274] shadow-[0_14px_28px_-24px_rgba(122,77,89,0.3)]">
                  {editorialBadge}
                </span>
                <span className="inline-flex rounded-full border border-[#efe1da] bg-[#fffaf7] px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-[#8e6d68]">
                  {categoryLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenZoom}
                className="inline-flex items-center gap-2 rounded-full border border-[#ead9d2] bg-white/90 px-4 py-2 text-xs font-black text-[#6d4b4b] shadow-[0_18px_34px_-26px_rgba(109,75,75,0.25)] transition-colors hover:border-[#d7b0bb] hover:bg-white"
                aria-label={prefersArabicCopy ? 'تكبير الصور' : 'Zoom gallery'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6" />
                  <path d="M8 11h6" />
                </svg>
                <span>{prefersArabicCopy ? 'عرض أقرب' : 'Zoom'}</span>
              </button>
            </div>

            <div
              className="group relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/78 shadow-[0_30px_82px_-62px_rgba(86,58,58,0.34)] touch-pan-y"
              {...swipeHandlers}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),rgba(255,248,244,0.38)_38%,transparent_62%)]" />
              <OptimizedGalleryImage
                source={images[activeIndex]}
                alt={`${product?.name} portrait view`}
                fetchpriority="high"
                loading="eager"
                decoding="sync"
                mode="hero"
                responsiveSizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/5] w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                productName={product?.name}
              />
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[1.3rem] border border-white/80 bg-white/86 px-4 py-3 backdrop-blur-md shadow-[0_18px_36px_-28px_rgba(86,58,58,0.22)]">
                <p className="text-[10px] font-black tracking-[0.2em] text-[#aa6e7e]">
                  {prefersArabicCopy ? 'لقطة الواجهة' : 'Front portrait'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#654c4c]">
                  {editorialNote}
                </p>
              </div>

              {images.length > 1 ? (
                <div className="absolute inset-x-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-between md:flex">
                  <button
                    onClick={() =>
                      setActiveIndex((p: number) =>
                        p === 0 ? images.length - 1 : p - 1,
                      )
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efe4df] bg-white/94 text-[#6e5757] shadow-[0_16px_34px_-24px_rgba(86,58,58,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#9c6274] hover:text-[#3f2f33]"
                    aria-label={prefersArabicCopy ? 'الصورة السابقة' : 'Previous image'}
                  >
                    <svg
                      className="rtl:rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efe4df] bg-white/94 text-[#6e5757] shadow-[0_16px_34px_-24px_rgba(86,58,58,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#9c6274] hover:text-[#3f2f33]"
                    aria-label={prefersArabicCopy ? 'الصورة التالية' : 'Next image'}
                  >
                    <svg
                      className="rtl:rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AtelierEditorialStageGallery: React.FC<{
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
  prefersArabicCopy?: boolean;
  onOpenZoom?: () => void;
  summaryPrice?: string;
  summaryOriginalPrice?: string | null;
  summaryDiscount?: number | null;
  summaryRating?: number | null;
  summaryReviews?: number;
  onJumpToBuybox?: () => void;
}> = ({
  images,
  product,
  activeIndex,
  setActiveIndex,
  swipeHandlers,
  prefersArabicCopy,
  onOpenZoom,
  summaryPrice,
  summaryOriginalPrice,
  summaryDiscount,
  summaryRating,
  summaryReviews,
  onJumpToBuybox,
}) => {
  const categoryLabel =
    typeof product?.category?.name === 'string' && product.category.name.trim()
      ? product.category.name.trim()
      : prefersArabicCopy
        ? 'تحرير هادئ'
        : 'Editorial selection';
  const editorialBadge =
    typeof product?.editorialBadge === 'string' && product.editorialBadge.trim()
      ? product.editorialBadge.trim()
      : prefersArabicCopy
        ? 'تحرير روزا'
        : 'Roza editorial';
  const editorialNote =
    typeof product?.editorialNote === 'string' && product.editorialNote.trim()
      ? product.editorialNote.trim()
      : prefersArabicCopy
        ? 'الصورة تبقى في الواجهة، والتفاصيل تنسحب للخلف حتى يبقى قرار الشراء متعلقًا بالقماش والقصّة.'
        : 'The image stays in front while the details step back so the decision stays focused on fabric and cut.';
  const frameLabel = prefersArabicCopy
    ? `لقطة ${activeIndex + 1} من ${images.length}`
    : `Frame ${activeIndex + 1} of ${images.length}`;

  return (
    <div className="space-y-5">
      <div className="space-y-4 border-b border-[#eadfd9] pb-5 lg:hidden">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black tracking-[0.28em] text-[#9c6274]">
            {editorialBadge}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#8a706b]">
            <span>{categoryLabel}</span>
            {summaryRating ? (
              <>
                <span className="text-[#d6c2bc]">/</span>
                <span>
                  {prefersArabicCopy
                    ? `★ ${summaryRating.toFixed(1)} من ${summaryReviews} تقييم`
                    : `★ ${summaryRating.toFixed(1)} from ${summaryReviews} reviews`}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-heading text-[2rem] font-black leading-[1.02] tracking-tight text-[#3f2f33]">
            {product?.name}
          </h1>
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-[2rem] font-black text-[#3f2f33]">
              {summaryPrice}
            </span>
            {summaryOriginalPrice ? (
              <span className="text-sm font-bold text-[#9d857f] line-through decoration-[#dfc4bd]">
                {summaryOriginalPrice}
              </span>
            ) : null}
            {summaryDiscount && summaryDiscount > 0 ? (
              <span className="text-[11px] font-black tracking-[0.18em] text-[#9c6274]">
                {prefersArabicCopy ? `خصم ${summaryDiscount}%` : `${summaryDiscount}% off`}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-7 text-[#6d5653]">{editorialNote}</p>
        </div>

        <button
          type="button"
          onClick={onJumpToBuybox}
          className="inline-flex items-center gap-2 self-start text-xs font-black tracking-[0.16em] text-[#6e5757] transition-colors hover:text-[#3f2f33]"
        >
          <span>{prefersArabicCopy ? 'شاهدي المقاس وخيارات الشراء' : 'View size & buying options'}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rtl:rotate-180"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eadfd9] pb-4 lg:hidden">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black tracking-[0.28em] text-[#9c6274]">
            {editorialBadge}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#8a706b]">
            <span>{categoryLabel}</span>
            {images.length > 1 ? (
              <>
                <span className="text-[#d6c2bc]">/</span>
                <span>{frameLabel}</span>
              </>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenZoom}
          className="inline-flex items-center gap-2 font-sans text-[0.8rem] font-black tracking-[0.04em] text-[#5c4747] transition-colors hover:text-[#3f2f33]"
          aria-label={prefersArabicCopy ? 'تكبير الصور' : 'Zoom gallery'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
          <span>{prefersArabicCopy ? 'عرض أقرب' : 'Closer view'}</span>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_4.8rem] lg:items-start">
        <div className="space-y-4">
          <div className="relative" {...swipeHandlers}>
            <div className="pointer-events-none absolute inset-x-[8%] top-8 bottom-8 bg-[radial-gradient(circle_at_44%_24%,rgba(234,198,208,0.4),transparent_42%),radial-gradient(circle_at_72%_68%,rgba(249,233,224,0.95),transparent_52%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-y-6 left-0 w-px bg-[#eadfd9]" />
            <div className="pointer-events-none absolute inset-y-6 right-0 w-px bg-[#eadfd9]" />
            <button
              type="button"
              onClick={onOpenZoom}
              className="absolute left-4 top-4 z-10 hidden items-center gap-2 rounded-full border border-[#dbc5be] bg-white/96 px-3.5 py-2 text-[0.8rem] font-black tracking-[0.04em] text-[#5c4747] shadow-[0_16px_34px_-24px_rgba(86,58,58,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#9c6274] hover:bg-[#fff8f5] hover:text-[#3f2f33] lg:inline-flex"
              aria-label={prefersArabicCopy ? 'تكبير الصور' : 'Zoom gallery'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
              <span>{prefersArabicCopy ? 'عرض أقرب' : 'Closer view'}</span>
            </button>
            <OptimizedGalleryImage
              source={images[activeIndex]}
              alt={`${product?.name} editorial frame`}
              fetchpriority="high"
              loading="eager"
              decoding="sync"
              mode="hero"
              responsiveSizes="(min-width: 1024px) 54vw, 100vw"
              className="relative aspect-[4/5] w-full object-cover object-center"
              productName={product?.name}
            />
          </div>
        </div>

        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {images.map((img: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`group relative h-20 min-w-[4.75rem] overflow-hidden border-b-2 transition-all duration-300 lg:h-[5.25rem] lg:min-w-0 ${
                  activeIndex === i
                    ? 'border-[#b57a89] opacity-100'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
                aria-label={
                  prefersArabicCopy
                    ? `الانتقال إلى الصورة ${i + 1}`
                    : `Go to image ${i + 1}`
                }
              >
                <OptimizedGalleryImage
                  source={img}
                  alt=""
                  loading="lazy"
                  fetchpriority="low"
                  decoding="async"
                  mode="thumb"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  productName={product?.name}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const FashionCounterStageGallery: React.FC<{
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
}) => (
  <div className="space-y-3">
    <div
      className="group relative overflow-hidden rounded-[1.55rem] border border-[#eddcd4] bg-[linear-gradient(180deg,#fffefd,#fff4ee)] shadow-[0_24px_72px_-58px_rgba(90,54,57,0.18)] touch-pan-y"
      {...swipeHandlers}
    >
      <OptimizedGalleryImage
        source={images[activeIndex]}
        alt={`${product?.name} fashion counter view`}
        fetchpriority="high"
        loading="eager"
        decoding="sync"
        mode="hero"
        responsiveSizes="(min-width: 1024px) 50vw, 100vw"
        className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        productName={product?.name}
      />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
        <span className="inline-flex rounded-full border border-white/45 bg-white/88 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#b86b5b] backdrop-blur">
          {prefersArabicCopy ? 'صورة المنتج' : 'Product shot'}
        </span>
        <button
          type="button"
          onClick={onOpenZoom}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/88 text-[#5a3641] shadow-[0_16px_34px_-24px_rgba(90,54,65,0.28)] backdrop-blur transition-colors hover:bg-white"
          aria-label={prefersArabicCopy ? 'تكبير الصورة' : 'Zoom image'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
          </svg>
        </button>
      </div>
      {images.length > 1 ? (
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-full border border-white/45 bg-white/92 px-4 py-2 text-xs font-black text-[#4c2d39] shadow-[0_18px_34px_-22px_rgba(76,45,57,0.24)] backdrop-blur">
          <span>{prefersArabicCopy ? `صورة ${activeIndex + 1} من ${images.length}` : `${activeIndex + 1}/${images.length}`}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((p: number) => (p === 0 ? images.length - 1 : p - 1));
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f1ddd4] bg-white text-[#5a3641] transition-colors hover:border-[#d86b55] hover:text-[#d86b55]"
              aria-label={prefersArabicCopy ? 'الصورة السابقة' : 'Previous image'}
            >
              <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((p: number) => (p === images.length - 1 ? 0 : p + 1));
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f1ddd4] bg-white text-[#5a3641] transition-colors hover:border-[#d86b55] hover:text-[#d86b55]"
              aria-label={prefersArabicCopy ? 'الصورة التالية' : 'Next image'}
            >
              <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>

    {images.length > 1 ? (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img: string, i: number) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`shrink-0 overflow-hidden rounded-[0.95rem] border transition-all duration-300 ${
              activeIndex === i
                ? 'border-[#d86b55] shadow-[0_14px_30px_-22px_rgba(216,107,85,0.4)]'
                : 'border-[#eddcd4] hover:border-[#dcaea5]'
            }`}
            aria-label={
              prefersArabicCopy
                ? `الانتقال إلى الصورة ${i + 1}`
                : `Go to image ${i + 1}`
            }
          >
            <div className="aspect-[4/5] w-[4.8rem] bg-white sm:w-[5.3rem]">
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

export const ElessiGalleryFrame: React.FC<{
  children: React.ReactNode;
  zoomLabel?: string;
  onZoom?: () => void;
  shellClassName?: string;
  toolbarClassName?: string;
  buttonClassName?: string;
  overlayToolbarOnMobile?: boolean;
}> = ({
  children,
  zoomLabel,
  onZoom,
  shellClassName = 'bg-white p-0',
  toolbarClassName = 'mb-3 flex items-center justify-end',
  buttonClassName = 'inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-black text-foreground transition-colors hover:border-primary/35 hover:text-primary',
  overlayToolbarOnMobile = false,
}) => (
  <div className={`${overlayToolbarOnMobile ? 'relative' : ''} ${shellClassName}`}>
    {onZoom && zoomLabel ? (
      <div
        className={
          overlayToolbarOnMobile
            ? `pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-end sm:pointer-events-auto sm:static sm:inset-auto ${toolbarClassName}`
            : toolbarClassName
        }
      >
        <button type="button" onClick={onZoom} className={buttonClassName}>
          {zoomLabel}
        </button>
      </div>
    ) : null}
    {children}
  </div>
);
