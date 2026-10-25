import React from "react";
import { CampaignFormData } from "./types";
import {
  conversionLocations,
  optimizationGoals,
  availableLocations,
  availableInterests,
  genderOptions,
} from "./constants";

interface Step3TargetingProps {
  formData: CampaignFormData;
  handleInputChange: (field: keyof CampaignFormData, value: any) => void;
  handleGenderToggle: (gender: string) => void;
  handleLocationToggle: (locationCode: string) => void;
  handleInterestToggle: (interest: string) => void;
}

export const Step3Targeting: React.FC<Step3TargetingProps> = ({
  formData,
  handleInputChange,
  handleGenderToggle,
  handleLocationToggle,
  handleInterestToggle,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">الاستهداف</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        حدد الجمهور المستهدف لإعلاناتك
      </p>

      {/* Conversion Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          مكان التحويل *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {conversionLocations.map((location) => (
            <div
              key={location.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.conversionLocation === location.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
              }`}
              onClick={() =>
                handleInputChange("conversionLocation", location.value)
              }
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {location.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {location.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Goal */}
      <div>
        <label
          htmlFor="create-campaign-optimization-goal"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          هدف التحسين *
        </label>
        <select
          id="create-campaign-optimization-goal"
          name="optimizationGoal"
          autoComplete="off"
          value={formData.optimizationGoal}
          onChange={(e) =>
            handleInputChange("optimizationGoal", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {optimizationGoals.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label} - {goal.description}
            </option>
          ))}
        </select>
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          الفئة العمرية
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label
              htmlFor="create-campaign-age-min"
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              من
            </label>
            <input
              id="create-campaign-age-min"
              name="targetingAgeMin"
              type="number"
              autoComplete="off"
              min="13"
              max="65"
              value={formData.targetingAgeMin}
              onChange={(e) =>
                handleInputChange(
                  "targetingAgeMin",
                  parseInt(e.target.value) || 18,
                )
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono tabular-nums"
            />
          </div>
          <span className="text-gray-400 mt-5">-</span>
          <div className="flex-1">
            <label
              htmlFor="create-campaign-age-max"
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              إلى
            </label>
            <input
              id="create-campaign-age-max"
              name="targetingAgeMax"
              type="number"
              autoComplete="off"
              min="13"
              max="65"
              value={formData.targetingAgeMax}
              onChange={(e) =>
                handleInputChange(
                  "targetingAgeMax",
                  parseInt(e.target.value) || 65,
                )
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          الجنس
        </label>
        <div className="flex gap-3">
          {genderOptions.map((gender) => (
            <button
              key={gender.value}
              type="button"
              onClick={() => handleGenderToggle(gender.value)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                formData.targetingGenders.includes(gender.value)
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {gender.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {formData.targetingGenders.length === 0
            ? "الكل (افتراضي)"
            : `محدد: ${formData.targetingGenders.length}`}
        </p>
      </div>

      {/* Locations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          المواقع الجغرافية *
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {availableLocations.map((location) => (
            <button
              key={location.value}
              type="button"
              onClick={() => handleLocationToggle(location.value)}
              className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                formData.targetingLocations.includes(location.value)
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {location.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          محدد: <span className="font-mono tabular-nums">{formData.targetingLocations.length}</span> دولة
        </p>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          الاهتمامات (اختياري)
        </label>
        <div className="flex flex-wrap gap-2">
          {availableInterests.map((interest) => (
            <button
              key={interest.value}
              type="button"
              onClick={() => handleInterestToggle(interest.value)}
              className={`py-2 px-4 rounded-full border text-sm transition-colors ${
                formData.targetingInterests.includes(interest.value)
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              {interest.label}
            </button>
          ))}
        </div>
        {formData.targetingInterests.length > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            محدد: <span className="font-mono tabular-nums">{formData.targetingInterests.length}</span> اهتمام
          </p>
        )}
      </div>
    </div>
  );
};
