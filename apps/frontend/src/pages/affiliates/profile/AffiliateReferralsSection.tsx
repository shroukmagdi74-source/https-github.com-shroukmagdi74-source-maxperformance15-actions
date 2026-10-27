import React from "react";
import { AffiliateReferral } from "./types";
import { statusTone } from "./helpers";

interface AffiliateReferralsSectionProps {
  referrals: AffiliateReferral[];
  canViewCustomerData?: boolean;
}

export const AffiliateReferralsSection: React.FC<AffiliateReferralsSectionProps> = ({
  referrals,
  canViewCustomerData,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-bold">الإحالات والعملاء</h2>
      <p className="mt-1 text-xs text-slate-500">
        صلاحية عرض بيانات العملاء:{" "}
        {canViewCustomerData ? "مفعلة" : "غير مفعلة"}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {referrals.map((referral) => (
          <div
            key={referral.id}
            className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">{referral.referralCode}</span>
              <span
                className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                  referral.converted ? statusTone("ACTIVE") : statusTone("PENDING")
                }`}
              >
                {referral.converted ? "تم التحويل" : "زيارة فقط"}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {referral.order?.orderNumber || referral.source || "مصدر غير محدد"}
            </div>
            {canViewCustomerData && referral.customer ? (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {`${referral.customer.firstName || ""} ${referral.customer.lastName || ""}`.trim() ||
                  referral.customer.phone ||
                  "عميل غير محدد"}
              </div>
            ) : null}
          </div>
        ))}
        {referrals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
            لا توجد إحالات مسجلة.
          </div>
        ) : null}
      </div>
    </section>
  );
};
