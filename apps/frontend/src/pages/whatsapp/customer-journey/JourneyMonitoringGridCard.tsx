import React from "react";
import { CheckCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WhatsAppSurfaceCard } from "../components/WhatsAppPageShell";
import {
  getJourneyStatusKey,
  Journey,
  journeyStatusClasses,
} from "./types";

export interface JourneyMonitoringGridCardProps {
  journeys: Journey[];
  onSelectJourney: (journey: Journey) => void;
  t: (key: string, options?: any) => string;
}

export const JourneyMonitoringGridCard: React.FC<JourneyMonitoringGridCardProps> = ({
  journeys,
  onSelectJourney,
  t,
}) => {
  return (
    <WhatsAppSurfaceCard
      title={t("whatsappJourney.tabs.monitoring") as string}
      description={t("whatsappJourney.monitoring.liveMonitor") as string}
    >
      {journeys.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {journeys.slice(0, 9).map((journey) => {
              const statusKey = journey.status.toUpperCase();
              const totalSteps = journey.flow.steps?.length || 0;
              const initials = `${journey.customer.firstName[0] || ""}${
                journey.customer.lastName[0] || ""
              }`.toUpperCase();
              const progressPct =
                totalSteps > 0
                  ? Math.min(
                      100,
                      Math.round((journey.currentStep / totalSteps) * 100),
                    )
                  : 0;
              const isActive = statusKey === "ACTIVE";
              const isFailed = statusKey === "FAILED";

              return (
                <motion.button
                  key={journey.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  type="button"
                  onClick={() => onSelectJourney(journey)}
                  className="flex items-center gap-3 rounded-xl bg-[color:var(--color-card)] p-3 text-start transition-all duration-200 hover:bg-[color:var(--color-muted)]"
                >
                  {/* Avatar with status indicator */}
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-card))] text-xs font-semibold text-[color:var(--color-primary)]">
                    {initials}
                    {/* Live pulse dot */}
                    {(isActive || isFailed) && (
                      <span className="absolute -end-0.5 -top-0.5 size-2.5">
                        <span
                          className={cn(
                            "absolute inset-0 animate-journey-dot-ring rounded-full",
                            isActive
                              ? "bg-[color:var(--business-success)]"
                              : "bg-[color:var(--color-destructive)]",
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "relative block size-full rounded-full ring-2 ring-[color:var(--color-card)]",
                            isActive
                              ? "bg-[color:var(--business-success)] animate-journey-glow-pulse"
                              : "bg-[color:var(--color-destructive)] animate-pulse",
                          )}
                        />
                      </span>
                    )}
                    {!isActive && !isFailed && statusKey === "COMPLETED" && (
                      <span className="absolute -end-0.5 -top-0.5 flex size-2.5 items-center justify-center rounded-full bg-[color:var(--business-success)] ring-2 ring-[color:var(--color-card)]">
                        <CheckCircle className="size-1.5 text-white" />
                      </span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[color:var(--color-foreground)]">
                      {journey.customer.firstName} {journey.customer.lastName}
                    </p>
                    {/* Mini progress bar */}
                    {totalSteps > 0 && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--color-muted)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              progressPct >= 80
                                ? "bg-[color:var(--business-success)]"
                                : progressPct >= 40
                                  ? "bg-[color:var(--color-primary)]"
                                  : progressPct > 0
                                    ? "bg-[color:var(--color-warning)]"
                                    : "bg-[color:var(--color-muted-foreground)]/30",
                            )}
                          />
                        </div>
                        <span className="shrink-0 text-[10px] font-medium font-mono tabular-nums text-[color:var(--color-muted-foreground)]">
                          {journey.currentStep}/{totalSteps}
                        </span>
                      </div>
                    )}
                    {totalSteps === 0 && (
                      <p className="truncate text-xs text-[color:var(--color-muted-foreground)]">
                        {journey.flow.name}
                      </p>
                    )}
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      journeyStatusClasses[statusKey] ||
                        journeyStatusClasses["CANCELLED"],
                    )}
                  >
                    {t(
                      `whatsappJourney.monitoring.${getJourneyStatusKey(statusKey)}`,
                    )}
                  </Badge>
                </motion.button>
              );
            })}
          </AnimatePresence>
          {journeys.length > 9 && (
            <p className="col-span-full pt-1 text-center text-xs font-mono tabular-nums text-[color:var(--color-muted-foreground)]">
              {journeys.length - 9}+
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-2 py-6 text-center"
        >
          <Users className="size-7 text-[color:var(--color-muted-foreground)] opacity-40" />
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            {t("common.no_data")}
          </p>
        </motion.div>
      )}
    </WhatsAppSurfaceCard>
  );
};
