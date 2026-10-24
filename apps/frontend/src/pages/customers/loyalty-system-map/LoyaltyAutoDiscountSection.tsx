import React from "react";
import { NavigateFunction } from "react-router-dom";
import { BadgePercent, Eye, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { fmt } from "./formatters";

interface LoyaltyAutoDiscountSectionProps {
  systemAnalytics: any;
  navigate: NavigateFunction;
  setBackfillConfirm: (open: boolean) => void;
  backfillBusy: boolean;
}

export const LoyaltyAutoDiscountSection: React.FC<LoyaltyAutoDiscountSectionProps> = ({
  systemAnalytics,
  navigate,
  setBackfillConfirm,
  backfillBusy,
}) => {
  if (!systemAnalytics || systemAnalytics.system !== "AUTO_DISCOUNT") {
    return null;
  }

  const items = [
    {
      label: "عملاء عندهم كوبون",
      value: systemAnalytics.appliedCustomers ?? 0,
    },
    {
      label: "كوبونات متاحة",
      value: systemAnalytics.activeVouchers ?? 0,
    },
    {
      label: "كوبونات مستخدمة",
      value: systemAnalytics.usedVouchers ?? 0,
    },
    {
      label: "كوبونات منتهية",
      value: systemAnalytics.expiredVouchers ?? 0,
    },
    {
      label: "أوردرات مستنية كوبون",
      value: systemAnalytics.waitingForDelivery ?? 0,
    },
    {
      label: "إجمالي الأوردرات المسلّمة",
      value: systemAnalytics.totalDeliveredOrders ?? 0,
    },
  ];

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-900/10">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <BadgePercent className="h-5 w-5 text-amber-500" />
        نظام الخصم التلقائي (كوبونات بعد البيع)
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-amber-200 bg-white p-3 dark:border-amber-800 dark:bg-gray-800/60"
          >
            <p className="text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
              {fmt(item.value)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            {item.label === "أوردرات مستنية كوبون" && (
              <button
                onClick={() => navigate("/customers/auto-discount")}
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Eye className="h-3 w-3" />
                مراجعة
              </button>
            )}
          </div>
        ))}
      </div>
      {Number(systemAnalytics.preActivationCustomers || 0) > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-100/40 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="flex flex-1 items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono tabular-nums">{fmt(systemAnalytics.preActivationCustomers)}</span> عميل عندهم أوردرات اتسلمت قبل
            تفعيل النظام — مش بياخدوا كوبون خصم تلقائي.
          </p>
          <button
            onClick={() => setBackfillConfirm(true)}
            disabled={backfillBusy}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {backfillBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            إصدار الكوبونات الناقصة
          </button>
        </div>
      )}
    </div>
  );
};
