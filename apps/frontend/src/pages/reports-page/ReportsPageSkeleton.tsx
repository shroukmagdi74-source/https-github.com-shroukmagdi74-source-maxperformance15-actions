import React from "react";
import { RefreshCw } from "lucide-react";

export const ReportsPageSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center space-x-2 space-x-reverse">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-gray-900 dark:text-white text-sm font-medium">
          جاري تحميل التقارير...
        </span>
      </div>
    </div>
  );
};
