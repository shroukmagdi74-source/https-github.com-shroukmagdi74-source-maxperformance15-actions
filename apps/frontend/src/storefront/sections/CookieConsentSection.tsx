import React from "react";
import { CookieConsentBar } from "../compliance/CookieConsentBar";
import { resolveLegalLocale, type LegalLocale } from "../compliance/legalCopy";

interface CookieConsentSettings {
  locale?: LegalLocale | string;
  title?: string;
  description?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  policyHref?: string;
  policyLabel?: string;
  variant?: "inline" | "fixed";
  [key: string]: unknown;
}

interface CookieConsentSectionProps {
  section?: { key?: string };
  settings?: CookieConsentSettings;
}

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/**
 * Page section wrapper around the consent bar so merchants can insert it like
 * any other storefront section (also used by the compliance bundle).
 */
const CookieConsentSection: React.FC<CookieConsentSectionProps> = ({ settings }) => {
  const variant = settings?.variant === "fixed" ? "fixed" : "inline";

  return (
    <CookieConsentBar
      locale={resolveLegalLocale(settings?.locale)}
      title={readString(settings?.title)}
      description={readString(settings?.description)}
      acceptLabel={readString(settings?.acceptLabel)}
      rejectLabel={readString(settings?.rejectLabel)}
      policyHref={readString(settings?.policyHref)}
      policyLabel={readString(settings?.policyLabel)}
      variant={variant}
    />
  );
};

export default CookieConsentSection;
