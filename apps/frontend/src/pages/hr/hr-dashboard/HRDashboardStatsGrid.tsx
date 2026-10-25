import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Building2, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { DashboardData } from "./types";

interface HRDashboardStatsGridProps {
  data: DashboardData | null;
}

export const HRDashboardStatsGrid: React.FC<HRDashboardStatsGridProps> = ({
  data,
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("hrDashboard.totalEmployees"),
      value: data?.employees.totalEmployees || 0,
      icon: Users,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t("hrDashboard.todaysAttendance"),
      value: data?.attendance.present || 0,
      icon: UserCheck,
      color: "green",
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: t("hrDashboard.pendingLeaves"),
      value: data?.pendingLeaves?.length || 0,
      icon: AlertCircle,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/10",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: t("hrDashboard.totalDepartments"),
      value: data?.departments.totalDepartments || 0,
      icon: Building2,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/10",
      textColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient} opacity-20`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
