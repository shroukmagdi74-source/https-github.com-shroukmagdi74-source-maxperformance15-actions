import React from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { TFunction } from "i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { AttendanceStats, TodayAttendance } from "./types";
import {
  formatDateWithTZ,
  formatTimeWithTZ,
  parseLocationJson,
  statusConfig,
} from "./helpers";

interface MyAttendanceStatsAndLogTableProps {
  t: TFunction;
  timezone: string;
  stats: AttendanceStats | null;
  recentAttendance: TodayAttendance[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  recentPage: number;
  onPageChange: (page: number) => void;
  hasMoreRecent: boolean;
  onOpenLocationInMap: (
    latitude: number,
    longitude: number,
    type: string,
  ) => void;
}

export const MyAttendanceStatsAndLogTable: React.FC<
  MyAttendanceStatsAndLogTableProps
> = ({
  t,
  timezone,
  stats,
  recentAttendance,
  selectedMonth,
  onMonthChange,
  recentPage,
  onPageChange,
  hasMoreRecent,
  onOpenLocationInMap,
}) => {
  const renderLocationInfo = (
    checkInLocation: string | null,
    checkOutLocation: string | null,
  ) => {
    const checkInLoc = parseLocationJson(checkInLocation);
    const checkOutLoc = parseLocationJson(checkOutLocation);

    if (!checkInLoc && !checkOutLoc) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="space-y-1 text-xs font-mono tabular-nums">
        {checkInLoc && (
          <div
            className="flex items-center gap-1 text-green-600 hover:text-green-800 cursor-pointer hover:bg-green-50 p-1 rounded transition-colors"
            onClick={() =>
              onOpenLocationInMap(
                checkInLoc.latitude,
                checkInLoc.longitude,
                t("employee.attendance.colCheckIn"),
              )
            }
            title={t("employee.attendance.openInMap")}
          >
            <MapPin className="h-3 w-3" />
            <span className="underline">
              {t("employee.attendance.colCheckIn")}:{" "}
              {checkInLoc.latitude?.toFixed(4)},{" "}
              {checkInLoc.longitude?.toFixed(4)}
            </span>
          </div>
        )}
        {checkOutLoc && (
          <div
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
            onClick={() =>
              onOpenLocationInMap(
                checkOutLoc.latitude,
                checkOutLoc.longitude,
                t("employee.attendance.colCheckOut"),
              )
            }
            title={t("employee.attendance.openInMap")}
          >
            <MapPin className="h-3 w-3" />
            <span className="underline">
              {t("employee.attendance.colCheckOut")}:{" "}
              {checkOutLoc.latitude?.toFixed(4)},{" "}
              {checkOutLoc.longitude?.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("employee.attendance.attendanceRate")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {Number(stats.attendanceRate || 0).toFixed(1)}%
              </div>
              <Progress
                value={Math.min(
                  100,
                  Math.max(0, Number(stats.attendanceRate || 0)),
                )}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("employee.attendance.daysPresent")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {stats.presentDays}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono tabular-nums">
                {t("employee.attendance.ofTotalDays", {
                  total: stats.totalDays,
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("employee.attendance.lateDays")}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {stats.lateDays}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono tabular-nums">
                {stats.totalDays
                  ? ((stats.lateDays / stats.totalDays) * 100).toFixed(1)
                  : "0.0"}
                {t("employee.attendance.percentageOfDays")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("employee.attendance.workHours")}
              </CardTitle>
              <Timer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {Number(stats.totalWorkHours || 0).toFixed(1)}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono tabular-nums">
                {t("employee.attendance.overtime", {
                  hours: Number(stats.totalOvertimeHours || 0).toFixed(1),
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>{t("employee.attendance.attendanceLog")}</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-[160px] font-mono tabular-nums"
            />
          </div>
        </CardHeader>
        <CardContent>
          {recentAttendance.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("employee.attendance.noAttendanceYet")}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">
                      {t("employee.attendance.colDate")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colCheckIn")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colCheckOut")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colLocation")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colWorkMode")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colWorkHours")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colDelay")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colEarlyLeave")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("employee.attendance.colStatus")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAttendance.map((record) => {
                    const StatusIcon =
                      statusConfig[record.status]?.icon || Clock;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          {formatDateWithTZ(record.date, timezone)}
                        </TableCell>
                        <TableCell>
                          {record.checkIn ? (
                            <span className="text-green-600 font-medium font-mono tabular-nums">
                              {formatTimeWithTZ(record.checkIn, timezone)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? (
                            <span className="text-blue-600 font-medium font-mono tabular-nums">
                              {formatTimeWithTZ(record.checkOut, timezone)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {renderLocationInfo(
                            record.checkInLocation,
                            record.checkOutLocation,
                          )}
                        </TableCell>
                        <TableCell>
                          {record.workMode === "HOME" ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold w-fit">
                              <Home className="h-3 w-3" />
                              <span>{t("employee.attendance.home")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold w-fit">
                              <Building2 className="h-3 w-3" />
                              <span>{t("employee.attendance.office")}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {record.workHours ? (
                            <span>
                              {Number(record.workHours).toFixed(1)}{" "}
                              {t("employee.attendance.hour")}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {Number(record.lateMinutes) > 0 ? (
                            <span className="text-red-600">
                              {record.lateMinutes}{" "}
                              {t("employee.attendance.minute")}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {Number(record.earlyLeaveMinutes) > 0 ? (
                            <span className="text-amber-700">
                              {record.earlyLeaveMinutes}{" "}
                              {t("employee.attendance.minute")}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={statusConfig[record.status]?.color || ""}
                          >
                            <StatusIcon className="h-3 w-3 ml-1" />
                            {t(
                              statusConfig[record.status]?.labelKey ||
                                record.status,
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {recentAttendance.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500 font-mono tabular-nums">
                {t("employee.attendance.showingRecords", {
                  count: recentAttendance.length,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recentPage <= 1}
                  onClick={() => onPageChange(Math.max(1, recentPage - 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-mono tabular-nums">
                  {t("employee.attendance.page", { num: recentPage })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMoreRecent}
                  onClick={() => onPageChange(recentPage + 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
