import React from "react";
import type { CampaignFormData } from "./types";

interface CampaignPreviewCardProps {
  formData: CampaignFormData;
  previewMessage: string;
}

export const CampaignPreviewCard: React.FC<CampaignPreviewCardProps> = ({
  formData,
  previewMessage,
}) => {
  return (
    <div className="lg:sticky lg:top-6">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          معاينة الرسالة
        </h4>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-600">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">ش</span>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                شركتك
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.sendNow
                  ? "سيتم الإرسال فوراً"
                  : formData.scheduledAt &&
                    formData.scheduledTime &&
                    new Date(
                      `${formData.scheduledAt}T${formData.scheduledTime}`
                    ).toLocaleString("ar-EG", {
                      calendar: "gregory",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {previewMessage}
          </div>
          {formData.message &&
            (formData.message.includes("{customerName}") ||
              formData.message.includes("{firstName}") ||
              formData.message.includes("{lastName}")) && (
              <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded text-xs text-indigo-700 dark:text-indigo-300">
                ℹ️ المعاينة تعرض مثال مع بيانات وهمية. سيتم استبدال المتغيرات
                بالبيانات الحقيقية عند الإرسال.
              </div>
            )}
          {formData.tags &&
            Array.isArray(formData.tags) &&
            formData.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              المستلمون:
            </span>
            <span className="font-medium text-gray-900 dark:text-white tabular-nums">
              {formData.recipientCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">الأولوية:</span>
            <span
              className={`font-medium ${
                formData.priority === "high"
                  ? "text-red-600 dark:text-red-400"
                  : formData.priority === "medium"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {formData.priority === "high"
                ? "عالية"
                : formData.priority === "medium"
                ? "متوسطة"
                : "منخفضة"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
