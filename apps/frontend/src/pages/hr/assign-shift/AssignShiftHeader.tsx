import React from "react";
import { Button } from "../../../components/ui/button";
import { ArrowRight, CalendarRange } from "lucide-react";

interface AssignShiftHeaderProps {
  onBack: () => void;
  dateRangeMode: boolean;
  onToggleDateRangeMode: () => void;
}

export const AssignShiftHeader: React.FC<AssignShiftHeaderProps> = ({
  onBack,
  dateRangeMode,
  onToggleDateRangeMode,
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">تعيين مناوبة</h1>
          <p className="text-muted-foreground text-sm">
            اختر موظف أو عدة موظفين لتعيينهم في المناوبة
          </p>
        </div>
      </div>
      <Button
        variant={dateRangeMode ? "default" : "outline"}
        size="sm"
        onClick={onToggleDateRangeMode}
      >
        <CalendarRange className="h-4 w-4 ml-2" />
        {dateRangeMode ? "إلغاء نطاق التاريخ" : "نطاق تاريخ"}
      </Button>
    </div>
  );
};
