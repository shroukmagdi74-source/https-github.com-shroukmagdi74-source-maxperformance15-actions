import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, Send, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { DelayUnit, DelayMode } from "./types";

interface CustomerWhatsAppDelaySettingsProps {
  delayValue: number;
  delayUnit: DelayUnit;
  delayMode: DelayMode;
  sending: boolean;
  sendError: string;
  hasConnectedSession: boolean;
  hasMessage: boolean;
  onDelayValueChange: (val: number) => void;
  onDelayUnitChange: (unit: DelayUnit) => void;
  onDelayModeChange: (mode: DelayMode) => void;
  onSend: () => void;
}

export const CustomerWhatsAppDelaySettings: React.FC<CustomerWhatsAppDelaySettingsProps> = ({
  delayValue,
  delayUnit,
  delayMode,
  sending,
  sendError,
  hasConnectedSession,
  hasMessage,
  onDelayValueChange,
  onDelayUnitChange,
  onDelayModeChange,
  onSend,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <h4 className="text-xs font-semibold text-foreground">
          {t("whatsappNotify.delaySettings", "إعدادات الفاصل الزمني بين الرسائل")}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Value */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">الفترة الزمنية</Label>
          <Input
            type="number"
            min={0.5}
            step={0.5}
            value={delayValue}
            onChange={(e) => onDelayValueChange(parseFloat(e.target.value) || 1.5)}
            className="h-8 font-mono text-xs tabular-nums"
          />
        </div>

        {/* Unit */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">الوحدة</Label>
          <Select
            value={delayUnit}
            onValueChange={(val) => onDelayUnitChange(val as DelayUnit)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds" className="text-xs">ثواني</SelectItem>
              <SelectItem value="minutes" className="text-xs">دقائق</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mode */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <Label className="text-[11px] text-muted-foreground">النمط</Label>
          <Select
            value={delayMode}
            onValueChange={(val) => onDelayModeChange(val as DelayMode)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perMessage" className="text-xs">لكل رسالة</SelectItem>
              <SelectItem value="perSession" className="text-xs">لكل جلسة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sendError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{sendError}</span>
        </div>
      )}

      <div className="pt-2">
        <Button
          onClick={onSend}
          disabled={sending || !hasConnectedSession || !hasMessage}
          className="w-full h-9 gap-2 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
        >
          <Send className={`h-4 w-4 ${sending ? "animate-pulse" : ""}`} />
          {sending
            ? t("whatsappNotify.sending", "جاري الإرسال...")
            : t("whatsappNotify.sendNow", "بدء إرسال الحملة الآن")}
        </Button>
      </div>
    </div>
  );
};
