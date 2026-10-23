// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { StudioThemeGalleryPanel } from "../studio/StudioThemeGalleryPanel";
import { StudioLeftRail } from "../studio/StudioLeftRail";
import { getStorefrontThemePresetIds } from "../themes/index";

describe("Ticket MKT-1: Storefront Studio Theme Gallery (64 Themes) with Preview and Apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Panel renders themes (≥8 cards with names and colors)
  // ─────────────────────────────────────────────────────────────
  it("renders theme gallery panel with ≥8 cards with names, descriptions, and color swatches", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={{ themeId: "modern-minimal" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    const gallery = screen.getByTestId("studio-theme-gallery");
    expect(gallery).toBeDefined();

    // Verify all preset IDs exist or at least ≥ 8 cards are visible
    const allPresetIds = getStorefrontThemePresetIds();
    expect(allPresetIds.length).toBeGreaterThanOrEqual(8);

    // Check specific popular themes are present
    const sampleIds = [
      "modern-minimal",
      "bold-fashion",
      "elegant-luxe",
      "khemet-fashion-eg",
      "allure",
      "dental-lab-elite",
      "redline-auto",
      "airlume-ai",
    ];

    sampleIds.forEach((id) => {
      const card = screen.getByTestId(`theme-card-${id}`);
      expect(card).toBeDefined();
      expect(screen.getByTestId(`theme-swatches-${id}`)).toBeDefined();
      expect(screen.getByTestId(`theme-preview-btn-${id}`)).toBeDefined();
      expect(screen.getByTestId(`theme-apply-btn-${id}`)).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Preview does not change settings
  // ─────────────────────────────────────────────────────────────
  it("opens preview modal showing details (colors, font, pages, sections) without altering store settings", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();
    const initialTokens = {
      themeId: "modern-minimal",
      pages: { customPage: { title: "صفحتي المخصصة" } },
    };

    render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={initialTokens}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Click preview on bold-fashion
    const previewBtn = screen.getByTestId("theme-preview-btn-bold-fashion");
    fireEvent.click(previewBtn);

    // Modal is opened
    const modal = screen.getByTestId("theme-preview-modal");
    expect(modal).toBeDefined();
    expect(within(modal).getByText(/معاينة الثيم/)).toBeDefined();
    expect(within(modal).getByText(/ألوان الثيم/)).toBeDefined();
    expect(within(modal).getByText(/أقسام الصفحة الرئيسية/)).toBeDefined();
    expect(within(modal).getByText(/الخط المعتمد/)).toBeDefined();
    expect(within(modal).getByText(/عدد الصفحات المتاحة/)).toBeDefined();

    // Close modal via close button
    const closeBtn = screen.getByTestId("theme-preview-close");
    fireEvent.click(closeBtn);

    // Modal is dismissed
    expect(screen.queryByTestId("theme-preview-modal")).toBeNull();

    // CRITICAL: onApplyTheme was never called, settings remain unchanged
    expect(mockApply).not.toHaveBeenCalled();
    expect(initialTokens.themeId).toBe("modern-minimal");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Apply changes themeId only
  // ─────────────────────────────────────────────────────────────
  it("shows confirmation modal and applies theme by updating themeId in designTokens", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();
    const designTokens = {
      themeId: "modern-minimal",
      customSetting: "keep-me",
    };

    render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={designTokens}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Click apply on elegant-luxe
    const applyBtn = screen.getByTestId("theme-apply-btn-elegant-luxe");
    fireEvent.click(applyBtn);

    // Confirmation dialog appears with exact ticket text
    const confirmModal = screen.getByTestId("theme-confirm-modal");
    expect(confirmModal).toBeDefined();
    expect(
      screen.getByText(/«هيتم تغيير شكل المتجر — التعديلات الحالية محفوظة كإصدار في السجل»/)
    ).toBeDefined();

    // Confirm apply
    const confirmBtn = screen.getByTestId("confirm-apply-theme-btn");
    fireEvent.click(confirmBtn);

    // Modal dismissed
    expect(screen.queryByTestId("theme-confirm-modal")).toBeNull();

    // Verify onApplyTheme called with elegant-luxe
    expect(mockApply).toHaveBeenCalledTimes(1);
    const [appliedThemeId, nextTokens] = mockApply.mock.calls[0];
    expect(appliedThemeId).toBe("elegant-luxe");
    expect(nextTokens.themeId).toBe("elegant-luxe");
    expect(nextTokens.customSetting).toBe("keep-me");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Pages and merchant work preserved after apply
  // ─────────────────────────────────────────────────────────────
  it("strictly preserves pages, pageOverrides, pageStyles, global, typography, and i18n when applying a theme", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const merchantCustomPages = {
      home: { id: "home", sections: [{ type: "custom-hero", key: "h1" }] },
      about: { id: "about", sections: [{ type: "custom-about", key: "a1" }] },
    };
    const merchantPageOverrides = {
      home: { title: "متجر الفخامة" },
    };
    const merchantPageStyles = {
      home: { accent: "#ff0055", density: "compact" },
    };
    const merchantGlobal = {
      header: { sticky: true, transparent: false },
    };
    const merchantTypography = {
      fontFamily: "Tajawal",
      headingWeight: "700",
    };
    const merchantI18n = {
      defaultLocale: "ar",
      supportedLocales: ["ar", "en"],
    };

    const initialDesignTokens = {
      themeId: "modern-minimal",
      pages: merchantCustomPages,
      pageOverrides: merchantPageOverrides,
      pageStyles: merchantPageStyles,
      global: merchantGlobal,
      typography: merchantTypography,
      i18n: merchantI18n,
    };

    render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={initialDesignTokens}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Apply redline-auto
    const applyBtn = screen.getByTestId("theme-apply-btn-redline-auto");
    fireEvent.click(applyBtn);

    const confirmBtn = screen.getByTestId("confirm-apply-theme-btn");
    fireEvent.click(confirmBtn);

    expect(mockApply).toHaveBeenCalledTimes(1);
    const [newThemeId, resultingTokens] = mockApply.mock.calls[0];

    // themeId changed
    expect(newThemeId).toBe("redline-auto");
    expect(resultingTokens.themeId).toBe("redline-auto");

    // All merchant customizations remain 100% intact
    expect(resultingTokens.pages).toEqual(merchantCustomPages);
    expect(resultingTokens.pageOverrides).toEqual(merchantPageOverrides);
    expect(resultingTokens.pageStyles).toEqual(merchantPageStyles);
    expect(resultingTokens.global).toEqual(merchantGlobal);
    expect(resultingTokens.typography).toEqual(merchantTypography);
    expect(resultingTokens.i18n).toEqual(merchantI18n);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Applied badge correctly marks active theme
  // ─────────────────────────────────────────────────────────────
  it("correctly displays 'المطبق حاليًا' badge on the active theme and disables its apply button", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const { rerender } = render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={{ themeId: "modern-minimal" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Active theme has active badge
    const activeBadge = screen.getByTestId("active-theme-badge");
    expect(activeBadge.textContent).toContain("المطبق حاليًا");

    // modern-minimal card contains the active badge
    const modernMinimalCard = screen.getByTestId("theme-card-modern-minimal");
    expect(within(modernMinimalCard).getByTestId("active-theme-badge")).toBeDefined();

    // apply button on modern-minimal says "مطبق" and is disabled
    const modernApplyBtn = screen.getByTestId("theme-apply-btn-modern-minimal");
    expect(modernApplyBtn.textContent).toContain("مطبق");
    expect((modernApplyBtn as HTMLButtonElement).disabled).toBe(true);

    // Other theme (e.g. bold-fashion) does not have the active badge
    const boldFashionCard = screen.getByTestId("theme-card-bold-fashion");
    expect(within(boldFashionCard).queryByTestId("active-theme-badge")).toBeNull();
    const boldApplyBtn = screen.getByTestId("theme-apply-btn-bold-fashion");
    expect(boldApplyBtn.textContent).toContain("تطبيق");
    expect((boldApplyBtn as HTMLButtonElement).disabled).toBe(false);

    // Switch active theme via props
    rerender(
      <StudioThemeGalleryPanel
        currentThemeId="bold-fashion"
        designTokens={{ themeId: "bold-fashion" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Now bold-fashion is active
    expect(within(screen.getByTestId("theme-card-bold-fashion")).getByTestId("active-theme-badge")).toBeDefined();
    expect(within(screen.getByTestId("theme-card-modern-minimal")).queryByTestId("active-theme-badge")).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Search filter filters themes
  // ─────────────────────────────────────────────────────────────
  it("filters themes list in real-time by search query and restores list upon clearing", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={{ themeId: "modern-minimal" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    const searchInput = screen.getByTestId("theme-search-input");

    // Search for "redline"
    fireEvent.change(searchInput, { target: { value: "redline" } });
    expect(screen.getByTestId("theme-card-redline-auto")).toBeDefined();
    expect(screen.queryByTestId("theme-card-modern-minimal")).toBeNull();
    expect(screen.queryByTestId("theme-card-bold-fashion")).toBeNull();

    // Clear search
    const clearBtn = screen.getByTestId("theme-search-clear");
    fireEvent.click(clearBtn);

    // Both are back
    expect(screen.getByTestId("theme-card-modern-minimal")).toBeDefined();
    expect(screen.getByTestId("theme-card-bold-fashion")).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Cancel application dismisses modal without apply
  // ─────────────────────────────────────────────────────────────
  it("dismisses confirmation dialog on cancel without triggering onApplyTheme", () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    render(
      <StudioThemeGalleryPanel
        currentThemeId="modern-minimal"
        designTokens={{ themeId: "modern-minimal" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    const applyBtn = screen.getByTestId("theme-apply-btn-bold-fashion");
    fireEvent.click(applyBtn);

    const cancelBtn = screen.getByTestId("theme-cancel-apply");
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId("theme-confirm-modal")).toBeNull();
    expect(mockApply).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // 8. StudioLeftRail includes 'themes' tab
  // ─────────────────────────────────────────────────────────────
  it("renders 'themes' tab in StudioLeftRail and invokes onSelectTab upon click", () => {
    const mockSelectTab = vi.fn();
    const mockToggleTab = vi.fn();

    render(
      <StudioLeftRail
        activeTab="elements"
        onSelectTab={mockSelectTab}
        onToggleTab={mockToggleTab}
        isPanelOpen={true}
      />
    );

    const themesTabBtn = screen.getByTestId("studio-left-rail-themes");
    expect(themesTabBtn).toBeDefined();
    expect(themesTabBtn.textContent).toContain("الثيمات");

    fireEvent.click(themesTabBtn);
    expect(mockSelectTab).toHaveBeenCalledWith("themes");
  });
});
