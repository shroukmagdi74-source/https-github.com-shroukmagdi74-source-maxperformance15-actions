import React from "react";
import { LegalDocumentSection, type LegalDocumentSettings } from "./LegalDocumentSection";
import { TERMS_COPY, parseLegalParagraphs, resolveLegalLocale } from "./legalCopy";

interface TermsSectionProps {
  settings?: LegalDocumentSettings;
}

/**
 * Ready-to-edit terms of use block. Default copy is generic and always keeps the
 * "review with your legal adviser" reminder visible.
 */
export const TermsSection: React.FC<TermsSectionProps> = ({ settings }) => {
  const locale = resolveLegalLocale(settings?.locale);
  const customParagraphs = parseLegalParagraphs(settings?.body);

  return (
    <LegalDocumentSection
      copy={TERMS_COPY[locale]}
      settings={settings}
      testId="terms-section"
      headingId="storefront-terms-heading"
      paragraphs={customParagraphs}
    />
  );
};

export default TermsSection;
