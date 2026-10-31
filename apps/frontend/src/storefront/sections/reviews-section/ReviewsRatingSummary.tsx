import React from 'react';
import { StarRating, type RatingDistributionRow, type ReviewsSectionVariant } from './types';
import ZenOrganicRatingSummary from './ZenOrganicRatingSummary';
import ElessiRatingSummary from './ElessiRatingSummary';

interface ReviewMediaItem {
  url: string;
  type: string;
  poster?: string;
  alt?: string;
}

interface ReviewsRatingSummaryProps {
  isZenOrganic: boolean;
  shouldShowLoading: boolean;
  totalCount: number;
  averageRating: number;
  outOfText: string;
  reviewsLabel: string;
  prefersArabicCopy: boolean;
  distributionRows: RatingDistributionRow[];
  sectionVariant: ReviewsSectionVariant;
  isContentCentered: boolean;
  title: string;
  showWriteReviewButton: boolean;
  writeReviewText: string;
  setIsReviewDialogOpen: (open: boolean) => void;
  isElessiStoryGrid: boolean;
  elessiPreviewMedia: ReviewMediaItem[];
  isElessiPlantReviews: boolean;
  isElessiProofWall: boolean;
  isElessiTrustPile: boolean;
  isScentNotesVariant: boolean;
  isVoiceNotesVariant: boolean;
  isCommandProofVariant: boolean;
  isStoryNotesVariant: boolean;
  isCompactVariant: boolean;
  ratedByCustomersText: string;
  trustedBadgeSubtitle: string;
  trustedBadgeItems: string[];
  trustedBadgeTitle: string;
  ratingBreakdownTitle: string;
}

export const ReviewsRatingSummary: React.FC<ReviewsRatingSummaryProps> = ({
  isZenOrganic,
  shouldShowLoading,
  totalCount,
  averageRating,
  outOfText,
  reviewsLabel,
  prefersArabicCopy,
  distributionRows,
  sectionVariant,
  isContentCentered,
  title,
  showWriteReviewButton,
  writeReviewText,
  setIsReviewDialogOpen,
  isElessiStoryGrid,
  elessiPreviewMedia,
  isElessiPlantReviews,
  isElessiProofWall,
  isElessiTrustPile,
  isScentNotesVariant,
  isVoiceNotesVariant,
  isCommandProofVariant,
  isStoryNotesVariant,
  isCompactVariant,
  ratedByCustomersText,
  trustedBadgeSubtitle,
  trustedBadgeItems,
  trustedBadgeTitle,
  ratingBreakdownTitle,
}) => {
  if (isZenOrganic && !shouldShowLoading) {
    return (
      <ZenOrganicRatingSummary
        averageRating={averageRating}
        outOfText={outOfText}
        reviewsLabel={reviewsLabel}
        totalCount={totalCount}
        prefersArabicCopy={prefersArabicCopy}
        distributionRows={distributionRows}
        showWriteReviewButton={showWriteReviewButton}
        writeReviewText={writeReviewText}
        setIsReviewDialogOpen={setIsReviewDialogOpen}
      />
    );
  }

  if (isElessiStoryGrid && !shouldShowLoading) {
    return (
      <ElessiRatingSummary
        totalCount={totalCount}
        averageRating={averageRating}
        prefersArabicCopy={prefersArabicCopy}
        distributionRows={distributionRows}
        elessiPreviewMedia={elessiPreviewMedia}
        writeReviewText={writeReviewText}
        setIsReviewDialogOpen={setIsReviewDialogOpen}
      />
    );
  }

  // Editorial / Minimal / Scent / Voice / Command Proof / Default
  return (
    <div
      className={`mb-10 grid gap-6 ${
        sectionVariant === 'editorial'
          ? 'lg:grid-cols-[minmax(0,1fr)_320px]'
          : 'lg:grid-cols-[minmax(0,1fr)_280px]'
      } ${isContentCentered ? 'mx-auto max-w-5xl' : ''}`}
    >
      <div
        className={`rounded-[1.5rem] p-6 shadow-sm ${
          isElessiPlantReviews
            ? 'border border-[#d8e6d8] bg-white shadow-[0_24px_70px_-58px_rgba(32,53,40,0.12)]'
            : isElessiProofWall || isElessiStoryGrid || isElessiTrustPile
              ? 'border border-[#ead8ca] bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] shadow-[0_24px_80px_-64px_rgba(91,57,40,0.14)]'
              : isScentNotesVariant
                ? 'border border-[#eadfd7] bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] shadow-[0_24px_80px_-64px_rgba(61,41,44,0.14)]'
                : isVoiceNotesVariant
                  ? 'border border-[#ead9d8] bg-[linear-gradient(180deg,#ffffff_0%,#fff7f5_100%)] shadow-[0_24px_80px_-64px_rgba(107,33,49,0.18)]'
                  : isCommandProofVariant
                    ? 'border border-[#dce4ef] bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)] shadow-[0_24px_80px_-64px_rgba(15,23,42,0.16)]'
                    : 'border border-border bg-card'
        }`}
      >
        <div
          className={`flex flex-col gap-4 ${
            isContentCentered
              ? 'items-center text-center'
              : 'sm:flex-row sm:items-start sm:justify-between'
          }`}
        >
          <div className={`space-y-3 ${isContentCentered ? 'text-center' : ''}`}>
            {isStoryNotesVariant ? (
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black tracking-[0.2em] ${
                  isElessiStoryGrid
                    ? 'border border-[#ead8ca] bg-[#fff7f1] text-[#8f5c44]'
                    : isScentNotesVariant
                      ? 'border border-[#eadfd7] bg-[#fff8f2] text-[#8b623e]'
                      : 'border border-[#f3c8c1] bg-[#fff2ee] text-[#8b3d33]'
                } ${isContentCentered ? 'mx-auto' : ''}`}
              >
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${
                    isElessiStoryGrid
                      ? 'bg-[#8f5c44]'
                      : isScentNotesVariant
                        ? 'bg-[#8b623e]'
                        : 'bg-[#ea580c]'
                  }`}
                />
                {isElessiStoryGrid
                  ? 'قصص الشراء'
                  : isScentNotesVariant
                    ? 'ملاحظات العطر'
                    : 'آراء سريعة'}
              </span>
            ) : isElessiPlantReviews ? (
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border border-[#d8e6d8] bg-[#f7fbf6] px-3 py-1 text-[11px] font-black tracking-[0.2em] text-[#6b8a74] ${
                  isContentCentered ? 'mx-auto' : ''
                }`}
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-[#6b8a74]" />
                مراجعات الزراعة المنزلية
              </span>
            ) : null}

            <div>
              <div
                className={`flex items-baseline gap-2 ${
                  isContentCentered ? 'justify-center' : ''
                }`}
              >
                <span className="text-4xl font-extrabold text-foreground tabular-nums">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">{outOfText}</span>
              </div>
              <div
                className={`mt-2 flex items-center gap-2 ${
                  isContentCentered ? 'justify-center' : ''
                }`}
              >
                <StarRating rating={averageRating} />
                <span className="text-xs text-muted-foreground">
                  ({totalCount} {reviewsLabel})
                </span>
              </div>
            </div>

            <p className="max-w-md text-xs text-muted-foreground">
              {ratedByCustomersText}
            </p>
          </div>

          <div
            className={`flex flex-col gap-2 ${
              isContentCentered ? 'items-center' : 'items-start sm:items-end'
            }`}
          >
            {showWriteReviewButton ? (
              <button
                type="button"
                onClick={() => setIsReviewDialogOpen(true)}
                className={`rounded-[var(--radius)] px-4 py-2 text-sm font-medium transition-colors ${
                  isElessiStoryGrid
                    ? 'border border-[#ead8ca] bg-[#2d211e] text-white hover:bg-[#43312c]'
                    : isScentNotesVariant
                      ? 'border border-[#e0c8b3] bg-[#8b623e] text-white hover:bg-[#724e2e]'
                      : isVoiceNotesVariant
                        ? 'border border-[#e7b0bc] bg-[#9f1239] text-white hover:bg-[#881337]'
                        : isCommandProofVariant
                          ? 'border border-[#cbd5e1] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {writeReviewText}
              </button>
            ) : null}

            {isCompactVariant ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {prefersArabicCopy ? 'تقييمات سريعة ومختصرة' : 'Quick compact reviews'}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <div className="mb-2 text-xs font-semibold text-foreground">
            {ratingBreakdownTitle}
          </div>
          <div className="space-y-1.5">
            {distributionRows.map((row) => (
              <div key={row.rating} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-muted-foreground tabular-nums">
                  {row.rating} {prefersArabicCopy ? 'نجوم' : 'stars'}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground tabular-nums">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col justify-between rounded-[1.5rem] p-6 shadow-sm ${
          isElessiPlantReviews
            ? 'border border-[#d8e6d8] bg-[#fbfdfa]'
            : isElessiProofWall || isElessiStoryGrid || isElessiTrustPile
              ? 'border border-[#ead8ca] bg-[#fffaf5]'
              : isScentNotesVariant
                ? 'border border-[#eadfd7] bg-[#fffbf7]'
                : isVoiceNotesVariant
                  ? 'border border-[#ead9d8] bg-[#fff8f7]'
                  : isCommandProofVariant
                    ? 'border border-[#dce4ef] bg-[#f8fafc]'
                    : 'border border-border bg-card'
        }`}
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {trustedBadgeTitle}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {trustedBadgeSubtitle}
          </p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {trustedBadgeItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isElessiPlantReviews
                      ? 'bg-[#6b8a74]'
                      : isElessiStoryGrid
                        ? 'bg-[#8f5c44]'
                        : isScentNotesVariant
                          ? 'bg-[#8b623e]'
                          : isVoiceNotesVariant
                            ? 'bg-[#9f1239]'
                            : isCommandProofVariant
                              ? 'bg-[#0f172a]'
                              : 'bg-primary'
                  }`}
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            {prefersArabicCopy
              ? 'يتم تحديث التقييمات ومشاركتها بعد مراجعة موثوقية الطلب.'
              : 'Ratings are updated after verifying order authenticity.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewsRatingSummary;
