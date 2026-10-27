import React from "react";
import { useTranslation } from "react-i18next";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useCurrency } from "../../../hooks/useCurrency";
import { PartnerPayoutItem } from "./types";
import { getMethodLabel, getStatusLabel, getStatusTone } from "./helpers";

interface PartnerPayoutsTableProps {
  payouts: PartnerPayoutItem[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export const PartnerPayoutsTable: React.FC<PartnerPayoutsTableProps> = ({
  payouts,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="border-b dark:border-gray-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-400" />{" "}
          {t("platformPartner.dashboard.payout.recentPayouts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              <tr className="text-left border-b dark:border-gray-800">
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.payout.amount")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.payout.method")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.payout.status")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.payout.date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {payouts?.length > 0 ? (
                payouts.map((payout, idx) => (
                  <tr
                    key={payout.id || idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white tabular-nums">
                      {formatPrice(payout.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {getMethodLabel(payout.paymentMethod, t)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`${getStatusTone(payout.status)} ${
                          payout.status === "PENDING" ? "animate-pulse" : ""
                        }`}
                      >
                        {getStatusLabel(payout.status, t)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 tabular-nums">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    {t("platformPartner.dashboard.payout.noPayouts")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="px-6 py-4 text-center">
            <Button variant="outline" onClick={onLoadMore} className="cursor-pointer">
              {t("common.loadMore") || "تحميل المزيد"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
