/**
 * COMPLY-1 — Legal bundle planning.
 *
 * Pure, idempotent logic shared by the studio panel and the studio shell:
 * one cookie-consent bar section plus two policy pages. Nothing is added twice,
 * and the caller receives the exact list of items that are still missing.
 */

import type { LegalLocale } from "./legalCopy";

export const LEGAL_BUNDLE_SECTION_TYPE = "cookie-consent";

export interface LegalBundlePageDefinition {
  pageKey: string;
  sectionType: string;
  title: Record<LegalLocale, string>;
}

export const LEGAL_BUNDLE_PAGE_DEFINITIONS: readonly LegalBundlePageDefinition[] = [
  {
    pageKey: "privacy",
    sectionType: "privacy-policy",
    title: { ar: "سياسة الخصوصية", en: "Privacy policy" },
  },
  {
    pageKey: "terms",
    sectionType: "terms-of-use",
    title: { ar: "شروط الاستخدام", en: "Terms of use" },
  },
] as const;

export const LEGAL_BUNDLE_TOTAL_ITEMS = 1 + LEGAL_BUNDLE_PAGE_DEFINITIONS.length;

export type LegalBundleItem =
  | {
      kind: "section";
      id: string;
      sectionType: string;
      pageKey: string;
      label: Record<LegalLocale, string>;
    }
  | {
      kind: "page";
      id: string;
      sectionType: string;
      pageKey: string;
      label: Record<LegalLocale, string>;
    };

export interface LegalBundleState {
  sectionTypes: readonly string[];
  pageKeys: readonly string[];
}

export interface LegalBundlePlan {
  items: LegalBundleItem[];
  skipped: string[];
  addedCount: number;
  next: LegalBundleState;
}

const normalize = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export interface BuildLegalBundleOptions {
  /** Page that receives the consent bar (defaults to "home"). */
  pageKey?: string;
  locale?: LegalLocale;
}

/**
 * Computes what still needs to be added. Re-running it against `next`
 * returns zero items — that is the no-duplicate guarantee.
 */
export const buildLegalBundlePlan = (
  state: LegalBundleState,
  options: BuildLegalBundleOptions = {}
): LegalBundlePlan => {
  const pageKey = normalize(options.pageKey) || "home";
  const existingSections = new Set((state.sectionTypes || []).map(normalize));
  const existingPages = new Set((state.pageKeys || []).map(normalize));

  const items: LegalBundleItem[] = [];
  const skipped: string[] = [];

  if (existingSections.has(LEGAL_BUNDLE_SECTION_TYPE)) {
    skipped.push(LEGAL_BUNDLE_SECTION_TYPE);
  } else {
    items.push({
      kind: "section",
      id: LEGAL_BUNDLE_SECTION_TYPE,
      sectionType: LEGAL_BUNDLE_SECTION_TYPE,
      pageKey,
      label: { ar: "شريط موافقة الكوكيز", en: "Cookie consent bar" },
    });
  }

  LEGAL_BUNDLE_PAGE_DEFINITIONS.forEach((definition) => {
    if (existingPages.has(definition.pageKey)) {
      skipped.push(definition.pageKey);
      return;
    }
    items.push({
      kind: "page",
      id: definition.pageKey,
      sectionType: definition.sectionType,
      pageKey: definition.pageKey,
      label: definition.title,
    });
  });

  const nextSectionTypes = new Set(existingSections);
  const nextPageKeys = new Set(existingPages);
  items.forEach((item) => {
    if (item.kind === "section") {
      nextSectionTypes.add(normalize(item.sectionType));
    } else {
      nextPageKeys.add(normalize(item.pageKey));
    }
  });

  return {
    items,
    skipped,
    addedCount: items.length,
    next: {
      sectionTypes: Array.from(nextSectionTypes),
      pageKeys: Array.from(nextPageKeys),
    },
  };
};

/**
 * Section settings used when the bundle inserts the bar into a page.
 */
export const buildLegalBundleSectionSettings = (
  locale: LegalLocale = "ar"
): Record<string, unknown> => ({
  locale,
  variant: "inline",
  policyHref: "/privacy",
});

/**
 * Creates the page payload (sections included) for one policy page.
 */
export const buildLegalBundlePage = (
  definition: LegalBundlePageDefinition,
  locale: LegalLocale = "ar"
): Record<string, unknown> => ({
  id: definition.pageKey,
  title: definition.title[locale],
  label: definition.title[locale],
  sections: [
    {
      key: `${definition.sectionType}-${definition.pageKey}`,
      type: definition.sectionType,
      settings: { locale, showDisclaimer: true },
    },
  ],
});
