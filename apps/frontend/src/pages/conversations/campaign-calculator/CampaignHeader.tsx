import React from "react";
import { CalculatorIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { HistoricalDefaults } from "./types";

interface CampaignHeaderProps {
  defaults: HistoricalDefaults | null;
}

export const CampaignHeader: React.FC<CampaignHeaderProps> = ({ defaults }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <CalculatorIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            حاسبة توقعات نتائج الحملات
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            خطط لحملاتك بذكاء مع توقعات دقيقة بناءً على البيانات التاريخية
          </p>
        </div>
        {defaults && (
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow">
            <SparklesIcon className="w-4 h-4 inline ml-1 text-amber-600 dark:text-amber-400" />
            بيانات تاريخية متاحة
          </div>
        )}
      </div>
    </div>
  );
};
