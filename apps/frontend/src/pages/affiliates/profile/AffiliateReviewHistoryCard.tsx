import React from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { AffiliateReviewHistoryItem } from "./types";
import { formatDate } from "./helpers";

interface AffiliateReviewHistoryCardProps {
  reviewHistory: AffiliateReviewHistoryItem[];
}

export const AffiliateReviewHistoryCard: React.FC<AffiliateReviewHistoryCardProps> = ({
  reviewHistory,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <ClipboardDocumentListIcon className="h-5 w-5" />
        سجل القرارات
      </h2>
      <div className="mt-4 space-y-3">
        {reviewHistory.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          >
            <div className="font-semibold">{log.title}</div>
            <div className="mt-1 text-xs text-slate-500 tabular-nums">
              {formatDate(log.createdAt)}
            </div>
            {log.note ? (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {log.note}
              </p>
            ) : null}
          </div>
        ))}
        {reviewHistory.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            لا يوجد سجل مراجعات.
          </p>
        ) : null}
      </div>
    </section>
  );
};
