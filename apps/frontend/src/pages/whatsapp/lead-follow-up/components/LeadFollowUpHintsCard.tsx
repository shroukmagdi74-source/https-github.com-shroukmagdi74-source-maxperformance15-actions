import React from "react";
import { Clock, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";

interface LeadFollowUpHintsCardProps {
  tx: (key: string) => string;
}

const TIPS = [
  { icon: Clock, color: "text-amber-500 bg-amber-500/10", key: "tip1" },
  { icon: MessageSquare, color: "text-sky-500 bg-sky-500/10", key: "tip2" },
  { icon: Sparkles, color: "text-violet-500 bg-violet-500/10", key: "tip3" },
] as const;

export const LeadFollowUpHintsCard: React.FC<LeadFollowUpHintsCardProps> = ({ tx }) => {
  return (
    <WhatsAppSurfaceCard title={tx("hints.title")}>
      <ul className="space-y-2 text-xs text-muted-foreground">
        {TIPS.map((tip, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/40 p-3"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg",
                tip.color
              )}
            >
              <tip.icon className="size-3.5" />
            </span>
            <span className="leading-relaxed mt-0.5">{tx(`hints.${tip.key}`)}</span>
          </li>
        ))}
      </ul>
    </WhatsAppSurfaceCard>
  );
};
