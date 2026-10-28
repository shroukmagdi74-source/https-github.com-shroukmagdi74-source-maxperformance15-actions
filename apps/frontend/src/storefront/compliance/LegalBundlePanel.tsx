import React, { useCallback, useMemo, useState } from "react";
import { XMarkIcon, ShieldCheckIcon, DocumentTextIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { LEGAL_BUNDLE_COPY, resolveLegalLocale, type LegalLocale } from "./legalCopy";
import {
  LEGAL_BUNDLE_PAGE_DEFINITIONS,
  LEGAL_BUNDLE_SECTION_TYPE,
  buildLegalBundlePlan,
  type LegalBundlePlan,
  type LegalBundleState,
} from "./legalBundle";

export interface LegalBundlePanelProps {
  /** Page that receives the cookie bar. */
  activePageKey?: string;
  /** Section types already present on the active page. */
  existingSectionTypes?: readonly string[];
  /** Page keys already configured on the store. */
  existingPageKeys?: readonly string[];
  locale?: LegalLocale;
  onApplyBundle?: (plan: LegalBundlePlan) => void;
  onClose?: () => void;
}

const EMPTY_STATE: LegalBundleState = { sectionTypes: [], pageKeys: [] };

export const LegalBundlePanel: React.FC<LegalBundlePanelProps> = ({
  activePageKey = "home",
  existingSectionTypes = [],
  existingPageKeys = [],
  locale,
  onApplyBundle,
  onClose,
}) => {
  const resolvedLocale = resolveLegalLocale(locale);
  const copy = LEGAL_BUNDLE_COPY[resolvedLocale];

  const [addedThisSession, setAddedThisSession] = useState<LegalBundleState>(EMPTY_STATE);
  const [totalAdded, setTotalAdded] = useState(0);

  const mergedState = useMemo<LegalBundleState>(
    () => ({
      sectionTypes: [...existingSectionTypes, ...addedThisSession.sectionTypes],
      pageKeys: [...existingPageKeys, ...addedThisSession.pageKeys],
    }),
    [addedThisSession, existingPageKeys, existingSectionTypes]
  );

  const plan = useMemo(
    () => buildLegalBundlePlan(mergedState, { pageKey: activePageKey, locale: resolvedLocale }),
    [activePageKey, mergedState, resolvedLocale]
  );

  const handleApply = useCallback(() => {
    if (plan.addedCount === 0) {
      return;
    }
    onApplyBundle?.(plan);
    setAddedThisSession(plan.next);
    setTotalAdded((previous) => previous + plan.addedCount);
  }, [onApplyBundle, plan]);

  const rows: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; added: boolean }> = [
    {
      id: LEGAL_BUNDLE_SECTION_TYPE,
      label: copy.barItem,
      icon: ShieldCheckIcon,
      added: plan.skipped.includes(LEGAL_BUNDLE_SECTION_TYPE),
    },
    ...LEGAL_BUNDLE_PAGE_DEFINITIONS.map((definition) => ({
      id: definition.pageKey,
      label: definition.pageKey === "privacy" ? copy.privacyItem : copy.termsItem,
      icon: definition.pageKey === "privacy" ? LockClosedIcon : DocumentTextIcon,
      added: plan.skipped.includes(definition.pageKey),
    })),
  ];

  const summary = totalAdded > 0 ? copy.appliedSummary(totalAdded) : copy.pendingSummary(plan.addedCount);

  return (
    <div
      className="flex h-full w-[320px] max-w-[90vw] shrink-0 flex-col border-e border-[#0c0d0f] bg-[#202226] text-[#e8eaee] select-none z-10"
      data-testid="legal-bundle-panel"
      dir={resolvedLocale === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-start justify-between px-3.5 py-3 border-b border-[#2c2f35]">
        <div>
          <b className="text-[12.5px] font-bold text-[#f0f2f5]">{copy.title}</b>
          <p className="mt-0.5 text-[10px] leading-4 text-[#8b9199]">{copy.subtitle}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-1 text-[#9ba0a8] hover:bg-[#2c2f35] hover:text-[#e8eaee]"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#7c828a]">
          {copy.pageLabel}: <span className="text-[#b9bec6]">{activePageKey}</span>
        </p>

        <ul className="flex flex-col gap-1.5">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <li
                key={row.id}
                data-testid={`legal-bundle-item-${row.id}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#2c2f35] bg-[#191b1f] px-2.5 py-2"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#7fa6ff]" />
                  <span className="text-[11.5px] text-[#dfe3e8]">{row.label}</span>
                </span>
                <span
                  data-testid={`legal-bundle-item-status-${row.id}`}
                  className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${
                    row.added
                      ? "bg-[#1f3a2b] text-[#7ee0a5]"
                      : "bg-[#2b2f38] text-[#a9b0ba]"
                  }`}
                >
                  {row.added ? "موجود" : "جاهز"}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 text-[10.5px] leading-5 text-[#8b9199]" data-testid="legal-bundle-note">
          {copy.existingNote}
        </p>

        <p
          className="mt-3 rounded-xl border border-[#4a3c22] bg-[#2a2418] px-2.5 py-2 text-[10.5px] leading-5 text-[#e3c68d]"
          data-testid="legal-bundle-reminder"
        >
          {copy.reminder}
        </p>
      </div>

      <div className="border-t border-[#2c2f35] px-3.5 py-3">
        <p className="mb-2 text-[10.5px] text-[#9ba0a8]" data-testid="legal-bundle-summary">
          {summary}
        </p>
        <button
          type="button"
          data-testid="legal-bundle-apply"
          onClick={handleApply}
          disabled={plan.addedCount === 0}
          aria-disabled={plan.addedCount === 0}
          className={`h-10 w-full rounded-xl text-[12px] font-bold transition-colors ${
            plan.addedCount === 0
              ? "cursor-not-allowed bg-[#2a2d33] text-[#6d737b]"
              : "bg-[#2b6cf6] text-white hover:bg-[#1f57cb]"
          }`}
        >
          {totalAdded > 0 || plan.addedCount === 0 ? copy.applied : copy.apply}
        </button>
        <p className="mt-2 text-center text-[10px] text-[#6d737b]" data-testid="legal-bundle-count">
          {totalAdded}
        </p>
      </div>
    </div>
  );
};

export default LegalBundlePanel;
