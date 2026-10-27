import React from "react";
import {
  BanknotesIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useCurrency } from "../../../hooks/useCurrency";
import { AffiliateRecord, AffiliateProfileStats } from "./types";
import { MetricCard, toNumber } from "./helpers";

interface AffiliateMetricsCardsProps {
  affiliate: AffiliateRecord;
  stats: AffiliateProfileStats;
}

export const AffiliateMetricsCards: React.FC<AffiliateMetricsCardsProps> = ({
  affiliate,
  stats,
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={BanknotesIcon}
        label="الرصيد القابل للسحب"
        value={formatPrice(toNumber(affiliate.pendingEarnings))}
        sub={`الحد الأدنى ${formatPrice(toNumber(affiliate.minPayout))}`}
      />
      <MetricCard
        icon={ReceiptPercentIcon}
        label="العمولات المؤكدة"
        value={formatPrice(toNumber(stats.confirmedCommissionAmount))}
        sub={`${stats.commissionsCount} سجل عمولة`}
      />
      <MetricCard
        icon={ShoppingBagIcon}
        label="طلبات المسوق"
        value={stats.ordersCount.toLocaleString("ar-EG")}
        sub={`${stats.deliveredOrders.toLocaleString(
          "ar-EG",
        )} مسلم، ${stats.cancelledOrders.toLocaleString("ar-EG")} ملغي`}
      />
      <MetricCard
        icon={CreditCardIcon}
        label="تم تحويله"
        value={formatPrice(toNumber(stats.processedPayoutAmount))}
        sub={`${stats.payoutRequestsCount.toLocaleString("ar-EG")} طلب سحب`}
      />
    </div>
  );
};
