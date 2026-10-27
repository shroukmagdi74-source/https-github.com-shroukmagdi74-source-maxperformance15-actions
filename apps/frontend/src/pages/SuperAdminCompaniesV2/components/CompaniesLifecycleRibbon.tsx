import React from "react";
import { cn } from "../../../lib/utils";

interface CompaniesLifecycleRibbonProps {
  savedView: string;
  quickStats: {
    totalCompanies: number;
    activeCompanies: number;
    trialCompanies?: number;
    activeStores?: number;
    onboardingStuck?: number;
    followUpNow: number;
    escalationDue: number;
    urgentEscalationDue: number;
  };
  onClearFilters: () => void;
  onOpenView: (view: string) => void;
}

export const CompaniesLifecycleRibbon: React.FC<CompaniesLifecycleRibbonProps> = ({
  savedView,
  quickStats,
  onClearFilters,
  onOpenView,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-x-reverse divide-y sm:divide-y-0 divide-border/60 rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={onClearFilters}
        className={cn(
          "p-3 text-right transition-colors cursor-pointer active:scale-[0.99]",
          savedView === "ALL" ? "bg-card shadow-xs" : "hover:bg-muted/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">كل الشركات</span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              savedView === "ALL" ? "bg-primary" : "bg-muted-foreground/30"
            )}
          />
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {quickStats.totalCompanies}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
          {quickStats.activeCompanies} نشطة
        </p>
      </button>

      <button
        type="button"
        onClick={() => onOpenView("TRIAL")}
        className={cn(
          "p-3 text-right transition-colors cursor-pointer active:scale-[0.99]",
          savedView === "TRIAL" ? "bg-card shadow-xs" : "hover:bg-muted/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">فترة تجريبية</span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              savedView === "TRIAL" ? "bg-purple-500" : "bg-muted-foreground/30"
            )}
          />
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {quickStats.trialCompanies ?? 0}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-mono text-purple-600 dark:text-purple-400">
          تجربة مجانية
        </p>
      </button>

      <button
        type="button"
        onClick={() => onOpenView("ACTIVE_STORES")}
        className={cn(
          "p-3 text-right transition-colors cursor-pointer active:scale-[0.99]",
          savedView === "ACTIVE_STORES" ? "bg-card shadow-xs" : "hover:bg-muted/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">متاجر نشطة</span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              savedView === "ACTIVE_STORES" ? "bg-emerald-500" : "bg-muted-foreground/30"
            )}
          />
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {quickStats.activeStores ?? 0}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
          لديها مبيعات
        </p>
      </button>

      <button
        type="button"
        onClick={() => onOpenView("ONBOARDING_STUCK")}
        className={cn(
          "p-3 text-right transition-colors cursor-pointer active:scale-[0.99]",
          savedView === "ONBOARDING_STUCK" ? "bg-card shadow-xs" : "hover:bg-muted/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">تحتاج إعداد</span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              savedView === "ONBOARDING_STUCK" ? "bg-sky-500" : "bg-muted-foreground/30"
            )}
          />
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {quickStats.onboardingStuck ?? 0}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-mono text-sky-600 dark:text-sky-400">
          بدون منتجات
        </p>
      </button>

      <button
        type="button"
        onClick={() => onOpenView("FOLLOW_UP_NOW")}
        className={cn(
          "p-3 text-right transition-colors cursor-pointer active:scale-[0.99]",
          savedView === "FOLLOW_UP_NOW" ? "bg-card shadow-xs" : "hover:bg-muted/40"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">متابعة وتصعيد</span>
          <span
            className={cn(
              "size-1.5 rounded-full",
              savedView === "FOLLOW_UP_NOW" ? "bg-amber-500" : "bg-muted-foreground/30"
            )}
          />
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground">
            {quickStats.followUpNow + quickStats.escalationDue + quickStats.urgentEscalationDue}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-mono text-amber-600 dark:text-amber-400">
          تدخل فوري
        </p>
      </button>
    </div>
  );
};
