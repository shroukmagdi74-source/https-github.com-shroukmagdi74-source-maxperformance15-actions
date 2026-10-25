import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { WarningSeveritySummary } from "./types";

interface WarningsOverviewCardProps {
  warnings?: {
    total: number;
    bySeverity: WarningSeveritySummary[];
    acknowledged: number;
  };
}

export const WarningsOverviewCard: React.FC<WarningsOverviewCardProps> = ({
  warnings,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const total = warnings?.total || 0;
  const acknowledged = warnings?.acknowledged || 0;
  const acknowledgmentRate = total > 0 ? Math.round((acknowledged / total) * 100) : 0;

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-white to-rose-50/30 dark:from-gray-800 dark:to-rose-900/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-rose-100/20 dark:border-rose-800/20 px-6 py-5">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-rose-900 dark:text-rose-100">
          <div className="p-2.5 bg-rose-500 shadow-lg shadow-rose-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          {t("hrDashboard.warnings")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-100/50 transition-all rounded-lg"
          onClick={() => navigate("/hr/warnings")}
        >
          <span className="hidden sm:inline">{t("hrDashboard.viewAll")}</span>
          <ChevronRight className="h-4 w-4 ms-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-white/50 dark:bg-gray-900/40 rounded-3xl border border-rose-100/50 dark:border-rose-900/20 shadow-inner">
            <div>
              <p className="text-4xl font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                {total}
              </p>
              <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-tighter">
                {t("hrDashboard.totalWarnings")}
              </p>
            </div>
            <div className="h-14 w-14 bg-rose-500/10 rounded-2xl flex items-center justify-center transform -rotate-6">
              <AlertCircle className="h-7 w-7 text-rose-500" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {t("hrDashboard.bySeverity")}
            </p>
            <div className="space-y-2">
              {warnings?.bySeverity?.map((sev, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {t(`common.severity.${sev.severity.toLowerCase()}`) ||
                      sev.severity}
                  </span>
                  <Badge variant="outline" className="font-bold font-mono tabular-nums">
                    {sev._count}
                  </Badge>
                </div>
              ))}
              {(!warnings?.bySeverity || warnings.bySeverity.length === 0) && (
                <p className="text-sm text-gray-500 italic">
                  {t("hrDashboard.noWarningsRecord") || "لا توجد سجلات"}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-sm font-bold mb-2">
              <span className="text-gray-500">
                {t("hrDashboard.acknowledgmentRate") || "نسبة الاعتراف"}
              </span>
              <span className="text-rose-600 font-mono tabular-nums">
                {acknowledgmentRate}%
              </span>
            </div>
            <Progress value={acknowledgmentRate} className="h-2 bg-gray-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
