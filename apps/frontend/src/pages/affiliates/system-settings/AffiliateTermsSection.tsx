import React from "react";
import { AffiliateSettingsData } from "./types";

interface AffiliateTermsSectionProps {
  settings: AffiliateSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<AffiliateSettingsData>>;
  isDark: boolean;
}

export const AffiliateTermsSection: React.FC<AffiliateTermsSectionProps> = ({
  settings,
  setSettings,
  isDark,
}) => {
  return (
    <div className="space-y-4">
      <h2
        className={`text-xl font-semibold border-b pb-2 ${
          isDark
            ? "text-white border-gray-700"
            : "text-gray-900 border-gray-200"
        }`}
      >
        الشروط والأحكام
      </h2>

      <div>
        <label
          className={`block text-sm font-medium ${
            isDark ? "text-gray-300" : "text-gray-700"
          } mb-2`}
        >
          نص الشروط والأحكام
        </label>
        <textarea
          rows={6}
          value={settings.termsAndConditions}
          onChange={(e) =>
            setSettings({
              ...settings,
              termsAndConditions: e.target.value,
            })
          }
          placeholder="اكتب هنا الشروط التي يجب أن يوافق عليها المسوق عند التسجيل..."
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isDark
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
        <p
          className={`text-xs mt-1 ${
            isDark ? "text-gray-500" : "text-gray-500"
          }`}
        >
          سيظهر هذا النص في صفحة تسجيل المسوقين.
        </p>
      </div>
    </div>
  );
};
