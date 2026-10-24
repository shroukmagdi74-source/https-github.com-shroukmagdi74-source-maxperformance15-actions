import React from "react";
import { cn } from "@/lib/utils";

export interface StatusPillProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  warn?: boolean;
}

export function StatusPill({
  active,
  activeLabel,
  inactiveLabel,
  warn = false,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        active
          ? warn
            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? (warn ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-400",
        )}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
