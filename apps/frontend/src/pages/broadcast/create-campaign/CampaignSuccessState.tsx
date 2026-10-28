import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface CampaignSuccessStateProps {
  message: string;
}

export const CampaignSuccessState: React.FC<CampaignSuccessStateProps> = ({
  message,
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-4" />
        <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
          تم إنشاء الحملة بنجاح!
        </h3>
        <p className="text-green-600 dark:text-green-300">{message}</p>
      </div>
    </div>
  );
};
