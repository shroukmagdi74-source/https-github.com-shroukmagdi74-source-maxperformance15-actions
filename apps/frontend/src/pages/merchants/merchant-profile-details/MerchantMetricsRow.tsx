import React from "react";
import {
  ArchiveBoxIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { formatInteger, MetricCard, MerchantProfileStats, toNumber } from "./types";

interface MerchantMetricsRowProps {
  stats: MerchantProfileStats;
  formatPrice: (amount: number) => string;
}

export const MerchantMetricsRow: React.FC<MerchantMetricsRowProps> = ({
  stats,
  formatPrice,
}) => {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={BanknotesIcon}
        label="المتاح للسحب"
        value={formatPrice(toNumber(stats.availablePayoutAmount))}
        sub={`${formatInteger(stats.availableCommissionsCount)} عمولة مؤهلة للسحب`}
      />
      <MetricCard
        icon={ReceiptPercentIcon}
        label="عمولات مؤكدة"
        value={formatPrice(toNumber(stats.confirmedCommissionAmount))}
        sub={`${formatInteger(stats.commissionsCount)} سجل عمولة`}
      />
      <MetricCard
        icon={ArchiveBoxIcon}
        label="الرصيد الفعلي"
        value={<><span className="tabular-nums">{formatInteger(stats.availableForSale)}</span> قطعة</>}
        sub={`${formatInteger(stats.reservedQuantity)} محجوز، ${formatInteger(stats.physicalAvailable)} متاح فعلي`}
      />
      <MetricCard
        icon={ShoppingBagIcon}
        label="طلبات التاجر"
        value={<span className="tabular-nums">{formatInteger(stats.ordersCount)}</span>}
        sub={`${formatInteger(stats.deliveredOrders)} مسلم، ${formatInteger(stats.inShippingOrders)} في الشحن`}
      />
    </div>
  );
};
