import React from "react";
import {
  CAMPAIGN_OBJECTIVES,
  FacebookAdAccount,
} from "../../../services/facebookAdsService";
import { CampaignFormData } from "./types";

interface Step1BasicInfoProps {
  formData: CampaignFormData;
  handleInputChange: (field: keyof CampaignFormData, value: any) => void;
  getObjectiveDescription: (objective: string) => string;
  adAccounts: FacebookAdAccount[];
  loadingAccounts: boolean;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  handleInputChange,
  getObjectiveDescription,
  adAccounts,
  loadingAccounts,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        معلومات الحملة
      </h2>

      {/* Campaign Name */}
      <div>
        <label
          htmlFor="create-campaign-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          اسم الحملة *
        </label>
        <input
          id="create-campaign-name"
          name="campaignName"
          type="text"
          autoComplete="off"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="مثال: حملة صيف 2025"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="create-campaign-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          الوصف (اختياري)
        </label>
        <textarea
          id="create-campaign-description"
          name="campaignDescription"
          autoComplete="off"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="وصف الحملة..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Campaign Objective */}
      <div>
        <label
          htmlFor="create-campaign-objective"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          هدف الحملة *
        </label>
        <select
          id="create-campaign-objective"
          name="objective"
          autoComplete="off"
          value={formData.objective}
          onChange={(e) => handleInputChange("objective", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {CAMPAIGN_OBJECTIVES.map((obj) => (
            <option key={obj.value} value={obj.value}>
              {obj.label}
            </option>
          ))}
        </select>
        {formData.objective && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {getObjectiveDescription(formData.objective)}
          </p>
        )}
      </div>

      {/* Ad Account */}
      {loadingAccounts ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            جاري تحميل حسابات Facebook Ads...
          </p>
        </div>
      ) : adAccounts.length > 0 ? (
        <div>
          <label
            htmlFor="create-campaign-ad-account"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            حساب Facebook Ads *
          </label>
          <select
            id="create-campaign-ad-account"
            name="adAccountId"
            autoComplete="off"
            value={formData.adAccountId}
            onChange={(e) => handleInputChange("adAccountId", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            {adAccounts.map((account) => (
              <option
                key={account.id}
                value={account.account_id || account.id}
              >
                {account.name} ({account.currency})
                {account.isActive ? " - نشط" : ""}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            لا توجد حسابات Facebook Ads متاحة. يرجى ربط حساب Facebook أولاً.
          </p>
        </div>
      )}

      {/* Campaign Status */}
      <div>
        <label
          htmlFor="create-campaign-status"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          حالة الحملة
        </label>
        <select
          id="create-campaign-status"
          name="status"
          autoComplete="off"
          value={formData.status}
          onChange={(e) =>
            handleInputChange("status", e.target.value as "ACTIVE" | "PAUSED")
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="PAUSED">متوقفة (سأفعلها لاحقاً)</option>
          <option value="ACTIVE">نشطة (تبدأ فوراً)</option>
        </select>
      </div>
    </div>
  );
};
