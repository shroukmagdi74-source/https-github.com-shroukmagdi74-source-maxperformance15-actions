import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { Flow, LeadCategory } from "../types";

interface LeadFollowUpCategoriesCardProps {
  categories: LeadCategory[];
  flows: Flow[];
  tx: (key: string) => string;
  onToggleCategory: (catId: string, autoFollowUp: boolean) => void;
  onBindCategoryFlow: (catId: string, triggerFlowId: string | null) => void;
}

export const LeadFollowUpCategoriesCard: React.FC<LeadFollowUpCategoriesCardProps> = ({
  categories,
  flows,
  tx,
  onToggleCategory,
  onBindCategoryFlow,
}) => {
  if (categories.length === 0) return null;

  return (
    <WhatsAppSurfaceCard
      title={tx("categories.title")}
      description={tx("categories.description")}
    >
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-3 transition-colors hover:border-border"
          >
            <span
              className="flex size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color || "#6366f1" }}
            />
            <span className="min-w-0 flex-1 text-xs font-semibold">{cat.name}</span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <Switch
                checked={cat.autoFollowUp !== false}
                onCheckedChange={(v) => onToggleCategory(cat.id, v)}
              />
              {tx("categories.autoFollowUp")}
            </label>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{tx("categories.linkedFlow")}</span>
              <Select
                value={cat.triggerFlowId || "NONE"}
                onValueChange={(v) =>
                  onBindCategoryFlow(cat.id, v && v !== "NONE" ? v : null)
                }
              >
                <SelectTrigger className="h-7 min-w-[9rem] rounded-full text-xs">
                  <SelectValue placeholder={tx("categories.none")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">{tx("categories.none")}</SelectItem>
                  {flows
                    .filter((f) => f.isEnabled)
                    .map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </WhatsAppSurfaceCard>
  );
};
