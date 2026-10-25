import React from "react";
import {
  CalendarOff,
  Download,
  RefreshCw,
  Timer,
  UserCheck,
  UserX,
} from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { ATTENDANCE_MONTHS } from "./helpers";

interface AttendanceSheetFiltersAndKPIsProps {
  selectedMonth: number;
  selectedYear: number;
  currentYear: number;
  hasReport: boolean;
  attendanceRate: string;
  totals: { present: number; late: number; absent: number; leave: number };
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const AttendanceSheetFiltersAndKPIs: React.FC<
  AttendanceSheetFiltersAndKPIsProps
> = ({
  selectedMonth,
  selectedYear,
  currentYear,
  hasReport,
  attendanceRate,
  totals,
  onMonthChange,
  onYearChange,
  onRefresh,
  onExport,
}) => {
  return (
    <>
      <Card className="border-none shadow-sm dark:bg-gray-800/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">الشهر</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => onMonthChange(parseInt(v ?? "1", 10))}
              >
                <SelectTrigger className="w-[150px] dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue className="dark:text-white" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {ATTENDANCE_MONTHS.map((month, index) => (
                    <SelectItem
                      key={index}
                      value={(index + 1).toString()}
                      className="dark:text-gray-300 dark:focus:bg-gray-700"
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">السنة</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) =>
                  onYearChange(parseInt(v ?? String(currentYear), 10))
                }
              >
                <SelectTrigger className="w-[120px] dark:bg-gray-800 dark:border-gray-700 font-mono tabular-nums">
                  <SelectValue className="dark:text-white" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <SelectItem
                      key={year}
                      value={year.toString()}
                      className="dark:text-gray-300 dark:focus:bg-gray-700 font-mono tabular-nums"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mr-auto">
              <Button
                variant="outline"
                onClick={onRefresh}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button
                variant="outline"
                onClick={onExport}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-lg">
            <CardContent className="p-5">
              <p className="text-emerald-100 text-sm font-medium">
                نسبة الحضور
              </p>
              <h3 className="text-2xl font-bold mt-1 font-mono tabular-nums">
                {attendanceRate}%
              </h3>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm border-none bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    حاضر
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {totals.present}
                  </h3>
                </div>
                <UserCheck className="h-8 w-8 text-emerald-500/20 dark:text-emerald-400/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm border-none bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    متأخر
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                    {totals.late}
                  </h3>
                </div>
                <Timer className="h-8 w-8 text-amber-500/20 dark:text-amber-400/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm border-none bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    غائب
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                    {totals.absent}
                  </h3>
                </div>
                <UserX className="h-8 w-8 text-rose-500/20 dark:text-rose-400/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm border-none bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    إجازات
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    {totals.leave}
                  </h3>
                </div>
                <CalendarOff className="h-8 w-8 text-blue-500/20 dark:text-blue-400/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
