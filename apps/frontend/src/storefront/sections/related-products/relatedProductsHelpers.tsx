import React from 'react';
import type ProductCard from '../../components/ProductCard';
import type { Product } from '../../hooks/useProducts';
import {
  buildStorefrontImageCandidates,
  normalizeStorefrontImageValue,
} from '../../utils/productImages';
import { resolveSectionVariant } from '../../variants';
import type { RelatedProductsVariant, StorefrontProductPayload } from './relatedProductsTypes';

export const RELATED_PRODUCTS_SECTION_FAMILY = 'RelatedProducts';

export const DEFAULT_TITLE = 'منتجات قد تعجبك';
export const DEFAULT_SUBTITLE = 'اختيارات إضافية قريبة من نفس الذوق لتسهيل إكمال الطلب.';

export const InlineStars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5 text-[#a06f37]">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        viewBox="0 0 24 24"
        className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'fill-current' : 'fill-none text-[#d5c4b9]'}`}
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2Z" />
      </svg>
    ))}
  </div>
);

export const parsePositiveNumber = (value: unknown, fallback: number) => {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
};

export const normalizeRecommendation = (product: StorefrontProductPayload): Product => ({
  ...product,
  mainImage: normalizeStorefrontImageValue(product.mainImage),
  images: buildStorefrontImageCandidates(
    product.images,
    product.mainImage,
    (product as Record<string, unknown>)['image'],
  ),
});

export const normalizeRelatedProductsVariant = (
  rawVariant?: string,
): RelatedProductsVariant => {
  return resolveSectionVariant<RelatedProductsVariant>(
    RELATED_PRODUCTS_SECTION_FAMILY,
    rawVariant,
    'standard',
  );
};

export const resolveDirectionalCopy = ({
  value,
  englishFallback,
  arabicFallback,
  prefersArabicCopy,
  legacyEnglishValues = [],
}: {
  value: unknown;
  englishFallback: string;
  arabicFallback: string;
  prefersArabicCopy: boolean;
  legacyEnglishValues?: string[];
}) => {
  if (typeof value === 'string' && value.trim()) {
    const trimmedValue = value.trim();
    if (
      prefersArabicCopy &&
      (trimmedValue === englishFallback || legacyEnglishValues.includes(trimmedValue))
    ) {
      return arabicFallback;
    }

    return trimmedValue;
  }

  return prefersArabicCopy ? arabicFallback : englishFallback;
};

export const getRelatedGridClassName = (
  variant: RelatedProductsVariant | React.ComponentProps<typeof ProductCard>['variant'],
  cardCount: number,
) => {
  if (variant === 'list') {
    return 'grid grid-cols-1 gap-5';
  }

  if (variant === 'fastly-offer-wall' || variant === 'fastly-offer') {
    if (cardCount <= 1) {
      return 'mx-auto grid max-w-sm grid-cols-1 gap-3';
    }

    if (cardCount === 2) {
      return 'mx-auto grid max-w-5xl grid-cols-2 gap-3';
    }

    return 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'closet-pairings') {
    if (cardCount <= 1) {
      return 'mx-auto grid max-w-md grid-cols-1 gap-5';
    }

    if (cardCount === 2) {
      return 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2';
    }

    return 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'scent-circle') {
    if (cardCount <= 1) {
      return 'mx-auto grid max-w-md grid-cols-1 gap-5';
    }

    if (cardCount === 2) {
      return 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2';
    }

    return 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'command-alternatives') {
    if (cardCount <= 1) {
      return 'mx-auto grid max-w-md grid-cols-1 gap-5';
    }

    if (cardCount === 2) {
      return 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2';
    }

    return 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'elessi-merch-rail') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'elessi-complete-set') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'elessi-discovery-strip') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'elessi-organic-related') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'elessi-digital-related') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'elessi-plant-related') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'elessi-bike-related') {
    return cardCount <= 2
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2'
      : 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';
  }

  if (cardCount <= 1) {
    return 'mx-auto grid max-w-sm grid-cols-1 gap-6';
  }

  if (cardCount === 2) {
    return variant === 'editorial'
      ? 'mx-auto grid max-w-5xl grid-cols-1 gap-6 xl:grid-cols-2'
      : 'mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2';
  }

  if (variant === 'editorial') {
    return 'grid grid-cols-1 gap-6 xl:grid-cols-2';
  }

  if (variant === 'luxury' || cardCount === 3) {
    return 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3';
  }

  return 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4';
};

export const resolveRelatedProductsVariant = (
  rawVariant?: string,
): React.ComponentProps<typeof ProductCard>['variant'] => {
  const variant = normalizeRelatedProductsVariant(rawVariant);
  if (variant === 'closet-pairings') {
    return 'editorial';
  }

  if (variant === 'scent-circle') {
    return 'luxury';
  }

  if (variant === 'command-alternatives') {
    return 'retail-air';
  }

  if (variant === 'fastly-offer-wall') {
    return 'fastly-offer';
  }

  if (variant === 'elessi-merch-rail') {
    return 'luxury';
  }

  if (variant === 'elessi-complete-set') {
    return 'compact';
  }

  if (variant === 'elessi-discovery-strip') {
    return 'editorial';
  }

  if (variant === 'elessi-organic-related') {
    return 'harvest-crate';
  }

  if (variant === 'elessi-digital-related') {
    return 'signal-rack';
  }

  if (variant === 'elessi-plant-related') {
    return 'standard';
  }

  if (variant === 'elessi-bike-related') {
    return 'pedal-frame';
  }

  return variant;
};
