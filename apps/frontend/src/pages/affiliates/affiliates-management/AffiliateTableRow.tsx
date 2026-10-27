import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Affiliate } from "./types";
import {
  getDocumentStatusLabel,
  getDocumentStatusStyle,
  getStatusLabel,
  getStatusStyle,
} from "./helpers";
import { AffiliateRowActions } from "./AffiliateRowActions";

interface AffiliateTableRowProps {
  affiliate: Affiliate;
  isDark: boolean;
  editingCommission: string | null;
  newCommission: number;
  updatingDocumentAffiliateId: string | null;
  setEditingCommission: (id: string | null) => void;
  setNewCommission: (commission: number) => void;
  updateCommission: (affiliateId: string) => void;
  handleStatusUpdate: (affiliateId: string, status: string) => void;
  openPolicyEditor: (affiliate: Affiliate) => void;
  openReviewHistory: (affiliate: Affiliate) => void;
  handleDocumentReviewUpdate: (
    affiliate: Affiliate,
    status: "APPROVED" | "REJECTED",
  ) => void;
}

export const AffiliateTableRow: React.FC<AffiliateTableRowProps> = ({
  affiliate,
  isDark,
  editingCommission,
  newCommission,
  updatingDocumentAffiliateId,
  setEditingCommission,
  setNewCommission,
  updateCommission,
  handleStatusUpdate,
  openPolicyEditor,
  openReviewHistory,
  handleDocumentReviewUpdate,
}) => {
  return (
    <tr
      className={`block rounded-2xl border p-4 transition md:table-row md:rounded-none md:border-0 md:p-0 ${
        isDark
          ? "border-gray-700 bg-gray-900/40 hover:bg-gray-700/30"
          : "border-gray-100 bg-white hover:bg-gray-50/50 shadow-sm md:shadow-none"
      }`}
    >
      {/* المسوق */}
      <td className="block pb-3 md:table-cell md:px-6 md:py-5">
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className={`font-bold text-base md:text-sm ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {affiliate.user.firstName} {affiliate.user.lastName}
              </span>
              <div className="text-xs text-gray-500 mt-0.5">
                {affiliate.user.email}
              </div>
              <div className="text-xs text-indigo-500 mt-0.5 tabular-nums">
                {affiliate.user.phone || "بدون هاتف"}
              </div>
            </div>
            <span
              className={`md:hidden w-fit px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusStyle(
                affiliate.status,
              )}`}
            >
              {getStatusLabel(affiliate.status)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {affiliate.identityDocumentUrl ? (
              <a
                href={affiliate.identityDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                مستند الاعتماد
              </a>
            ) : (
              <span className="text-[11px] text-amber-500">
                لا يوجد مستند اعتماد مرفوع
              </span>
            )}
            <span
              className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium ${getDocumentStatusStyle(
                affiliate.identityDocumentStatus,
              )}`}
            >
              {getDocumentStatusLabel(affiliate.identityDocumentStatus)}
            </span>
          </div>

          {affiliate.isMissingRecord && (
            <span className="text-[10px] text-orange-500 mt-1">
              يحتاج إصلاح سجل الأفليت
            </span>
          )}
        </div>
      </td>

      {/* البيانات المالية */}
      <td className="block border-t border-gray-100 py-3 dark:border-gray-700/60 md:table-cell md:border-0 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-2 md:hidden mb-1.5">
          <span className="text-xs font-semibold text-gray-500">
            البيانات المالية
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 md:flex md:flex-col md:gap-1 text-xs">
          <div className="flex flex-col md:flex-row md:justify-between md:max-w-[120px] bg-gray-50 dark:bg-gray-800/60 md:bg-transparent md:dark:bg-transparent p-2 md:p-0 rounded-lg text-center md:text-right">
            <span className="text-gray-500 text-[10px] md:text-xs">الإجمالي</span>
            <span
              className={`font-bold tabular-nums text-xs md:text-xs ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {Number(affiliate.totalEarnings).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:max-w-[120px] bg-green-50/60 dark:bg-green-900/20 md:bg-transparent md:dark:bg-transparent p-2 md:p-0 rounded-lg text-center md:text-right">
            <span className="text-gray-500 text-[10px] md:text-xs">المدفوع</span>
            <span className="text-green-500 font-bold tabular-nums text-xs md:text-xs">
              {Number(affiliate.paidEarnings).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:max-w-[120px] bg-orange-50/60 dark:bg-orange-900/20 md:bg-transparent md:dark:bg-transparent p-2 md:p-0 rounded-lg text-center md:text-right">
            <span className="text-gray-500 text-[10px] md:text-xs">المعلق</span>
            <span className="text-orange-500 font-bold tabular-nums text-xs md:text-xs">
              {Number(affiliate.pendingEarnings).toFixed(2)}
            </span>
          </div>
        </div>
      </td>

      {/* الأداء */}
      <td className="block border-t border-gray-100 py-3 dark:border-gray-700/60 md:table-cell md:border-0 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-gray-500 md:hidden">
            الأداء
          </span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-center">
              <span className="text-[10px] text-gray-400">مبيعات</span>
              <span
                className={`font-bold tabular-nums ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {affiliate.totalSales}
              </span>
            </div>
            <div className="w-[1px] h-6 bg-gray-700/20 dark:bg-gray-600/40"></div>
            <div className="flex flex-col text-center">
              <span className="text-[10px] text-gray-400">نقرات</span>
              <span
                className={`font-bold tabular-nums ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {affiliate.totalClicks}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* العمولة */}
      <td className="block border-t border-gray-100 py-3 dark:border-gray-700/60 md:table-cell md:border-0 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-gray-500 md:hidden">
            العمولة اليدوية
          </span>
          {editingCommission === affiliate.id ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max={
                  affiliate.commissionType === "PERCENTAGE" ? 100 : undefined
                }
                value={newCommission}
                onChange={(e) => setNewCommission(parseFloat(e.target.value))}
                className={`w-16 px-2 py-1 rounded border text-xs tabular-nums ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => updateCommission(affiliate.id)}
                className="p-1 text-green-500 hover:bg-green-500/10 rounded"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setEditingCommission(null)}
                className="p-1 text-red-500 hover:bg-red-500/10 rounded"
              >
                ✗
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium tabular-nums ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {affiliate.commissionType === "PERCENTAGE"
                  ? `${affiliate.commissionRate}%`
                  : `${affiliate.commissionRate} ج.م`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingCommission(affiliate.id);
                  setNewCommission(affiliate.commissionRate);
                }}
                disabled={affiliate.isMissingRecord}
                className="p-1 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-500/5 transition-all"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </td>

      {/* الضوابط */}
      <td className="block border-t border-gray-100 py-3 dark:border-gray-700/60 md:table-cell md:border-0 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4 md:hidden mb-1.5">
          <span className="text-xs font-semibold text-gray-500">
            الضوابط التشغيلية
          </span>
        </div>
        <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 text-xs">
          <div
            className={`${
              isDark ? "text-gray-300" : "text-gray-700"
            } bg-gray-50 dark:bg-gray-800/40 md:bg-transparent px-2 py-1 md:p-0 rounded`}
          >
            سحب أدنى:{" "}
            <span className="font-bold tabular-nums">
              {Number(affiliate.minPayout || 100).toFixed(0)}
            </span>
          </div>
          <div
            className={`${
              affiliate.canCreateOrdersForOthers
                ? "text-green-600 dark:text-green-400"
                : "text-red-500"
            } bg-gray-50 dark:bg-gray-800/40 md:bg-transparent px-2 py-1 md:p-0 rounded`}
          >
            الطلب المباشر:{" "}
            {affiliate.canCreateOrdersForOthers ? "مسموح" : "موقوف"}
          </div>
          <div
            className={`${
              affiliate.canViewCustomerData
                ? "text-green-600 dark:text-green-400"
                : "text-red-500"
            } bg-gray-50 dark:bg-gray-800/40 md:bg-transparent px-2 py-1 md:p-0 rounded`}
          >
            بيانات العملاء: {affiliate.canViewCustomerData ? "مسموح" : "مخفية"}
          </div>
        </div>
      </td>

      {/* الحالة */}
      <td className="block border-t border-gray-100 py-3 dark:border-gray-700/60 md:table-cell md:border-0 md:px-6 md:py-5">
        <div className="flex items-center justify-between gap-4 md:hidden mb-1.5">
          <span className="text-xs font-semibold text-gray-500">
            الحالة والمراجعة
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span
            className={`w-fit px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(
              affiliate.status,
            )}`}
          >
            {getStatusLabel(affiliate.status)}
          </span>
          {affiliate.statusReason && (
            <span
              className={`text-[11px] leading-5 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {affiliate.statusReason}
            </span>
          )}
          {affiliate.reviewedAt && (
            <span className="text-[10px] text-gray-500 tabular-nums">
              {new Date(affiliate.reviewedAt).toLocaleDateString("ar-EG")}
            </span>
          )}
          {affiliate.identityDocumentUploadedAt && (
            <span className="text-[10px] text-gray-500 tabular-nums">
              رفع المستند:{" "}
              {new Date(affiliate.identityDocumentUploadedAt).toLocaleDateString(
                "ar-EG",
              )}
            </span>
          )}
          {affiliate.identityDocumentReviewNote && (
            <span
              className={`text-[11px] leading-5 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {affiliate.identityDocumentReviewNote}
            </span>
          )}
          {affiliate.identityDocumentReviewedAt && (
            <span className="text-[10px] text-gray-500 tabular-nums">
              مراجعة المستند:{" "}
              {new Date(affiliate.identityDocumentReviewedAt).toLocaleDateString(
                "ar-EG",
              )}
            </span>
          )}
        </div>
      </td>

      {/* الإجراءات */}
      <AffiliateRowActions
        affiliate={affiliate}
        isDark={isDark}
        updatingDocumentAffiliateId={updatingDocumentAffiliateId}
        handleStatusUpdate={handleStatusUpdate}
        openPolicyEditor={openPolicyEditor}
        openReviewHistory={openReviewHistory}
        handleDocumentReviewUpdate={handleDocumentReviewUpdate}
      />
    </tr>
  );
};
