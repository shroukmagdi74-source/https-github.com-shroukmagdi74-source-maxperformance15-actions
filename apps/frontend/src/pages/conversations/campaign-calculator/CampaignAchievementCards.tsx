import React from "react";
import { CampaignInputs, PredictionResults } from "./types";

interface CampaignAchievementCardsProps {
  inputs: CampaignInputs;
  currentResults: PredictionResults;
  formatNumber: (value: number) => string;
}

export const CampaignAchievementCards: React.FC<
  CampaignAchievementCardsProps
> = ({ inputs, currentResults, formatNumber }) => {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          الوصول الفعلي (ناجح)
        </p>
        <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
          {formatNumber(inputs.successfulMessages)}
        </p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
            من إجمالي {formatNumber(currentResults.totalSent)}
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            نجاح {currentResults.successRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          الردود (الناس اللي ردت)
        </p>
        <p className="text-4xl font-black text-gray-600 dark:text-gray-400 tabular-nums">
          {formatNumber(inputs.repliesReceived)}
        </p>
        <p className="text-xs mt-3 font-bold text-gray-600 dark:text-gray-400 tabular-nums">
          نسبة الرد: {currentResults.replyRate.toFixed(1)}%
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          عدد الاوردرات الحالي
        </p>
        <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
          {formatNumber(inputs.currentOrders)}
        </p>
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, currentResults.orderAchievementRate)}%`,
            }}
          />
        </div>
        <p className="text-xs mt-2 font-bold text-gray-400 dark:text-gray-500 tabular-nums">
          تحقيق الهدف: {currentResults.orderAchievementRate.toFixed(1)}%
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border business-border">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          تحليل الأداء (أوردر/إرسال)
        </p>
        <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 tabular-nums">
          {currentResults.orderRate.toFixed(2)}%
        </p>
        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500 tabular-nums">
          {currentResults.messagesPerOrder.toFixed(1)} رسالة لكل أوردر
        </p>
      </div>
    </div>
  );
};
