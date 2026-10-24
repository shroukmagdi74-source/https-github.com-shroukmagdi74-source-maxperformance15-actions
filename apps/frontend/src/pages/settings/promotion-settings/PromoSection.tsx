import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SWITCH_SIZE_CLASS } from "./types";

export interface PromoSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  accentClassName: { sectionBorder: string; iconActive: string };
  isOn: boolean;
  pill: React.ReactNode;
  switchChecked: boolean;
  onSwitchChange: (checked: boolean) => void;
  switchLabel: string;
  children?: React.ReactNode;
}

export function PromoSection({
  icon: Icon,
  title,
  description,
  accentClassName,
  isOn,
  pill,
  switchChecked,
  onSwitchChange,
  switchLabel,
  children,
}: PromoSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] border bg-white/80 p-5 shadow-xs transition-colors dark:bg-slate-900/70 dark:shadow-none",
        isOn ? accentClassName.sectionBorder : "border-slate-200/70 dark:border-slate-800",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset transition-colors",
            isOn
              ? accentClassName.iconActive
              : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <h2 className="text-base font-bold text-slate-950 dark:text-slate-100">{title}</h2>
          {pill}
        </div>
        <div className="ms-auto flex items-center gap-3">
          <Switch
            checked={switchChecked}
            onCheckedChange={onSwitchChange}
            aria-label={switchLabel}
            className={SWITCH_SIZE_CLASS}
          />
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {children ? <div className="mt-5 space-y-4 text-slate-900 dark:text-slate-100">{children}</div> : null}
    </section>
  );
}
