import React from "react";
import { DocumentTextIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { AffiliateDocument } from "./types";
import { formatDate, getDocumentStatusLabel } from "./helpers";

interface AffiliateDocumentsCardProps {
  identityDocumentStatus: string;
  identityDocumentUploadedAt?: string | null;
  identityDocumentReviewNote?: string | null;
  identityDocumentUrl?: string | null;
  documentHistory: AffiliateDocument[];
  reviewDocument: (status: "APPROVED" | "REJECTED") => Promise<void>;
  saving: boolean;
}

export const AffiliateDocumentsCard: React.FC<AffiliateDocumentsCardProps> = ({
  identityDocumentStatus,
  identityDocumentUploadedAt,
  identityDocumentReviewNote,
  identityDocumentUrl,
  documentHistory,
  reviewDocument,
  saving,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <IdentificationIcon className="h-5 w-5" />
        المستندات والمراجعة
      </h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="font-semibold">
            {getDocumentStatusLabel(identityDocumentStatus)}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {formatDate(identityDocumentUploadedAt)}
          </div>
          {identityDocumentReviewNote ? (
            <p className="mt-2 text-xs text-red-600 dark:text-red-300">
              {identityDocumentReviewNote}
            </p>
          ) : null}
          {identityDocumentUrl ? (
            <a
              href={identityDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <DocumentTextIcon className="h-4 w-4" />
              فتح المستند الحالي
            </a>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => void reviewDocument("APPROVED")}
            disabled={saving || !identityDocumentUrl}
            className="min-h-10 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            اعتماد المستند
          </button>
          <button
            onClick={() => void reviewDocument("REJECTED")}
            disabled={saving || !identityDocumentUrl}
            className="min-h-10 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
          >
            رفض المستند
          </button>
        </div>

        <div className="space-y-2">
          {documentHistory.slice(0, 4).map((document) => (
            <a
              key={document.id}
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <span>{document.isCurrent ? "الحالي" : "نسخة سابقة"}</span>
              <span className="tabular-nums">{formatDate(document.uploadedAt)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
