import React, { useCallback, useEffect, useState } from "react";
import {
  COOKIE_CONSENT_COPY,
  resolveLegalLocale,
  type LegalLocale,
} from "./legalCopy";
import {
  readCookieConsent,
  writeCookieConsent,
  type ConsentDecision,
} from "./consentStore";
import { sendAnalyticsEvent } from "../analytics/beacon";

export interface CookieConsentBarProps {
  locale?: LegalLocale;
  title?: string;
  description?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  policyHref?: string;
  policyLabel?: string;
  pageKey?: string;
  companyId?: string;
  companySlug?: string;
  /** `fixed` pins the bar to the viewport bottom; `inline` keeps it in the page flow. */
  variant?: "inline" | "fixed";
  /** Set false for the studio preview / tests so nothing is written to storage. */
  persist?: boolean;
  /** Render even after a decision was stored (studio preview). */
  preview?: boolean;
  /** Overrides the stored decision on first render. */
  initialDecision?: ConsentDecision | null;
  onDecision?: (decision: ConsentDecision) => void;
  className?: string;
}

export const CookieConsentBar: React.FC<CookieConsentBarProps> = ({
  locale,
  title,
  description,
  acceptLabel,
  rejectLabel,
  policyHref,
  policyLabel,
  pageKey = "home",
  companyId,
  companySlug,
  variant = "inline",
  persist = true,
  preview = false,
  initialDecision,
  onDecision,
  className = "",
}) => {
  const resolvedLocale = resolveLegalLocale(locale);
  const copy = COOKIE_CONSENT_COPY[resolvedLocale];

  const [decision, setDecision] = useState<ConsentDecision | null>(() => {
    if (initialDecision !== undefined) {
      return initialDecision;
    }
    return persist ? readCookieConsent() : null;
  });

  // Keep the bar in sync when another surface (settings page, bar instance)
  // records a decision while this one is mounted.
  useEffect(() => {
    if (!persist || initialDecision !== undefined) {
      return;
    }
    setDecision(readCookieConsent());
  }, [persist, initialDecision]);

  const handleDecision = useCallback(
    (nextDecision: ConsentDecision) => {
      if (persist) {
        writeCookieConsent(nextDecision);
      }
      setDecision(nextDecision);

      // The consent event is the only beacon allowed on "granted"; a rejection
      // dispatches nothing at all (zero tracking before and after refusal).
      if (nextDecision === "granted") {
        sendAnalyticsEvent({
          companyId,
          companySlug,
          pageKey,
          eventType: "consent_update",
          meta: { status: "granted", surface: "cookie-bar" },
        });
      }

      onDecision?.(nextDecision);
    },
    [companyId, companySlug, onDecision, pageKey, persist]
  );

  if (decision !== null && !preview) {
    return null;
  }

  const wrapperClass =
    variant === "fixed"
      ? "fixed inset-x-0 bottom-0 z-[80] px-3 pb-3 sm:px-5 sm:pb-5"
      : "w-full px-3 py-4 sm:px-5";

  return (
    <div
      className={`${wrapperClass} ${className}`.trim()}
      data-testid="cookie-consent-bar"
      data-consent-variant={variant}
      dir={resolvedLocale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl border border-[#d8dbe0] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex-1">
          <p className="text-sm font-bold text-[#171b21]" data-testid="cookie-consent-title">
            {title || copy.title}
          </p>
          <p className="mt-1 text-[12.5px] leading-6 text-[#4b5563]" data-testid="cookie-consent-description">
            {description || copy.description}
          </p>
          {policyHref ? (
            <a
              href={policyHref}
              className="mt-1 inline-block text-[12px] font-semibold text-[#2b6cf6] underline underline-offset-2"
              data-testid="cookie-consent-policy-link"
            >
              {policyLabel || copy.policyLabel}
            </a>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            data-testid="cookie-consent-reject"
            onClick={() => handleDecision("denied")}
            className="h-10 rounded-xl border border-[#cfd4dc] bg-white px-4 text-[12.5px] font-semibold text-[#3b424d] transition-colors hover:bg-[#f3f4f6]"
          >
            {rejectLabel || copy.reject}
          </button>
          <button
            type="button"
            data-testid="cookie-consent-accept"
            onClick={() => handleDecision("granted")}
            className="h-10 rounded-xl bg-[#2b6cf6] px-4 text-[12.5px] font-bold text-white transition-colors hover:bg-[#1f57cb]"
          >
            {acceptLabel || copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBar;
