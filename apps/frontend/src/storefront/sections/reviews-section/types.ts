import type { ProductReview } from '../../hooks/useProductReviews';
import { resolveSectionVariant } from '../../variants';

export * from './ReviewsSharedUi';

export interface RatingDistributionRow {
  rating: number;
  count: number;
  percentage: number;
}

export interface ReviewsSectionSettings {
  title?: string;
  writeReviewText?: string;
  emptyText?: string;
  verifiedLabel?: string;
  outOfText?: string;
  reviewsLabel?: string;
  mediaTitle?: string;
  mediaDescription?: string;
  listTitle?: string;
  showMediaFeed?: boolean | string;
  showWriteReview?: boolean;
  reviewLimit?: number | string;
  mobileReviewLimit?: number | string;
  galleryStyle?: string;
  cardStyle?: string;
  contentAlign?: string;
  [key: string]: unknown;
}

export interface ReviewsSectionProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: ReviewsSectionSettings;
}

export type ReviewsSectionVariant =
  | 'standard'
  | 'compact'
  | 'editorial'
  | 'minimal'
  | 'voice-notes'
  | 'scent-notes'
  | 'elessi-proof-wall'
  | 'elessi-story-grid'
  | 'elessi-trust-pile'
  | 'elessi-plant-reviews'
  | 'command-proof';

export const REVIEWS_SECTION_FAMILY = 'ReviewsSection';

export const normalizeReviewsVariant = (rawVariant: unknown): ReviewsSectionVariant => {
  return resolveSectionVariant<ReviewsSectionVariant>(
    REVIEWS_SECTION_FAMILY,
    rawVariant,
    'standard',
  );
};

export const formatDisplayDate = (value: string): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const getEnabledReviewMedia = (
  review: ProductReview,
  allowPhotoReviews: boolean,
  allowVideoReviews: boolean,
) =>
  review.media.filter((item) => {
    if (item.type === 'video') {
      return allowVideoReviews;
    }

    return allowPhotoReviews;
  });

export const getReviewCardClassName = (cardStyle: string): string => {
  switch (cardStyle) {
    case 'minimal':
      return 'space-y-3 rounded-[var(--radius)] border border-border bg-background p-5';
    case 'editorial':
      return 'space-y-3 rounded-[1.5rem] border border-primary/10 bg-[linear-gradient(135deg,hsl(var(--background)),hsl(var(--secondary)/0.35))] p-5 shadow-[0_20px_70px_-55px_hsl(var(--primary)/0.55)]';
    default:
      return 'space-y-3 rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm';
  }
};

export const parseBooleanSetting = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

export const parsePositiveNumberSetting = (value: unknown, fallback: number): number => {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
};

export const resolveDirectionalCopy = ({
  value,
  englishFallback,
  arabicFallback,
  prefersArabicCopy,
}: {
  value: unknown;
  englishFallback: string;
  arabicFallback: string;
  prefersArabicCopy: boolean;
}): string => {
  if (typeof value === 'string' && value.trim()) {
    const trimmedValue = value.trim();
    if (prefersArabicCopy && trimmedValue === englishFallback) {
      return arabicFallback;
    }

    return trimmedValue;
  }

  return prefersArabicCopy ? arabicFallback : englishFallback;
};

export const getReviewGridClassName = (
  variant: ReviewsSectionVariant,
  isZenOrganic: boolean,
): string => {
  if (isZenOrganic) {
    return 'space-y-12';
  }

  switch (variant) {
    case 'compact':
      return 'grid gap-4 lg:grid-cols-2';
    case 'voice-notes':
    case 'scent-notes':
    case 'elessi-proof-wall':
    case 'elessi-trust-pile':
    case 'elessi-plant-reviews':
    case 'command-proof':
      return 'grid gap-4 lg:grid-cols-2';
    case 'elessi-story-grid':
      return 'space-y-0';
    case 'editorial':
      return 'grid gap-6';
    default:
      return 'space-y-6';
  }
};
