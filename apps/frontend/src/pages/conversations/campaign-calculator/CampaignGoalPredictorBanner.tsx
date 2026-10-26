import React from "react";
import { CalculatorIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { CampaignInputs, PredictionResults } from "./types";

interface CampaignGoalPredictorBannerProps {
  inputs: CampaignInputs;
  currentResults: PredictionResults;
  formatNumber: (value: number) => string;
}

export const CampaignGoalPredictorBanner: React.FC<
  CampaignGoalPredictorBannerProps
> = ({ inputs, currentResults, formatNumber }) => {
  return (
    <div className="lg:col-span-4 business-bg-brand-gradient rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
        <SparklesIcon className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <h4 className="text-xl font-bold flex items-center gap-2">
          <CalculatorIcon className="w-6 h-6" />
          توقعات تحقيق الهدف (Goal Predictor)
        </h4>
        <p className="text-white mb-6 text-lg">
          لتحقيق هدفك بالوصول إلى{" "}
          <span className="font-black text-white tabular-nums">
            {formatNumber(inputs.orderTarget)}
          </span>{" "}
          أوردر بناءً على أدائك الحالي:
        </p>
        <div className="flex flex-col md:flex-row items-baseline gap-4">
          <p className="text-sm opacity-80">
            أنت بحاجة إلى إجمالي إرسال ناجح:
          </p>
          <p className="text-6xl font-black tabular-nums">
            {formatNumber(currentResults.requiredSuccessfulMessages)}
          </p>
          <p className="text-2xl font-bold opacity-90">
            رسالة ناجحة
          </p>
        </div>
        <div className="mt-8 flex gap-6 border-t border-white/20 pt-6">
          <div>
            <p className="text-xs opacity-70 mb-1">
              نسبة الردود الحالية
            </p>
            <p className="text-xl font-bold tabular-nums">
              {currentResults.replyRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-1">
              نسبة الأوردرات الحالية
            </p>
            <p className="text-xl font-bold tabular-nums">
              {currentResults.orderRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
