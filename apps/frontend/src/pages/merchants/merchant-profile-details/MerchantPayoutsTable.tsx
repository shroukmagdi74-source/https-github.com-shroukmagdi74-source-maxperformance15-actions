import React from "react";
import {
  Badge,
  EmptyState,
  formatDate,
  MerchantPayoutRow,
  parsePaymentDetails,
  statusLabels,
  statusTone,
  toNumber,
} from "./types";

interface MerchantPayoutsTableProps {
  payouts: MerchantPayoutRow[];
  formatPrice: (amount: number, currency?: string) => string;
}

export const MerchantPayoutsTable: React.FC<MerchantPayoutsTableProps> = ({
  payouts,
  formatPrice,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-bold">طلبات السحب</h2>
      <div className="mt-4 overflow-x-auto">
        {payouts.length ? (
          <table className="min-w-full text-right text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2">المبلغ</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">طريقة الدفع</th>
                <th className="py-2">مرجع التحويل</th>
                <th className="py-2">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="py-3 font-semibold tabular-nums">
                    {formatPrice(toNumber(payout.amount), payout.currency || undefined)}
                  </td>
                  <td className="py-3">
                    <Badge
                      label={statusLabels[payout.status] || payout.status}
                      tone={statusTone(payout.status)}
                    />
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    <div>{payout.paymentMethod || "غير محدد"}</div>
                    <div className="text-xs text-slate-400">
                      {parsePaymentDetails(payout.paymentDetails)}
                    </div>
                  </td>
                  <td className="py-3 text-slate-500 font-mono text-xs">
                    {payout.externalReference ||
                      payout.transactionId ||
                      "بدون مرجع"}
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(payout.processedAt || payout.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState text="لا توجد طلبات سحب لهذا التاجر." />
        )}
      </div>
    </section>
  );
};
