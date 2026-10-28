import React from "react";
import {
  ClockIcon,
  PaperAirplaneIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface CampaignSubmitActionsProps {
  loading: boolean;
  sendNow: boolean;
  onSaveDraft?: () => void;
}

export const CampaignSubmitActions: React.FC<CampaignSubmitActionsProps> = ({
  loading,
  sendNow,
  onSaveDraft,
}) => {
  return (
    <div className="flex justify-end space-x-3 space-x-reverse pt-5 border-t border-gray-200 dark:border-gray-600">
      <button
        type="button"
        onClick={onSaveDraft}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        حفظ كمسودة
      </button>
      <button
        type="submit"
        disabled={loading}
        className={`inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          sendNow
            ? "bg-green-600 hover:bg-green-700"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? (
          <>
            <ClockIcon className="h-4 w-4 ml-2 animate-spin" />
            {sendNow ? "جاري الإرسال..." : "جاري الجدولة..."}
          </>
        ) : (
          <>
            {sendNow ? (
              <PaperAirplaneIcon className="h-4 w-4 ml-2" />
            ) : (
              <CalendarIcon className="h-4 w-4 ml-2" />
            )}
            {sendNow ? "إرسال فوري" : "جدولة الحملة"}
          </>
        )}
      </button>
    </div>
  );
};
