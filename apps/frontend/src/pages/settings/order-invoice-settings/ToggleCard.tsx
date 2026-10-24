import React from "react";
import { Switch } from "@/components/ui/switch";

export interface ToggleCardProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleCard({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: ToggleCardProps) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-950 dark:text-slate-100">{title}</p>
          <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <Switch
          aria-label={title}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
