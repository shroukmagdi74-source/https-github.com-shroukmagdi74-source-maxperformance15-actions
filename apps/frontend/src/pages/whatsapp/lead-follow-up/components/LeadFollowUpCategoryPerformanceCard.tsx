import React from "react";
import { cn } from "@/lib/utils";

import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { CategoryStatItem } from "../types";

interface LeadFollowUpCategoryPerformanceCardProps {
  categoryStats: CategoryStatItem[];
  tx: (key: string) => string;
}

export const LeadFollowUpCategoryPerformanceCard: React.FC<
  LeadFollowUpCategoryPerformanceCardProps
> = ({ categoryStats, tx }) => {
  if (categoryStats.length === 0) return null;

  return (
    <WhatsAppSurfaceCard
      title={tx("categories.performanceTitle")}
      description={tx("categories.performanceDesc")}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-border/70 text-muted-foreground">
              <th className="py-2.5 pr-2 text-right font-medium">{tx("categories.title")}</th>
              <th className="py-2.5 px-2 text-right font-medium">{tx("categories.total")}</th>
              <th className="py-2.5 px-2 text-right font-medium">{tx("categories.enrolled")}</th>
              <th className="py-2.5 px-2 text-right font-medium">{tx("categories.completed")}</th>
              <th className="py-2.5 px-2 text-right font-medium">{tx("categories.replied")}</th>
              <th className="py-2.5 pr-2 text-right font-medium">{tx("categories.replyRate")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono tabular-nums">
            {categoryStats.map((cs) => (
              <tr key={cs.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-2.5 pr-2 font-sans font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cs.color || "#6366f1" }}
                    />
                    <span>{cs.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-muted-foreground text-right" dir="ltr">
                  {cs.totalContacts}
                </td>
                <td className="py-2.5 px-2 text-muted-foreground text-right" dir="ltr">
                  {cs.enrolled}
                </td>
                <td className="py-2.5 px-2 text-muted-foreground text-right" dir="ltr">
                  {cs.completed}
                </td>
                <td className="py-2.5 px-2 text-muted-foreground text-right" dir="ltr">
                  {cs.replied}
                </td>
                <td className="py-2.5 pr-2 text-right" dir="ltr">
                  <span
                    className={cn(
                      "font-semibold",
                      cs.replyRate >= 50
                        ? "text-emerald-600 dark:text-emerald-400"
                        : cs.replyRate >= 25
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {cs.replyRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WhatsAppSurfaceCard>
  );
};
