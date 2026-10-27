import React from "react";
import { parsePaymentDetails } from "./helpers";

interface AffiliatePaymentDetailsCardProps {
  paymentMethod?: string | null;
  paymentDetails?: unknown;
}

export const AffiliatePaymentDetailsCard: React.FC<AffiliatePaymentDetailsCardProps> = ({
  paymentMethod,
  paymentDetails,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-bold">بيانات الدفع</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
          <div className="text-xs text-slate-500">طريقة الدفع</div>
          <div className="mt-1 font-semibold">
            {paymentMethod || "غير محدد"}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 md:col-span-2">
          <div className="text-xs text-slate-500">بيانات التحويل</div>
          <div className="mt-1 break-words font-semibold tabular-nums">
            {parsePaymentDetails(paymentDetails)}
          </div>
        </div>
      </div>
    </section>
  );
};
