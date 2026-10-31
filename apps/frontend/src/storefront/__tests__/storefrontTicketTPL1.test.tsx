// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  INDUSTRY_PRESETS,
  getIndustryPreset,
  buildPresetPage,
  type IndustryPreset,
} from "../presets/industryPresets";
import { StudioTemplateGalleryPanel } from "../studio/StudioTemplateGalleryPanel";
import { StudioLeftRail } from "../studio/StudioLeftRail";

describe("Ticket TPL-1: Industry Presets Library & Studio Gallery Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Preset Catalog Integrity (6 Industries)
  // ─────────────────────────────────────────────────────────────
  describe("1. Preset Catalog Integrity", () => {
    it("provides the core industry presets (at least 6)", () => {
      expect(INDUSTRY_PRESETS.length).toBeGreaterThanOrEqual(6);
      const expectedIds = ["fashion", "food", "electronics", "beauty", "home", "perfume"];
      const actualIds = INDUSTRY_PRESETS.map((p) => p.id);
      expectedIds.forEach((id) => {
        expect(actualIds).toContain(id);
      });
    });

    it("assigns the exact required accent color to each sector", () => {
      const accents: Record<string, string> = {
        fashion: "#B45309",
        food: "#B91C1C",
        electronics: "#1D4ED8",
        beauty: "#BE185D",
        home: "#4B5563",
        perfume: "#8B5E3C",
      };

      INDUSTRY_PRESETS.filter((p) => p.id in accents).forEach((preset) => {
        expect(preset.accent).toBe(accents[preset.id]);
        expect(preset.style.accent).toBe(accents[preset.id]);
      });
    });

    it("getIndustryPreset returns matching preset or undefined", () => {
      const fashion = getIndustryPreset("fashion");
      expect(fashion?.label).toBe("أزياء وأحذية");

      const unknown = getIndustryPreset("nonexistent-sector");
      expect(unknown).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Section Composition & Order (Each Preset >= 5 sections)
  // ─────────────────────────────────────────────────────────────
  describe("2. Section Composition & Order", () => {
    it("ensures every preset has at least 5 sections (all have exactly 6)", () => {
      INDUSTRY_PRESETS.forEach((preset) => {
        expect(preset.sections.length).toBeGreaterThanOrEqual(5);
        expect(preset.sections.length).toBe(6);
      });
    });

    it("verifies the exact required section sequence for all 6 presets", () => {
      const expectedSequences: Record<string, string[]> = {
        fashion: [
          "hero-banner",
          "category-strip",
          "featured-products",
          "lookbook-showcase",
          "promo-strip",
          "newsletter",
        ],
        food: [
          "hero-banner",
          "menu-highlights",
          "offer-bento",
          "review-circle",
          "promo-strip",
          "info-content",
        ],
        electronics: [
          "hero-sidebar",
          "product-grid",
          "features-bar",
          "before-after",
          "faq-accordion",
          "newsletter",
        ],
        beauty: [
          "hero-banner",
          "featured-collections",
          "review-circle",
          "social-gallery",
          "offer-bento",
          "newsletter",
        ],
        home: [
          "hero-banner",
          "featured-collections",
          "story-parallax",
          "features-bar",
          "info-content",
          "newsletter",
        ],
        perfume: [
          "hero-banner",
          "image-hotspot",
          "lookbook-showcase",
          "review-circle",
          "promo-strip",
          "newsletter",
        ],
      };

      INDUSTRY_PRESETS.filter((p) => p.id in expectedSequences).forEach((preset) => {
        const actualTypes = preset.sections.map((s) => s.type);
        expect(actualTypes).toEqual(expectedSequences[preset.id]);
      });
    });

    it("verifies specific variants are mapped as specified in the ticket", () => {
      const fashionHero = getIndustryPreset("fashion")?.sections[0];
      expect(fashionHero?.variant).toBe("bold");

      const foodHero = getIndustryPreset("food")?.sections[0];
      expect(foodHero?.variant).toBe("dark");

      const elecGrid = getIndustryPreset("electronics")?.sections[1];
      expect(elecGrid?.variant).toBe("grid");

      const elecFeatures = getIndustryPreset("electronics")?.sections[2];
      expect(elecFeatures?.variant).toBe("trust-strip");

      const beautyHero = getIndustryPreset("beauty")?.sections[0];
      expect(beautyHero?.variant).toBe("soft");

      const homeHero = getIndustryPreset("home")?.sections[0];
      expect(homeHero?.variant).toBe("editorial");

      const perfumeHero = getIndustryPreset("perfume")?.sections[0];
      expect(perfumeHero?.variant).toBe("dark-luxe");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. buildPresetPage Returns Valid StorefrontPageConfig
  // ─────────────────────────────────────────────────────────────
  describe("3. buildPresetPage Functionality", () => {
    it("returns a valid StorefrontPageConfig with sections and unique keys", () => {
      const pageConfig = buildPresetPage("fashion");
      expect(pageConfig.id).toBe("fashion");
      expect(pageConfig.title).toBe("أزياء وأحذية");
      expect(pageConfig.sections.length).toBe(6);

      const keys = pageConfig.sections.map((s: any) => s.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(6);

      // Verify each section has type and settings
      pageConfig.sections.forEach((s: any) => {
        expect(typeof s.type).toBe("string");
        expect(typeof s.settings).toBe("object");
        expect(s.settings).not.toBeNull();
      });
    });

    it("throws an informative error for unknown preset IDs", () => {
      expect(() => buildPresetPage("invalid-id")).toThrowError(
        /Industry preset not found: invalid-id/
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Zero Unverified Marketing Claims / Numbers in Texts
  // ─────────────────────────────────────────────────────────────
  describe("4. Text Quality & Egyptian Practical Phrasing Audit", () => {
    it("contains zero unverified statistics, fake counts or superlative claims", () => {
      const bannedPatterns = [
        /\+?10[,.]?000/i,
        /\+?50[,.]?000/i,
        /100%/i,
        /الأفضل في مصر/i,
        /أفضل متجر/i,
        /الأول في مصر/i,
        /رقم 1/i,
        /الأسرع على الإطلاق/i,
      ];

      INDUSTRY_PRESETS.forEach((preset) => {
        const jsonStr = JSON.stringify(preset);
        bannedPatterns.forEach((pattern) => {
          expect(pattern.test(jsonStr)).toBe(false);
        });
      });
    });

    it("includes practical Egyptian e-commerce value propositions", () => {
      const allText = JSON.stringify(INDUSTRY_PRESETS);
      expect(allText).toContain("شحن لكل المحافظات");
      expect(allText).toContain("الدفع عند الاستلام");
      expect(allText).toContain("معاينة قبل الاستلام");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. StudioTemplateGalleryPanel UI Rendering
  // ─────────────────────────────────────────────────────────────
  describe("5. StudioTemplateGalleryPanel UI Component", () => {
    it("renders gallery panel with all 6 preset cards", () => {
      const mockApply = vi.fn();
      const mockClose = vi.fn();

      render(
        <StudioTemplateGalleryPanel
          activePageKey="home"
          onApplyPreset={mockApply}
          onClose={mockClose}
        />
      );

      const gallery = screen.getByTestId("studio-template-gallery");
      expect(gallery).toBeDefined();

      const expectedIds = ["fashion", "food", "electronics", "beauty", "home", "perfume"];
      expectedIds.forEach((id) => {
        expect(screen.getByTestId(`template-card-${id}`)).toBeDefined();
        expect(screen.getByTestId(`template-accent-${id}`)).toBeDefined();
        expect(screen.getByTestId(`template-sections-count-${id}`).textContent).toContain("6 أقسام");
      });
    });

    it("toggles mini-preview details when clicking معاينة", () => {
      const mockApply = vi.fn();
      const mockClose = vi.fn();

      render(
        <StudioTemplateGalleryPanel
          activePageKey="home"
          onApplyPreset={mockApply}
          onClose={mockClose}
        />
      );

      const previewBtn = screen.getByTestId("template-preview-btn-fashion");
      expect(previewBtn.textContent).toContain("معاينة");

      // Click to expand preview
      fireEvent.click(previewBtn);
      expect(previewBtn.textContent).toContain("إخفاء التفاصيل");
      expect(screen.getByText(/الهوية البصرية للقالب/)).toBeDefined();

      // Click again to hide
      fireEvent.click(previewBtn);
      expect(previewBtn.textContent).toContain("معاينة");
      expect(screen.queryByText(/الهوية البصرية للقالب/)).toBeNull();
    });

    it("shows confirmation modal upon clicking استخدم القالب, with warning message", () => {
      const mockApply = vi.fn();
      const mockClose = vi.fn();

      render(
        <StudioTemplateGalleryPanel
          activePageKey="home"
          onApplyPreset={mockApply}
          onClose={mockClose}
        />
      );

      const applyBtn = screen.getByTestId("template-apply-btn-fashion");
      fireEvent.click(applyBtn);

      const modal = screen.getByTestId("template-confirm-modal");
      expect(modal).toBeDefined();
      expect(
        screen.getByText(/هيتم استبدال محتوى الصفحة الحالية — التغييرات الحالية محفوظة كإصدار في السجل/)
      ).toBeDefined();

      // Cancel button dismisses modal without applying
      const cancelBtn = screen.getByTestId("template-cancel-apply");
      fireEvent.click(cancelBtn);
      expect(screen.queryByTestId("template-confirm-modal")).toBeNull();
      expect(mockApply).not.toHaveBeenCalled();

      // Click apply again and confirm
      fireEvent.click(applyBtn);
      const confirmBtn = screen.getByTestId("template-confirm-apply-fashion");
      fireEvent.click(confirmBtn);

      expect(mockApply).toHaveBeenCalledTimes(1);
      const appliedArg = mockApply.mock.calls[0][0] as IndustryPreset;
      expect(appliedArg.id).toBe("fashion");
      expect(screen.queryByTestId("template-confirm-modal")).toBeNull();
    });

    it("calls onClose when clicking close button", () => {
      const mockApply = vi.fn();
      const mockClose = vi.fn();

      render(
        <StudioTemplateGalleryPanel
          activePageKey="home"
          onApplyPreset={mockApply}
          onClose={mockClose}
        />
      );

      const closeBtn = screen.getByTestId("template-gallery-close");
      fireEvent.click(closeBtn);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. StudioLeftRail Integration
  // ─────────────────────────────────────────────────────────────
  describe("6. StudioLeftRail Tab Integration", () => {
    it("renders the templates tab in the left rail with correct test-id", () => {
      const mockSelect = vi.fn();
      const mockToggle = vi.fn();

      render(
        <StudioLeftRail
          activeTab="templates"
          onSelectTab={mockSelect}
          onToggleTab={mockToggle}
          isPanelOpen={true}
        />
      );

      const templatesBtn = screen.getByTestId("studio-left-rail-templates");
      expect(templatesBtn).toBeDefined();
      expect(templatesBtn.getAttribute("title")).toBe("قوالب");
      expect(templatesBtn.getAttribute("aria-pressed")).toBe("true");

      fireEvent.click(templatesBtn);
      expect(mockToggle).toHaveBeenCalledWith("templates");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Template Application State Update (Acceptance Criteria Simulation)
  // ─────────────────────────────────────────────────────────────
  describe("7. Application to Active Page & Style Binding Simulation", () => {
    it("replaces activePage sections and updates pageStyles accent/density/radius", () => {
      const initialDesignTokens = {
        pages: {
          home: {
            id: "home",
            sections: [{ type: "old-section", key: "old-1" }],
          },
        },
        pageStyles: {
          home: { accent: "#000000", density: "compact" },
        },
      };

      const preset = getIndustryPreset("fashion")!;
      const presetConfig = buildPresetPage(preset.id);

      // Simulation of StorefrontStudioShell's handleApplyIndustryPreset
      const targetPageKey = "home";
      const nextPages = {
        ...initialDesignTokens.pages,
        [targetPageKey]: {
          ...initialDesignTokens.pages.home,
          sections: presetConfig.sections,
        },
      };

      const nextPageStyles = {
        ...initialDesignTokens.pageStyles,
        [targetPageKey]: {
          accent: preset.style.accent,
          density: preset.style.density,
          radius: preset.style.radius,
        },
      };

      const nextTokens = {
        ...initialDesignTokens,
        pages: nextPages,
        pageStyles: nextPageStyles,
      };

      // Acceptance Criteria 33 verification:
      // sections.length >= 6 and pageStyles.home.accent = #B45309
      expect(nextTokens.pages.home.sections.length).toBeGreaterThanOrEqual(6);
      expect(nextTokens.pageStyles.home.accent).toBe("#B45309");
      expect(nextTokens.pageStyles.home.density).toBe("normal");
      expect(nextTokens.pageStyles.home.radius).toBe(8);

      // Verify sections are in the exact specified order
      const appliedSectionTypes = nextTokens.pages.home.sections.map((s: any) => s.type);
      expect(appliedSectionTypes).toEqual([
        "hero-banner",
        "category-strip",
        "featured-products",
        "lookbook-showcase",
        "promo-strip",
        "newsletter",
      ]);
    });
  });
});
