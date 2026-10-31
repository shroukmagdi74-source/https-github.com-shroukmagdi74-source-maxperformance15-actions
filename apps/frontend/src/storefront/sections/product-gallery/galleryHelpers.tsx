import React, { useState } from 'react';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import { resolveSectionVariant } from '../../variants';
import {
  GallerySwipeHandlers,
  OptimizedGalleryImageProps,
  ProductGalleryVariant,
} from './galleryTypes';

export const prefersArabic = (value?: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  return (
    typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  );
};

export const getFallbackInitials = (productName?: string): string => {
  const normalized = productName?.trim();
  if (!normalized) {
    return 'CG';
  }

  const initials = normalized
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || normalized.charAt(0).toUpperCase() || 'CG';
};

export const GalleryImageFallback: React.FC<{
  productName?: string;
  prefersArabicCopy?: boolean;
  isThumb?: boolean;
}> = ({ productName, prefersArabicCopy, isThumb }) => {
  if (isThumb) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
        <span className="text-xs font-bold uppercase tracking-wider">
          {(productName?.trim().charAt(0) || 'P').toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(241,245,249,0.98))] px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/90 text-sm font-black text-foreground/70">
        {(productName?.trim().charAt(0) || 'P').toUpperCase()}
      </div>
      <p className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
        {prefersArabic(prefersArabicCopy)
          ? 'المعاينة غير متاحة'
          : 'Preview unavailable'}
      </p>
    </div>
  );
};

export const CyberGalleryImageFallback: React.FC<{
  productName?: string;
  categoryLabel?: string;
  prefersArabicCopy?: boolean;
}> = ({ productName, categoryLabel, prefersArabicCopy }) => {
  const isArabic = prefersArabic(prefersArabicCopy);
  const initials = getFallbackInitials(productName);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),rgba(7,10,19,0.98)_58%)] px-5 py-6 text-start text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),transparent_34%,transparent_66%,rgba(59,130,246,0.16))]" />
      <div className="pointer-events-none absolute inset-x-6 top-6 h-px bg-gradient-to-r from-cyan-300/0 via-cyan-300/70 to-cyan-300/0" />
      <div className="pointer-events-none absolute inset-y-10 start-7 w-px bg-gradient-to-b from-cyan-300/0 via-cyan-300/55 to-cyan-300/0" />
      <div className="pointer-events-none absolute -top-8 end-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 start-8 h-28 w-28 rounded-full bg-primary/25 blur-3xl" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-cyan-300/30 bg-slate-950/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-md">
            {isArabic ? 'Cyber Gear' : 'Cyber Gear'}
          </div>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
            {categoryLabel || (isArabic ? 'مختارات المتجر' : 'Store Select')}
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-cyan-300/25 bg-white/6 text-2xl font-black uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.16)] backdrop-blur-md">
            {initials}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200/75">
              {isArabic ? 'قطعة مميزة' : 'Featured Item'}
            </p>
            <h3 className="max-w-[16rem] text-lg font-black leading-tight text-white sm:text-xl">
              {productName?.trim() ||
                (isArabic ? 'قطعة Cyber Gear' : 'Cyber Gear Item')}
            </h3>
            <p className="max-w-[18rem] text-sm leading-6 text-slate-200/82">
              {isArabic
                ? 'السعر والتفاصيل والإضافات المرتبطة أمامك بوضوح داخل صفحة واحدة حتى تحسم اختيارك بسرعة.'
                : 'Price, key details, and related add-ons stay clear in one focused product view.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/72 sm:max-w-[18rem]">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
            {isArabic ? 'تفاصيل واضحة' : 'Key Details'}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
            {isArabic ? 'شراء أسرع' : 'Quick Order'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const useSwipe = (
  imagesLength: number,
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
): GallerySwipeHandlers => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex((p: number) => (p === imagesLength - 1 ? 0 : p + 1));
    }
    if (isRightSwipe) {
      setActiveIndex((p: number) => (p === 0 ? imagesLength - 1 : p - 1));
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd: onTouchEndHandler };
};

export const resolveGalleryResponsiveSizes = (
  mode: 'hero' | 'detail' | 'thumb',
  responsiveSizes: string | undefined,
): string | undefined => {
  if (mode === 'thumb') {
    return undefined;
  }

  const fallbackSizes = responsiveSizes || '100vw';

  if (mode !== 'hero' || /max-width:\s*767px/i.test(fallbackSizes)) {
    return fallbackSizes;
  }

  return `(max-width: 767px) 82vw, ${fallbackSizes}`;
};

export const OptimizedGalleryImage: React.FC<OptimizedGalleryImageProps> = ({
  source,
  mode = 'detail',
  responsiveSizes,
  productName,
  categoryLabel,
  fallbackVariant = 'default',
  prefersArabicCopy,
  fitMode,
  ...imgProps
}) => {
  return (
    <StorefrontProductImage
      candidates={[source]}
      requestedWidth={mode === 'thumb' ? 160 : mode === 'hero' ? 1280 : 960}
      responsiveWidths={
        mode === 'thumb'
          ? undefined
          : mode === 'hero'
            ? [420, 520, 720, 960, 1280]
            : [320, 480, 640, 800, 1200]
      }
      responsiveSizes={resolveGalleryResponsiveSizes(mode, responsiveSizes)}
      imageQuality={mode === 'thumb' ? 72 : mode === 'hero' ? 78 : 80}
      fitMode={fitMode || (mode === 'hero' ? 'contain' : undefined)}
      fallback={
        fallbackVariant === 'cyber' ? (
          <CyberGalleryImageFallback
            productName={productName}
            categoryLabel={categoryLabel}
            prefersArabicCopy={prefersArabicCopy}
          />
        ) : (
          <GalleryImageFallback
            productName={productName}
            prefersArabicCopy={prefersArabicCopy}
            isThumb={mode === 'thumb'}
          />
        )
      }
      {...imgProps}
    />
  );
};

export const PRODUCT_GALLERY_SECTION_FAMILY = 'ProductGallery';

export const normalizeProductGalleryVariant = (
  rawVariant: unknown,
): ProductGalleryVariant => {
  return resolveSectionVariant<ProductGalleryVariant>(
    PRODUCT_GALLERY_SECTION_FAMILY,
    rawVariant,
    'standard',
  );
};
