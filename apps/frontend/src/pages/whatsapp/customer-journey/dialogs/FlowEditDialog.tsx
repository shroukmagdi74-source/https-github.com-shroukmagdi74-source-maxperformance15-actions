import React from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
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
import { Flow } from "../types";

export interface FlowEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFlow: Partial<Flow>;
  setCurrentFlow: React.Dispatch<React.SetStateAction<Partial<Flow>>>;
  onSaveFlow: () => void;
  submitting: boolean;
  t: (key: string, options?: any) => string;
}

export const FlowEditDialog: React.FC<FlowEditDialogProps> = ({
  open,
  onOpenChange,
  currentFlow,
  setCurrentFlow,
  onSaveFlow,
  submitting,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl border-[color:var(--shell-control-border)] bg-[var(--app-panel-bg)] p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_72%,transparent)] px-6 pt-6">
          <DialogTitle>
            {currentFlow.id
              ? t("whatsappJourney.flows.edit")
              : t("whatsappJourney.flows.addNew")}
          </DialogTitle>
          <DialogDescription>{t("whatsappJourney.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="flow-name">{t("whatsappJourney.flows.name")}</Label>
            <Input
              id="flow-name"
              autoFocus
              value={currentFlow.name ?? ""}
              onChange={(event) =>
                setCurrentFlow((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              placeholder={t("whatsappJourney.flows.name") as string}
              className="h-11 bg-[color:var(--color-card)]/75"
            />
          </div>

          <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {t("whatsappJourney.flows.enabled")}
                </p>
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  {t("whatsappJourney.subtitle")}
                </p>
              </div>
              <Switch
                checked={Boolean(currentFlow.isEnabled)}
                onCheckedChange={(checked) =>
                  setCurrentFlow((previous) => ({
                    ...previous,
                    isEnabled: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/70 px-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                {t("whatsappJourney.flows.channels")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(["WHATSAPP", "FACEBOOK"] as const).map((channel) => {
                  const active = (
                    currentFlow.channels ?? ["WHATSAPP", "FACEBOOK"]
                  ).includes(channel);
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() =>
                        setCurrentFlow((previous) => {
                          const current =
                            previous.channels ?? ["WHATSAPP", "FACEBOOK"];
                          return {
                            ...previous,
                            channels: active
                              ? current.filter((c) => c !== channel)
                              : [...current, channel],
                          };
                        })
                      }
                      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                        active
                          ? "border-[color:var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[color:var(--color-primary)]"
                          : "border-[color:var(--shell-control-border)] text-[color:var(--color-muted-foreground)]"
                      }`}
                    >
                      {channel === "WHATSAPP" ? "WhatsApp" : "Messenger"}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                {t("whatsappJourney.flows.channelsHint")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!currentFlow.name?.trim() || submitting}
            onClick={onSaveFlow}
          >
            {submitting ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <CheckCircle className="size-4" />
            )}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
