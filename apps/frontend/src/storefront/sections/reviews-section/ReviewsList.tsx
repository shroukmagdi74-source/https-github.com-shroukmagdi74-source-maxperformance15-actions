import React from 'react';
import type { ProductReview } from '../../hooks/useProductReviews';
import { ReviewSkeleton } from './types';
import ReviewCard from './ReviewCard';

interface ReviewsListProps {
  isZenOrganic: boolean;
  shouldShowLoading: boolean;
  visibleReviews: ProductReview[];
  reviews: ProductReview[];
  listTitle: string;
  showingReviewsText: string;
  setIsReviewDialogOpen: (open: boolean) => void;
  writeReviewText: string;
  sortByText: string;
  newestText: string;
  isElessiStoryGrid: boolean;
  showingRangeText: string;
  prefersArabicCopy: boolean;
  isContentCentered: boolean;
  isCompactVariant: boolean;
  mobileReviewLimit: number;
  mobileShowingReviewsText: string;
  compactLayoutText: string;
  shouldUseCompactEmptyReviews: boolean;
  emptyText: string;
  showWriteReviewButton: boolean;
  reviewGridClassName: string;
  allowPhotoReviews: boolean;
  allowVideoReviews: boolean;
  reviewCardClassName: string;
  isStoryNotesVariant: boolean;
  isScentNotesVariant: boolean;
  isVoiceNotesVariant: boolean;
  isCommandProofVariant: boolean;
  showVerifiedBadge: boolean;
  verifiedZenText: string;
  verifiedLabel: string;
  customerFeedbackText: string;
  defaultFeedbackText: string;
  galleryStyle: string;
  helpfulCustomersText: (count: number) => string;
  ratingOnlyCommentText: string;
  helpfulPeopleText: (count: number) => string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  isZenOrganic,
  shouldShowLoading,
  visibleReviews,
  reviews,
  listTitle,
  showingReviewsText,
  setIsReviewDialogOpen,
  writeReviewText,
  sortByText,
  newestText,
  isElessiStoryGrid,
  showingRangeText,
  prefersArabicCopy,
  isContentCentered,
  isCompactVariant,
  mobileReviewLimit,
  mobileShowingReviewsText,
  compactLayoutText,
  shouldUseCompactEmptyReviews,
  emptyText,
  showWriteReviewButton,
  reviewGridClassName,
  allowPhotoReviews,
  allowVideoReviews,
  reviewCardClassName,
  isStoryNotesVariant,
  isScentNotesVariant,
  isVoiceNotesVariant,
  isCommandProofVariant,
  showVerifiedBadge,
  verifiedZenText,
  verifiedLabel,
  customerFeedbackText,
  defaultFeedbackText,
  galleryStyle,
  helpfulCustomersText,
  ratingOnlyCommentText,
  helpfulPeopleText,
}) => {
  return (
    <>
      {isZenOrganic && !shouldShowLoading && visibleReviews.length > 0 ? (
        <div className="mb-8 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#1a3328]">{listTitle}</h3>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[#1a3328]/30">
              {showingReviewsText}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a3328]/50">
                {sortByText}:
              </span>
              <span className="text-xs font-bold text-[#1a3328]">{newestText}</span>
            </div>
          </div>
        </div>
      ) : null}

      {isElessiStoryGrid && !shouldShowLoading && visibleReviews.length > 0 ? (
        <div
          dir={prefersArabicCopy ? 'rtl' : 'ltr'}
          className="mb-8 flex flex-col gap-4 border-b border-[#ece2d9] pb-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className={prefersArabicCopy ? 'text-right' : 'text-left'}>
            <p className="text-[1.05rem] font-black text-[#2d211e]">
              {prefersArabicCopy ? 'آراء المشترين الحقيقيين' : 'Customer reviews'}
            </p>
            <p className="mt-1 text-sm text-[#7c6963]">{showingRangeText}</p>
          </div>
          <div className="flex items-center gap-3 text-[#5f4e47]">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#2d211e] text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 4h18v2H3V4Zm0 7h18v2H3v-2Zm0 7h18v2H3v-2Z" />
                </svg>
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#f2f2f2] text-[#2d211e]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6h4v4H4V6Zm6 0h10v4H10V6ZM4 14h4v4H4v-4Zm6 0h10v4H10v-4Z" />
                </svg>
              </span>
            </div>
            <span className="text-sm">
              {prefersArabicCopy ? 'الترتيب حسب' : 'Sort by'}{' '}
              <span className="font-medium text-[#2d211e]">
                {prefersArabicCopy ? 'الأحدث' : 'Latest'}
              </span>
            </span>
          </div>
        </div>
      ) : null}

      {!isZenOrganic && !shouldShowLoading && visibleReviews.length > 0 && !isElessiStoryGrid ? (
        <div
          className={`mb-6 flex flex-col gap-3 ${
            isContentCentered
              ? 'items-center text-center'
              : 'sm:flex-row sm:items-center sm:justify-between'
          }`}
        >
          <div className={isContentCentered ? 'text-center' : ''}>
            <h3
              className={`text-lg font-bold text-foreground ${
                isCompactVariant ? 'hidden sm:block' : ''
              }`}
            >
              {listTitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mobileReviewLimit < visibleReviews.length ? (
                <>
                  <span className="sm:hidden">{mobileShowingReviewsText}</span>
                  <span className="hidden sm:inline">{showingReviewsText}</span>
                </>
              ) : (
                showingReviewsText
              )}
            </p>
          </div>
          {isCompactVariant ? (
            <span className="hidden w-fit rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-foreground sm:inline-flex">
              {compactLayoutText}
            </span>
          ) : null}
        </div>
      ) : null}

      {shouldShowLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <ReviewSkeleton key={item} />
          ))}
        </div>
      ) : null}

      {!shouldShowLoading && reviews.length === 0 ? (
        <div
          className={
            shouldUseCompactEmptyReviews
              ? 'rounded-[1.1rem] border border-dashed border-[#ead8ca] bg-[#fffaf6] p-4 text-center'
              : 'rounded-[1.5rem] border border-dashed border-border bg-card/70 p-6 text-center sm:p-8'
          }
        >
          <div
            className={
              shouldUseCompactEmptyReviews
                ? 'mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e3d6]'
                : 'mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={shouldUseCompactEmptyReviews ? '20' : '24'}
              height={shouldUseCompactEmptyReviews ? '20' : '24'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={shouldUseCompactEmptyReviews ? 'text-[#8f5c44]' : 'text-primary'}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3
            className={
              shouldUseCompactEmptyReviews
                ? 'mt-3 text-base font-black text-[#2d211e]'
                : 'mt-4 text-lg font-bold text-foreground'
            }
          >
            {prefersArabicCopy ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
          </h3>
          <p
            className={
              shouldUseCompactEmptyReviews
                ? 'mx-auto mt-1 max-w-xl text-sm leading-6 text-[#6f5a54]'
                : 'mt-2 mx-auto max-w-xl text-sm leading-7 text-muted-foreground'
            }
          >
            {emptyText}
          </p>
          {shouldUseCompactEmptyReviews ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                prefersArabicCopy ? 'تبديل مقاس' : 'Size exchange',
                prefersArabicCopy ? 'شحن داخل مصر' : 'Egypt shipping',
                prefersArabicCopy ? 'دعم بعد الشراء' : 'After-sale support',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#ead8ca] bg-white px-3 py-1.5 text-[11px] font-black text-[#6b4a3c]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
          {showWriteReviewButton ? (
            <button
              type="button"
              onClick={() => setIsReviewDialogOpen(true)}
              className={
                shouldUseCompactEmptyReviews
                  ? 'mt-4 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90'
                  : 'mt-5 rounded-[var(--radius)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90'
              }
            >
              {writeReviewText}
            </button>
          ) : null}
        </div>
      ) : null}

      {!shouldShowLoading && visibleReviews.length > 0 ? (
        <div className={reviewGridClassName}>
          {visibleReviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              index={index}
              isZenOrganic={isZenOrganic}
              isElessiStoryGrid={isElessiStoryGrid}
              reviewCardClassName={reviewCardClassName}
              isStoryNotesVariant={isStoryNotesVariant}
              isScentNotesVariant={isScentNotesVariant}
              isVoiceNotesVariant={isVoiceNotesVariant}
              isCommandProofVariant={isCommandProofVariant}
              mobileReviewLimit={mobileReviewLimit}
              showVerifiedBadge={showVerifiedBadge}
              verifiedZenText={verifiedZenText}
              verifiedLabel={verifiedLabel}
              customerFeedbackText={customerFeedbackText}
              defaultFeedbackText={defaultFeedbackText}
              prefersArabicCopy={prefersArabicCopy}
              allowPhotoReviews={allowPhotoReviews}
              allowVideoReviews={allowVideoReviews}
              galleryStyle={galleryStyle}
              helpfulCustomersText={helpfulCustomersText}
              ratingOnlyCommentText={ratingOnlyCommentText}
              helpfulPeopleText={helpfulPeopleText}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default ReviewsList;
