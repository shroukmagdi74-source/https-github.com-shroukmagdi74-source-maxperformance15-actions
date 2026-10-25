import React from "react";
import { Clock, Calendar, User, ShieldHalf } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Employee } from "./types";

interface EmployeeOverviewTabProps {
  employee: Employee;
  onNavigateToSubordinate: (subordinateId: string) => void;
}

export const EmployeeOverviewTab: React.FC<EmployeeOverviewTabProps> = ({
  employee,
  onNavigateToSubordinate,
}) => {
  const attendanceDaysThisMonth =
    employee.attendance?.filter(
      (a: any) => a.status === "PRESENT" || a.status === "LATE",
    ).length || 0;

  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              رصيد الإجازات السنوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 font-mono tabular-nums">
              {employee.annualLeaveBalance || 0} يوم
            </div>
            <Progress
              value={((employee.annualLeaveBalance || 0) / 21) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              رصيد الإجازات المرضية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 font-mono tabular-nums">
              {employee.sickLeaveBalance || 0} يوم
            </div>
            <Progress
              value={((employee.sickLeaveBalance || 0) / 15) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              أيام الحضور (هذا الشهر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 font-mono tabular-nums">
              {attendanceDaysThisMonth}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              المرؤوسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 font-mono tabular-nums">
              {employee.subordinates?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              آخر سجلات الحضور
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!employee.attendance || employee.attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد سجلات</p>
            ) : (
              <div className="space-y-3">
                {employee.attendance.slice(0, 5).map((att: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg"
                  >
                    <span className="text-sm font-mono tabular-nums">
                      {new Date(att.date).toLocaleDateString("ar-EG")}
                    </span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      {att.checkIn && (
                        <span className="text-sm text-green-600">
                          {new Date(att.checkIn).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {att.checkOut && (
                        <>
                          <span className="text-gray-400">-</span>
                          <span className="text-sm text-blue-600">
                            {new Date(att.checkOut).toLocaleTimeString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-amber-600" />
              آخر طلبات الإجازات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!employee.leaveRequests || employee.leaveRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد طلبات</p>
            ) : (
              <div className="space-y-3">
                {employee.leaveRequests.slice(0, 5).map((leave: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium">{leave.type}</span>
                      <span className="text-sm text-gray-500 mr-2 font-mono tabular-nums">
                        ({leave.totalDays} يوم)
                      </span>
                    </div>
                    <Badge
                      variant={
                        leave.status === "APPROVED" ? "default" : "secondary"
                      }
                    >
                      {leave.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subordinates */}
      {employee.subordinates && employee.subordinates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              المرؤوسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {employee.subordinates.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => onNavigateToSubordinate(sub.id)}
                >
                  <Avatar>
                    <AvatarImage src={sub.avatar} />
                    <AvatarFallback>
                      {sub.firstName?.[0]}
                      {sub.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {sub.firstName} {sub.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sub.position?.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deduction Settings Card */}
      <Card className="border-orange-100 bg-orange-50/20 dark:bg-orange-950/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <ShieldHalf className="h-5 w-5" />
            سياسة الخصم والتأخير للموظف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">
                حالة الخصم التلقائي
              </p>
              {employee.enableAutoDeduction !== false ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  مفعل
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  مستثنى (Whitelisted)
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">
                رصيد المرونة الشهري
              </p>
              <p className="font-bold text-lg font-mono tabular-nums">
                {employee.monthlyGraceMinutes ?? 60} دقيقة
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">
                حد التأخير اليومي
              </p>
              <p className="font-bold text-lg font-mono tabular-nums">
                {employee.maxDailyLateMinutes ?? 10} دقائق
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">
                معدل الخصم للدقيقة
              </p>
              <p className="font-bold text-lg font-mono tabular-nums">
                {employee.lateDeductionRate
                  ? `${employee.lateDeductionRate} جنيه`
                  : "حساب تلقائي"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
