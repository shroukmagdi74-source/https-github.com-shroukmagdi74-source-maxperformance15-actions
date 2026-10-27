import React from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { PartnerReferredCompany } from "./types";
import { getStatusLabel, getStatusTone } from "./helpers";

interface PartnerReferralsTableProps {
  referrals: PartnerReferredCompany[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export const PartnerReferralsTable: React.FC<PartnerReferralsTableProps> = ({
  referrals,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
      <CardHeader className="border-b dark:border-gray-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />{" "}
          {t("platformPartner.dashboard.referrals.historyTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              <tr className="text-left border-b dark:border-gray-800">
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.referrals.companyName")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.referrals.status")}
                </th>
                <th className="px-6 py-4">
                  {t("platformPartner.dashboard.referrals.date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {referrals?.length > 0 ? (
                referrals.map((ref, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {ref.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusTone(ref.status)}>
                        {getStatusLabel(ref.status, t)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 tabular-nums">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    {t("platformPartner.dashboard.referrals.noReferrals")}
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
