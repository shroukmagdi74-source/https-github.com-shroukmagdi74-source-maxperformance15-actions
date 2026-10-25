import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export const HRQuickActionsCard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      label: t("hrDashboard.employees"),
      icon: Users,
      path: "/hr/employees",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("hrDashboard.rewards") || "المكافآت",
      icon: DollarSign,
      path: "/hr/rewards",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: t("hrDashboard.departments"),
      icon: Building2,
      path: "/hr/departments",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: t("hrDashboard.attendanceLabel"),
      icon: Clock,
      path: "/hr/attendance",
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: t("hrDashboard.leaves"),
      icon: Calendar,
      path: "/hr/leaves",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      label: t("hrDashboard.payroll"),
      icon: DollarSign,
      path: "/hr/payroll",
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: t("hrDashboard.reports"),
      icon: BarChart3,
      path: "/hr/reports",
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
  ];

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm mt-8">
      <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full" />
          {t("hrDashboard.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className={`h-auto aspect-square flex-col gap-3 border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-4 ${action.bg}`}
              onClick={() => navigate(action.path)}
            >
              <div
                className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ${action.color}`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-tight text-center">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
