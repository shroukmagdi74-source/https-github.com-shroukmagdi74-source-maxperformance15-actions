import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, MessageSquareText, Plus, RefreshCw, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface JourneyPageTopBarProps {
  backHref: string;
  backLabel: string;
  isRtl: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenTimeline: () => void;
  onOpenCopilot: () => void;
  copilotTitle: string;
  isAdmin: boolean;
  onAddNewFlow: () => void;
  refreshLabel: string;
  addNewFlowLabel: string;
}

export const JourneyPageTopBar: React.FC<JourneyPageTopBarProps> = ({
  backHref,
  backLabel,
  isRtl,
  refreshing,
  onRefresh,
  onOpenTimeline,
  onOpenCopilot,
  copilotTitle,
  isAdmin,
  onAddNewFlow,
  refreshLabel,
  addNewFlowLabel,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] px-3 py-2 shadow-soft sm:rounded-3xl sm:px-4 sm:py-2.5">
      <Link
        to={backHref}
        aria-label={backLabel}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "shrink-0 rounded-full border-[color:var(--shell-control-border)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]",
        )}
      >
        <ChevronLeft className={cn("size-4", isRtl && "rotate-180")} />
      </Link>

      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={onRefresh}
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          {refreshLabel}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTimeline}
        >
          <MessageSquareText className="size-4" />
          رسايل عميل
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCopilot}
          title={copilotTitle + " (⌘K)"}
        >
          <Sparkles className="size-4" />
          {copilotTitle}
        </Button>
        {isAdmin && (
          <Button size="sm" onClick={onAddNewFlow}>
            <Plus className="size-4" />
            {addNewFlowLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
