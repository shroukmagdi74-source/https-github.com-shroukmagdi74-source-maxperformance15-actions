import React from 'react';
import { StarRating, type RatingDistributionRow } from './types';

interface ReviewMediaItem {
  url: string;
  type: string;
  poster?: string;
  alt?: string;
}

export interface ElessiRatingSummaryProps {
  totalCount: number;
  averageRating: number;
  prefersArabicCopy: boolean;
  distributionRows: RatingDistributionRow[];
  elessiPreviewMedia: ReviewMediaItem[];
  writeReviewText: string;
  setIsReviewDialogOpen: (open: boolean) => void;
}

export const ElessiRatingSummary: React.FC<ElessiRatingSummaryProps> = ({
  totalCount,
  averageRating,
  prefersArabicCopy,
  distributionRows,
  elessiPreviewMedia,
  writeReviewText,
  setIsReviewDialogOpen,
}) => {
  return (
    <div
      dir={prefersArabicCopy ? 'rtl' : 'ltr'}
      className="mb-8 rounded-[1rem] border border-[#ece2d9] bg-[#fbf9f6] p-4 sm:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[2.6rem] font-black leading-none text-[#2d211e] tabular-nums">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-[#8f7b73]">
              {prefersArabicCopy ? 'من 5 نجوم' : 'out of 5'}
            </span>
          </div>
          <StarRating rating={averageRating} />
          <p className="text-xs text-[#8f7b73]">
            {prefersArabicCopy
              ? `استنادًا إلى ${totalCount} تقييم موثق`
              : `Based on ${totalCount} verified reviews`}
          </p>
        </div>

        <div className="min-w-0">
          <div className="space-y-1.5">
            {distributionRows.map((item) => (
              <div
                key={`elessi-dist-${item.rating}`}
                className="flex items-center gap-2 text-xs"
              >
                <span className="flex w-7 items-center justify-start gap-1 font-semibold text-[#5a4841] tabular-nums">
                  <span>{item.rating}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#f5a200]"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ececec]">
                  <div
                    className="h-full rounded-full bg-[#78aa08] transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-5 text-right text-[#8f7b73] tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 border-y border-[#efe0d4] py-4 lg:border-y-0 lg:border-s lg:border-e lg:px-6 lg:py-0">
          {elessiPreviewMedia.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {elessiPreviewMedia.map((item, index) => {
                const previewSrc = item.type === 'video' ? item.poster || '' : item.url;

                return (
                  <div
                    key={`${item.url}-${index}`}
                    className="relative h-[4.65rem] w-[4.65rem] shrink-0 overflow-hidden rounded-[0.9rem] border border-[#e6dfd7] bg-white"
                  >
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={
                          item.alt ||
                          (prefersArabicCopy ? 'وسائط من مراجعات العملاء' : 'Customer review media')
                        }
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#f5f1ed]" />
                    )}
                    {item.type === 'video' ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/12">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/92 shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
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
          ) : (
            <p className="text-sm text-[#8f7b73]">
              {prefersArabicCopy
                ? 'لا توجد وسائط مرفوعة مع المراجعات بعد.'
                : 'No review media has been uploaded yet.'}
            </p>
          )}
        </div>

        <div
          dir={prefersArabicCopy ? 'rtl' : 'ltr'}
          className={`flex ${prefersArabicCopy ? 'lg:justify-end' : 'lg:justify-start'}`}
        >
          <button
            type="button"
            onClick={() => setIsReviewDialogOpen(true)}
            className="inline-flex min-h-[2.65rem] w-full items-center justify-center rounded-[0.5rem] bg-[#fb6a6d] px-5 text-sm font-black text-white transition-colors hover:bg-[#f85d61] lg:w-auto lg:min-w-[11rem]"
          >
            {writeReviewText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElessiRatingSummary;
