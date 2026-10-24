import React from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import { AttendanceRecord } from "./types";

interface PayrollOvertimeCardProps {
  attendance: AttendanceRecord[];
}

export const PayrollOvertimeCard: React.FC<PayrollOvertimeCardProps> = ({
  attendance,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          إعدادات العمل الإضافي
        </CardTitle>
        <CardDescription>
          تعديل معدلات العمل الإضافي والتأخير
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="overtimeRate">معدل العمل الإضافي</Label>
            <div className="mt-1">
              <div className="flex items-center gap-4">
                <Slider
                  id="overtimeRate"
                  defaultValue={[1.5]}
                  max={3}
                  min={1}
                  step={0.25}
                  className="flex-1"
                />
                <div className="w-12 text-center font-bold font-mono tabular-nums">
                  1.5x
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                مضاعف سعر الساعة العادية
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="lateDeductionRate">معدل خصم التأخير</Label>
            <div className="mt-1">
              <div className="flex items-center gap-4">
                <Slider
                  id="lateDeductionRate"
                  defaultValue={[2]}
                  max={5}
                  min={0.5}
                  step={0.5}
                  className="flex-1"
                />
                <div className="w-12 text-center font-bold font-mono tabular-nums">
                  2x
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                مضاعف سعر الدقيقة العادية
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-medium mb-2">ملخص الحضور</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="text-xs text-slate-500">أيام الحضور</div>
                <div className="font-bold text-lg font-mono tabular-nums">
                  {
                    attendance.filter(
                      (a) => a.status === "PRESENT" || a.status === "LATE",
                    ).length
                  }{" "}
                  يوم
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="text-xs text-slate-500">أيام الغياب</div>
                <div className="font-bold text-lg font-mono tabular-nums">
                  {attendance.filter((a) => a.status === "ABSENT").length}{" "}
                  يوم
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="text-xs text-slate-500">
                  إجمالي دقائق التأخير
                </div>
                <div className="font-bold text-lg font-mono tabular-nums">
                  {attendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0)}{" "}
                  دقيقة
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="text-xs text-slate-500">
                  إجمالي ساعات الإضافي
                </div>
                <div className="font-bold text-lg font-mono tabular-nums">
                  {attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)}{" "}
                  ساعة
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
