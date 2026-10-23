import React from "react";
import { TrendingUp } from "lucide-react";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { Stats } from "../types";

interface WhatsAppAnalyticsRatesCardsProps {
  stats: Stats | null;
  summaryHint: string;
  formatPercent: (val: string | number | undefined) => string;
  t: (key: string) => string;
}

export const WhatsAppAnalyticsRatesCards: React.FC<WhatsAppAnalyticsRatesCardsProps> = ({
  stats,
  summaryHint,
  formatPercent,
  t,
}) => {
  const deliveryPct = formatPercent(stats?.deliveryRate);
  const readPct = formatPercent(stats?.readRate);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <WhatsAppSurfaceCard
        title={t("whatsappAnalytics.stats.deliveryRate")}
        description={summaryHint}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-foreground">
                {deliveryPct}%
              </p>
              <p className="text-xs text-muted-foreground">
                {t("whatsappAnalytics.stats.delivered")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3.5" />
              {deliveryPct}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-emerald-500/10 overflow-hidden">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${Math.min(100, Number(deliveryPct))}%` }}
            />
          </div>
        </div>
      </WhatsAppSurfaceCard>

      <WhatsAppSurfaceCard
        title={t("whatsappAnalytics.stats.readRate")}
        description={summaryHint}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-foreground">
                {readPct}%
              </p>
              <p className="text-xs text-muted-foreground">
                {t("whatsappAnalytics.stats.read")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium font-mono tabular-nums text-blue-600 dark:text-blue-400">
              <TrendingUp className="size-3.5" />
              {readPct}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-blue-500/10 overflow-hidden">
            <div
              className="h-2 rounded-full bg-blue-500 transition-[width]"
              style={{ width: `${Math.min(100, Number(readPct))}%` }}
            />
          </div>
        </div>
      </WhatsAppSurfaceCard>
    </div>
  );
};
