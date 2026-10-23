import React from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getJourneyStatusKey,
  Journey,
  journeyStatusClasses,
} from "../types";

export interface JourneyDetailsDialogProps {
  journey: Journey | null;
  open: boolean;
  onClose: () => void;
  t: (key: string, options?: any) => string;
}

export const JourneyDetailsDialog: React.FC<JourneyDetailsDialogProps> = ({
  journey,
  open,
  onClose,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-[color:var(--shell-control-border)] bg-[var(--app-panel-bg)] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_72%,transparent)] px-6 pt-6">
          <DialogTitle>{t("whatsappJourney.monitoring.details")}</DialogTitle>
          <DialogDescription>{t("whatsappJourney.subtitle")}</DialogDescription>
        </DialogHeader>

        {journey ? (
          <div className="space-y-5 px-6 pb-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
                  {t("whatsappJourney.monitoring.customer")}
                </p>
                <p className="mt-2 text-base font-semibold text-[color:var(--color-foreground)]">
                  {journey.customer.firstName} {journey.customer.lastName}
                </p>
                <p className="mt-1 text-sm font-mono tabular-nums text-[color:var(--color-muted-foreground)]">
                  {journey.customer.phone}
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
                  {t("whatsappJourney.monitoring.status")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full",
                      journeyStatusClasses[journey.status] ||
                        journeyStatusClasses["CANCELLED"],
                    )}
                  >
                    {t(
                      `whatsappJourney.monitoring.${getJourneyStatusKey(journey.status)}`,
                    )}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 font-mono tabular-nums"
                  >
                    <GitBranch className="size-3.5" />#
                    {journey.order.orderNumber}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
                  {journey.flow.name}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-foreground)]">
                <RefreshCw className="size-4" />
                {t("whatsappJourney.monitoring.details")}
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 p-4">
                {journey.logs?.trim() ? (
                  journey.logs
                    .split("\n")
                    .filter(Boolean)
                    .reverse()
                    .map((log, index) => (
                      <div
                        key={`${log}-${index}`}
                        className="rounded-xl border border-[color:color-mix(in_srgb,var(--shell-control-border)_66%,transparent)] bg-[color:var(--color-card)] px-4 py-3"
                      >
                        <p className="text-sm leading-6 text-[color:var(--color-foreground)]">
                          {log}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">
                    {t("common.no_data")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="px-6">
          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
