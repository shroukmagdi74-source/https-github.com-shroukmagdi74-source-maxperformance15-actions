import React from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  EmptyState,
  formatDate,
  formatInteger,
  MerchantOperationRow,
  statusLabels,
  statusTone,
  toNumber,
} from "./types";

interface MerchantOrdersHistoryTableProps {
  merchantId: string;
  rows?: MerchantOperationRow[];
  formatPrice: (amount: number) => string;
}

export const MerchantOrdersHistoryTable: React.FC<MerchantOrdersHistoryTableProps> = ({
  merchantId,
  rows,
  formatPrice,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">تاريخ الطلبات المرتبطة</h2>
        <Link
          to={`/orders?page=1&limit=20&merchantId=${merchantId}`}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
        >
          فتح كل طلبات التاجر
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        {rows?.length ? (
          <table className="min-w-full text-right text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2">رقم الطلب</th>
                <th className="py-2">العميل</th>
                <th className="py-2">التنفيذ</th>
                <th className="py-2">القطع</th>
                <th className="py-2">مستحق</th>
                <th className="py-2">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((order) => (
                <tr key={order.id}>
                  <td className="py-3">
                    <Link
                      to={`/orders/${order.orderNumber}`}
                      className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300 font-mono"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    <div className="font-semibold">
                      {order.customerName || "عميل غير محدد"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {order.customerPhone || "بدون هاتف"}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        label={
                          statusLabels[order.operationStatus || ""] ||
                          order.operationStatus ||
                          "غير محدد"
                        }
                        tone={statusTone(order.operationStatus)}
                      />
                      <Badge
                        label={
                          order.fulfillmentSource === "COMPANY_WAREHOUSE"
                            ? "من مخزن الشركة"
                            : "من عند التاجر"
                        }
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {order.warehouseName || order.shippingCompanyName
                        ? `${order.warehouseName || "بدون مخزن"} · ${
                            order.shippingCompanyName || "بدون شركة شحن"
                          }`
                        : "بدون تفاصيل شحن"}
                    </div>
                  </td>
                  <td className="py-3 font-semibold tabular-nums">
                    {formatInteger(order.pieces)}
                  </td>
                  <td className="py-3 font-semibold tabular-nums">
                    {formatPrice(toNumber(order.payableAmount))}
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState text="لا توجد طلبات مرتبطة بهذا التاجر حتى الآن." />
        )}
      </div>
    </section>
  );
};
