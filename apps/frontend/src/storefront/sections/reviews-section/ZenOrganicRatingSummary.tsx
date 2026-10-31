import React from 'react';
import type { RatingDistributionRow } from './types';

export interface ZenOrganicRatingSummaryProps {
  averageRating: number;
  outOfText: string;
  reviewsLabel: string;
  totalCount: number;
  prefersArabicCopy: boolean;
  distributionRows: RatingDistributionRow[];
  showWriteReviewButton: boolean;
  writeReviewText: string;
  setIsReviewDialogOpen: (open: boolean) => void;
}

export const ZenOrganicRatingSummary: React.FC<ZenOrganicRatingSummaryProps> = ({
  averageRating,
  outOfText,
  reviewsLabel,
  totalCount,
  prefersArabicCopy,
  distributionRows,
  showWriteReviewButton,
  writeReviewText,
  setIsReviewDialogOpen,
}) => {
  return (
    <div className="mb-16 grid grid-cols-1 gap-12 pb-12 lg:grid-cols-2">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-6xl font-bold text-[#1a3328] tabular-nums">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-lg font-bold text-[#1a3328]/30">{outOfText}</span>
        </div>
        <div className="mb-3 flex gap-1 text-[#ffb800]">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating)
                  ? 'fill-current'
                  : 'fill-[#e9ebe5] text-[#e9ebe5]'
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1a3328]/40">
          {prefersArabicCopy
            ? `بناءً على ${totalCount} تقييم`
            : `Based on ${totalCount} ${reviewsLabel}`}
        </p>

        {showWriteReviewButton ? (
          <button
            type="button"
            onClick={() => setIsReviewDialogOpen(true)}
            className="mt-6 rounded-full bg-[#1a3328] px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#fcfbf9] transition-all duration-300 hover:bg-[#88a876] hover:text-[#1a3328]"
          >
            {writeReviewText}
          </button>
        ) : null}
      </div>

      <div className="flex flex-col justify-center space-y-3">
        {distributionRows.map((row) => (
          <div key={row.rating} className="flex items-center gap-4 text-xs font-bold">
            <span className="w-8 text-[#1a3328] tabular-nums">
              {row.rating} {prefersArabicCopy ? 'نجوم' : 'stars'}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f3ee]">
              <div
                className="h-full rounded-full bg-[#1a3328] transition-all duration-700"
                style={{ width: `${row.percentage}%` }}
              />
            </div>
            <span className="w-8 text-right text-[#1a3328]/30 tabular-nums">
              {row.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZenOrganicRatingSummary;
