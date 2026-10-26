import React from "react";
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BookmarkIcon as SaveIcon,
} from "@heroicons/react/24/outline";
import { SmartRecommendation } from "./types";

interface CampaignRecommendationsProps {
  recommendations: SmartRecommendation[];
  onSaveScenario: () => void;
}

export const CampaignRecommendations: React.FC<
  CampaignRecommendationsProps
> = ({ recommendations, onSaveScenario }) => {
  return (
    <>
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            توصيات ذكية
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  rec.type === "warning"
                    ? "bg-red-50 dark:bg-red-950 border business-border-danger-soft"
                    : rec.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950 border business-border-success-soft"
                      : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                }`}
              >
                {rec.type === "warning" ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                ) : rec.type === "success" ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {rec.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rec.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onSaveScenario}
          className="flex items-center gap-2 px-6 py-3 business-bg-primary-solid text-white rounded-lg business-hover-primary-solid transition-colors font-medium"
        >
          <SaveIcon className="w-5 h-5" />
          حفظ هذا السيناريو
        </button>
      </div>
    </>
  );
};
