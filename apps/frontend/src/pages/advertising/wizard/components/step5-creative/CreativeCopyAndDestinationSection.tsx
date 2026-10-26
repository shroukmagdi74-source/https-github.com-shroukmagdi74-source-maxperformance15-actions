import React from "react";
import { Sparkles } from "lucide-react";
import type { FormData } from "../../types";
import { AdCopyVariationsEditor } from "../AdCopyVariationsEditor";

interface CreativeCopyAndDestinationSectionProps {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  getError: (field: string) => string;
  isEn: boolean;
  onOpenUtmModal: () => void;
}

export const CreativeCopyAndDestinationSection: React.FC<CreativeCopyAndDestinationSectionProps> = ({
  formData,
  handleChange,
  getError,
  isEn,
  onOpenUtmModal,
}) => {
  return (
    <>
      {/* Primary Text & Headline Variations */}
      <AdCopyVariationsEditor
        primaryText={formData.primaryText}
        onPrimaryTextChange={(val) => handleChange("primaryText", val)}
        textVariations={formData.textVariations || []}
        onTextVariationsChange={(variations) =>
          handleChange("textVariations", variations)
        }
        headline={formData.headline}
        onHeadlineChange={(val) => handleChange("headline", val)}
        headlineVariations={formData.headlineVariations || []}
        onHeadlineVariationsChange={(variations) =>
          handleChange("headlineVariations", variations)
        }
        primaryTextError={getError("primaryText")}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isEn ? "Description" : "الوصف"}
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={isEn ? "Short description appearing below headline" : "وصف مختصر يظهر أسفل العنوان"}
          maxLength={30}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 tabular-nums ${isEn ? "text-right" : "text-left"}`}>
          {formData.description.length}/30
        </p>
      </div>

      {/* Link URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isEn ? "Destination URL" : "رابط الوجهة"} <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={formData.linkUrl}
          onChange={(e) => handleChange("linkUrl", e.target.value)}
          placeholder="https://yourwebsite.com"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
            getError("linkUrl") ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {getError("linkUrl") && (
          <p className="mt-1 text-sm text-red-500">{getError("linkUrl")}</p>
        )}
      </div>

      {/* Display Link & URL Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isEn ? "Display Link (Optional)" : "رابط العرض (اختياري)"}
          </label>
          <input
            type="text"
            value={formData.displayLink}
            onChange={(e) => handleChange("displayLink", e.target.value)}
            placeholder={isEn ? "e.g. yoursite.com/sale" : "مثال: yoursite.com/sale"}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isEn ? "Text shown instead of the full URL" : "النص الذي يظهر بدلاً من الرابط الكامل"}
          </p>
        </div>

        {/* URL Parameters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isEn ? "URL Parameters (UTM)" : "معاملات URL (UTM)"}
            </label>
            <button
              type="button"
              onClick={onOpenUtmModal}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isEn ? "Dynamic UTM Builder" : "مُنشئ الرموز الديناميكية (UTM Builder)"}
            </button>
          </div>
          <input
            type="text"
            value={formData.urlParameters}
            onChange={(e) => handleChange("urlParameters", e.target.value)}
            placeholder="مثال: utm_source={{site_source_name}}&utm_campaign={{campaign.name}}"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isEn ? "For accurate source tracking in Google Analytics and CRM systems" : "لتتبع مصدر الزيارات بدقة في Google Analytics وأنظمة الـ CRM"}
          </p>
        </div>
      </div>
    </>
  );
};
