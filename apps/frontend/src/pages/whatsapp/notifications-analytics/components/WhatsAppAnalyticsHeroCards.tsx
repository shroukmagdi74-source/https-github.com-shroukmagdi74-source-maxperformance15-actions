import React from "react";
import { AlertTriangle, CheckCircle2, Eye, Send } from "lucide-react";
import { WhatsAppMetricCard } from "../../components/WhatsAppPageShell";
import type { Stats } from "../types";

interface WhatsAppAnalyticsHeroCardsProps {
  stats: Stats | null;
  summaryHint: string;
  t: (key: string) => string;
}

export const WhatsAppAnalyticsHeroCards: React.FC<WhatsAppAnalyticsHeroCardsProps> = ({
  stats,
  summaryHint,
  t,
}) => {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
      <WhatsAppMetricCard
        label={t("whatsappAnalytics.stats.total")}
        value={stats?.total || 0}
        hint={summaryHint}
        icon={Send}
        tone="primary"
      />
      <WhatsAppMetricCard
        label={t("whatsappAnalytics.stats.delivered")}
        value={stats?.delivered || 0}
        hint={t("whatsappAnalytics.stats.deliveryRate")}
        icon={CheckCircle2}
        tone="success"
      />
      <WhatsAppMetricCard
        label={t("whatsappAnalytics.stats.read")}
        value={stats?.read || 0}
        hint={t("whatsappAnalytics.stats.readRate")}
        icon={Eye}
        tone="info"
      />
      <WhatsAppMetricCard
        label={t("whatsappAnalytics.stats.failed")}
        value={stats?.failed || 0}
        hint={t("whatsappAnalytics.logs.status")}
        icon={AlertTriangle}
        tone="danger"
      />
    </div>
  );
};
