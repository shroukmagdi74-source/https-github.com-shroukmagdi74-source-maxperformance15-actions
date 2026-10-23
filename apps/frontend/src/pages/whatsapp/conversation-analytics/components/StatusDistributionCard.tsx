import React from "react";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import { STATUS_COLORS, STATUS_LABELS } from "../types";

interface StatusDistributionCardProps {
  statusChartData: { name: string; count: number; pct: string }[];
  statusDist: Record<string, number>;
}

export const StatusDistributionCard: React.FC<StatusDistributionCardProps> = ({
  statusChartData,
  statusDist,
}) => {
  return (
    <WhatsAppSurfaceCard
      title="توزيع الحالات"
      description="حالة المحادثات في الفترة المحددة"
    >
      {statusChartData.length > 0 ? (
        <div className="space-y-4">
          {statusChartData.map((item) => {
            const rawStatusKey =
              Object.keys(statusDist).find(
                (k) => (STATUS_LABELS[k] || k) === item.name
              ) || "";
            const colorClass = STATUS_COLORS[rawStatusKey] || "bg-primary";

            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-muted/40 text-[10px]"
                    >
                      {item.pct}%
                    </Badge>
                    <span className="font-semibold text-foreground">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-[width] ${colorClass}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <BarChart3 className="mb-2 size-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">لا توجد بيانات توزيع حالات</p>
        </div>
      )}
    </WhatsAppSurfaceCard>
  );
};
