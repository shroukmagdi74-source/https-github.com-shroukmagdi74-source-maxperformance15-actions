import React from "react";
import {
  ArrowUpTrayIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { AffiliatePayout } from "./types";
import { getPayoutStatusColor, getPayoutStatusText } from "./helpers";

export interface PayoutRequestsTableProps {
  payouts: AffiliatePayout[];
  processingPayoutId: string | null;
  formatPrice: (amount: number) => string;
  isDark: boolean;
  onRecordExternalPayout: (payoutId: string) => void;
  onCancelPayoutRequest: (payoutId: string) => void;
  onOpenProofUploadDialog: (payoutId: string) => void;
}

export const PayoutRequestsTable: React.FC<PayoutRequestsTableProps> = ({
  payouts,
  processingPayoutId,
  formatPrice,
  isDark,
  onRecordExternalPayout,
  onCancelPayoutRequest,
  onOpenProofUploadDialog,
}) => {
  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow overflow-hidden mb-8`}
    >
      <div
        className={`px-6 py-4 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h2
          className={`text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          طلبات سحب المسوقين
        </h2>
        <p
          className={`text-sm mt-1 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          راجع طلبات السحب المعلقة وسجل التحويل الفعلي بعد الدفع.
        </p>
      </div>

      {payouts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  المسوق
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  المبلغ
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  طريقة السحب
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  العمولات المرتبطة
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  الحالة
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  التاريخ
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody
              className={`${
                isDark
                  ? "bg-gray-800 divide-gray-700"
                  : "bg-white divide-gray-200"
              } divide-y`}
            >
              {payouts.map((payout) => (
                <tr
                  key={payout.id}
                  className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {payout.affiliate.user.firstName}{" "}
                        {payout.affiliate.user.lastName}
                      </span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {payout.affiliate.affiliateCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 tabular-nums">
                    {formatPrice(payout.amount)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{payout.paymentMethod}</span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {payout.transactionId ||
                          payout.externalReference ||
                          "-"}
                      </span>
                      {payout.notes ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {payout.notes}
                        </span>
                      ) : null}
                      {payout.proofFileUrl ? (
                        <a
                          href={payout.proofFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          عرض إثبات التحويل
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>
                        <span className="tabular-nums">
                          {payout.commissions.length}
                        </span>{" "}
                        عمولة
                      </span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {payout.commissions[0]?.order?.orderNumber || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPayoutStatusColor(
                        payout.status,
                        isDark
                      )}`}
                    >
                      {getPayoutStatusText(payout.status)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="tabular-nums">
                        {new Date(payout.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                      <span className="text-xs tabular-nums">
                        {payout.processedAt
                          ? new Date(payout.processedAt).toLocaleDateString(
                              "ar-EG"
                            )
                          : "بانتظار التحويل"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payout.status === "PENDING" ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onRecordExternalPayout(payout.id)}
                          disabled={processingPayoutId === payout.id}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1 transition disabled:opacity-60"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          {processingPayoutId === payout.id
                            ? "جارٍ التنفيذ..."
                            : "تسجيل التحويل"}
                        </button>
                        <button
                          onClick={() => onCancelPayoutRequest(payout.id)}
                          disabled={processingPayoutId === payout.id}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 transition disabled:opacity-60"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          {processingPayoutId === payout.id
                            ? "جارٍ التنفيذ..."
                            : "رفض الطلب"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500 tabular-nums">
                          {payout.transactionId ||
                            payout.externalReference ||
                            "مكتمل"}
                        </span>
                        {(payout.status === "PROCESSED" ||
                          payout.status === "PAID") && (
                          <button
                            onClick={() => onOpenProofUploadDialog(payout.id)}
                            disabled={processingPayoutId === payout.id}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition disabled:opacity-60"
                          >
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            {processingPayoutId === payout.id
                              ? "جارٍ الرفع..."
                              : payout.proofFileUrl
                              ? "تحديث الإثبات"
                              : "رفع الإثبات"}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <BanknotesIcon
            className={`h-12 w-12 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            لا توجد طلبات سحب حالياً
          </p>
        </div>
      )}
    </div>
  );
};
