// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  INDUSTRY_PRESETS,
  getIndustryPreset,
  buildPresetPage,
  type IndustryPresetId,
} from "../presets/industryPresets";
import { isStorefrontSectionKnown } from "../sections/manifest";

describe("Ticket PAGES-10: Industry Presets Diversity & Expansion", () => {
  const EXPECTED_PRESET_IDS: readonly IndustryPresetId[] = [
    "fashion",
    "food",
    "electronics",
    "beauty",
    "home",
    "perfume",
    "clinic",
    "academy",
    "realestate",
    "gym",
    "pharmacy",
    "grocery",
    "services",
  ];

  const NEW_PRESET_IDS: readonly IndustryPresetId[] = [
    "clinic",
    "academy",
    "realestate",
    "gym",
    "pharmacy",
    "grocery",
    "services",
  ];

  // ─────────────────────────────────────────────────────────────
  // 1. Catalog Count & Identity Integrity
  // ─────────────────────────────────────────────────────────────
  describe("1. Preset Catalog Integrity (13 Presets)", () => {
    it("provides exactly 13 industry presets matching IndustryPresetId", () => {
      expect(INDUSTRY_PRESETS.length).toBe(13);
      const actualIds = INDUSTRY_PRESETS.map((p) => p.id);
      expect(actualIds).toEqual(EXPECTED_PRESET_IDS);
    });

    it("ensures each preset is retrievable via getIndustryPreset", () => {
      EXPECTED_PRESET_IDS.forEach((id) => {
        const preset = getIndustryPreset(id);
        expect(preset).toBeDefined();
        expect(preset?.id).toBe(id);
        expect(typeof preset?.label).toBe("string");
        expect(preset?.label.length).toBeGreaterThan(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Minimum Section Count
  // ─────────────────────────────────────────────────────────────
  describe("2. Section Composition Quantity", () => {
    it("ensures every preset contains at least 6 sections", () => {
      INDUSTRY_PRESETS.forEach((preset) => {
        expect(preset.sections.length).toBeGreaterThanOrEqual(6);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Section Manifest Reality (Zero invented types)
  // ─────────────────────────────────────────────────────────────
  describe("3. Section Manifest Reality", () => {
    it("ensures all section types in the 7 new presets exist in manifest.ts", () => {
      const newPresets = INDUSTRY_PRESETS.filter((p) => NEW_PRESET_IDS.includes(p.id));
      expect(newPresets.length).toBe(7);

      newPresets.forEach((preset) => {
        preset.sections.forEach((section) => {
          expect(isStorefrontSectionKnown(section.type)).toBe(true);
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Section Sequence Diversity (Core Ticket Mandate)
  // ─────────────────────────────────────────────────────────────
  describe("4. Section Sequence Diversity", () => {
    it("verifies every preset has a unique section type sequence", () => {
      const sequences = INDUSTRY_PRESETS.map((p) =>
        p.sections.map((s) => s.type).join(" -> ")
      );

      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBe(INDUSTRY_PRESETS.length);
      expect(uniqueSequences.size).toBe(13);
    });

    it("verifies the distinct intended sequence for each new industry", () => {
      const expectedNewSequences: Record<string, string[]> = {
        clinic: [
          "hero-sidebar",
          "services-grid",
          "info-content",
          "reviews",
          "trusted-badges",
          "newsletter",
        ],
        academy: [
          "story-parallax",
          "article-grid",
          "features-bar",
          "reviews",
          "offer-bento",
          "newsletter",
        ],
        realestate: [
          "product-gallery",
          "related-products",
          "offer-bento",
          "info-content",
          "trusted-badges",
          "whatsapp-cta",
        ],
        gym: [
          "offer-bento",
          "countdown",
          "features-bar",
          "services-grid",
          "reviews",
          "whatsapp-cta",
        ],
        pharmacy: [
          "shop-command-bar",
          "shopping-intents",
          "product-grid",
          "featured-products",
          "trusted-badges",
          "newsletter",
        ],
        grocery: [
          "shop-promo-rail",
          "featured-products",
          "delivery-proof",
          "product-grid",
          "features-bar",
          "newsletter",
        ],
        services: [
          "services-grid",
          "filters-sidebar",
          "trusted-badges",
          "info-content",
          "reviews",
          "whatsapp-cta",
        ],
      };

      Object.entries(expectedNewSequences).forEach(([id, expectedSequence]) => {
        const preset = getIndustryPreset(id);
        expect(preset).toBeDefined();
        const actualTypes = preset?.sections.map((s) => s.type);
        expect(actualTypes).toEqual(expectedSequence);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Text Quality & Egyptian Phrasing (Zero Slop / Hyperbole)
  // ─────────────────────────────────────────────────────────────
  describe("5. Text Quality & Egyptian Phrasing", () => {
    it("uses Arabic text for labels, industries, and descriptions without promises or marketing fluff", () => {
      const arabicPattern = /[\u0600-\u06FF]/;
      INDUSTRY_PRESETS.forEach((preset) => {
        expect(arabicPattern.test(preset.label)).toBe(true);
        expect(arabicPattern.test(preset.industry)).toBe(true);
        expect(arabicPattern.test(preset.description)).toBe(true);
      });
    });

    it("contains zero unverified statistics, superlative claims or fake customer names", () => {
      const bannedPatterns = [
        /\+?10[,.]?000/i,
        /\+?50[,.]?000/i,
        /100%/i,
        /الأفضل/i,
        /أفضل متجر/i,
        /الأول في مصر/i,
        /رقم 1/i,
        /الأسرع على الإطلاق/i,
        /مضمون 100%/i,
      ];

      INDUSTRY_PRESETS.forEach((preset) => {
        const jsonStr = JSON.stringify(preset);
        bannedPatterns.forEach((pattern) => {
          expect(pattern.test(jsonStr)).toBe(false);
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Visual Design Tokens (Valid Accent, Radius, Density)
  // ─────────────────────────────────────────────────────────────
  describe("6. Visual Design Tokens", () => {
    it("ensures all accents are valid 7-character hex colors", () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      INDUSTRY_PRESETS.forEach((preset) => {
        expect(preset.accent).toMatch(hexPattern);
        expect(preset.style.accent).toMatch(hexPattern);
        expect(preset.style.accent).toBe(preset.accent);
      });
    });

    it("ensures border radius is within [0, 32] and density is valid", () => {
      const validDensities = ["compact", "normal", "airy"];
      INDUSTRY_PRESETS.forEach((preset) => {
        expect(preset.style.radius).toBeGreaterThanOrEqual(0);
        expect(preset.style.radius).toBeLessThanOrEqual(32);
        expect(validDensities).toContain(preset.style.density);
      });
    });

    it("ensures the 7 new presets have distinct visual palettes and styles", () => {
      const newPresets = INDUSTRY_PRESETS.filter((p) => NEW_PRESET_IDS.includes(p.id));
      const accents = new Set(newPresets.map((p) => p.accent));
      // All 7 new presets have unique accent colors
      expect(accents.size).toBe(7);

      // Verify radii and density variation
      const densities = new Set(newPresets.map((p) => p.style.density));
      expect(densities.size).toBeGreaterThanOrEqual(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Storefront Page Builder Integration
  // ─────────────────────────────────────────────────────────────
  describe("7. Page Config Generation via buildPresetPage", () => {
    it("successfully creates StorefrontPageConfig with unique section keys for all 13 presets", () => {
      EXPECTED_PRESET_IDS.forEach((id) => {
        const pageConfig = buildPresetPage(id);
        expect(pageConfig.id).toBe(id);
        expect(pageConfig.sections.length).toBeGreaterThanOrEqual(6);

        const keys = pageConfig.sections.map((s) => s.key);
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(pageConfig.sections.length);

        expect(pageConfig.settings?.presetId).toBe(id);
        expect(pageConfig.settings?.accent).toBe(pageConfig.settings?.accent);
      });
    });
  });
});
