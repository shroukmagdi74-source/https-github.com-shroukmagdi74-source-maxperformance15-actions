import React from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useCurrency } from "../../../hooks/useCurrency";
import { PartnerCommissionItem } from "./types";
import { getStatusLabel, getStatusTone } from "./helpers";

interface PartnerCommissionsTableProps {
  commissions: PartnerCommissionItem[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export const PartnerCommissionsTable: React.FC<PartnerCommissionsTableProps> = ({
  commissions,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="border-b dark:border-gray-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />{" "}
          {t("platformPartner.dashboard.commissions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              <tr className="text-left border-b dark:border-gray-800">
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.commissions.source")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.commissions.amount")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.commissions.level")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.commissions.status")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.commissions.date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {commissions.length > 0 ? (
                commissions.map((comm, idx) => (
                  <tr
                    key={comm.id || idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {comm.fromCompany?.name ||
                        t("platformPartner.dashboard.commissions.system")}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold tabular-nums">
                      {formatPrice(comm.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="dark:border-gray-700 dark:text-gray-200"
                      >
                        {t("platformPartner.dashboard.commissions.level")}{" "}
                        {comm.level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusTone(comm.status)}>
                        {getStatusLabel(comm.status, t)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 tabular-nums">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    {t("platformPartner.dashboard.commissions.noCommissions")}
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
