import React from "react";
import type { TFunction } from "i18next";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";

export const PricingModelBadge: React.FC<{ t: TFunction; model: string }> = ({ t, model }) => {
  switch (model) {
    case "FREE":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
          {t("subscription.free")}
        </Badge>
      );
    case "PAY_PER_USE":
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
          {t("subscription.payAsYouGo")}
        </Badge>
      );
    case "SUBSCRIPTION":
      return (
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900">
          {t("subscription.subscription")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{model}</Badge>;
  }
};

export const ActiveStatusPill: React.FC<{ t: TFunction; isActive: boolean }> = ({ t, isActive }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2 py-0.5 rounded-full ${
      isActive
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
    {isActive ? t("subscription.active", "مفعّل") : t("subscription.disabled", "موقوف")}
  </span>
);

interface ToggleWithTooltipProps {
  checked: boolean;
  onToggle: () => void;
  onLabel: string;
  offLabel: string;
  className?: string;
}

export const ToggleWithTooltip: React.FC<ToggleWithTooltipProps> = ({
  checked,
  onToggle,
  onLabel,
  offLabel,
  className = "data-[state=checked]:bg-emerald-500",
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Switch checked={checked} onCheckedChange={onToggle} className={className} />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs font-cairo">
        {checked ? onLabel : offLabel}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface TrialDaysInputProps {
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  daysLabel: string;
  compact?: boolean;
}

export const TrialDaysInput: React.FC<TrialDaysInputProps> = ({
  value,
  onChange,
  onCommit,
  daysLabel,
  compact = false,
}) => (
  <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
    <input
      type="number"
      min={0}
      aria-label={daysLabel}
      className={`${compact ? "w-12 text-xs" : "w-14"} text-center text-amber-600 dark:text-amber-400 font-bold font-mono tabular-nums bg-transparent border-b border-dashed border-amber-300 dark:border-amber-700 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onBlur={onCommit}
    />
    <span className="text-xs text-slate-400 dark:text-slate-500">{daysLabel}</span>
  </div>
);
