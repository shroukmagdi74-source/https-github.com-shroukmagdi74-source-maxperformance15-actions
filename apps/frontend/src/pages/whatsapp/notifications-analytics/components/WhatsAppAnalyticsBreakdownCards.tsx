import React from "react";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { Stats } from "../types";

interface WhatsAppAnalyticsBreakdownCardsProps {
  stats: Stats | null;
  categorySeries: [string, number][];
  topEvents: [string, number][];
  summaryHint: string;
  categoryLabels: Record<string, string>;
  eventLabels: Record<string, string>;
  t: (key: string) => string;
}

export const WhatsAppAnalyticsBreakdownCards: React.FC<
  WhatsAppAnalyticsBreakdownCardsProps
> = ({
  stats,
  categorySeries,
  topEvents,
  summaryHint,
  categoryLabels,
  eventLabels,
  t,
}) => {
  const total = stats?.total || 1;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* By Category */}
      <WhatsAppSurfaceCard
        title={t("whatsappAnalytics.charts.byCategory")}
        description={t("whatsappAnalytics.description")}
      >
        {categorySeries.length > 0 ? (
          <div className="space-y-3.5">
            {categorySeries.map(([category, count]) => {
              const percentage = Number(((count / total) * 100).toFixed(1));

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-foreground">
                      {categoryLabels[category] || category}
                    </span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/70 bg-muted/40 text-[10px]"
                      >
                        {percentage}%
                      </Badge>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary transition-[width]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-8 text-center">
            <BarChart3 className="mb-2 size-8 text-muted-foreground/30" />
            <p className="text-xs font-semibold text-foreground">
              {t("whatsappAnalytics.charts.byCategory")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("whatsappAnalytics.charts.noData")}
            </p>
          </div>
        )}
      </WhatsAppSurfaceCard>

      {/* Top Events */}
      <WhatsAppSurfaceCard
        title={t("whatsappAnalytics.charts.topEvents")}
        description={summaryHint}
      >
        {topEvents.length > 0 ? (
          <div className="space-y-3.5">
            {topEvents.map(([event, count]) => {
              const percentage = Number(((count / total) * 100).toFixed(1));

              return (
                <div key={event} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-foreground">
                      {eventLabels[event] || event}
                    </span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/70 bg-muted/40 text-[10px]"
                      >
                        {percentage}%
                      </Badge>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/15 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-secondary-foreground/70 transition-[width]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-8 text-center">
            <BarChart3 className="mb-2 size-8 text-muted-foreground/30" />
            <p className="text-xs font-semibold text-foreground">
              {t("whatsappAnalytics.charts.topEvents")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("whatsappAnalytics.charts.noData")}
            </p>
          </div>
        )}
      </WhatsAppSurfaceCard>
    </div>
  );
};
