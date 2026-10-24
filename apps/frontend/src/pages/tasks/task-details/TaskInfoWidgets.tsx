import React from 'react';
import { cn } from '../../../lib/utils';

export const TaskInfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  emphasized?: boolean;
}> = ({ label, value, icon, emphasized = false }) => (
  <div className="rounded-[22px] border border-border/65 bg-background/70 px-4 py-3">
    <div className="flex items-start gap-3">
      {icon ? (
        <div className="mt-0.5 rounded-2xl bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "text-sm text-foreground",
            emphasized ? "font-semibold" : "font-medium",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  </div>
);

export const TaskEmptyState: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="rounded-[26px] border border-dashed border-border/70 bg-background/55 px-5 py-10 text-center">
    <div className="mx-auto max-w-md space-y-2">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const TaskWorkspaceStat: React.FC<{
  label: string;
  value: React.ReactNode;
  hint: string;
  tone?: "default" | "primary" | "warning" | "success";
}> = ({ label, value, hint, tone = "default" }) => (
  <div
    className={cn(
      "min-w-0 rounded-[20px] border px-3 py-2.5 md:rounded-[22px]",
      tone === "primary" &&
        "border-primary/15 bg-primary/5 text-primary dark:bg-primary/10",
      tone === "warning" &&
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200",
      tone === "success" &&
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
      tone === "default" && "border-border/65 bg-background/75 text-foreground",
    )}
  >
    <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
    <div className="mt-1 min-w-0 truncate text-[15px] font-semibold leading-6 tracking-tight md:text-base">
      {value}
    </div>
    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground md:text-xs">
      {hint}
    </p>
  </div>
);
