import React from "react";
import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import type { PeriodMode } from "./types";

interface TeamPerformance360HeaderProps {
  selectedPeriodMode: PeriodMode;
  onPeriodModeChange: (mode: PeriodMode) => void;
  activePeriodLabel: string;
  loading: boolean;
  onRefresh: () => void;
}

export const TeamPerformance360Header: React.FC<
  TeamPerformance360HeaderProps
> = ({
  selectedPeriodMode,
  onPeriodModeChange,
  activePeriodLabel,
  loading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            لوحة تقييم الفريق التلقائية 360°
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            محرك احتساب عادل وموضوعي مبني على مخرجات المهام، الجودة التناسبية،
            انضباط الحضور، والتركيز
          </p>
        </div>
      </div>

      {/* Period Selector & Refresh Controls */}
      <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
        <div className="flex items-center bg-card rounded-lg border border-border/50 p-1">
          <button
            type="button"
            onClick={() => onPeriodModeChange("SLIDING_30")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              selectedPeriodMode === "SLIDING_30"
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            آخر 30 يوماً
          </button>
          <button
            type="button"
            onClick={() => onPeriodModeChange("CURRENT_MONTH")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              selectedPeriodMode === "CURRENT_MONTH"
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            الشهر الحالي
          </button>
          <button
            type="button"
            onClick={() => onPeriodModeChange("PREVIOUS_MONTH")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              selectedPeriodMode === "PREVIOUS_MONTH"
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            الشهر السابق
          </button>
        </div>

        <Badge
          variant="outline"
          className="px-3 py-1 font-mono text-xs tabular-nums bg-card border-border/60"
        >
          {activePeriodLabel || "الفترة النشطة"}
        </Badge>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="gap-1.5 text-xs h-9 bg-card border-border/60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>تحديث</span>
        </Button>
      </div>
    </div>
  );
};
