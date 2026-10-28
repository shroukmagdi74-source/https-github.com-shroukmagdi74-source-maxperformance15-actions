/**
 * COMPLY-1 — Compliance bundle public surface.
 */

export {
  COOKIE_CONSENT_STORAGE_KEY,
  MARKETING_CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  readCookieConsent,
  readMarketingConsent,
  resetConsentCache,
  subscribeToConsent,
  writeCookieConsent,
  writeMarketingConsent,
  type ConsentDecision,
} from "./consentStore";

export {
  COOKIE_CONSENT_COPY,
  LEGAL_BUNDLE_COPY,
  LEGAL_DISCLAIMER,
  LEGAL_LOCALES,
  MARKETING_CONSENT_COPY,
  PRIVACY_POLICY_COPY,
  TERMS_COPY,
  parseLegalParagraphs,
  resolveLegalLocale,
  type LegalDocumentCopy,
  type LegalLocale,
} from "./legalCopy";

export {
  LEGAL_BUNDLE_PAGE_DEFINITIONS,
  LEGAL_BUNDLE_SECTION_TYPE,
  LEGAL_BUNDLE_TOTAL_ITEMS,
  buildLegalBundlePage,
  buildLegalBundlePlan,
  buildLegalBundleSectionSettings,
  type LegalBundleItem,
  type LegalBundlePlan,
  type LegalBundleState,
} from "./legalBundle";

export { CookieConsentBar } from "./CookieConsentBar";
export { LegalBundlePanel } from "./LegalBundlePanel";
export { MarketingConsentCheckbox } from "./MarketingConsentCheckbox";
export { PrivacyPolicySection } from "./PrivacyPolicySection";
export { TermsSection } from "./TermsSection";
