import React from "react";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { Flow, FlowStep, LeadCategory } from "../types";
import { LeadFollowUpStepForm } from "./LeadFollowUpStepForm";

interface LeadFollowUpFlowsListProps {
  flows: Flow[];
  categories: LeadCategory[];
  expandedFlow: string | null;
  editingStep: { flowId: string; step: FlowStep } | null;
  saving: string | null;
  newFlowName: string;
  newFlowScope: "TARGETED" | "GENERAL";
  newFlowCategoryIds: string[];
  showNewFlow: boolean;
  deleteConfirm: string | null;
  tx: (key: string) => string;
  onSetShowNewFlow: (open: boolean) => void;
  onSetNewFlowName: (name: string) => void;
  onSetNewFlowScope: (scope: "TARGETED" | "GENERAL") => void;
  onSetNewFlowCategoryIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  onSetDeleteConfirm: (id: string | null) => void;
  onSetEditingStep: (step: { flowId: string; step: FlowStep } | null) => void;
  onCreatePresetFlow: () => void;
  onCreateFlow: () => void;
  onToggleFlow: (flow: Flow) => void;
  onExpandFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onSaveStep: (flowId: string, step: FlowStep) => void;
  onDeleteStep: (stepId: string, flowId: string) => void;
  onSetFlowScope: (flowId: string, isGeneral: boolean) => void;
  onLinkCategoryToFlow: (catId: string, isLinked: boolean, flowId: string) => void;
}

export const LeadFollowUpFlowsList: React.FC<LeadFollowUpFlowsListProps> = ({
  flows,
  categories,
  expandedFlow,
  editingStep,
  saving,
  newFlowName,
  newFlowScope,
  newFlowCategoryIds,
  showNewFlow,
  deleteConfirm,
  tx,
  onSetShowNewFlow,
  onSetNewFlowName,
  onSetNewFlowScope,
  onSetNewFlowCategoryIds,
  onSetDeleteConfirm,
  onSetEditingStep,
  onCreatePresetFlow,
  onCreateFlow,
  onToggleFlow,
  onExpandFlow,
  onDeleteFlow,
  onSaveStep,
  onDeleteStep,
  onSetFlowScope,
  onLinkCategoryToFlow,
}) => {
  return (
    <WhatsAppSurfaceCard
      title={tx("flows.title")}
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-amber-600 border-amber-300 hover:bg-amber-500/10 text-xs"
            onClick={onCreatePresetFlow}
          >
            <Sparkles className="size-3.5 mr-1" /> {tx("flows.presetWelcome")}
          </Button>

          <Dialog
            open={showNewFlow}
            onOpenChange={(open) => {
              onSetShowNewFlow(open);
              if (!open) {
                onSetNewFlowScope("TARGETED");
                onSetNewFlowCategoryIds([]);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs"
              >
                <Plus className="size-3.5 mr-1" /> {tx("flows.addNew")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{tx("flows.addNew")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">{tx("flows.name")}</Label>
                  <Input
                    value={newFlowName}
                    onChange={(e) => onSetNewFlowName(e.target.value)}
                    placeholder={tx("flows.name")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{tx("flows.scope")}</Label>
                  <div className="mt-1 flex gap-2">
                    <Button
                      type="button"
                      variant={newFlowScope === "TARGETED" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => onSetNewFlowScope("TARGETED")}
                    >
                      {tx("flows.targeted")}
                    </Button>
                    <Button
                      type="button"
                      variant={newFlowScope === "GENERAL" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => onSetNewFlowScope("GENERAL")}
                    >
                      {tx("flows.general")}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {newFlowScope === "GENERAL" ? tx("flows.generalDesc") : tx("flows.targetedDesc")}
                  </p>
                </div>
                {newFlowScope === "TARGETED" && categories.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{tx("categories.title")}</Label>
                    <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border/70 p-2">
                      {categories.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/40"
                        >
                          <input
                            type="checkbox"
                            checked={newFlowCategoryIds.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onSetNewFlowCategoryIds((prev) => [...prev, cat.id]);
                              } else {
                                onSetNewFlowCategoryIds((prev) => prev.filter((id) => id !== cat.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span
                            className="inline-block size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color || "#6366f1" }}
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    onSetShowNewFlow(false);
                    onSetNewFlowScope("TARGETED");
                    onSetNewFlowCategoryIds([]);
                  }}
                >
                  {tx("actions.cancel")}
                </Button>
                <Button
                  onClick={onCreateFlow}
                  disabled={!newFlowName.trim() || saving === "create"}
                >
                  {saving === "create" ? (
                    <Loader2 className="size-3 animate-spin mr-1" />
                  ) : (
                    <Plus className="size-3 mr-1" />
                  )}
                  {tx("flows.addNew")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {flows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Layers className="size-12 opacity-30" />
          <p className="font-medium text-sm">{tx("flows.empty")}</p>
          <p className="text-xs">{tx("flows.emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className="rounded-2xl border border-border/70 bg-card/60 shadow-xs transition-all hover:border-border"
            >
              <button
                type="button"
                onClick={() => onExpandFlow(flow.id)}
                className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
              >
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                  {expandedFlow === flow.id ? (
                    <ChevronDown className="size-4 text-primary" />
                  ) : (
                    <ChevronRight className="size-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{flow.name}</p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        flow.isGeneral
                          ? "border-sky-300/70 bg-sky-500/10 text-sky-700 dark:text-sky-400"
                          : "border-amber-300/70 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {flow.isGeneral ? tx("flows.general") : tx("flows.targeted")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono tabular-nums">
                    {flow._count.steps} {tx("flows.steps")} · {flow._count.journeys}{" "}
                    {tx("flows.activeLeads").replace("{{count}}", String(flow._count.journeys))}
                  </p>
                  {flow.isGeneral ? (
                    <p className="mt-0.5 text-xs text-sky-600 dark:text-sky-400">
                      {tx("flows.generalDesc")}
                    </p>
                  ) : flow.categories && flow.categories.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {flow.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px]"
                        >
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: cat.color || "#6366f1" }}
                          />
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Switch
                  checked={flow.isEnabled}
                  onCheckedChange={() => onToggleFlow(flow)}
                  onClick={(e) => e.stopPropagation()}
                />
              </button>

              {expandedFlow === flow.id && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                  {/* Steps section */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{tx("steps.title")}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full text-xs"
                        onClick={() =>
                          onSetEditingStep({
                            flowId: flow.id,
                            step: {
                              delayDays: 1,
                              delayHours: 1,
                              delayUnit: "HOURS",
                              content: "",
                              stepOrder: (flow.steps?.length ?? 0) + 1,
                            },
                          })
                        }
                      >
                        <Plus className="size-3 mr-1" /> {tx("steps.add")}
                      </Button>
                    </div>

                    {(!flow.steps || flow.steps.length === 0) && !editingStep && (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        {tx("steps.noSteps")}
                      </p>
                    )}

                    {flow.steps?.map((step, i) => (
                      <div key={step.id || i}>
                        {editingStep?.flowId === flow.id &&
                        editingStep?.step.stepOrder === step.stepOrder ? (
                          <LeadFollowUpStepForm
                            flowId={flow.id}
                            step={editingStep.step}
                            saving={saving}
                            tx={tx}
                            onSave={(s) => onSaveStep(flow.id, { ...s, id: step.id })}
                            onCancel={() => onSetEditingStep(null)}
                          />
                        ) : (
                          <div className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card/40 p-3 transition-colors hover:bg-muted/20">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold font-mono tabular-nums text-primary">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-muted-foreground font-mono tabular-nums">
                                {step.delayUnit === "HOURS"
                                  ? `${step.delayHours ?? 1} ${tx("steps.hours")}`
                                  : `${step.delayDays} ${
                                      step.delayDays === 1 ? tx("steps.day") : tx("steps.days")
                                    }`}
                              </p>
                              <p className="mt-0.5 text-xs line-clamp-2">{step.content}</p>
                            </div>
                            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => onSetEditingStep({ flowId: flow.id, step })}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <Settings2 className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => step.id && onDeleteStep(step.id, flow.id)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {editingStep &&
                      editingStep.flowId === flow.id &&
                      !flow.steps?.some((s) => s.stepOrder === editingStep.step.stepOrder) && (
                        <LeadFollowUpStepForm
                          flowId={flow.id}
                          step={editingStep.step}
                          saving={saving}
                          tx={tx}
                          onSave={(s) => onSaveStep(flow.id, s)}
                          onCancel={() => onSetEditingStep(null)}
                        />
                      )}
                  </div>

                  {/* Scope & Categories Linkage */}
                  <div className="mb-4 rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold">{tx("flows.scope")}</h4>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSetFlowScope(flow.id, false)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            !flow.isGeneral
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/40"
                              : "border border-border/60 text-muted-foreground hover:bg-muted/40"
                          )}
                        >
                          {tx("flows.targeted")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetFlowScope(flow.id, true)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            flow.isGeneral
                              ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-300/40"
                              : "border border-border/60 text-muted-foreground hover:bg-muted/40"
                          )}
                        >
                          {tx("flows.general")}
                        </button>
                      </div>
                    </div>
                    {flow.isGeneral ? (
                      <p className="mt-2 text-xs text-muted-foreground">{tx("flows.generalDesc")}</p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">{tx("flows.targetedDesc")}</p>
                        {categories.map((cat) => {
                          const isLinked =
                            flow.categories?.some((c) => c.id === cat.id) ||
                            cat.triggerFlowId === flow.id;
                          return (
                            <label
                              key={cat.id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs hover:bg-muted/40"
                            >
                              <input
                                type="checkbox"
                                checked={!!isLinked}
                                onChange={() => onLinkCategoryToFlow(cat.id, !!isLinked, flow.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span
                                className="inline-block size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: cat.color || "#6366f1" }}
                              />
                              <span className="flex-1">{cat.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Delete Flow Action */}
                  <div className="flex justify-end border-t border-border/60 pt-3">
                    {deleteConfirm === flow.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive">{tx("flows.deleteConfirm")}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 rounded-full text-xs"
                          onClick={() => onDeleteFlow(flow.id)}
                        >
                          <Trash2 className="size-3 mr-1" /> {tx("actions.delete")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-full text-xs"
                          onClick={() => onSetDeleteConfirm(null)}
                        >
                          {tx("actions.cancel")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => onSetDeleteConfirm(flow.id)}
                      >
                        <Trash2 className="size-3 mr-1" /> {tx("actions.delete")}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </WhatsAppSurfaceCard>
  );
};
