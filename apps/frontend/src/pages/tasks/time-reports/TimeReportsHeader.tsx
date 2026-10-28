import React from "react";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface TimeReportsHeaderProps {
  onExportCSV: () => void;
}

export const TimeReportsHeader: React.FC<TimeReportsHeaderProps> = ({
  onExportCSV,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link
            to="/tasks"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <ClockIcon className="h-7 w-7 text-indigo-600 ml-2" />
            تقارير الوقت
          </h1>
        </div>

        <button
          onClick={onExportCSV}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5 ml-2" />
          تصدير CSV
        </button>
      </div>
    </div>
  );
};
