import React from "react";
import { Calendar, Clock, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { EmployeeReportData } from "./types";
import { formatCurrency, getStatusColor, getStatusLabel } from "./helpers";

interface EmployeeReportRequestsSectionProps {
  report: EmployeeReportData;
}

export const EmployeeReportRequestsSection: React.FC<
  EmployeeReportRequestsSectionProps
> = ({ report }) => {
  return (
    <>
      {report.leaves?.requests && report.leaves.requests.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              طلبات الإجازات (
              <span className="font-mono tabular-nums">
                {report.leaves.totalDaysTaken}
              </span>{" "}
              يوم)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-gray-700">
              {report.leaves.requests.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(leave.status)}>
                          {getStatusLabel(leave.status)}
                        </Badge>
                        <span className="text-sm font-medium dark:text-gray-300">
                          {leave.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono tabular-nums">
                        {new Date(leave.startDate).toLocaleDateString("ar-EG")}{" "}
                        - {new Date(leave.endDate).toLocaleDateString("ar-EG")}
                      </p>
                      {leave.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {leave.reason}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="dark:border-gray-600">
                      <span className="font-mono tabular-nums">
                        {leave.days}
                      </span>{" "}
                      يوم
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.advances?.requests && report.advances.requests.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              طلبات السلف (
              <span className="font-mono tabular-nums">
                {formatCurrency(report.advances.totalAmount)}
              </span>
              )
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-gray-700">
              {report.advances.requests.map((advance) => (
                <div
                  key={advance.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(advance.status)}>
                          {getStatusLabel(advance.status)}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                          {new Date(advance.requestDate).toLocaleDateString(
                            "ar-EG"
                          )}
                        </span>
                      </div>
                      {advance.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {advance.reason}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400 font-mono tabular-nums">
                      {formatCurrency(advance.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.permissions?.requests &&
        report.permissions.requests.length > 0 && (
          <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
            <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                طلبات الاستئذان (
                <span className="font-mono tabular-nums">
                  {report.permissions.totalHours}
                </span>{" "}
                ساعة)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {report.permissions.requests.map((perm) => (
                  <div
                    key={perm.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(perm.status)}>
                            {getStatusLabel(perm.status)}
                          </Badge>
                          <span className="text-sm font-medium dark:text-gray-300 font-mono tabular-nums">
                            {new Date(perm.date).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono tabular-nums">
                          {perm.startTime} - {perm.endTime} ({perm.totalHours}{" "}
                          ساعة)
                        </p>
                        {perm.reason && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {perm.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {report.payroll?.manualDeductions &&
        report.payroll.manualDeductions.length > 0 && (
          <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
            <CardHeader className="border-b dark:border-gray-700 bg-red-50/50 dark:bg-red-950/10">
              <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
                <DollarSign className="h-5 w-5" />
                الخصومات المالية الإضافية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {report.payroll.manualDeductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className="p-4 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(deduction.status)}>
                            {getStatusLabel(deduction.status)}
                          </Badge>
                          <span className="text-sm font-medium dark:text-gray-300 font-mono tabular-nums">
                            {new Date(deduction.date).toLocaleDateString(
                              "ar-EG"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deduction.reason}
                        </p>
                      </div>
                      <span className="font-bold text-lg text-red-600 dark:text-red-400 font-mono tabular-nums">
                        {formatCurrency(deduction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </>
  );
};
