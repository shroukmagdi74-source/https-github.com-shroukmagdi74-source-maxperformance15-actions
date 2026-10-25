import React from "react";
import { UserCheck, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TodayStats } from "./types";

interface AttendanceStatsCardsProps {
  todayStats: TodayStats | null;
}

export const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({
  todayStats,
}) => {
  const stats = [
    {
      label: "إجمالي الموظفين",
      value: todayStats?.totalEmployees,
      icon: UserCheck,
      color: "text-gray-600 dark:text-gray-300",
      bg: "bg-gray-100 dark:bg-gray-800",
    },
    {
      label: "حاضر",
      value: todayStats?.present,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "متأخر",
      value: todayStats?.late,
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "غائب",
      value: todayStats?.absent,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
              <h3 className={`text-3xl font-bold font-mono tabular-nums ${stat.color}`}>
                {stat.value || 0}
              </h3>
            </div>
            <div className={`p-3 ${stat.bg} rounded-full`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
