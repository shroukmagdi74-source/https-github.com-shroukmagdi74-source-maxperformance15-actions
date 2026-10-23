import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { WhatsAppSurfaceCard } from "../components/WhatsAppPageShell";
import { FlowCanvas, type FlowStep } from "@/pages/whatsapp/components/journey/FlowCanvas";
import { Flow, Step } from "./types";
import { EmptyState } from "./JourneyFlowsListCard";

export interface JourneyStepsCanvasCardProps {
  selectedFlow: Flow | null;
  steps: Step[];
  stepsLoading: boolean;
  isAdmin: boolean;
  onOpenCopilot: () => void;
  onReorderSteps: (steps: Step[]) => void;
  onEditStep: (step: FlowStep) => void;
  onAddStep: () => void;
  onDeleteStep: (step: FlowStep) => void;
  onOpenCreateFlow: () => void;
  t: (key: string, options?: any) => string;
  FlowCanvasComponent?: React.ComponentType<any>;
}

export const JourneyStepsCanvasCard: React.FC<JourneyStepsCanvasCardProps> = ({
  selectedFlow,
  steps,
  stepsLoading,
  isAdmin,
  onOpenCopilot,
  onReorderSteps,
  onEditStep,
  onAddStep,
  onDeleteStep,
  onOpenCreateFlow,
  t,
  FlowCanvasComponent = FlowCanvas,
}) => {
  return (
    <WhatsAppSurfaceCard
      title={
        selectedFlow
          ? selectedFlow.name
          : (t("whatsappJourney.steps.title") as string)
      }
      description={
        selectedFlow
          ? (t("whatsappJourney.flows.editing") as string)
          : (t("whatsappJourney.flows.selectPrompt") as string)
      }
      action={
        selectedFlow ? (
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 rounded-full px-2.5 py-1 text-xs",
              selectedFlow.isEnabled
                ? "border-[color:color-mix(in_srgb,var(--business-success)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--business-success)_10%,transparent)] text-[color:color-mix(in_srgb,var(--business-success)_80%,var(--color-foreground))]"
                : "border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)]",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                selectedFlow.isEnabled
                  ? "bg-[color:var(--business-success)]"
                  : "bg-[color:var(--color-muted-foreground)] opacity-50",
              )}
            />
            {selectedFlow.isEnabled
              ? t("whatsappJourney.flows.enabled")
              : t("whatsappJourney.flows.disabled")}
          </Badge>
        ) : undefined
      }
    >
      {!selectedFlow ? (
        <EmptyState
          icon={Sparkles}
          title={t("whatsappJourney.flows.empty")}
          description={t("whatsappJourney.flows.selectPrompt")}
          action={
            isAdmin ? (
              <Button size="sm" onClick={onOpenCreateFlow}>
                <Plus className="size-4" />
                {t("whatsappJourney.flows.addNew")}
              </Button>
            ) : undefined
          }
        />
      ) : stepsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-40 rounded-2xl border border-[color:var(--shell-control-border)]"
            />
          ))}
        </div>
      ) : (
        <FlowCanvasComponent
          steps={steps}
          isAdmin={isAdmin}
          onOpenCopilot={onOpenCopilot}
          onReorder={(next: any) => onReorderSteps(next as Step[])}
          onEdit={onEditStep}
          onAdd={onAddStep}
          onDelete={onDeleteStep}
        />
      )}
    </WhatsAppSurfaceCard>
  );
};
