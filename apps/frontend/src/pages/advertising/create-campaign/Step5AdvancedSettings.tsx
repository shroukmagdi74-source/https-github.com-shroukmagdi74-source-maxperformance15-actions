import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { CampaignFormData, FacebookPixel } from "./types";
import {
  buyingTypes,
  bidStrategies,
  specialAdCategories,
} from "./constants";

interface Step5AdvancedSettingsProps {
  formData: CampaignFormData;
  handleInputChange: (field: keyof CampaignFormData, value: any) => void;
  handleSpecialAdCategoryToggle: (category: string) => void;
  pixels: FacebookPixel[];
  loadingPixels: boolean;
}

export const Step5AdvancedSettings: React.FC<Step5AdvancedSettingsProps> = ({
  formData,
  handleInputChange,
  handleSpecialAdCategoryToggle,
  pixels,
  loadingPixels,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        إعدادات متقدمة
      </h2>

      {/* Pixel Selection */}
      <div>
        {loadingPixels ? (
          <div className="text-center py-2" aria-live="polite">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : pixels.length > 0 ? (
          <>
            <label
              htmlFor="create-campaign-pixel-id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Facebook Pixel (للتتبع)
            </label>
            <select
              id="create-campaign-pixel-id"
              name="pixelId"
              autoComplete="off"
              value={formData.pixelId}
              onChange={(e) => handleInputChange("pixelId", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">بدون Pixel</option>
              {pixels.map((pixel) => (
                <option key={pixel.pixelId} value={pixel.pixelId}>
                  {pixel.pixelName} ({pixel.pixelId})
                </option>
              ))}
            </select>
          </>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Facebook Pixel (للتتبع)
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              لا توجد Pixels متاحة. يمكنك إضافة Pixel من إعدادات Facebook Pixel.
            </p>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          اختر Pixel لتتبع التحويلات والأحداث
        </p>
      </div>

      {/* Buying Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          نوع الشراء (Buying Type)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {buyingTypes.map((type) => (
            <div
              key={type.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.buyingType === type.value
                  ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
              }`}
              onClick={() => handleInputChange("buyingType", type.value)}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {type.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {type.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bid Strategy */}
      <div>
        <label
          htmlFor="create-campaign-bid-strategy"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          استراتيجية المزايدة (Bid Strategy)
        </label>
        <select
          id="create-campaign-bid-strategy"
          name="bidStrategy"
          autoComplete="off"
          value={formData.bidStrategy}
          onChange={(e) => handleInputChange("bidStrategy", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {bidStrategies.map((strategy) => (
            <option key={strategy.value} value={strategy.value}>
              {strategy.label}
            </option>
          ))}
        </select>
        {formData.bidStrategy && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {
              bidStrategies.find((s) => s.value === formData.bidStrategy)
                ?.description
            }
          </p>
        )}
      </div>

      {/* Special Ad Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          فئات الإعلانات الخاصة (Special Ad Categories)
        </label>
        <div className="space-y-3">
          {specialAdCategories.map((category) => (
            <div
              key={category.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.specialAdCategories?.includes(category.value)
                  ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700"
              }`}
              onClick={() => handleSpecialAdCategoryToggle(category.value)}
            >
              <div className="flex items-start gap-3">
                <input
                  id={`special-ad-category-${category.value}`}
                  name={`specialAdCategory-${category.value}`}
                  type="checkbox"
                  aria-label={category.label}
                  checked={
                    formData.specialAdCategories?.includes(category.value) ||
                    false
                  }
                  onChange={() =>
                    handleSpecialAdCategoryToggle(category.value)
                  }
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {category.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {category.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              يجب تحديد فئات الإعلانات الخاصة إذا كانت إعلاناتك تتعلق بالإسكان أو
              التوظيف أو الائتمان.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
