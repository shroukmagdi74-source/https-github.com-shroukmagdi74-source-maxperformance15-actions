import React from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MONTHS } from "./helpers";

interface HRReportsHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onRefresh: () => void;
  onExport: () => void;
}

export const HRReportsHeader: React.FC<HRReportsHeaderProps> = ({
  selectedMonth,
  selectedYear,
  onRefresh,
  onExport,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          تقارير الموارد البشرية
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono tabular-nums">
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 ml-2" />
          تصدير
        </Button>
      </div>
    </div>
  );
};
