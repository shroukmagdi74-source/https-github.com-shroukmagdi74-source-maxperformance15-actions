import React from "react";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";

interface TopTagsCardProps {
  tagDist: { tag: string; count: number }[];
  totalConversations: number;
}

export const TopTagsCard: React.FC<TopTagsCardProps> = ({
  tagDist,
  totalConversations,
}) => {
  if (tagDist.length === 0) return null;

  return (
    <WhatsAppSurfaceCard
      title="الوسوم الأكثر استخداماً"
      description="توزيع المحادثات حسب الوسوم"
      className="lg:col-span-1"
    >
      <div className="space-y-3">
        {tagDist.map((item) => {
          const pct = ((item.count / Math.max(1, totalConversations)) * 100).toFixed(1);
          return (
            <div key={item.tag} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Tag className="size-3 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.tag}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono tabular-nums">
                  <Badge
                    variant="outline"
                    className="rounded-full border-border/70 bg-muted/40 text-[10px]"
                  >
                    {pct}%
                  </Badge>
                  <span className="text-xs font-semibold text-foreground">
                    {item.count}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-primary transition-[width]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WhatsAppSurfaceCard>
  );
};
