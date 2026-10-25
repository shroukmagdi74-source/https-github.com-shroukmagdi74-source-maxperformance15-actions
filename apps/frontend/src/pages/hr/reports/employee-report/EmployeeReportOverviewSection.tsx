import React from "react";
import {
  User,
  Calendar,
  Clock,
  DollarSign,
  Award,
  Target,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Progress } from "../../../../components/ui/progress";
import { EmployeeReportData } from "./types";
import {
  formatCurrency,
  getAttendanceRate,
  getPerformanceColor,
} from "./helpers";

interface EmployeeReportOverviewSectionProps {
  report: EmployeeReportData;
}

export const EmployeeReportOverviewSection: React.FC<
  EmployeeReportOverviewSectionProps
> = ({ report }) => {
  const attendanceRate = getAttendanceRate(report);

  return (
    <>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <User className="h-10 w-10" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {report.employee?.name}
              </CardTitle>
              <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                <span className="font-mono tabular-nums">
                  {report.employee?.employeeNumber}
                </span>
                <span className="opacity-50">•</span>
                <span>{report.employee?.department}</span>
                <span className="opacity-50">•</span>
                <span>{report.employee?.position}</span>
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">
                  نسبة الحضور
                </p>
                <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">
                  {attendanceRate}%
                </h3>
              </div>
              <Clock className="h-10 w-10 opacity-30" />
            </div>
            <Progress
              value={parseFloat(attendanceRate)}
              className="mt-3 h-2 bg-white/20"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  طلبات الإجازات
                </p>
                <h3 className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                  {report.leaves?.totalRequests || 0}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-mono tabular-nums">
                    {report.leaves?.approved || 0}
                  </span>{" "}
                  موافق عليها
                </p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500/20 dark:text-blue-400/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  صافي الراتب
                </p>
                <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400 font-mono tabular-nums">
                  {formatCurrency(report.payroll?.netSalary || 0)}
                </h3>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500/20 dark:text-purple-400/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  تقييم الأداء
                </p>
                <h3
                  className={`text-3xl font-bold mt-1 font-mono tabular-nums ${getPerformanceColor(report.performance?.lastReview?.score || 0)}`}
                >
                  {report.performance?.lastReview?.score || "N/A"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-mono tabular-nums">
                    {report.performance?.activeGoals || 0}
                  </span>{" "}
                  أهداف نشطة
                </p>
              </div>
              <Award className="h-10 w-10 text-amber-500/20 dark:text-amber-400/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              تفاصيل الحضور
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  أيام الحضور
                </span>
                <Badge className="bg-emerald-600 text-white font-mono tabular-nums">
                  {report.attendance?.presentDays || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  أيام الغياب
                </span>
                <Badge className="bg-red-600 text-white font-mono tabular-nums">
                  {report.attendance?.absentDays || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  أيام التأخير
                </span>
                <Badge className="bg-orange-600 text-white font-mono tabular-nums">
                  {report.attendance?.lateDays || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  إجمالي ساعات العمل
                </span>
                <Badge className="bg-blue-600 text-white font-mono tabular-nums">
                  {report.attendance?.totalWorkHours?.toFixed(1) || 0}h
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  ساعات إضافية
                </span>
                <Badge className="bg-purple-600 text-white font-mono tabular-nums">
                  {report.attendance?.overtimeHours?.toFixed(1) || 0}h
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              تفاصيل الراتب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  الراتب الأساسي
                </span>
                <span className="font-bold text-gray-900 dark:text-white font-mono tabular-nums">
                  {formatCurrency(report.payroll?.baseSalary || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  البدلات
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  +{formatCurrency(report.payroll?.allowances || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  مكافأة الوقت الإضافي
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                  +{formatCurrency(report.payroll?.overtimePay || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-sm font-medium dark:text-gray-300">
                  الخصومات
                </span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono tabular-nums">
                  -{formatCurrency(report.payroll?.deductions || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <span className="text-sm font-bold dark:text-gray-200">
                  صافي الراتب
                </span>
                <span className="font-bold text-xl text-purple-600 dark:text-purple-400 font-mono tabular-nums">
                  {formatCurrency(report.payroll?.netSalary || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {(report.performance?.lastReview ||
        (report.performance?.activeGoals || 0) > 0) && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              الأداء والأهداف
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.performance?.lastReview && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium dark:text-gray-300">
                      آخر تقييم
                    </span>
                  </div>
                  <p
                    className={`text-3xl font-bold font-mono tabular-nums ${getPerformanceColor(report.performance.lastReview.score)}`}
                  >
                    {report.performance.lastReview.score}/5
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono tabular-nums">
                    {new Date(
                      report.performance.lastReview.date
                    ).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              )}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium dark:text-gray-300">
                    أهداف نشطة
                  </span>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                  {report.performance?.activeGoals || 0}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium dark:text-gray-300">
                    أهداف مكتملة
                  </span>
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {report.performance?.completedGoals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
