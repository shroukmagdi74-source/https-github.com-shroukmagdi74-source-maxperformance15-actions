import React from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../../../hooks/useCurrency";
import { AffiliateOrderRow } from "./types";
import { formatDate, statusLabels, statusTone, toNumber } from "./helpers";

interface AffiliateOrdersTableProps {
  orders: AffiliateOrderRow[];
}

export const AffiliateOrdersTable: React.FC<AffiliateOrdersTableProps> = ({
  orders,
}) => {
  const { formatPrice } = useCurrency();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-bold">تاريخ الطلبات المرتبطة</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="py-2">رقم الطلب</th>
              <th className="py-2">العميل</th>
              <th className="py-2">الحالة</th>
              <th className="py-2">القيمة</th>
              <th className="py-2">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-3">
                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-300">
                  {order.customerName || "عميل غير محدد"}
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusTone(
                      order.status,
                    )}`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="py-3 font-semibold tabular-nums">
                  {formatPrice(toNumber(order.total))}
                </td>
                <td className="py-3 text-slate-500 tabular-nums">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            لا توجد طلبات مرتبطة بهذا المسوق.
          </div>
        ) : null}
      </div>
    </section>
  );
};
