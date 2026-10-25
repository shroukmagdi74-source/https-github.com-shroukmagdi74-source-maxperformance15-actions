import React from "react";
import { Activity, Award, ShieldAlert, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import type { LeaderboardSummary } from "./types";

interface TeamPerformance360KPIsProps {
  summary?: LeaderboardSummary;
}

export const TeamPerformance360KPIs: React.FC<TeamPerformance360KPIsProps> = ({
  summary,
}) => {
  const averageScore = summary?.averageScore ?? 0;
  const evaluatedEmployees =
    summary?.evaluatedEmployees ?? summary?.totalEmployees ?? 0;
  const totalEmployees = summary?.totalEmployees ?? 0;
  const eliteCount =
    (summary?.tierCounts.TIER_S ?? 0) + (summary?.tierCounts.TIER_A ?? 0);
  const atRiskCount = summary?.atRiskCount ?? 0;
  const bestDepartment = summary?.bestDepartment || "عام";
  const needsSupportDepartment = summary?.needsSupportDepartment || "-";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Company Average */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">متوسط أداء الشركة</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground font-mono tabular-nums">
              {averageScore}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 font-mono">
            <span>المقيمون:</span>
            <strong className="text-foreground tabular-nums">
              {evaluatedEmployees}
            </strong>
            <span>من {totalEmployees} موظف</span>
          </div>
        </CardContent>
      </Card>

      {/* Tier S + A Elite */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">فئة النخبة (Tier S & A)</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono tabular-nums">
              {eliteCount}
            </span>
            <span className="text-xs text-muted-foreground">موظف</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            <span>أداء متفوق وموثق بالكامل</span>
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Count */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">موظفون في دائرة الخطر</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-500 font-mono tabular-nums">
              {atRiskCount}
            </span>
            <span className="text-xs text-muted-foreground">يحتاج تدخل</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            <span>معدل إرجاع عالي أو تأخرات متكررة</span>
          </div>
        </CardContent>
      </Card>

      {/* Best Department */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">القسم الأعلى إنتاجية</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-base sm:text-lg font-bold text-foreground truncate">
            {bestDepartment}
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <span>الأقل إنجازاً:</span>
            <span className="text-foreground truncate">
              {needsSupportDepartment}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
