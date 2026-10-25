import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface MyCompaniesReportsTabProps {
  onGoToReports: () => void;
}

export const MyCompaniesReportsTab: React.FC<MyCompaniesReportsTabProps> = ({
  onGoToReports,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
      <ChartBarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
        التقارير الموحدة
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        قريباً... يمكنك الوصول للتقارير من صفحة التقارير الموحدة
      </p>
      <button
        onClick={onGoToReports}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        الذهاب للتقارير
      </button>
    </div>
  );
};
