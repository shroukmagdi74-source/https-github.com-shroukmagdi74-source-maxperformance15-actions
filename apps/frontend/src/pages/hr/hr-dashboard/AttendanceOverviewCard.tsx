import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Clock, UserCheck, UserX, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Progress } from "../../../components/ui/progress";
import { AttendanceRecord, DashboardData } from "./types";

interface AttendanceOverviewCardProps {
  data: DashboardData | null;
  attendanceRate: number;
}

export const AttendanceOverviewCard: React.FC<AttendanceOverviewCardProps> = ({
  data,
  attendanceRate,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          {t("hrDashboard.todaysAttendanceTitle")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-primary/5 transition-colors gap-2"
          onClick={() => navigate("/hr/attendance")}
        >
          {t("hrDashboard.viewAll")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="relative group bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 p-6 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-1 leading-none font-mono tabular-nums">
              {data?.attendance.present || 0}
            </p>
            <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/50">
              {t("hrDashboard.present")}
            </p>
          </div>

          <div className="relative group bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 p-6 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-1 leading-none font-mono tabular-nums">
              {data?.attendance.late || 0}
            </p>
            <p className="text-sm font-medium text-amber-600/70 dark:text-amber-400/50">
              {t("hrDashboard.late")}
            </p>
          </div>

          <div className="relative group bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/20 p-6 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-500/20 transition-colors">
              <UserX className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-rose-700 dark:text-rose-400 mb-1 leading-none font-mono tabular-nums">
              {data?.attendance.absent || 0}
            </p>
            <p className="text-sm font-medium text-rose-600/70 dark:text-rose-400/50">
              {t("hrDashboard.absent")}
            </p>
          </div>
        </div>

        <div className="space-y-4 bg-gray-50/50 dark:bg-gray-900/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/30">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-600 dark:text-gray-400">
              {t("hrDashboard.attendanceRate")}
            </span>
            <span className="text-primary bg-primary/10 px-2 py-1 rounded-md font-mono tabular-nums">
              {attendanceRate}%
            </span>
          </div>
          <Progress
            value={attendanceRate}
            className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        </div>

        {/* Recent Check-ins */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
              {t("hrDashboard.recentCheckins")}
            </h4>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.attendance.records
              ?.slice(0, 6)
              .map((record: AttendanceRecord, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage src={record.employee?.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {record.employee?.firstName?.[0]}
                          {record.employee?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
                          record.checkIn ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tighter">
                        {record.employee?.department?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-0.5 text-[10px] font-bold font-mono tabular-nums ${
                        record.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : record.status === "LATE"
                            ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                      }`}
                    >
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
