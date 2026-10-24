import { StorefrontSettings } from "../../../services/storefrontSettingsService";
import {
  DEFAULT_STOREFRONT_THEME_ID,
  getStorefrontThemePreset,
} from "../../../storefront/themes";
import {
  applyStorefrontPageOverrides,
  getStorefrontPageOverridesFromDesignTokens,
  upsertStorefrontPageOverridesInDesignTokens,
} from "../../../storefront/utils/pageOverrides";
import { resolveStorefrontThemeId } from "../../../utils/storefrontSettingsHelpers";
import { PDP_CHECKOUT_SECTION_ID } from "../../../storefront/utils/pdpCheckout";
import {
  DEFAULT_PDP_QUICK_ORDER_SETTINGS,
  getPdpQuickOrderSettingsFromDesignTokens,
  PdpQuickOrderSettings,
  upsertPdpQuickOrderSettingsInDesignTokens,
} from "../../../storefront/utils/pdpQuickOrderSettings";
import type { StorefrontSectionConfig } from "../../../storefront/types/theme.types";

export type StoreSettingsTab =
  | "branches"
  | "shipping"
  | "storefront"
  | "checkout"
  | "payment"
  | "footer"
  | "promotion"
  | "delivery"
  | "recommendations"
  | "features"
  | "homepage"
  | "product-gallery";

export const VALID_STORE_SETTINGS_TABS = new Set<StoreSettingsTab>([
  "branches",
  "shipping",
  "storefront",
  "checkout",
  "payment",
  "footer",
  "promotion",
  "delivery",
  "recommendations",
  "features",
  "homepage",
  "product-gallery",
]);

export const resolveRequestedTab = (value: string | null): StoreSettingsTab =>
  VALID_STORE_SETTINGS_TABS.has(value as StoreSettingsTab)
    ? (value as StoreSettingsTab)
    : "branches";

export type StorefrontSectionEntry = string | StorefrontSectionConfig;
export type PromotionSettingsState = Record<string, unknown>;

export const GOVERNORATE_CODE_ALIASES: Record<string, string> = {
  october: "6th-october",
  "6-october": "6th-october",
  zayed: "sheikh-zayed",
  "new-cairo-city": "new-cairo",
  may15: "15th-may",
  assiut: "asyut",
  cairo: "cairo",
  giza: "giza",
  qalyubia: "qalyubia",
  alexandria: "alexandria",
  beheira: "beheira",
  gharbia: "gharbia",
  sharqia: "sharqia",
  monufia: "monufia",
  dakahlia: "dakahlia",
  "port-said": "port-said",
  ismailia: "ismailia",
  suez: "suez",
  fayoum: "fayoum",
  "beni-suef": "beni-suef",
  minya: "minya",
  asyut: "asyut",
  sohag: "sohag",
  qena: "qena",
  luxor: "luxor",
  aswan: "aswan",
  "red-sea": "red-sea",
  "new-valley": "new-valley",
  matrouh: "matrouh",
  "north-sinai": "north-sinai",
  "south-sinai": "south-sinai",
  "6th-october": "6th-october",
  "sheikh-zayed": "sheikh-zayed",
  "new-cairo": "new-cairo",
  helwan: "helwan",
  "15th-may": "15th-may",
};

export const getStorefrontSectionType = (
  section: StorefrontSectionEntry,
): string => (typeof section === "string" ? section : section.type);

export const hasPdpCheckoutSection = (
  sections: StorefrontSectionEntry[],
): boolean =>
  sections.some(
    (section) => getStorefrontSectionType(section) === PDP_CHECKOUT_SECTION_ID,
  );

export const insertPdpCheckoutSection = (
  sections: StorefrontSectionEntry[],
): StorefrontSectionEntry[] => {
  if (hasPdpCheckoutSection(sections)) {
    return sections;
  }

  const nextSections = [...sections];
  const insertionAnchorTypes = ["conversion-stack", "product-info"];
  const anchorIndex = insertionAnchorTypes
    .map((anchorType) =>
      nextSections.findIndex(
        (section) => getStorefrontSectionType(section) === anchorType,
      ),
    )
    .find((index) => index >= 0);

  const pdpCheckoutSection: StorefrontSectionConfig = {
    type: PDP_CHECKOUT_SECTION_ID,
  };

  if (typeof anchorIndex === "number" && anchorIndex >= 0) {
    nextSections.splice(anchorIndex + 1, 0, pdpCheckoutSection);
    return nextSections;
  }

  nextSections.push(pdpCheckoutSection);
  return nextSections;
};

export const removePdpCheckoutSection = (
  sections: StorefrontSectionEntry[],
): StorefrontSectionEntry[] =>
  sections.filter(
    (section) => getStorefrontSectionType(section) !== PDP_CHECKOUT_SECTION_ID,
  );

export const resolvePdpCheckoutSections = (
  settings?: StorefrontSettings | null,
): StorefrontSectionEntry[] => {
  const themeId = resolveStorefrontThemeId(settings);
  const baseTheme = getStorefrontThemePreset(themeId);
  const pageOverrides = getStorefrontPageOverridesFromDesignTokens(
    settings?.designTokens,
  );
  const resolvedTheme = applyStorefrontPageOverrides(baseTheme, pageOverrides);

  return (resolvedTheme.pages.pdp?.sections || []) as StorefrontSectionEntry[];
};

export const resolvePdpCheckoutEnabled = (
  settings?: StorefrontSettings | null,
): boolean => {
  return settings?.productPageShowCheckoutForm !== false;
};

export const applyPdpCheckoutVisibilityToStorefrontSettings = (
  currentSettings?: StorefrontSettings | null,
  enabled = true,
): StorefrontSettings => {
  const nextSettings = {
    ...(currentSettings || ({} as StorefrontSettings)),
  };
  const designTokens =
    typeof nextSettings.designTokens === "object" && nextSettings.designTokens !== null
      ? nextSettings.designTokens
      : {};
  const pageOverrides = getStorefrontPageOverridesFromDesignTokens(designTokens);
  const currentPdpOverride = pageOverrides.pdp;
  const basePdpSections = (
    getStorefrontThemePreset(resolveStorefrontThemeId(nextSettings)).pages.pdp
      ?.sections || []
  ) as StorefrontSectionEntry[];
  const currentPdpSections =
    currentPdpOverride && Array.isArray(currentPdpOverride.sections)
      ? (currentPdpOverride.sections as StorefrontSectionEntry[])
      : basePdpSections;
  const nextPdpSections = enabled
    ? insertPdpCheckoutSection(currentPdpSections)
    : removePdpCheckoutSection(currentPdpSections);
  const nextPageOverrides = {
    ...pageOverrides,
    pdp: {
      ...(currentPdpOverride || {}),
      sections: nextPdpSections,
    },
  };

  return {
    ...nextSettings,
    productPageShowCheckoutForm: enabled,
    designTokens: upsertStorefrontPageOverridesInDesignTokens(
      designTokens,
      nextPageOverrides,
    ),
  };
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const applyPdpQuickOrderSettingsToStorefrontSettings = (
  currentSettings?: StorefrontSettings | null,
  pdpQuickOrderSettings?: PdpQuickOrderSettings,
): StorefrontSettings => {
  const nextSettings = {
    ...(currentSettings || ({} as StorefrontSettings)),
  };

  const normalizedSettings =
    pdpQuickOrderSettings || DEFAULT_PDP_QUICK_ORDER_SETTINGS;
  const nextDesignTokens = upsertPdpQuickOrderSettingsInDesignTokens(
    nextSettings.designTokens,
    normalizedSettings,
  );

  if (
    isRecord(nextDesignTokens) &&
    isRecord(nextDesignTokens.pageOverrides) &&
    isRecord((nextDesignTokens.pageOverrides as Record<string, unknown>).pdp)
  ) {
    const pdp = (nextDesignTokens.pageOverrides as Record<string, unknown>)
      .pdp as Record<string, unknown>;
    if (Array.isArray(pdp.sections)) {
      pdp.sections = pdp.sections.map((sectionEntry: unknown) => {
        if (
          sectionEntry &&
          typeof sectionEntry === "object" &&
          "type" in sectionEntry &&
          ((sectionEntry as { type: string }).type === "pdp-checkout" ||
            (sectionEntry as { type: string }).type === "pdpQuickOrder")
        ) {
          const currentSection = sectionEntry as {
            type: string;
            settings?: Record<string, unknown>;
          };
          return {
            ...currentSection,
            settings: {
              ...(currentSection.settings || {}),
              placement: normalizedSettings.placement,
              surfaceMode: normalizedSettings.surfaceMode,
              showQuantity: normalizedSettings.showQuantity,
              showOrderSummary: normalizedSettings.showOrderSummary,
              autoSelectVariants: normalizedSettings.autoSelectVariants,
              fields: normalizedSettings.fields,
            },
          };
        }
        return sectionEntry;
      });
    }
  }

  return {
    ...nextSettings,
    designTokens: nextDesignTokens,
  };
};

export const isExpectedOptionalLoadError = (error: unknown): boolean => {
  const status =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: unknown } }).response?.status ===
      "number"
      ? Number((error as { response?: { status?: number } }).response?.status)
      : 0;

  return status === 404;
};

export interface StoreSettingsProps {
  forcedTab?: StoreSettingsTab;
  hideNavigation?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}
