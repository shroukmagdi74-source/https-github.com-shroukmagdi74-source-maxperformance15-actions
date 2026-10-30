import React from "react";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Commission } from "./types";
import {
  getCommissionTypeColor,
  getCommissionTypeText,
  getCommissionStatusColor,
  getCommissionStatusText,
} from "./helpers";

export interface CommissionsListTableProps {
  commissions: Commission[];
  formatPrice: (amount: number) => string;
  isDark: boolean;
  onUpdateCommissionStatus: (commissionId: string, status: string) => void;
}

export const CommissionsListTable: React.FC<CommissionsListTableProps> = ({
  commissions,
  formatPrice,
  isDark,
  onUpdateCommissionStatus,
}) => {
  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow overflow-hidden`}
    >
      {commissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  رقم الطلب
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  النوع
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  المستفيد
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
                  إجراءات
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
              {commissions.map((commission) => (
                <tr
                  key={commission.id}
                  className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium tabular-nums ${
                      isDark ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    {commission.order?.orderNumber || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getCommissionTypeColor(
                        commission.type,
                        isDark
                      )}`}
                    >
                      {getCommissionTypeText(commission.type)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    {commission.affiliate
                      ? `${commission.affiliate.user.firstName} ${commission.affiliate.user.lastName} (${commission.affiliate.affiliateCode})`
                      : commission.merchant
                        ? commission.merchant.name
                        : "المنصة"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 tabular-nums">
                    {formatPrice(commission.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getCommissionStatusColor(
                        commission.status,
                        isDark
                      )}`}
                    >
                      {getCommissionStatusText(commission.status)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm tabular-nums ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {new Date(commission.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {commission.status === "CONFIRMED" && (
                      <button
                        onClick={() =>
                          onUpdateCommissionStatus(commission.id, "PAID")
                        }
                        className="text-green-600 hover:text-green-800 flex items-center gap-1 transition"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        تأكيد الدفع
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <CurrencyDollarIcon
            className={`h-12 w-12 mx-auto mb-4 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            لا توجد عمولات
          </p>
        </div>
      )}
    </div>
  );
};
