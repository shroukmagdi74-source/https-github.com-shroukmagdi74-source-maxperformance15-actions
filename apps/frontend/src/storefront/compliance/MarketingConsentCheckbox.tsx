import React, { useCallback, useState } from "react";
import {
  MARKETING_CONSENT_COPY,
  resolveLegalLocale,
  type LegalLocale,
} from "./legalCopy";
import { readMarketingConsent, writeMarketingConsent } from "./consentStore";

export interface MarketingConsentCheckboxProps {
  locale?: LegalLocale;
  name?: string;
  label?: string;
  helperText?: string;
  /** Controlled value. When provided the component stops owning the state. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Set false for previews/tests so nothing is written to storage. */
  persist?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

/**
 * Optional marketing-consent checkbox. It is separate from the analytics
 * cookie decision and is unchecked unless the visitor opts in.
 */
export const MarketingConsentCheckbox: React.FC<MarketingConsentCheckboxProps> = ({
  locale,
  name = "marketingConsent",
  label,
  helperText,
  checked,
  defaultChecked,
  persist = true,
  disabled = false,
  onChange,
  className = "",
}) => {
  const resolvedLocale = resolveLegalLocale(locale);
  const copy = MARKETING_CONSENT_COPY[resolvedLocale];
  const isControlled = checked !== undefined;

  const [internalChecked, setInternalChecked] = useState<boolean>(() => {
    if (defaultChecked !== undefined) {
      return defaultChecked;
    }
    return persist ? readMarketingConsent() : false;
  });

  const currentChecked = isControlled ? Boolean(checked) : internalChecked;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.checked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      if (persist) {
        writeMarketingConsent(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange, persist]
  );

  return (
    <label
      className={`flex w-full cursor-pointer items-start gap-3 text-start ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`.trim()}
      data-testid="marketing-consent-checkbox"
      dir={resolvedLocale === "ar" ? "rtl" : "ltr"}
    >
      <input
        type="checkbox"
        name={name}
        checked={currentChecked}
        disabled={disabled}
        onChange={handleChange}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#c7ccd4] accent-[#2b6cf6]"
      />
      <span className="flex-1">
        <span className="block text-[12.5px] leading-6 text-[#374151]" data-testid="marketing-consent-label">
          {label || copy.label}
        </span>
        <span className="mt-0.5 block text-[11.5px] leading-5 text-[#6b7280]" data-testid="marketing-consent-helper">
          {helperText || copy.helperText}
        </span>
      </span>
    </label>
  );
};

export default MarketingConsentCheckbox;
