import React from "react";
import { Badge } from "../../../components/ui/badge";

export const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    VERBAL: "شفوي",
    WRITTEN: "كتابي",
    FINAL: "نهائي",
    TERMINATION: "إنهاء خدمة",
  };
  return typeMap[type] || type;
};

export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    VERBAL:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    WRITTEN:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    FINAL:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    TERMINATION:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return colorMap[type] || "bg-gray-100 text-gray-700";
};

export const getSeverityBadge = (severity: string): React.ReactNode => {
  const styles: Record<string, string> = {
    minor:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    moderate:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
    severe:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  };
  const labels: Record<string, string> = {
    minor: "مخالفة بسيطة",
    moderate: "مخالفة متوسطة",
    severe: "مخالفة جسيمة",
  };

  return (
    <Badge
      variant="outline"
      className={`${styles[severity] || ""} text-xs font-normal`}
    >
      {labels[severity] || severity}
    </Badge>
  );
};
