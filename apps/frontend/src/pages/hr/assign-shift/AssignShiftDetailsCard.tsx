import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Clock, ShieldCheck } from "lucide-react";
import { Shift } from "./types";

interface AssignShiftDetailsCardProps {
  shift: Shift;
}

export const AssignShiftDetailsCard: React.FC<AssignShiftDetailsCardProps> = ({
  shift,
}) => {
  return (
    <Card className="md:col-span-1 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          تفاصيل المناوبة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-primary/10 shadow-sm">
          <span className="text-sm font-medium">{shift.name}</span>
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: shift.color }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-muted-foreground">وقت البدء</span>
            <span className="font-bold text-primary font-mono tabular-nums">
              {shift.startTime}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-muted-foreground">وقت الانتهاء</span>
            <span className="font-bold text-primary font-mono tabular-nums">
              {shift.endTime}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-primary/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/10 p-2 rounded">
            <ShieldCheck className="h-3 w-3" />
            <span>سيتم تسجيل هذا التعيين في ملف الموظف</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
