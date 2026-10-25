import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CampaignFormData } from "./types";
import { availablePlacements } from "./constants";

interface Step4PlacementsProps {
  formData: CampaignFormData;
  handleInputChange: (field: keyof CampaignFormData, value: any) => void;
  handlePlacementToggle: (placement: string) => void;
}

export const Step4Placements: React.FC<Step4PlacementsProps> = ({
  formData,
  handleInputChange,
  handlePlacementToggle,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">المواضع</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">اختر أين تريد عرض إعلاناتك</p>

      {/* Placement Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          نوع المواضع
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.placementType === "AUTOMATIC"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
            }`}
            onClick={() => handleInputChange("placementType", "AUTOMATIC")}
          >
            <div className="font-medium text-gray-900 dark:text-white">
              Advantage+ (تلقائي)
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Facebook يختار أفضل المواضع تلقائياً لتحقيق أفضل النتائج
            </div>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
              موصى به
            </div>
          </div>
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.placementType === "MANUAL"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
            }`}
            onClick={() => handleInputChange("placementType", "MANUAL")}
          >
            <div className="font-medium text-gray-900 dark:text-white">يدوي</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              اختر المواضع يدوياً للتحكم الكامل
            </div>
          </div>
        </div>
      </div>

      {/* Manual Placements */}
      {formData.placementType === "MANUAL" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            اختر المواضع
          </label>
          <div className="space-y-4">
            {["Facebook", "Instagram", "Messenger", "Audience Network"].map(
              (platform) => (
                <div
                  key={platform}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {platform}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availablePlacements
                      .filter((p) => p.platform === platform)
                      .map((placement) => (
                        <button
                          key={placement.value}
                          type="button"
                          onClick={() => handlePlacementToggle(placement.value)}
                          className={`py-2 px-4 rounded-lg border text-sm transition-colors ${
                            formData.placements.includes(placement.value)
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {placement.label}
                        </button>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>
          {formData.placements.length > 0 && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              محدد: <span className="font-mono tabular-nums">{formData.placements.length}</span> موضع
            </p>
          )}
        </div>
      )}

      {formData.placementType === "AUTOMATIC" && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Advantage+ Placements
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                سيتم عرض إعلاناتك على جميع المنصات المتاحة (Facebook, Instagram,
                Messenger, Audience Network) وسيقوم Facebook بتحسين التوزيع
                تلقائياً لتحقيق أفضل النتائج.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
