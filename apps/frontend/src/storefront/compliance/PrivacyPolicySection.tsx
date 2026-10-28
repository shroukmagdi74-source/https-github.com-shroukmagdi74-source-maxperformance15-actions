import React from "react";
import { LegalDocumentSection, type LegalDocumentSettings } from "./LegalDocumentSection";
import { PRIVACY_POLICY_COPY, parseLegalParagraphs, resolveLegalLocale } from "./legalCopy";

interface PrivacyPolicySectionProps {
  settings?: LegalDocumentSettings;
}

/**
 * Ready-to-edit privacy policy block. Default copy is generic and always keeps
 * the "review with your legal adviser" reminder visible.
 */
export const PrivacyPolicySection: React.FC<PrivacyPolicySectionProps> = ({ settings }) => {
  const locale = resolveLegalLocale(settings?.locale);
  const customParagraphs = parseLegalParagraphs(settings?.body);

  return (
    <LegalDocumentSection
      copy={PRIVACY_POLICY_COPY[locale]}
      settings={settings}
      testId="privacy-policy-section"
      headingId="storefront-privacy-policy-heading"
      paragraphs={customParagraphs}
    />
  );
};

export default PrivacyPolicySection;
