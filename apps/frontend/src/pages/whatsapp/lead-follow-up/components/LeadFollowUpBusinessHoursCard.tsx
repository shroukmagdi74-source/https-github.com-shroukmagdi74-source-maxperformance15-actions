import React from "react";
import { Clock, Globe, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import { TIMEZONES, WA_HOURS, type Settings } from "../types";

interface LeadFollowUpBusinessHoursCardProps {
  settings: Settings | null;
  saving: string | null;
  tx: (key: string) => string;
  onUpdateSettings: (settings: Settings) => void;
  onSaveSettings: () => void;
}

export const LeadFollowUpBusinessHoursCard: React.FC<LeadFollowUpBusinessHoursCardProps> = ({
  settings,
  saving,
  tx,
  onUpdateSettings,
  onSaveSettings,
}) => {
  if (!settings) return null;

  const isSaving = saving === "settings";
  const startVal =
    settings.businessHourStart !== null && settings.businessHourStart !== undefined
      ? String(settings.businessHourStart)
      : "ANY";
  const endVal =
    settings.businessHourEnd !== null && settings.businessHourEnd !== undefined
      ? String(settings.businessHourEnd)
      : "ANY";

  return (
    <WhatsAppSurfaceCard
      title={tx("businessHours.title")}
      description={tx("businessHours.description")}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {tx("businessHours.startHour")}
            </Label>
            <Select
              value={startVal}
              onValueChange={(v) =>
                onUpdateSettings({
                  ...settings,
                  businessHourStart: v && v !== "ANY" ? Number(v) : null,
                })
              }
            >
              <SelectTrigger className="mt-1 text-xs">
                <SelectValue placeholder={tx("businessHours.anyTime")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">{tx("businessHours.anyTime")}</SelectItem>
                {WA_HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)} className="font-mono tabular-nums">
                    {`${h}`.padStart(2, "0")}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {tx("businessHours.endHour")}
            </Label>
            <Select
              value={endVal}
              onValueChange={(v) =>
                onUpdateSettings({
                  ...settings,
                  businessHourEnd: v && v !== "ANY" ? Number(v) : null,
                })
              }
            >
              <SelectTrigger className="mt-1 text-xs">
                <SelectValue placeholder={tx("businessHours.anyTime")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">{tx("businessHours.anyTime")}</SelectItem>
                {WA_HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)} className="font-mono tabular-nums">
                    {`${h}`.padStart(2, "0")}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="size-3.5" /> {tx("businessHours.timezone")}
            </Label>
            <Select
              value={settings.timezone || "UTC"}
              onValueChange={(v) =>
                onUpdateSettings({ ...settings, timezone: v || "UTC" })
              }
            >
              <SelectTrigger className="mt-1 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="font-mono text-xs">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3">
          <span className="text-xs font-medium">
            {settings.isEnabled ? tx("status.active") : tx("status.paused")}
          </span>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(v) => onUpdateSettings({ ...settings, isEnabled: v })}
            />
            <Button
              size="sm"
              className="rounded-full text-xs"
              onClick={onSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : (
                <Save className="size-3 mr-1" />
              )}
              {tx("actions.save")}
            </Button>
          </div>
        </div>
      </div>
    </WhatsAppSurfaceCard>
  );
};
