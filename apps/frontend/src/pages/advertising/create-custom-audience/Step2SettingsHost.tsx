import React from "react";
import {
  CreateCustomAudienceData,
  FacebookAdAccount,
  FacebookPage,
  FacebookPixel,
} from "./types";
import { Step2WebsiteCriteria } from "./Step2WebsiteCriteria";
import { Step2CustomerListCriteria } from "./Step2CustomerListCriteria";
import { Step2EngagementCriteria } from "./Step2EngagementCriteria";

interface Step2SettingsHostProps {
  formData: CreateCustomAudienceData;
  adAccounts: FacebookAdAccount[];
  pixels: FacebookPixel[];
  pages: FacebookPage[];
  onInputChange: (field: keyof CreateCustomAudienceData, value: any) => void;
  onParseManualCustomers: (text: string) => void;
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Step2SettingsHost: React.FC<Step2SettingsHostProps> = ({
  formData,
  adAccounts,
  pixels,
  pages,
  onInputChange,
  onParseManualCustomers,
  onCsvUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Account Selector */}
      {adAccounts.length > 1 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
          <label
            htmlFor="custom-audience-account-select"
            className="block text-xs font-semibold text-gray-700"
          >
            الحساب الإعلاني المستهدف
          </label>
          <select
            id="custom-audience-account-select"
            value={formData.adAccountId}
            onChange={(e) => onInputChange("adAccountId", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
          >
            {adAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.accountId})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Website Criteria */}
      {formData.audienceType === "WEBSITE" && (
        <Step2WebsiteCriteria
          formData={formData}
          pixels={pixels}
          onInputChange={onInputChange}
        />
      )}

      {/* Customer List Criteria */}
      {formData.audienceType === "CUSTOMER_LIST" && (
        <Step2CustomerListCriteria
          formData={formData}
          onInputChange={onInputChange}
          onParseManualCustomers={onParseManualCustomers}
          onCsvUpload={onCsvUpload}
        />
      )}

      {/* Social Engagement Criteria */}
      {(formData.audienceType === "PAGE_ENGAGEMENT" ||
        formData.audienceType === "IG_ENGAGEMENT" ||
        formData.audienceType === "VIDEO_VIEWS") && (
        <Step2EngagementCriteria
          formData={formData}
          pages={pages}
          onInputChange={onInputChange}
        />
      )}
    </div>
  );
};
