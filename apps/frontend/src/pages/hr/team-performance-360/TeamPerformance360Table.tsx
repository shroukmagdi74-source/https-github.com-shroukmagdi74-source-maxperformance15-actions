import React from "react";
import { Users, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { getTierColorClass, getScoreColor } from "./helpers";
import type { LeaderboardEmployee } from "./types";

interface TeamPerformance360TableProps {
  employees: LeaderboardEmployee[];
  totalCount: number;
  onSelectForDrilldown: (emp: LeaderboardEmployee) => void;
  onSelectForPIP: (emp: LeaderboardEmployee) => void;
}

export const TeamPerformance360Table: React.FC<
  TeamPerformance360TableProps
> = ({
  employees,
  totalCount,
  onSelectForDrilldown,
  onSelectForPIP,
}) => {
  return (
    <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            تصنيف موظفي الفريق حسب مؤشر الأداء التراكمي
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          عرض {employees.length} من {totalCount} موظف
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20 text-[11px] font-semibold text-muted-foreground">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">الموظف</th>
              <th className="py-3 px-4">القسم والمسمى</th>
              <th className="py-3 px-4 text-center">الدرجة التراكمية</th>
              <th className="py-3 px-4 text-center">المستوى التشغيلي</th>
              <th className="py-3 px-4 text-center">المحاور الخمسة</th>
              <th className="py-3 px-4 text-center">الوقائع الموثقة</th>
              <th className="py-3 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-xs">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground text-xs"
                >
                  لا يوجد موظفون مطابقون لمعايير البحث الحالية.
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectForDrilldown(emp)}
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-center font-bold text-muted-foreground font-mono tabular-nums">
                    {emp.isEvaluated ? index + 1 : "—"}
                  </td>

                  {/* Employee Profile */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {emp.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <span>{emp.name}</span>
                          {emp.isAtRisk && (
                            <span
                              title="مخاطرة أداء"
                              className="text-rose-500 shrink-0"
                            >
                              <AlertTriangle className="h-3 w-3 inline" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {emp.employeeNumber}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Position */}
                  <td className="py-3 px-4">
                    <div className="text-foreground font-medium">
                      {emp.positionTitle}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {emp.departmentName}
                    </div>
                  </td>

                  {/* Composite Score */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-lg font-black font-mono tabular-nums ${getScoreColor(
                        emp.compositeScore,
                        emp.isEvaluated,
                      )}`}
                    >
                      {emp.isEvaluated ? emp.compositeScore : "—"}
                    </span>
                  </td>

                  {/* Tier Badge */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getTierColorClass(
                        emp.tier,
                      )}`}
                    >
                      {emp.tierLabel}
                    </span>
                  </td>

                  {/* 5 Pillars Summary */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-mono tabular-nums">
                      <span
                        title="إنجاز المهام"
                        className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground"
                      >
                        {emp.pillars.delivery.isApplicable !== false
                          ? emp.pillars.delivery.score
                          : "—"}
                      </span>
                      <span className="text-muted-foreground/40">|</span>
                      <span
                        title="الجودة والاعتماد"
                        className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground"
                      >
                        {emp.pillars.quality.isApplicable !== false
                          ? emp.pillars.quality.score
                          : "—"}
                      </span>
                      <span className="text-muted-foreground/40">|</span>
                      <span
                        title="الانضباط والحضور"
                        className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground"
                      >
                        {emp.pillars.punctuality.isApplicable !== false
                          ? emp.pillars.punctuality.score
                          : "—"}
                      </span>
                      <span className="text-muted-foreground/40">|</span>
                      <span
                        title="النشاط الرقمي"
                        className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground"
                      >
                        {emp.pillars.focus.isApplicable !== false
                          ? emp.pillars.focus.score
                          : "—"}
                      </span>
                      <span className="text-muted-foreground/40">|</span>
                      <span
                        title="الأهداف OKRs"
                        className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground"
                      >
                        {emp.pillars.goals.isApplicable !== false
                          ? emp.pillars.goals.score
                          : "—"}
                      </span>
                    </div>
                  </td>

                  {/* Telemetry Stats */}
                  <td className="py-3 px-4 text-center">
                    <div className="text-[11px] text-muted-foreground font-mono tabular-nums space-y-0.5">
                      <div>
                        إنجاز:{" "}
                        <strong className="text-foreground">
                          {emp.telemetryStats.tasksCompleted}/
                          {emp.telemetryStats.totalTasks}
                        </strong>
                      </div>
                      <div>
                        إرجاعات:{" "}
                        <strong
                          className={
                            emp.telemetryStats.returns > 0
                              ? "text-amber-500"
                              : "text-foreground"
                          }
                        >
                          {emp.telemetryStats.returns}
                        </strong>{" "}
                        | تأخيرات:{" "}
                        <strong
                          className={
                            emp.telemetryStats.lateDays > 0
                              ? "text-rose-500"
                              : "text-foreground"
                          }
                        >
                          {emp.telemetryStats.lateDays}
                        </strong>
                      </div>
                    </div>
                  </td>

                  {/* Action Button */}
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {emp.isAtRisk ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onSelectForPIP(emp)}
                        className="h-7 text-[11px] gap-1 px-2.5 font-medium"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        <span>خطة تحسين (PIP)</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectForDrilldown(emp)}
                        className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        عرض التدقيق
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
