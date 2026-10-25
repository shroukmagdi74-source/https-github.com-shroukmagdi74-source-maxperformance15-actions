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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { DashboardEmployee } from "./types";

interface RecentHiresCardProps {
  recentHires?: DashboardEmployee[];
}

export const RecentHiresCard: React.FC<RecentHiresCardProps> = ({
  recentHires = [],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          {t("hrDashboard.recentHires")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors gap-2"
          onClick={() => navigate("/hr/employees")}
        >
          {t("hrDashboard.viewAll")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recentHires.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/50 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-700 shadow-sm">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold uppercase">
                    {employee.firstName?.[0]}
                    {employee.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">
                    {employee.position?.title}
                  </p>
                </div>
              </div>
              <div className="text-left bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 font-mono tabular-nums">
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString("ar-EG")
                    : "-"}
                </p>
              </div>
            </div>
          ))}
          {recentHires.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-6">
              {t("hrDashboard.noRecentHires") || "لا يوجد تعيينات حديثة"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
