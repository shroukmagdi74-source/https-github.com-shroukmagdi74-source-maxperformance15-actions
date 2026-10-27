import React from "react";
import { AffiliateCommission, AffiliatePayout } from "./types";
import { formatDate, formatPrice, statusLabels, toNumber } from "./helpers";

interface AffiliateCommissionsPayoutsProps {
  commissions: AffiliateCommission[];
  payouts: AffiliatePayout[];
}

export const AffiliateCommissionsPayouts: React.FC<AffiliateCommissionsPayoutsProps> = ({
  commissions,
  payouts,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-bold">تاريخ العمولات والسحوبات</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            العمولات
          </h3>
          <div className="space-y-2">
            {commissions.slice(0, 10).map((commission) => (
              <div
                key={commission.id}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">
                    {commission.order?.orderNumber || "طلب غير محدد"}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-300 tabular-nums">
                    {formatPrice(toNumber(commission.amount))}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{statusLabels[commission.status] || commission.status}</span>
                  <span className="tabular-nums">{formatDate(commission.createdAt)}</span>
                </div>
              </div>
            ))}
            {commissions.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                لا توجد عمولات.
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            السحوبات
          </h3>
          <div className="space-y-2">
            {payouts.slice(0, 10).map((payout) => (
              <div
                key={payout.id}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">
                    {payout.paymentMethod || "طريقة غير محددة"}
                  </span>
                  <span className="font-bold tabular-nums">
                    {formatPrice(toNumber(payout.amount))}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{statusLabels[payout.status] || payout.status}</span>
                  <span className="tabular-nums">{formatDate(payout.createdAt)}</span>
                </div>
                {payout.proofFileUrl ? (
                  <a
                    href={payout.proofFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    إثبات التحويل
                  </a>
                ) : null}
              </div>
            ))}
            {payouts.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                لا توجد سحوبات.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
