import React from "react";
import { Link } from "react-router-dom";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Affiliate } from "./types";

interface AffiliateRowActionsProps {
  affiliate: Affiliate;
  isDark: boolean;
  updatingDocumentAffiliateId: string | null;
  handleStatusUpdate: (affiliateId: string, status: string) => void;
  openPolicyEditor: (affiliate: Affiliate) => void;
  openReviewHistory: (affiliate: Affiliate) => void;
  handleDocumentReviewUpdate: (
    affiliate: Affiliate,
    status: "APPROVED" | "REJECTED",
  ) => void;
}

export const AffiliateRowActions: React.FC<AffiliateRowActionsProps> = ({
  affiliate,
  isDark,
  updatingDocumentAffiliateId,
  handleStatusUpdate,
  openPolicyEditor,
  openReviewHistory,
  handleDocumentReviewUpdate,
}) => {
  return (
    <td className="block border-t border-gray-100 pt-3 md:table-cell md:border-0 md:px-6 md:py-5">
      <div className="flex items-center justify-between gap-4 md:hidden mb-2">
        <span className="text-xs font-semibold text-gray-500">الإجراءات</span>
      </div>
      <div className="grid grid-cols-2 md:flex md:flex-col gap-2">
        {affiliate.isMissingRecord ? (
          <span
            className={`rounded-lg border px-3 py-1.5 text-center text-xs col-span-2 md:col-span-1 ${
              isDark
                ? "border-orange-500/30 bg-orange-500/10 text-orange-200"
                : "border-orange-200 bg-orange-50 text-orange-700"
            }`}
          >
            الملف غير مكتمل
          </span>
        ) : (
          <Link
            to={`/affiliates/management/${affiliate.id}`}
            className={`rounded-lg border px-3 py-1.5 text-center text-xs font-semibold transition ${
              isDark
                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20"
                : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            فتح الملف
          </Link>
        )}
        <select
          value={affiliate.status}
          onChange={(e) => handleStatusUpdate(affiliate.id, e.target.value)}
          disabled={affiliate.isMissingRecord}
          className={`text-xs px-2 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark
              ? "bg-gray-900 border-gray-700 text-gray-300"
              : "bg-white border-gray-200"
          }`}
        >
          <option value="PENDING">مراجعة الطلب</option>
          <option value="ACTIVE">تفعيل المسوق</option>
          <option value="SUSPENDED">إيقاف (Suspend)</option>
        </select>
        <button
          type="button"
          onClick={() => openPolicyEditor(affiliate)}
          disabled={affiliate.isMissingRecord}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
            isDark
              ? "border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          } disabled:opacity-50`}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          الضوابط
        </button>
        <button
          type="button"
          onClick={() => openReviewHistory(affiliate)}
          className={`rounded-lg border px-3 py-1.5 text-xs transition ${
            isDark
              ? "border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          سجل المراجعة
        </button>
        {affiliate.identityDocumentUrl && (
          <>
            <button
              type="button"
              onClick={() => handleDocumentReviewUpdate(affiliate, "APPROVED")}
              disabled={
                affiliate.isMissingRecord ||
                updatingDocumentAffiliateId === affiliate.id
              }
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              اعتماد المستند
            </button>
            <button
              type="button"
              onClick={() => handleDocumentReviewUpdate(affiliate, "REJECTED")}
              disabled={
                affiliate.isMissingRecord ||
                updatingDocumentAffiliateId === affiliate.id
              }
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-60"
            >
              رفض المستند
            </button>
          </>
        )}
      </div>
    </td>
  );
};
