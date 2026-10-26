import React from "react";
import { CampaignInputs, PredictionResults } from "./types";

interface CampaignSummaryRowProps {
  inputs: CampaignInputs;
  currentResults: PredictionResults;
  formatNumber: (value: number) => string;
}

export const CampaignSummaryRow: React.FC<CampaignSummaryRowProps> = ({
  inputs,
  currentResults,
  formatNumber,
}) => {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t business-border pt-6">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
          التارجيت اليومي
        </p>
        <p className="text-lg font-bold text-gray-700 dark:text-gray-300 tabular-nums">
          {formatNumber(inputs.dailyTarget)}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
          عدد الارسال الفاشل
        </p>
        <p className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">
          {formatNumber(inputs.failedMessages)}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
          نسبة الرسايل للارسال
        </p>
        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {currentResults.successRate.toFixed(1)}%
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">المنتج</p>
        <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
          {inputs.productName || "-"}
        </p>
      </div>
    </div>
  );
};
