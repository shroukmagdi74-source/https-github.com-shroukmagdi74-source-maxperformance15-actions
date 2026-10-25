import React from "react";
import { Clock, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { EmployeeReportData } from "./types";
import { getStatusColor, getStatusLabel } from "./helpers";

interface EmployeeReportWarningsAndAttendanceTableProps {
  report: EmployeeReportData;
}

export const EmployeeReportWarningsAndAttendanceTable: React.FC<
  EmployeeReportWarningsAndAttendanceTableProps
> = ({ report }) => {
  return (
    <>
      {report.warnings?.total > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm overflow-hidden">
          <CardHeader className="border-b dark:border-gray-700 bg-red-50/50 dark:bg-red-950/20">
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              الإنذارات والتحذيرات التأديبية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-gray-700">
              {report.warnings?.recent?.map((warning) => (
                <div
                  key={warning.id}
                  className="p-4 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-red-600 dark:text-red-400">
                        {warning.type}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        {warning.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded whitespace-nowrap font-mono tabular-nums">
                      {new Date(warning.date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.attendance?.records && report.attendance.records.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-none shadow-sm">
          <CardHeader className="border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              سجل الحضور الأخير
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      التاريخ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      الدخول
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      الخروج
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      ساعات العمل
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      التأخير
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                  {report.attendance.records.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-sm dark:text-gray-300 font-mono tabular-nums">
                        {new Date(record.date).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusLabel(record.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300 font-mono tabular-nums">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString(
                              "ar-EG",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300 font-mono tabular-nums">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString(
                              "ar-EG",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300 font-mono tabular-nums">
                        {record.workHours?.toFixed(1) || 0}h
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300 font-mono tabular-nums">
                        {record.lateMinutes > 0
                          ? `${record.lateMinutes} دقيقة`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
