import React from "react";
import { Edit, GitBranch, MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { WhatsAppSurfaceCard } from "../components/WhatsAppPageShell";
import { Flow } from "./types";

export interface JourneyFlowsListCardProps {
  flows: Flow[];
  filteredFlows: Flow[];
  selectedFlow: Flow | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectFlow: (flow: Flow) => void;
  onEditFlow: (flow: Flow) => void;
  onDeleteFlow: (flow: Flow) => void;
  onOpenCreateFlow: () => void;
  isAdmin: boolean;
  isRtl: boolean;
  t: (key: string, options?: any) => string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[color:color-mix(in_srgb,var(--shell-control-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--color-card)_40%,transparent)] px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-card))] text-[color:var(--color-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-[color:var(--color-foreground)]">
          {title}
        </p>
        <p className="mx-auto max-w-sm text-sm leading-6 text-[color:var(--color-muted-foreground)]">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export const JourneyFlowsListCard: React.FC<JourneyFlowsListCardProps> = ({
  flows,
  filteredFlows,
  selectedFlow,
  searchTerm,
  onSearchChange,
  onSelectFlow,
  onEditFlow,
  onDeleteFlow,
  onOpenCreateFlow,
  isAdmin,
  isRtl,
  t,
}) => {
  return (
    <WhatsAppSurfaceCard
      title={t("whatsappJourney.tabs.flows") as string}
      description={
        t("whatsappJourney.flows.count", { count: flows.length }) as string
      }
      action={
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)] px-2.5 py-1 text-xs font-mono tabular-nums"
        >
          <GitBranch className="size-3.5 text-[color:var(--color-muted-foreground)]" />
          {flows.length}
        </Badge>
      }
      contentClassName="px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="space-y-2">
        <div className="relative">
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 text-[color:var(--color-muted-foreground)]",
              isRtl ? "right-2.5" : "left-2.5",
            )}
          />
          <Input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("common.search") as string}
            className={cn(
              "h-8 bg-[color:var(--color-card)]/75 text-xs",
              isRtl ? "pr-8 pl-3" : "pl-8 pr-3",
            )}
          />
        </div>

        {filteredFlows.length > 0 ? (
          <div className="space-y-1">
            {filteredFlows.map((flow) => {
              const selected = selectedFlow?.id === flow.id;

              return (
                <div
                  key={flow.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectFlow(flow)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectFlow(flow);
                    }
                  }}
                  className={cn(
                    "group relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-start transition-all duration-200",
                    selected
                      ? "bg-[color:var(--journey-accent-soft)]"
                      : "bg-[color:var(--color-card)] hover:bg-[color:var(--color-muted)]",
                  )}
                  style={
                    selected
                      ? {
                          boxShadow: `inset 0 0 0 1.5px var(--journey-accent), 0 0 12px -2px var(--journey-accent-glow)`,
                        }
                      : undefined
                  }
                >
                  {/* Status dot */}
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full transition-all",
                      flow.isEnabled
                        ? "bg-[color:var(--business-success)] shadow-[0_0_0_2.5px_color-mix(in_srgb,var(--business-success)_22%,transparent)]"
                        : "bg-[color:var(--color-muted-foreground)] opacity-50",
                    )}
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[color:var(--color-foreground)]">
                      {flow.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[color:var(--color-muted-foreground)]">
                      <span className="flex items-center gap-0.5 font-mono tabular-nums">
                        <MessageSquare className="size-2.5" />
                        {flow._count?.steps || 0}
                      </span>
                      {flow._count?.journeys ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="font-mono tabular-nums">
                            {t("whatsappJourney.flows.activeCustomers", {
                              count: flow._count.journeys,
                            })}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        className="flex size-6 items-center justify-center rounded-md text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditFlow(flow);
                        }}
                        aria-label={t("common.edit") as string}
                      >
                        <Edit className="size-3" />
                      </button>
                      <button
                        type="button"
                        className="flex size-6 items-center justify-center rounded-md text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-destructive)_12%,transparent)] hover:text-[color:var(--color-destructive)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteFlow(flow);
                        }}
                        aria-label={t("common.delete") as string}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={GitBranch}
            title={t("whatsappJourney.flows.empty")}
            description={
              flows.length > 0
                ? t("common.no_data")
                : t("whatsappJourney.flows.emptyDesc")
            }
            action={
              flows.length === 0 && isAdmin ? (
                <Button size="sm" onClick={onOpenCreateFlow}>
                  <Plus className="size-4" />
                  {t("whatsappJourney.flows.addNew")}
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </WhatsAppSurfaceCard>
  );
};
