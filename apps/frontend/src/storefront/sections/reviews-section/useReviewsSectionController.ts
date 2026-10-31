import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  getRatingDistribution,
  normalizeProductReviewRecord,
  useProductReviews,
} from '../../hooks/useProductReviews';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { useProduct } from '../../hooks/useProduct';
import { useStorefrontSettings } from '../../hooks/useStorefrontSettings';
import {
  getStorefrontMarketplaceAppSettings,
  isStorefrontMarketplaceAppEnabled,
} from '../../utils/marketplaceApps';
import { useDeferredSectionActivation } from '../../hooks/useDeferredSectionActivation';
import { resolveSectionContentAlign } from '../../utils/contentAlignment';
import { isKhemetLuxeTheme as isKhemetLuxeThemeId } from '../../utils/navigationGuards';
import {
  getEnabledReviewMedia,
  getReviewCardClassName,
  getReviewGridClassName,
  normalizeReviewsVariant,
  parseBooleanSetting,
  parsePositiveNumberSetting,
  resolveDirectionalCopy,
  type ReviewsSectionProps,
} from './types';

export const useReviewsSectionController = (props: ReviewsSectionProps) => {
  const { section, settings } = props;
  const { id: productId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const sectionVariant = normalizeReviewsVariant(section?.variant);
  const isElessiStoryGrid = sectionVariant === 'elessi-story-grid';
  const { isActive, sectionRef } = useDeferredSectionActivation({
    idleTimeout: isElessiStoryGrid ? 3500 : 10000,
    rootMargin: isElessiStoryGrid ? '1600px 0px' : '360px 0px',
  });
  const { product } = useProduct(productId);
  const targetReviewProductId = product?.id || productId;
  const {
    reviews: realReviews,
    totalCount: realTotalCount,
    averageRating: realAverageRating,
    ratingDistribution: realRatingDistribution,
    isLoading,
  } = useProductReviews(targetReviewProductId, {
    enabled: isActive && Boolean(targetReviewProductId),
  });
  const { theme } = useStorefrontTheme();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const prefersArabicCopy = theme.direction === 'rtl';
  const notAvailableText = prefersArabicCopy ? 'غير متوفر' : 'N/A';

  const isContentCentered =
    resolveSectionContentAlign(settings?.contentAlign) === 'center';
  const title =
    settings?.title ||
    resolveDirectionalCopy({
      value: settings?.title,
      englishFallback: 'Customer reviews',
      arabicFallback: 'آراء العملاء',
      prefersArabicCopy,
    });
  const writeReviewText =
    settings?.writeReviewText ||
    resolveDirectionalCopy({
      value: settings?.writeReviewText,
      englishFallback: 'Write a review',
      arabicFallback: 'اكتب مراجعتك',
      prefersArabicCopy,
    });
  const emptyText =
    settings?.emptyText ||
    resolveDirectionalCopy({
      value: settings?.emptyText,
      englishFallback: 'There are no reviews yet. Be the first to review this product.',
      arabicFallback: 'لا توجد مراجعات بعد. كن أول من يشارك رأيه عن هذا المنتج.',
      prefersArabicCopy,
    });
  const verifiedLabel =
    settings?.verifiedLabel ||
    resolveDirectionalCopy({
      value: settings?.verifiedLabel,
      englishFallback: 'Verified buyer',
      arabicFallback: 'عميل موثق',
      prefersArabicCopy,
    });
  const outOfText =
    settings?.outOfText ||
    resolveDirectionalCopy({
      value: settings?.outOfText,
      englishFallback: 'out of 5',
      arabicFallback: 'من 5',
      prefersArabicCopy,
    });
  const reviewsLabel =
    settings?.reviewsLabel ||
    resolveDirectionalCopy({
      value: settings?.reviewsLabel,
      englishFallback: 'reviews',
      arabicFallback: 'مراجعات',
      prefersArabicCopy,
    });
  const mediaTitle =
    settings?.mediaTitle ||
    resolveDirectionalCopy({
      value: settings?.mediaTitle,
      englishFallback: 'Customer photos & videos',
      arabicFallback: 'صور ومقاطع العملاء',
      prefersArabicCopy,
    });
  const mediaDescription =
    settings?.mediaDescription ||
    resolveDirectionalCopy({
      value: settings?.mediaDescription,
      englishFallback: 'Rendered from review media when the UGC app is enabled.',
      arabicFallback: 'يتم عرض هذا القسم من وسائط المراجعات عند تفعيل تطبيق المراجعات المرئية.',
      prefersArabicCopy,
    });
  const listTitle =
    settings?.listTitle ||
    resolveDirectionalCopy({
      value: settings?.listTitle,
      englishFallback: 'Review list',
      arabicFallback: 'قائمة المراجعات',
      prefersArabicCopy,
    });

  const isZenOrganic = theme.id === 'zen-organic';
  const isKhemetLuxeTheme = isKhemetLuxeThemeId(theme.id);
  const isCompactVariant = sectionVariant === 'compact';
  const isVoiceNotesVariant = sectionVariant === 'voice-notes';
  const isScentNotesVariant = sectionVariant === 'scent-notes';
  const isElessiProofWall = sectionVariant === 'elessi-proof-wall';
  const isElessiTrustPile = sectionVariant === 'elessi-trust-pile';
  const isElessiPlantReviews = sectionVariant === 'elessi-plant-reviews';
  const isCommandProofVariant = sectionVariant === 'command-proof';
  const isStoryNotesVariant = isVoiceNotesVariant || isScentNotesVariant;

  const ugcEnabled = isStorefrontMarketplaceAppEnabled(
    storefrontSettings,
    'ugc-reviews-pro',
  );
  const ugcSettings = getStorefrontMarketplaceAppSettings(
    storefrontSettings,
    'ugc-reviews-pro',
  );
  const ugcModules = (ugcSettings['modules'] as Record<string, unknown> | undefined) || {};
  const ugcUi = (ugcSettings['ui'] as Record<string, unknown> | undefined) || {};
  const allowPhotoReviews = ugcEnabled && ugcModules['photoReviews'] !== false;
  const allowVideoReviews = ugcEnabled && ugcModules['videoReviews'] !== false;
  const showVerifiedBadge = !ugcEnabled || ugcModules['verifiedBadge'] !== false;
  const galleryStyle =
    typeof settings?.galleryStyle === 'string' && settings.galleryStyle.trim()
      ? settings.galleryStyle.trim()
      : String(ugcUi['galleryStyle'] || 'mosaic');
  const cardStyle =
    typeof settings?.cardStyle === 'string' && settings.cardStyle.trim()
      ? settings.cardStyle.trim()
      : String(ugcUi['cardStyle'] || 'elevated');
  const showMediaFeed = parseBooleanSetting(settings?.showMediaFeed, true);
  const showWriteReviewButton = parseBooleanSetting(settings?.showWriteReview, Boolean(productId));
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'reviews'>('reviews');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const mockReviews = useMemo(
    () => {
      const rawMockReviews = (
        Array.isArray(settings?.['reviews']) ? settings['reviews'] : []
      ) as unknown[];

      return rawMockReviews.map((review, index) =>
        normalizeProductReviewRecord(
          review && typeof review === 'object'
            ? (review as Record<string, unknown>)
            : { comment: String(review || '') },
          index,
        ),
      );
    },
    [settings],
  );

  const hasRealReviews = realReviews.length > 0;
  const reviews = hasRealReviews ? realReviews : mockReviews;
  const totalCount = hasRealReviews ? realTotalCount : mockReviews.length;
  const computedMockRating =
    mockReviews.length > 0
      ? mockReviews.reduce((total, review) => total + (review.rating || 5), 0) /
        mockReviews.length
      : 0;
  const averageRating = hasRealReviews ? realAverageRating : computedMockRating;
  const ratingDistribution = hasRealReviews
    ? realRatingDistribution
    : getRatingDistribution(mockReviews);
  const reviewLimit = parsePositiveNumberSetting(
    settings?.reviewLimit,
    isElessiStoryGrid ? 4 : 6,
  );
  const mobileReviewLimit = Math.min(
    reviewLimit,
    parsePositiveNumberSetting(settings?.mobileReviewLimit, reviewLimit),
  );
  const shouldShowLoading = !isActive || isLoading;
  const shouldUseCompactEmptyReviews =
    isKhemetLuxeTheme && isElessiStoryGrid && !shouldShowLoading && reviews.length === 0;
  const visibleReviews = reviews.slice(0, reviewLimit);
  const safeRatingDistribution = Array.isArray(ratingDistribution)
    ? ratingDistribution
    : [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 }));
  const distributionRows = safeRatingDistribution.map((item) => ({
    ...item,
    percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
  }));
  const mediaFeed = useMemo(
    () =>
      reviews
        .flatMap((review) => getEnabledReviewMedia(review, allowPhotoReviews, allowVideoReviews))
        .slice(0, 8),
    [allowPhotoReviews, allowVideoReviews, reviews],
  );
  const elessiPreviewMedia = mediaFeed.slice(0, 4);

  const reviewCardClassName = isScentNotesVariant
    ? 'space-y-3 rounded-[1.65rem] border border-[#eadfd7] bg-[linear-gradient(180deg,#ffffff_0%,#fffaf6_100%)] p-5 shadow-[0_20px_70px_-58px_rgba(61,41,44,0.16)]'
    : isVoiceNotesVariant
      ? 'space-y-3 rounded-[1.6rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f7_100%)] p-5 shadow-[0_20px_70px_-58px_rgba(107,33,49,0.18)]'
      : isElessiStoryGrid
        ? ''
        : isElessiProofWall || isElessiStoryGrid || isElessiTrustPile
          ? 'space-y-3 rounded-[1.6rem] border border-[#ead8ca] bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-5 shadow-[0_20px_70px_-58px_rgba(91,57,40,0.16)]'
      : isElessiPlantReviews
        ? 'space-y-3 border border-[#d8e6d8] bg-white p-5 shadow-[0_20px_60px_-54px_rgba(32,53,40,0.12)]'
      : isCommandProofVariant
        ? 'space-y-3 rounded-[1.6rem] border border-[#dce4ef] bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)] p-5 shadow-[0_20px_70px_-58px_rgba(15,23,42,0.18)]'
      : getReviewCardClassName(cardStyle);

  const reviewGridClassName = getReviewGridClassName(sectionVariant, isZenOrganic);
  const productTags = product?.['tags'];
  const tagsValue = Array.isArray(productTags) ? productTags.join(', ') : notAvailableText;

  const trustedBadgeTitle =
    typeof product?.['trustedBadgeTitle'] === 'string' && product['trustedBadgeTitle'].trim()
      ? product['trustedBadgeTitle'].trim()
      : prefersArabicCopy
        ? 'ثقة بعد الشراء'
        : 'Post-purchase trust';
  const trustedBadgeSubtitle =
    typeof product?.['trustedBadgeSubtitle'] === 'string' &&
    product['trustedBadgeSubtitle'].trim()
      ? product['trustedBadgeSubtitle'].trim()
      : prefersArabicCopy
        ? 'مؤشرات قصيرة عن الضمان والشحن وتجربة الاستخدام.'
        : 'Short cues about warranty, shipping, and real product use.';
  const trustedBadgeItems = Array.isArray(product?.['trustedBadgeItems'])
    ? (product['trustedBadgeItems'] as string[]).filter((item) => typeof item === 'string' && item.trim()).slice(0, 3)
    : [];

  const showingReviewsText = prefersArabicCopy
    ? `عرض ${visibleReviews.length} من أصل ${totalCount} مراجعة`
    : `Showing ${visibleReviews.length} of ${totalCount} reviews`;
  const mobileShowingReviewsText = prefersArabicCopy
    ? `عرض مختصر من أصل ${totalCount} مراجعة`
    : `Compact view from ${totalCount} reviews`;
  const ratingBreakdownTitle = prefersArabicCopy ? 'تفصيل التقييمات' : 'Rating Breakdown';
  const ratedByCustomersText = prefersArabicCopy ? 'تقييمات العملاء' : 'Rated by customers';
  const compactLayoutText = prefersArabicCopy ? 'عرض مضغوط' : 'Compact layout';
  const sortByText = prefersArabicCopy ? 'الترتيب حسب:' : 'Sort by:';
  const newestText = prefersArabicCopy ? 'الأحدث' : 'Newest';
  const verifiedZenText = prefersArabicCopy ? '(موثق)' : '(Verified)';
  const customerFeedbackText = prefersArabicCopy ? 'رأي العميل' : 'Customer feedback';
  const defaultFeedbackText = prefersArabicCopy
    ? 'أعجبته التجربة بشكل عام وأراد مشاركة ملاحظة سريعة.'
    : 'Loved the overall experience and wanted to share quick feedback.';
  const ratingOnlyCommentText = prefersArabicCopy
    ? 'شارك العميل تقييمه بدون إضافة تعليق مكتوب.'
    : 'Customer shared a rating without extra written feedback.';
  const helpfulCustomersText = (count: number) =>
    prefersArabicCopy
      ? `${count} عميل وجدوا هذه المراجعة مفيدة`
      : `${count} customers found this helpful`;
  const helpfulPeopleText = (count: number) =>
    prefersArabicCopy
      ? `${count} شخص وجدوا هذه المراجعة مفيدة`
      : `${count} people found this helpful`;
  const showingRangeStart = totalCount > 0 ? 1 : 0;
  const showingRangeEnd = Math.min(visibleReviews.length, totalCount);
  const showingRangeText = prefersArabicCopy
    ? `عرض ${showingRangeStart} - ${showingRangeEnd} من ${totalCount} مراجعات`
    : `Showing ${showingRangeStart} - ${showingRangeEnd} of ${totalCount} reviews`;

  const handleReviewSubmitted = useCallback(() => {
    if (!productId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ['storefront', 'reviews', productId],
    });
  }, [productId, queryClient]);

  return {
    productId,
    sectionRef,
    sectionVariant,
    isElessiStoryGrid,
    isZenOrganic,
    isKhemetLuxeTheme,
    isCompactVariant,
    isStoryNotesVariant,
    isScentNotesVariant,
    isVoiceNotesVariant,
    isElessiProofWall,
    isElessiTrustPile,
    isElessiPlantReviews,
    isCommandProofVariant,
    shouldShowLoading,
    shouldUseCompactEmptyReviews,
    isContentCentered,
    prefersArabicCopy,
    title,
    writeReviewText,
    emptyText,
    verifiedLabel,
    outOfText,
    reviewsLabel,
    mediaTitle,
    mediaDescription,
    listTitle,
    activeTab,
    setActiveTab,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    handleReviewSubmitted,
    product,
    tagsValue,
    notAvailableText,
    totalCount,
    averageRating,
    distributionRows,
    visibleReviews,
    reviews,
    mediaFeed,
    elessiPreviewMedia,
    ugcEnabled,
    showMediaFeed,
    showWriteReviewButton,
    showVerifiedBadge,
    galleryStyle,
    mobileReviewLimit,
    reviewCardClassName,
    reviewGridClassName,
    trustedBadgeTitle,
    trustedBadgeSubtitle,
    trustedBadgeItems,
    showingReviewsText,
    mobileShowingReviewsText,
    ratingBreakdownTitle,
    ratedByCustomersText,
    compactLayoutText,
    sortByText,
    newestText,
    verifiedZenText,
    customerFeedbackText,
    defaultFeedbackText,
    ratingOnlyCommentText,
    helpfulCustomersText,
    helpfulPeopleText,
    showingRangeText,
    allowPhotoReviews,
    allowVideoReviews,
  };
};

export type ReviewsSectionController = ReturnType<typeof useReviewsSectionController>;
