import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

export const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    PEER: "زميل",
    MANAGER: "مدير",
    SUBORDINATE: "مرؤوس",
    SELF: "ذاتي",
    GENERAL: "عام",
    OTHER: "آخر",
  };
  return typeMap[type] || type;
};

export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    PEER: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    MANAGER:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    SUBORDINATE:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    SELF: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    GENERAL:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  };
  return (
    colorMap[type] ||
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800"
  );
};

export const getStatusBadge = (status: string): React.ReactNode => {
  switch (status) {
    case "RESOLVED":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3 ml-1" />
          تم الرد
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="h-3 w-3 ml-1" />
          قيد الانتظار
        </Badge>
      );
  }
};
