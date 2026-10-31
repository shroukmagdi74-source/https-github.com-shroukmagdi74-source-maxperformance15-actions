import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const StatusPill: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <span
    className={[
      "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold tracking-wide",
      ok
        ? "border border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "border border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
    ].join(" ")}
  >
    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
    {label}
  </span>
);

export const MetricTile: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}> = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-slate-700">
    <div className="flex items-center gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="truncate text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);
