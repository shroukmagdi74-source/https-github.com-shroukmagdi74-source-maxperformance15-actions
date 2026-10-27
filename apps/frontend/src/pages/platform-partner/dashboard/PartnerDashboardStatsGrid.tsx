import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useCurrency } from "../../../hooks/useCurrency";
import { PartnerRecord, PartnerStats, PartnerTrends } from "./types";
import { getTrendTone } from "./helpers";

interface PartnerDashboardStatsGridProps {
  partner: PartnerRecord;
  stats: PartnerStats;
  trends?: PartnerTrends;
}

export const PartnerDashboardStatsGrid: React.FC<PartnerDashboardStatsGridProps> = ({
  partner,
  stats,
  trends,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const statCards = [
    {
      label: t("platformPartner.dashboard.stats.totalEarnings"),
      value: formatPrice(partner.totalEarnings),
      icon: <Wallet className="text-emerald-500" />,
      trendValue: trends?.earningsChange,
    },
    {
      label: t("platformPartner.dashboard.stats.availablePayout"),
      value: formatPrice(partner.pendingEarnings),
      icon: <DollarSign className="text-blue-500" />,
      trendValue: null,
    },
    {
      label: t("platformPartner.dashboard.stats.directReferrals"),
      value: stats.directReferralsCount.toLocaleString("ar-EG"),
      icon: <Users className="text-purple-500" />,
      trendValue: trends?.referralsChange,
    },
    {
      label: t("platformPartner.dashboard.stats.totalNetwork"),
      value: stats.totalNetworkCount.toLocaleString("ar-EG"),
      icon: <TrendingUp className="text-orange-500" />,
      trendValue: trends?.referralsChange,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-none shadow-md bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  {stat.icon}
                </div>
                <Badge
                  variant="secondary"
                  className={getTrendTone(stat.trendValue)}
                >
                  {stat.trendValue === null || stat.trendValue === undefined
                    ? "—"
                    : `${stat.trendValue > 0 ? "+" : ""}${stat.trendValue}%`}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold mt-1 tabular-nums">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
