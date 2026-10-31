import React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { OptimizedGalleryImage } from './galleryHelpers';
import { GalleryZoomDialogProps } from './galleryTypes';

export const GalleryZoomDialog: React.FC<GalleryZoomDialogProps> = ({
  open,
  onOpenChange,
  images,
  product,
  activeIndex,
  setActiveIndex,
  prefersArabicCopy,
}) => {
  if (!images?.length) {
    return null;
  }

  const closeLabel = prefersArabicCopy ? '\u0625\u063a\u0644\u0627\u0642' : 'Close';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[#3f2f35]/35 backdrop-blur-sm data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0" />
        <DialogPrimitive.Popup
          className="fixed left-0 top-0 z-50 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe8_100%)] p-0 text-[#3f2f35] shadow-none sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[94vh] sm:w-full sm:max-w-[min(96vw,76rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.5rem] sm:border sm:border-[#ead8cf] sm:shadow-[0_40px_120px_-50px_rgba(79,59,66,0.45)]"
          dir={prefersArabicCopy ? 'rtl' : 'ltr'}
        >
          <DialogPrimitive.Title className="sr-only">
            {prefersArabicCopy ? 'تكبير صور المنتج' : 'Product image zoom'}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="absolute end-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8cf] bg-white/92 text-[#4f3b42] shadow-[0_18px_28px_-18px_rgba(79,59,66,0.5)] transition-colors hover:bg-white hover:text-[#d86b55]"
            aria-label={closeLabel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </DialogPrimitive.Close>

          <div className="flex h-full flex-col gap-0 sm:grid sm:h-auto sm:gap-4 sm:p-4">
            <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3 pe-14 sm:px-0 sm:pt-0 sm:pb-0 sm:pe-10">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#3f2f35]">
                  {product?.name}
                </p>
                <p className="text-xs font-semibold text-[#8b6b69]">
                  {prefersArabicCopy
                    ? `الصورة ${activeIndex + 1} من ${images.length}`
                    : `Image ${activeIndex + 1} of ${images.length}`}
                </p>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden bg-[#fffaf7] sm:rounded-[1.45rem] sm:ring-1 sm:ring-[#ead8cf]">
              <OptimizedGalleryImage
                source={images[activeIndex]}
                alt={`${product?.name} zoomed view`}
                loading="eager"
                fetchpriority="high"
                decoding="sync"
                mode="hero"
                responsiveSizes="100vw"
                className="h-full max-h-none w-full object-contain sm:max-h-[72vh]"
                productName={product?.name}
              />

              {images.length > 1 ? (
                <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-3">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((p: number) =>
                        p === 0 ? images.length - 1 : p - 1,
                      )
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#4f3b42] shadow-[0_18px_28px_-18px_rgba(79,59,66,0.5)] transition-colors hover:bg-white hover:text-[#d86b55] sm:h-10 sm:w-10"
                    aria-label={prefersArabicCopy ? 'الصورة السابقة' : 'Previous image'}
                  >
                    <svg className="rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((p: number) =>
                        p === images.length - 1 ? 0 : p + 1,
                      )
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#4f3b42] shadow-[0_18px_28px_-18px_rgba(79,59,66,0.5)] transition-colors hover:bg-white hover:text-[#d86b55] sm:h-10 sm:w-10"
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
              <div className="border-t border-[#ead8cf] px-4 py-3 sm:border-t-0 sm:px-0 sm:py-0">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={`shrink-0 overflow-hidden rounded-[0.95rem] ring-1 transition-all duration-300 ${
                        activeIndex === i
                          ? 'ring-[#d86b55] shadow-[0_12px_24px_-18px_rgba(216,107,85,0.55)]'
                          : 'ring-[#ead8cf] hover:ring-[#d86b55]/55'
                      }`}
                      aria-label={
                        prefersArabicCopy
                          ? `الانتقال إلى الصورة ${i + 1}`
                          : `Go to image ${i + 1}`
                      }
                    >
                      <div className="aspect-[4/5] w-[4.5rem] bg-white sm:w-[5rem]">
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
              </div>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
