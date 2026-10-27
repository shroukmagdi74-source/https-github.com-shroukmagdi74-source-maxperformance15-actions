import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { FacebookAdDetailResponse } from "../../../services/facebookAdsService";
import { getPriorityClass } from "./helpers";

interface AdFunnelRecommendationsProps {
  details: FacebookAdDetailResponse;
  isEn: boolean;
  formatNumber: (value?: number) => string;
  formatPercent: (value?: number) => string;
}

export const AdFunnelRecommendations: React.FC<AdFunnelRecommendationsProps> = ({
  details,
  isEn,
  formatNumber,
  formatPercent,
}) => {
  const funnelSteps = details.funnel.steps;
  const maxFunnelValue = Math.max(...funnelSteps.map((step) => step.value), 1);

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      {/* Funnel Diagnosis */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">
              {isEn ? "Funnel Diagnosis" : "تشخيص الفانل"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {details.funnel.diagnosis.title}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getPriorityClass(
              details.funnel.diagnosis.severity,
            )}`}
          >
            {details.funnel.diagnosis.severity}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
          {details.funnel.diagnosis.message}
        </p>

        <div className="mt-3 space-y-2">
          {funnelSteps.map((step) => (
            <div key={step.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{step.label}</span>
                <span className="font-semibold text-slate-500 tabular-nums">
                  {formatNumber(step.value)} · {formatPercent(step.rate)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${Math.max(2, (step.value / maxFunnelValue) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-black text-slate-950">
            {isEn ? "Decision Recommendations" : "توصيات القرار"}
          </h2>
        </div>
        <div className="mt-2 space-y-2">
          {details.recommendations.slice(0, 4).map((recommendation) => (
            <div
              key={`${recommendation.priority}-${recommendation.title}`}
              className={`rounded-lg border p-2.5 ${getPriorityClass(
                recommendation.priority,
              )}`}
            >
              <p className="text-sm font-black">{recommendation.title}</p>
              <p className="mt-1 text-xs leading-5">{recommendation.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
