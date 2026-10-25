import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Check } from "lucide-react";
import { getDateRange } from "./helpers";

interface AssignShiftSummaryCardProps {
  selectedCount: number;
  dateRangeMode: boolean;
  assignmentDate: string;
  endDate: string;
}

export const AssignShiftSummaryCard: React.FC<AssignShiftSummaryCardProps> = ({
  selectedCount,
  dateRangeMode,
  assignmentDate,
  endDate,
}) => {
  if (selectedCount === 0) return null;

  const daysCount =
    dateRangeMode && endDate
      ? getDateRange(assignmentDate, endDate).length
      : 1;
  const totalAssignments = selectedCount * daysCount;

  return (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              ملخص التعيين
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1 font-mono tabular-nums">
              {selectedCount} موظف × {daysCount} يوم = {totalAssignments} تعيين
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
