import React from "react";
import { MarketingConsentCheckbox } from "../compliance/MarketingConsentCheckbox";
import { resolveLegalLocale, type LegalLocale } from "../compliance/legalCopy";

interface MarketingConsentSettings {
  locale?: LegalLocale | string;
  label?: string;
  helperText?: string;
  name?: string;
  [key: string]: unknown;
}

interface MarketingConsentSectionProps {
  section?: { key?: string };
  settings?: MarketingConsentSettings;
}

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/**
 * Page section wrapper around the opt-in marketing checkbox.
 */
const MarketingConsentSection: React.FC<MarketingConsentSectionProps> = ({ settings }) => (
  <div className="w-full bg-white px-4 py-6 sm:px-6 lg:px-10" data-testid="marketing-consent-section">
    <div className="mx-auto max-w-3xl rounded-2xl border border-[#e5e7eb] p-4">
      <MarketingConsentCheckbox
        locale={resolveLegalLocale(settings?.locale)}
        label={readString(settings?.label)}
        helperText={readString(settings?.helperText)}
        name={readString(settings?.name) || "marketingConsent"}
      />
    </div>
  </div>
);

export default MarketingConsentSection;
