import React from 'react';
import type { ProductReview } from '../../hooks/useProductReviews';
import ReviewMediaGallery from '../../components/ReviewMediaGallery';
import {
  ElessiAvatar,
  formatDisplayDate,
  getEnabledReviewMedia,
  StarRating,
} from './types';
import { formatNumber } from '../../utils/localeFormat';

export interface ReviewCardProps {
  review: ProductReview;
  index: number;
  isZenOrganic: boolean;
  isElessiStoryGrid: boolean;
  reviewCardClassName: string;
  isStoryNotesVariant: boolean;
  isScentNotesVariant: boolean;
  isVoiceNotesVariant: boolean;
  isCommandProofVariant: boolean;
  mobileReviewLimit: number;
  showVerifiedBadge: boolean;
  verifiedZenText: string;
  verifiedLabel: string;
  customerFeedbackText: string;
  defaultFeedbackText: string;
  prefersArabicCopy: boolean;
  allowPhotoReviews: boolean;
  allowVideoReviews: boolean;
  galleryStyle: string;
  helpfulCustomersText: (count: number) => string;
  ratingOnlyCommentText: string;
  helpfulPeopleText: (count: number) => string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  index,
  isZenOrganic,
  isElessiStoryGrid,
  reviewCardClassName,
  isStoryNotesVariant,
  isScentNotesVariant,
  isVoiceNotesVariant,
  isCommandProofVariant,
  mobileReviewLimit,
  showVerifiedBadge,
  verifiedZenText,
  verifiedLabel,
  customerFeedbackText,
  defaultFeedbackText,
  prefersArabicCopy,
  allowPhotoReviews,
  allowVideoReviews,
  galleryStyle,
  helpfulCustomersText,
  ratingOnlyCommentText,
  helpfulPeopleText,
}) => {
  const reviewMedia = getEnabledReviewMedia(
    review,
    allowPhotoReviews,
    allowVideoReviews,
  );
  const reviewDate = formatDisplayDate(review.createdAt || review.date);

  return (
    <div
      className={[
        isZenOrganic ? 'space-y-4' : reviewCardClassName,
        isStoryNotesVariant ? 'relative overflow-hidden' : '',
        index >= mobileReviewLimit ? 'hidden sm:block' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isStoryNotesVariant ? (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[1.6rem] ${
            isScentNotesVariant
              ? 'bg-[linear-gradient(90deg,#d2b4a3_0%,#8b623e_52%,#3d292c_100%)]'
              : 'bg-[linear-gradient(90deg,#fca5a5_0%,#fb7185_48%,#f59e0b_100%)]'
          }`}
        />
      ) : isCommandProofVariant ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[1.6rem] bg-[linear-gradient(90deg,#f7b500_0%,#facc15_46%,#0f172a_100%)]" />
      ) : null}

      {!isElessiStoryGrid ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isZenOrganic ? (
              <div className="h-12 w-12 overflow-hidden rounded-full bg-[#f1f3ee]">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    review.author,
                  )}&format=svg&background=f1f3ee&color=1a3328`}
                  alt={review.author}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {review.author?.[0]?.toUpperCase() || '?'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    isZenOrganic ? 'text-[#1a3328]' : 'text-foreground'
                  }`}
                >
                  {review.author}
                </span>
                {showVerifiedBadge && review.verified !== false ? (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isZenOrganic
                        ? 'text-[#88a876]'
                        : 'rounded-full bg-green-500/10 px-1.5 py-0.5 text-green-600'
                    }`}
                  >
                    {isZenOrganic ? verifiedZenText : verifiedLabel}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] font-bold text-[#1a3328]/20">
                {reviewDate || review.date}
              </span>
            </div>
          </div>
          {!isZenOrganic ? <StarRating rating={review.rating || 5} /> : null}
        </div>
      ) : null}

      {isZenOrganic ? (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-[#1a3328]">
            {review.title || customerFeedbackText}
          </h4>
          <p className="max-w-2xl text-sm leading-relaxed text-[#1a3328]/60">
            {review.comment || defaultFeedbackText}
          </p>
          <div className="flex gap-2">
            <div className="flex gap-0.5 text-[#ffb800]">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-3 w-3 ${
                    star <= (review.rating || 5)
                      ? 'fill-current'
                      : 'fill-[#e9ebe5] text-[#e9ebe5]'
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] font-black text-[#1a3328] tabular-nums">
              {review.rating.toFixed(1)}
            </span>
          </div>
          {reviewMedia.length > 0 ? (
            <ReviewMediaGallery
              media={reviewMedia}
              galleryStyle={galleryStyle}
              className="pt-2"
            />
          ) : null}
          {review.helpfulCount > 0 ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a3328]/35">
              {helpfulCustomersText(review.helpfulCount)}
            </div>
          ) : null}
        </div>
      ) : isElessiStoryGrid ? (
        <div
          dir={prefersArabicCopy ? 'rtl' : 'ltr'}
          className="grid gap-4 border-b border-[#ece2d9] py-6 lg:grid-cols-[minmax(0,1fr)_13.25rem] lg:gap-5"
        >
          <div className="min-w-0">
            <div className="grid items-start gap-3 md:grid-cols-[4.25rem_minmax(0,1fr)] md:gap-4">
              <ElessiAvatar label={review.author} />
              <div
                dir={prefersArabicCopy ? 'rtl' : 'ltr'}
                className={`min-w-0 ${prefersArabicCopy ? 'text-right' : 'text-left'}`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-start gap-2">
                  <StarRating rating={review.rating || 5} />
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 text-[#2d211e]">
                  <span className="text-base font-black">{review.author}</span>
                  <span className="text-[#8f7b73]">—</span>
                  <span className="text-[0.92rem] text-[#8f7b73]">
                    {reviewDate || review.date}
                  </span>
                </div>
                <p className="mt-2.5 max-w-[44rem] text-[0.98rem] leading-7 text-[#4f413b]">
                  {review.comment || ratingOnlyCommentText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            {reviewMedia.length > 0 ? (
              <div className="flex gap-2 self-stretch overflow-x-auto pb-1 lg:w-[13.25rem] lg:self-auto [&::-webkit-scrollbar]:hidden">
                {reviewMedia.slice(0, 3).map((item, mediaIndex) => {
                  const previewSrc =
                    item.type === 'video' ? item.poster || '' : item.url;

                  return (
                    <div
                      key={`${item.url}-${mediaIndex}`}
                      className="relative h-[3.9rem] w-[3.9rem] shrink-0 overflow-hidden rounded-[0.72rem] border border-[#ece2d9] bg-white lg:h-[4rem] lg:w-[4rem]"
                    >
                      {previewSrc ? (
                        <img
                          src={previewSrc}
                          alt={
                            item.alt ||
                            (prefersArabicCopy
                              ? 'وسائط من مراجعات العملاء'
                              : 'Customer review media')
                          }
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#f5f1ed]" />
                      )}
                      {item.type === 'video' ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/92 shadow-sm lg:h-7 lg:w-7">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="translate-x-[1px] text-[#2d211e]"
                            >
                              <polygon points="8,5 19,12 8,19" />
                            </svg>
                          </span>
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
            {review.helpfulCount > 0 ? (
              <div className="flex items-center gap-2 text-[0.78rem] text-[#98837b] lg:gap-1.5">
                <span>{prefersArabicCopy ? 'مفيد؟' : 'Helpful?'}</span>
                <span className="inline-flex items-center gap-1 font-medium text-[#7c6963] tabular-nums">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M7 10v12" />
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.94 2.5l-1.34 5A2 2 0 0 1 18.5 19H7V8.53a2 2 0 0 1 .59-1.41l4.83-4.82A2 2 0 0 1 15.88 3 2 2 0 0 1 16 4.2v1.67Z" />
                  </svg>
                  {formatNumber(review.helpfulCount, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {isCommandProofVariant ? (
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-full border border-[#f4d067] bg-[#fff9de] px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-[#8b623e]">
                {prefersArabicCopy ? 'تجربة فعلية' : 'Real usage'}
              </span>
              <StarRating rating={review.rating || 5} />
            </div>
          ) : null}
          {review.title ? (
            <h3 className="text-base font-semibold text-foreground">
              {review.title}
            </h3>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {review.comment || ratingOnlyCommentText}
          </p>
          {reviewMedia.length > 0 ? (
            <ReviewMediaGallery
              media={reviewMedia}
              galleryStyle={galleryStyle}
              className="pt-1"
            />
          ) : null}
          {review.helpfulCount > 0 ? (
            <div className="text-xs font-medium text-muted-foreground">
              {helpfulPeopleText(review.helpfulCount)}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ReviewCard;
