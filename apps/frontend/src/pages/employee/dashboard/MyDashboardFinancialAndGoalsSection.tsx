import React from "react";
import {
  Award,
  DollarSign,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { TFunction } from "i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { AdvanceRequest, Reward } from "./types";

interface MyDashboardFinancialTabContentProps {
  t: TFunction;
  advances: AdvanceRequest[];
  rewards: Reward[];
  onNavigate: (path: string) => void;
}

export const MyDashboardFinancialTabContent: React.FC<
  MyDashboardFinancialTabContentProps
> = ({ t, advances, rewards, onNavigate }) => {
  return (
    <div className="grid gap-6">
      <Card className="border-none shadow-sm bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-900/5">
        <CardHeader>
          <CardTitle className="text-md font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t("sidebar.rewards.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/40 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/20"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {r.rewardName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(
                      new Date(r.appliedAt || r.createdAt),
                      "dd MMMM yyyy",
                      { locale: ar },
                    )}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-black font-mono tabular-nums text-purple-600">
                    +{r.calculatedValue}{" "}
                    <span className="text-xs">
                      {t("employee.dashboard.egp")}
                    </span>
                  </p>
                  <Badge className="bg-purple-100 text-purple-700 border-none rounded-full text-[10px]">
                    {r.rewardCategory ||
                      t("employee.dashboard.performanceBonus")}
                  </Badge>
                </div>
              </div>
            ))}
            {rewards.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <Award className="h-10 w-10 mx-auto opacity-20 mb-2" />
                <p className="text-sm">
                  {t("employee.dashboard.earnFirstReward")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-md font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {t("employee.dashboard.activeAdvances")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advances
              .filter((a) => a.status === "APPROVED" && a.remainingBalance > 0)
              .map((a) => (
                <div
                  key={a.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded-2xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-tight">
                        {t("employee.dashboard.totalAdvance")}
                      </p>
                      <p className="text-xl font-black font-mono tabular-nums text-gray-900 dark:text-gray-100">
                        {a.amount.toLocaleString()}{" "}
                        {t("employee.dashboard.egp")}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-none">
                      {t("employee.dashboard.active")}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold font-mono tabular-nums mb-1">
                      <span className="text-gray-400">
                        {t("employee.dashboard.remainingAmount")}
                      </span>
                      <span className="text-primary">
                        {a.remainingBalance.toLocaleString()}{" "}
                        {t("employee.dashboard.egp")}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((a.amount - a.remainingBalance) / a.amount) * 100
                      }
                      className="h-2 bg-gray-200"
                    />
                    <p className="text-[10px] text-gray-400 text-left mt-2">
                      {t("employee.dashboard.installmentPlan", {
                        count: a.installmentsCount,
                      })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-bold text-gray-900 dark:text-gray-100">
            {t("employee.dashboard.recentAdvances")}
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            onClick={() => onNavigate("/my-advances")}
          >
            {t("employee.dashboard.viewAll")}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advances.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold font-mono tabular-nums text-gray-900 dark:text-gray-100">
                      {a.amount.toLocaleString()}{" "}
                      {t("employee.dashboard.egp")}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-gray-400">
                      {format(new Date(a.createdAt), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    a.status === "APPROVED"
                      ? "bg-green-500"
                      : a.status === "PENDING"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }
                >
                  {a.status === "APPROVED"
                    ? t("employee.dashboard.approved")
                    : a.status === "PENDING"
                      ? t("employee.dashboard.pending")
                      : t("employee.dashboard.rejected")}
                </Badge>
              </div>
            ))}
            {advances.length === 0 && (
              <p className="text-center text-gray-400 py-4 text-sm">
                {t("employee.dashboard.noAdvances")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const MyDashboardGoalsAndFooterSection: React.FC<{ t: TFunction }> = ({
  t,
}) => {
  return (
    <>
      <Card className="border-none shadow-md bg-white dark:bg-gray-900 border-t-4 border-primary lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("employee.dashboard.goalsAndDevelopment")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                  <Target className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-gray-900 dark:text-gray-100">
                  {t("employee.dashboard.improvePerformance")}
                </h5>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                {t("employee.dashboard.improvePerformanceDesc")}
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold font-mono tabular-nums text-blue-600 mb-1">
                <span>{t("employee.dashboard.completionRate")}</span>
                <span>75%</span>
              </div>
              <Progress
                value={75}
                className="h-1.5 bg-blue-100 dark:bg-blue-900/30"
              />
            </div>

            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                  <Award className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-gray-900 dark:text-gray-100">
                  {t("employee.dashboard.professionalTraining")}
                </h5>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                {t("employee.dashboard.professionalTrainingDesc")}
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold font-mono tabular-nums text-purple-600 mb-1">
                <span>{t("employee.dashboard.completionRate")}</span>
                <span>40%</span>
              </div>
              <Progress
                value={40}
                className="h-1.5 bg-purple-100 dark:bg-purple-900/30"
              />
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
              <Plus className="h-8 w-8 text-gray-300 mb-2 cursor-pointer hover:text-primary transition-colors" />
              <p className="text-xs text-gray-400 font-medium">
                {t("employee.dashboard.addPersonalGoal")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-gray-100 dark:border-gray-900 lg:col-span-3">
        <p className="text-sm text-gray-400">
          {t("employee.dashboard.footer")}
        </p>
        <div className="flex items-center gap-6">
          <Button
            variant="link"
            className="text-sm text-gray-400 hover:text-primary p-0 h-auto"
          >
            {t("employee.dashboard.helpCenter")}
          </Button>
          <Button
            variant="link"
            className="text-sm text-gray-400 hover:text-primary p-0 h-auto"
          >
            {t("employee.dashboard.companyPolicy")}
          </Button>
          <Button
            variant="link"
            className="text-sm text-gray-400 hover:text-primary p-0 h-auto"
          >
            {t("employee.dashboard.reportIssue")}
          </Button>
        </div>
      </div>
    </>
  );
};
