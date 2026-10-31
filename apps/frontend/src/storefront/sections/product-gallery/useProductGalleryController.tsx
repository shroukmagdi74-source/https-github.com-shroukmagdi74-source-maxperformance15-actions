import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRightLeft, Heart } from 'lucide-react';
import { useProduct } from '../../hooks/useProduct';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import { usePdpSelectionStore } from '../../store/usePdpSelectionStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { buildStorefrontImageCandidates } from '../../utils/productImages';
import { getVariantAttributes } from '../../utils/variants';
import { formatStorefrontCurrency } from '../../utils/currency';
import { STOREFRONT_BUYBOX_ID } from '../../utils/pdpCheckout';
import {
  getStorefrontMarketplaceAppSettings,
  isStorefrontMarketplaceAppEnabled,
} from '../../utils/marketplaceApps';
import {
  normalizeProductGalleryVariant,
  useSwipe,
} from './galleryHelpers';
import { ProductGalleryProps } from './galleryTypes';

export const useProductGalleryController = (
  section?: ProductGalleryProps['section'],
) => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useStorefrontTheme();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const selectionProductId = usePdpSelectionStore(
    (state) => state.selection?.productId,
  );
  const selectedVariantId = usePdpSelectionStore(
    (state) => state.selection?.variantId,
  );
  const selectionAttributes = usePdpSelectionStore(
    (state) => state.selection?.attributes,
    (a, b) => {
      if (a === b) return true;
      if (!a || !b) return false;
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((k) => a[k] === b[k]);
    },
  );
  const isZenOrganic = theme.id === 'zen-organic';
  const isMenShoesEg = theme.id === 'men-shoes-eg';
  const isWomenFashionEg = theme.id === 'women-fashion-eg';
  const prefersArabicCopy = theme.direction === 'rtl';
  const variant = normalizeProductGalleryVariant(section?.variant);
  const isGracefulGallery = theme.id === 'soft-graceful';
  const effectiveId = id || (theme.id ? `preview:${theme.id}` : undefined);
  const { product, isLoading } = useProduct(effectiveId);
  const galleryDiscountPct =
    product &&
    typeof product.comparePrice === 'number' &&
    typeof product.price === 'number' &&
    product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100,
        )
      : 0;
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const hasWishlistItem = useWishlistStore((state) => state.hasItem);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompared, setIsCompared] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!product?.productVariants?.length || selectionProductId !== product.id) {
      return null;
    }

    if (selectedVariantId) {
      return (
        product.productVariants.find(
          (variantOption) => variantOption.id === selectedVariantId,
        ) || null
      );
    }

    const selectionEntries = Object.entries(selectionAttributes || {});
    if (!selectionEntries.length) {
      return null;
    }

    const normAttr = (val: unknown) =>
      String(val || '')
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, ' ');

    return (
      product.productVariants.find((variantOption) => {
        const variantAttributes = getVariantAttributes(variantOption);
        return selectionEntries.every(
          ([key, value]) =>
            variantAttributes[key] === value ||
            normAttr(variantAttributes[key]) === normAttr(value),
        );
      }) || null
    );
  }, [
    product?.id,
    product?.productVariants,
    selectionProductId,
    selectedVariantId,
    selectionAttributes,
  ]);

  const prevImagesRef = useRef<string[]>([]);
  const images = useMemo(() => {
    const normAttr = (val: unknown) =>
      String(val || '')
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, ' ');

    const rawMeta = product?.metadata;
    let parsedMeta: Record<string, any> | null = null;
    if (typeof rawMeta === 'string') {
      try {
        parsedMeta = JSON.parse(rawMeta);
      } catch {
        parsedMeta = null;
      }
    } else if (rawMeta && typeof rawMeta === 'object') {
      parsedMeta = rawMeta as Record<string, any>;
    }

    const attributeImages = parsedMeta?.variantSettings?.attributeImages;
    const selectedAttributeImages: string[] = [];
    if (
      attributeImages &&
      typeof attributeImages === 'object' &&
      selectionProductId === product?.id
    ) {
      const activeAttrValues = [
        ...Object.values(selectionAttributes || {}),
        ...Object.values(
          selectedVariant ? getVariantAttributes(selectedVariant) : {},
        ),
      ].filter(Boolean);

      for (const imageMap of Object.values(attributeImages)) {
        if (!imageMap || typeof imageMap !== 'object') continue;
        for (const val of activeAttrValues) {
          const direct = (imageMap as Record<string, unknown>)[val];
          if (typeof direct === 'string' && direct.trim()) {
            selectedAttributeImages.push(direct.trim());
            continue;
          }
          const normVal = normAttr(val);
          for (const [mapKey, mapUrl] of Object.entries(imageMap)) {
            if (
              typeof mapUrl === 'string' &&
              mapUrl.trim() &&
              normAttr(mapKey) === normVal
            ) {
              selectedAttributeImages.push(mapUrl.trim());
            }
          }
        }
      }
    }

    const selectedVariantImages = selectedVariant
      ? buildStorefrontImageCandidates(
          (selectedVariant as { images?: unknown }).images,
          (selectedVariant as { galleryImages?: unknown }).galleryImages,
          selectedVariant.imageUrl,
          selectedVariant.image,
          selectedAttributeImages,
        )
      : buildStorefrontImageCandidates(selectedAttributeImages);

    const nextImages = buildStorefrontImageCandidates(
      selectedVariantImages,
      product?.images || [],
    );

    const prev = prevImagesRef.current;
    if (
      prev.length === nextImages.length &&
      prev.every((url, idx) => url === nextImages[idx])
    ) {
      return prev;
    }

    prevImagesRef.current = nextImages;
    return nextImages;
  }, [
    product?.id,
    product?.images,
    product?.metadata,
    selectedVariant,
    selectionAttributes,
    selectionProductId,
  ]);

  const currency =
    storefrontSettings?.storefront?.settings?.currency ||
    storefrontSettings?.company?.currency ||
    'EGP';
  const activePrice =
    typeof selectedVariant?.price === 'number' &&
    Number.isFinite(selectedVariant.price)
      ? selectedVariant.price
      : typeof product?.price === 'number'
        ? product.price
        : 0;
  const activeComparePrice =
    typeof selectedVariant?.comparePrice === 'number' &&
    Number.isFinite(selectedVariant.comparePrice)
      ? selectedVariant.comparePrice
      : typeof product?.comparePrice === 'number'
        ? product.comparePrice
        : null;
  const womenQuickBuyDiscount =
    activeComparePrice && activeComparePrice > activePrice
      ? Math.round(
          ((activeComparePrice - activePrice) / activeComparePrice) * 100,
        )
      : null;
  const womenQuickBuyRating =
    typeof product?.rating === 'number'
      ? product.rating
      : typeof product?.reviewSummary?.averageRating === 'number'
        ? product.reviewSummary.averageRating
        : typeof product?.reviewAverage === 'number'
          ? product.reviewAverage
          : null;
  const womenQuickBuyReviews =
    typeof product?.reviewCount === 'number'
      ? product.reviewCount
      : typeof product?.reviewsCount === 'number'
        ? product.reviewsCount
        : typeof product?.ratingCount === 'number'
          ? product.ratingCount
          : typeof product?.reviewSummary?.totalReviews === 'number'
            ? product.reviewSummary.totalReviews
            : 0;
  const shouldShowWomenQuickBuyOverlay =
    isWomenFashionEg && variant === 'mirror-carousel';
  const swipeHandlers = useSwipe(images.length, setActiveIndex);
  const isWishlisted = product?.id ? hasWishlistItem(product.id) : false;

  const handleWishlistToggle = () => {
    if (!product?.id) {
      return;
    }

    toggleWishlist(product.id);
    toast.success(
      prefersArabicCopy
        ? isWishlisted
          ? 'تمت إزالة المنتج من المفضلة'
          : 'تمت إضافة المنتج للمفضلة'
        : isWishlisted
          ? 'Removed from wishlist'
          : 'Added to wishlist',
    );
  };

  const handleCompareToggle = () => {
    const next = !isCompared;
    setIsCompared(next);
    toast.success(
      prefersArabicCopy
        ? next
          ? 'تمت إضافة المنتج للمقارنة'
          : 'تمت إزالة المنتج من المقارنة'
        : next
          ? 'Added to compare'
          : 'Removed from compare',
    );
  };

  const conversionEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    'conversion-suite',
  );
  const conversionSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    'conversion-suite',
  );

  const isWishlistEnabled =
    storefrontSettings?.storefront?.storefrontFeatures?.wishlistEnabled !==
      false &&
    storefrontSettings?.storefrontSettings?.wishlistEnabled !== false &&
    (!conversionEnabled ||
      (conversionSettings?.modules as Record<string, unknown> | undefined)
        ?.productWishlist !== false);

  const isComparisonEnabled =
    storefrontSettings?.storefront?.storefrontFeatures?.comparisonEnabled !==
      false &&
    storefrontSettings?.storefrontSettings?.comparisonEnabled !== false &&
    (!conversionEnabled ||
      (conversionSettings?.modules as Record<string, unknown> | undefined)
        ?.productComparison !== false);

  const hasOverlayContent =
    galleryDiscountPct > 0 || isWishlistEnabled || isComparisonEnabled;

  const elessiOverlayActions =
    variant === 'elessi-showroom' && hasOverlayContent ? (
      <>
        {galleryDiscountPct > 0 ? (
          <span className="pointer-events-auto inline-flex items-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-[0_12px_26px_-18px_rgba(185,28,28,0.5)]">
            {prefersArabicCopy
              ? `خصم ${galleryDiscountPct}%`
              : `${galleryDiscountPct}% OFF`}
          </span>
        ) : null}
        {isWishlistEnabled ? (
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_26px_-18px_rgba(76,44,34,0.42)] backdrop-blur transition-colors ${
              isWishlisted
                ? 'border-[#d7b2a0] bg-[#fff2ec] text-[#b3533b]'
                : 'border-[#ead8ca] bg-white/92 text-[#6b4a3c] hover:border-[#c79f8b]'
            }`}
            aria-label={
              prefersArabicCopy ? 'إضافة إلى المفضلة' : 'Add to wishlist'
            }
          >
            <Heart
              className={`h-[18px] w-[18px] ${isWishlisted ? 'fill-current' : ''}`}
            />
          </button>
        ) : null}
        {isComparisonEnabled ? (
          <button
            type="button"
            onClick={handleCompareToggle}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_26px_-18px_rgba(76,44,34,0.42)] backdrop-blur transition-colors ${
              isCompared
                ? 'border-[#d4beae] bg-[#fff5ec] text-[#8f5c44]'
                : 'border-[#ead8ca] bg-white/92 text-[#6b4a3c] hover:border-[#c79f8b]'
            }`}
            aria-label={
              prefersArabicCopy ? 'إضافة إلى المقارنة' : 'Add to compare'
            }
          >
            <ArrowRightLeft className="h-[18px] w-[18px]" />
          </button>
        ) : null}
      </>
    ) : null;

  const handleJumpToBuybox = () => {
    document.getElementById(STOREFRONT_BUYBOX_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedVariant?.id, selectedVariant?.image, images]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('storefront:pdp-gallery-zoom-open', {
        detail: { open: isZoomOpen },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent('storefront:pdp-gallery-zoom-open', {
          detail: { open: false },
        }),
      );
    };
  }, [isZoomOpen]);

  return {
    product,
    isLoading,
    images,
    variant,
    isZenOrganic,
    isMenShoesEg,
    isGracefulGallery,
    prefersArabicCopy,
    activeIndex,
    setActiveIndex,
    isZoomOpen,
    setIsZoomOpen,
    swipeHandlers,
    elessiOverlayActions,
    activePrice,
    activeComparePrice,
    currency,
    shouldShowWomenQuickBuyOverlay,
    womenQuickBuyDiscount,
    womenQuickBuyRating,
    womenQuickBuyReviews,
    handleJumpToBuybox,
  };
};

export type ProductGalleryController = ReturnType<
  typeof useProductGalleryController
>;
