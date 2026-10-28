import React from "react";
import {
  LEGAL_DISCLAIMER,
  resolveLegalLocale,
  type LegalDocumentCopy,
  type LegalLocale,
} from "./legalCopy";

export interface LegalDocumentSettings {
  locale?: LegalLocale | string;
  badge?: string;
  title?: string;
  subtitle?: string;
  body?: unknown;
  lastUpdated?: string;
  showDisclaimer?: boolean;
  [key: string]: unknown;
}

interface LegalDocumentSectionProps {
  copy: LegalDocumentCopy;
  settings?: LegalDocumentSettings;
  testId: string;
  headingId: string;
  /** Paragraphs provided by the caller override the defaults when present. */
  paragraphs?: readonly string[];
}

export const LegalDocumentSection: React.FC<LegalDocumentSectionProps> = ({
  copy,
  settings,
  testId,
  headingId,
  paragraphs,
}) => {
  const locale = resolveLegalLocale(settings?.locale);
  const badge = settings?.badge || copy.badge;
  const title = settings?.title || copy.title;
  const subtitle = settings?.subtitle || copy.subtitle;
  const lastUpdated = typeof settings?.lastUpdated === "string" ? settings.lastUpdated.trim() : "";
  const showDisclaimer = settings?.showDisclaimer !== false;
  const bodyParagraphs = paragraphs && paragraphs.length > 0 ? paragraphs : copy.paragraphs;

  return (
    <section
      className="w-full bg-white px-4 py-10 sm:px-6 lg:px-10"
      data-testid={testId}
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-3xl">
        <span className="inline-block w-fit border-b border-[#e16244] pb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#e16244]">
          {badge}
        </span>
        <h2
          id={headingId}
          className="mt-4 text-2xl font-semibold leading-tight text-[#171717] sm:text-[2rem]"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-7 text-[#4b5563]">{subtitle}</p>
        ) : null}
        {lastUpdated ? (
          <p className="mt-2 text-[11.5px] text-[#6b7280]">
            {copy.lastUpdatedLabel}: {lastUpdated}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          {bodyParagraphs.map((paragraph, index) => (
            <p
              key={`legal-paragraph-${index}`}
              className="text-[13.5px] leading-7 text-[#374151]"
              data-testid={`${testId}-paragraph`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {showDisclaimer ? (
          <p
            className="mt-6 rounded-xl border border-[#f0d9b5] bg-[#fff8ec] px-4 py-3 text-[12px] leading-6 text-[#7a5a1f]"
            data-testid="legal-disclaimer"
          >
            {copy.disclaimer || LEGAL_DISCLAIMER[locale]}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default LegalDocumentSection;
