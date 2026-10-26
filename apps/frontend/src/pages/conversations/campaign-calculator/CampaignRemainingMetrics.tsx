import React from "react";
import { CampaignInputs, PredictionResults } from "./types";

interface CampaignRemainingMetricsProps {
  inputs: CampaignInputs;
  currentResults: PredictionResults;
  formatNumber: (value: number) => string;
}

export const CampaignRemainingMetrics: React.FC<
  CampaignRemainingMetricsProps
> = ({ inputs, currentResults, formatNumber }) => {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          الباقي علي تارجت الاوردرات
        </p>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
          {formatNumber(currentResults.remainingOrdersToTarget)}
        </p>
        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500 tabular-nums">
          من أصل {inputs.orderTarget}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border relative overflow-hidden">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          إحصائيات الفشل
        </p>
        <p className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
          {formatNumber(inputs.failedMessages)}
        </p>
        <p className="text-xs mt-1 font-bold text-red-600 dark:text-red-400 tabular-nums">
          نسبة الفشل: {currentResults.failureRate.toFixed(1)}%
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          الباقي علي تارجيت ارسال
        </p>
        <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 tabular-nums">
          {formatNumber(currentResults.messagesToDailyTarget)}
        </p>
        <p className="text-xs mt-1 font-bold text-gray-400 dark:text-gray-500 tabular-nums">
          إنجاز الإرسال: {currentResults.sendingAchievementRate.toFixed(1)}%
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
          المتوقع عند اكتمال الإرسال
        </p>
        <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
          {formatNumber(currentResults.expectedOrdersFromDaily)}
        </p>
        <p className="text-[10px] mt-1 text-blue-600 dark:text-blue-400 opacity-70">
          أوردر متوقع تحقيقه اليوم
        </p>
      </div>
    </div>
  );
};
