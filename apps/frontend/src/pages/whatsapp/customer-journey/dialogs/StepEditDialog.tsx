import React from "react";
import { BookOpen, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ButtonsEditor from "../../../automation/components/ButtonsEditor";
import {
  parseInteger,
  previewBackgroundStyle,
  replaceVariables,
  Step,
  variableTokens,
} from "../types";

export function MessagePreview({ content }: { content: string }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-[color:var(--shell-control-border)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
      style={previewBackgroundStyle}
    >
      <div className="max-w-[22rem] rounded-xl rounded-bl-[6px] bg-[color:color-mix(in_srgb,var(--color-background)_92%,var(--shell-control-bg)_8%)] px-4 py-3 text-start shadow-sm">
        <p className="whitespace-pre-wrap text-sm leading-6 text-[color:var(--color-foreground)]">
          {replaceVariables(content)}
        </p>
        <div className="mt-2 text-end text-[11px] font-mono tabular-nums text-[color:var(--color-muted-foreground)]">
          12:05 PM
        </div>
      </div>
    </div>
  );
}

export interface StepEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: Partial<Step>;
  setCurrentStep: React.Dispatch<React.SetStateAction<Partial<Step>>>;
  onSaveStep: () => void;
  submitting: boolean;
  steps: Step[];
  onOpenMetaModal: () => void;
  t: (key: string, options?: any) => string;
}

export const StepEditDialog: React.FC<StepEditDialogProps> = ({
  open,
  onOpenChange,
  currentStep,
  setCurrentStep,
  onSaveStep,
  submitting,
  steps,
  onOpenMetaModal,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-[color:var(--shell-control-border)] bg-[var(--app-panel-bg)] p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_72%,transparent)] px-6 pt-6">
          <DialogTitle>
            {currentStep.id
              ? t("whatsappJourney.steps.edit")
              : t("whatsappJourney.steps.add")}
          </DialogTitle>
          <DialogDescription>{t("whatsappJourney.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-6 pb-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="step-delay">
                {t("whatsappJourney.steps.delay", {
                  days: currentStep.delayDays ?? 1,
                })}
              </Label>
              <Input
                id="step-delay"
                type="number"
                min={1}
                value={currentStep.delayDays ?? 1}
                onChange={(event) =>
                  setCurrentStep((previous) => ({
                    ...previous,
                    delayDays: Math.max(
                      1,
                      parseInteger(event.target.value, previous.delayDays || 1),
                    ),
                  }))
                }
                className="h-11 font-mono tabular-nums bg-[color:var(--color-card)]/75"
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 p-4">
              <div>
                <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {t("whatsappJourney.steps.variables")}
                </p>
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  {t("whatsappJourney.subtitle")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {variableTokens.map((token) => (
                  <Button
                    key={token}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[color:var(--shell-control-border)] font-mono text-xs bg-[color:var(--color-card)]/80"
                    onClick={() =>
                      setCurrentStep((previous) => ({
                        ...previous,
                        content: `${previous.content || ""}${token}`,
                      }))
                    }
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                    {t("whatsappJourney.steps.expectReply")}
                  </p>
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">
                    {t("whatsappJourney.steps.expectReplyHint")}
                  </p>
                </div>
                <Switch
                  checked={Boolean(currentStep.expectReply)}
                  onCheckedChange={(checked) =>
                    setCurrentStep((previous) => ({
                      ...previous,
                      expectReply: checked,
                    }))
                  }
                />
              </div>

              {currentStep.expectReply && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>{t("whatsappJourney.steps.replyKeywords")}</Label>
                    <Input
                      type="text"
                      value={(currentStep.replyKeywords ?? []).join("، ")}
                      onChange={(event) =>
                        setCurrentStep((previous) => ({
                          ...previous,
                          replyKeywords: event.target.value
                            .split(/[،,]/)
                            .map((k) => k.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder={
                        t("whatsappJourney.steps.replyKeywordsPlaceholder") as string
                      }
                      className="h-10 bg-[color:var(--color-card)]/75"
                    />
                  </div>
                  {steps.length > 0 && (
                    <div className="space-y-1">
                      <Label>{t("whatsappJourney.steps.nextStep")}</Label>
                      <select
                        value={currentStep.nextStepId ?? ""}
                        onChange={(event) =>
                          setCurrentStep((previous) => ({
                            ...previous,
                            nextStepId: event.target.value || undefined,
                          }))
                        }
                        className="h-10 w-full rounded-lg border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/75 px-3 text-sm text-[color:var(--color-foreground)]"
                      >
                        <option value="">
                          {t("whatsappJourney.steps.nextStepAuto")}
                        </option>
                        {steps
                          .filter((s) => s.id !== currentStep.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.stepOrder} — {s.content.slice(0, 40)}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>{t("whatsappJourney.steps.timeout")}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={currentStep.timeoutHours ?? ""}
                      onChange={(event) =>
                        setCurrentStep((previous) => ({
                          ...previous,
                          timeoutHours: event.target.value
                            ? Math.max(1, Number(event.target.value))
                            : undefined,
                        }))
                      }
                      placeholder="24"
                      className="h-10 font-mono tabular-nums bg-[color:var(--color-card)]/75"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="step-content">
                  {t("whatsappJourney.steps.content")}
                </Label>
                <button
                  type="button"
                  onClick={onOpenMetaModal}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <BookOpen className="size-3.5" />
                  قوالب ميتا
                </button>
              </div>
              <Textarea
                id="step-content"
                value={currentStep.content ?? ""}
                onChange={(event) =>
                  setCurrentStep((previous) => ({
                    ...previous,
                    content: event.target.value,
                  }))
                }
                placeholder={t("whatsappJourney.steps.content") as string}
                className="min-h-[14rem] bg-[color:var(--color-card)]/75"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
                {t("whatsappJourney.steps.preview")}
              </p>
              <MessagePreview content={currentStep.content || ""} />
            </div>

            <div className="space-y-3 rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 p-4">
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                {t("whatsappJourney.steps.buttons")}
              </p>
              <ButtonsEditor
                buttons={currentStep.buttons ?? []}
                onChange={(buttons) =>
                  setCurrentStep((previous) => ({ ...previous, buttons }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!currentStep.content?.trim() || submitting}
            onClick={onSaveStep}
          >
            {submitting ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
