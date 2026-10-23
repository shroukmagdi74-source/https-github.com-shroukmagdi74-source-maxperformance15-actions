import React, { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { FlowStep } from "../types";

interface LeadFollowUpStepFormProps {
  flowId: string;
  step: FlowStep;
  saving: string | null;
  tx: (key: string) => string;
  onSave: (step: FlowStep) => void;
  onCancel: () => void;
}

export const LeadFollowUpStepForm: React.FC<LeadFollowUpStepFormProps> = ({
  flowId,
  step,
  saving,
  tx,
  onSave,
  onCancel,
}) => {
  const [local, setLocal] = useState<FlowStep>(step);
  const isSaving = saving === `step-${flowId}`;

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4 transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">{tx("steps.delay")}</Label>
          <div className="mt-1 flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={365}
              className="w-16 font-mono tabular-nums text-xs"
              value={local.delayUnit === "HOURS" ? (local.delayHours ?? 1) : local.delayDays}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (local.delayUnit === "HOURS") {
                  setLocal({ ...local, delayHours: v });
                } else {
                  setLocal({ ...local, delayDays: v });
                }
              }}
            />
            <Select
              value={local.delayUnit}
              onValueChange={(v) => setLocal({ ...local, delayUnit: v ?? "HOURS" })}
            >
              <SelectTrigger className="w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOURS">{tx("steps.hours")}</SelectItem>
                <SelectItem value="DAYS">{tx("steps.days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label className="text-xs text-muted-foreground">{tx("steps.content")}</Label>
          <p className="text-[10px] text-muted-foreground">{tx("steps.variables")}</p>
          <Textarea
            value={local.content}
            onChange={(e) => setLocal({ ...local, content: e.target.value })}
            rows={2}
            className="mt-1 resize-none text-xs"
            placeholder="Hi {firstName}..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
          {tx("actions.cancel")}
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(local)}
          disabled={!local.content.trim() || isSaving}
          className="text-xs"
        >
          {isSaving ? <Loader2 className="size-3 animate-spin mr-1" /> : <Save className="size-3 mr-1" />}
          {tx("actions.save")}
        </Button>
      </div>
    </div>
  );
};
