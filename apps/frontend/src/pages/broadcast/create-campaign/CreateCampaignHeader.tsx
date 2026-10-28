import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";

interface CreateCampaignHeaderProps {
  previewMode: boolean;
  onTogglePreview: () => void;
}

export const CreateCampaignHeader: React.FC<CreateCampaignHeaderProps> = ({
  previewMode,
  onTogglePreview,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          إنشاء حملة برودكاست جديدة
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          قم بإنشاء حملة إرسال جماعي لتصل لعملائك خلال 24 ساعة
        </p>
      </div>
      <button
        type="button"
        onClick={onTogglePreview}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <EyeIcon className="h-4 w-4 ml-2" />
        {previewMode ? "إخفاء المعاينة" : "معاينة"}
      </button>
    </div>
  );
};
