import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface RecruitmentOverviewCardProps {
  recruitment?: {
    activeJobs: number;
    totalApplicants: number;
    scheduledInterviews: number;
    pendingReviews: number;
    hiredThisMonth: number;
  };
}

export const RecruitmentOverviewCard: React.FC<RecruitmentOverviewCardProps> = ({
  recruitment,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-r from-purple-500/5 to-indigo-500/5 dark:from-purple-900/10 dark:to-indigo-900/10 border border-white/20 dark:border-white/5 backdrop-blur-xl mb-8">
      <CardHeader className="flex flex-row items-center justify-between border-b border-purple-100/20 dark:border-purple-800/20 px-6 py-5">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-purple-900 dark:text-purple-100">
          <div className="p-2.5 bg-purple-500 shadow-lg shadow-purple-500/20 rounded-xl">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {t("hrDashboard.recruitmentOverview")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50 transition-all rounded-lg"
          onClick={() => navigate("/hr/recruitment")}
        >
          <span className="hidden sm:inline">
            {t("hrDashboard.manageRecruitment")}
          </span>
          <ChevronRight className="h-4 w-4 ms-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="group p-5 bg-white/50 dark:bg-gray-800/40 rounded-3xl border border-purple-100/50 dark:border-purple-900/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1 font-mono tabular-nums">
              {recruitment?.activeJobs || 0}
            </p>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-purple-600/70 uppercase tracking-widest transition-colors">
              {t("hrDashboard.activeJobs")}
            </p>
          </div>
          <div className="group p-5 bg-white/50 dark:bg-gray-800/40 rounded-3xl border border-blue-100/50 dark:border-blue-900/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1 font-mono tabular-nums">
              {recruitment?.totalApplicants || 0}
            </p>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600/70 uppercase tracking-widest transition-colors">
              {t("hrDashboard.totalApplicants")}
            </p>
          </div>
          <div className="group p-5 bg-white/50 dark:bg-gray-800/40 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1 font-mono tabular-nums">
              {recruitment?.scheduledInterviews || 0}
            </p>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-600/70 uppercase tracking-widest transition-colors">
              {t("hrDashboard.interviews")}
            </p>
          </div>
          <div className="group p-5 bg-white/50 dark:bg-gray-800/40 rounded-3xl border border-amber-100/50 dark:border-amber-900/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1 font-mono tabular-nums">
              {recruitment?.pendingReviews || 0}
            </p>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-amber-600/70 uppercase tracking-widest transition-colors">
              {t("hrDashboard.pendingReviews")}
            </p>
          </div>
          <div className="group p-5 bg-white/50 dark:bg-gray-800/40 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1 font-mono tabular-nums">
              {recruitment?.hiredThisMonth || 0}
            </p>
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-600/70 uppercase tracking-widest transition-colors">
              {t("hrDashboard.hiredThisMonth")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
