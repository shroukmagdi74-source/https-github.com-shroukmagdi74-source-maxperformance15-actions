import React from "react";
import { Layers, Power, PowerOff } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { DashboardData } from "./types";

interface SuperAdminSystemServicesProps {
  systems: DashboardData["systems"];
}

export const SuperAdminSystemServices: React.FC<SuperAdminSystemServicesProps> = ({
  systems,
}) => {
  if (!systems || systems.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/40 p-4 shadow-xs">
      <div className="mb-3.5 flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center text-primary">
            <Layers className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              خدمات النظام الأساسية
            </h3>
            <p className="text-[10px] text-muted-foreground">
              حالة تشغيل البوابات والخدمات السحابية
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {systems.length} خدمة
        </Badge>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {systems.map((s) => (
          <div
            key={s.systemName}
            className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 p-2.5 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "size-7 rounded-md border flex items-center justify-center shrink-0",
                  s.isEnabled
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-border/80 bg-muted text-muted-foreground",
                )}
              >
                {s.isEnabled ? (
                  <Power className="size-3.5" />
                ) : (
                  <PowerOff className="size-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {s.displayName}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {s.category === "api_keys"
                    ? "مفاتيح API"
                    : s.category === "monitoring"
                      ? "مراقبة"
                      : s.category === "general"
                        ? "عام"
                        : s.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-muted-foreground">
                {s.resourceUsage}
              </span>
              <div
                className={cn(
                  "size-1.5 rounded-full",
                  s.isEnabled ? "bg-emerald-500" : "bg-muted-foreground/40",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
