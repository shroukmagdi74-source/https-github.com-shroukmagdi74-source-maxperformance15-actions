import React from "react";
import { cn } from "@/lib/utils";

interface TemplateMetricProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  colorClass: string;
}

export const TemplateMetric: React.FC<TemplateMetricProps> = ({
  icon: Icon,
  label,
  value,
  colorClass,
}) => {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-1.5">
      <Icon className={cn("size-4 shrink-0", colorClass)} />
      <div className="space-y-0.5 text-center">
        <p className={cn("text-sm font-semibold tabular-nums font-mono", colorClass)}>
          {value}
        </p>
        <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
          {label}
        </p>
      </div>
    </div>
  );
};
