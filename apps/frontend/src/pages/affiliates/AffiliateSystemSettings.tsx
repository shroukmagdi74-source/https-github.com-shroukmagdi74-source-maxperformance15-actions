import React from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../hooks/useTheme";
import {
  useAffiliateSettings,
  AffiliateInvitationCard,
  AffiliateStatusCards,
  AffiliateOperationalDefaults,
  AffiliateCommissionSection,
  AffiliateTermsSection,
} from "./system-settings";

const AffiliateSystemSettings: React.FC = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";

  const {
    user,
    settings,
    setSettings,
    loading,
    handleToggleAutoApprove,
    handleToggleIsActive,
    handleSubmit,
  } = useAffiliateSettings();

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      <div
        className={`w-full ${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-8`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 ml-4">
              <Cog6ToothIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                إعدادات نظام المسوقين
              </h1>
              <p
                className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-1 text-sm`}
              >
                تحكم في عمولات المسوقين، الشروط والأحكام، وروابط التسجيل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors text-sm self-start sm:self-auto"
          >
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>

        {/* Invitation Link Section */}
        {user?.company && (
          <AffiliateInvitationCard company={user.company} isDark={isDark} />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <AffiliateStatusCards
            settings={settings}
            isDark={isDark}
            onToggleIsActive={handleToggleIsActive}
            onToggleAutoApprove={handleToggleAutoApprove}
          />

          <AffiliateOperationalDefaults
            settings={settings}
            setSettings={setSettings}
            isDark={isDark}
          />

          <AffiliateCommissionSection
            settings={settings}
            setSettings={setSettings}
            isDark={isDark}
          />

          <AffiliateTermsSection
            settings={settings}
            setSettings={setSettings}
            isDark={isDark}
          />

          {/* Submit Button */}
          <div className="flex gap-4 border-t pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
            >
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AffiliateSystemSettings;
