/* @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  ARABIC_FONTS,
  ARABIC_FONT_DEFINITIONS,
  formatStoreFontFamily,
  isArabicFont,
  resolveStoreTypographyVars,
  ensureDocumentFontAvailable,
} from "../utils/arabicTypography";
import {
  resolvePageStyleVars,
  type StorefrontThemeInput,
} from "../engine/themeResolverCore";
import { resolveStorefrontTheme } from "../engine/themeResolver";
import { StorefrontThemeProvider, useStorefrontTheme } from "../engine/ThemeProvider";
import { StorefrontSectionFrame } from "../layout/StorefrontSectionFrame";
import HeadingElement from "../sections/elements/HeadingElement";
import TextElement from "../sections/elements/TextElement";
import { StudioThemeSettingsPanel } from "../studio/StudioThemeSettingsPanel";
import { StudioPageStylePopover } from "../studio/StudioPageStylePopover";

// Helper component to inspect storefront computed styles
const SectionLiveInspector: React.FC = () => {
  const { pageStyleVars } = useStorefrontTheme();
  return (
    <StorefrontSectionFrame
      element={
        <div data-testid="section-content">
          <HeadingElement settings={{ text: "عنوان تجريبي", level: "h2" }} />
          <TextElement settings={{ content: "نص الفقرة التجريبية", size: "md" }} />
        </div>
      }
      index={0}
      sectionEntry={{
        type: "richtext",
        key: "sf-section-0",
      }}
    />
  );
};

describe("Ticket TYPO-1: مكتبة خطوط عربية + ضبط تايبوغرافي عربي", () => {
  beforeEach(() => {
    // Ensure document.fonts mock is initialized for test environment
    ensureDocumentFontAvailable("Noto Kufi Arabic");
  });

  afterEach(() => {
    cleanup();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. معيار القبول 1: اختيار «Noto Kufi Arabic» من الإعدادات
  // ─────────────────────────────────────────────────────────────
  it("Criterion 1: Selecting 'Noto Kufi Arabic' sets fontFamily starting with 'Noto Kufi Arabic' and document.fonts.check returns true", () => {
    const themeInput: StorefrontThemeInput = {
      themeId: "modern-minimal",
      designTokens: {
        typography: {
          fontFamily: "Noto Kufi Arabic",
        },
      },
    };

    const resolved = resolveStorefrontTheme(themeInput);
    const vars = resolvePageStyleVars(resolved, "home");

    // CSS var starts with 'Noto Kufi Arabic'
    expect(vars["--store-font-family"]).toContain("Noto Kufi Arabic");
    expect(vars["--store-font-family"]).toBe(
      "'Noto Kufi Arabic', 'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif"
    );

    // Render live storefront section
    render(
      <StorefrontThemeProvider initialTheme={themeInput} activePageKey="home">
        <SectionLiveInspector />
      </StorefrontThemeProvider>
    );

    const sectionEl = document.querySelector('[data-storefront-section="true"]') as HTMLElement;
    expect(sectionEl).toBeTruthy();

    const computedFont = window.getComputedStyle(sectionEl).fontFamily;
    // Cleans quotes and verifies starting family
    const cleanComputed = computedFont.replace(/^['"]/, "");
    expect(cleanComputed.startsWith("Noto Kufi Arabic")).toBe(true);

    // Verify document.fonts.check
    expect(document.fonts.check('16px "Noto Kufi Arabic"')).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. معيار القبول 2: baseFontSize=18 -> --store-font-size-base: 18px ومقاس نص فعلي 18px
  // ─────────────────────────────────────────────────────────────
  it("Criterion 2: baseFontSize=18 generates --store-font-size-base: 18px and actual text size 18px on text element", () => {
    const themeInput: StorefrontThemeInput = {
      themeId: "modern-minimal",
      designTokens: {
        typography: {
          fontFamily: "Cairo",
          baseFontSize: 18,
        },
      },
    };

    const resolved = resolveStorefrontTheme(themeInput);
    const vars = resolvePageStyleVars(resolved, "home");

    expect(vars["--store-font-size-base"]).toBe("18px");

    render(
      <StorefrontThemeProvider initialTheme={themeInput} activePageKey="home">
        <SectionLiveInspector />
      </StorefrontThemeProvider>
    );

    const textEl = document.querySelector('[data-storefront-element="text"]') as HTMLElement;
    expect(textEl).toBeTruthy();
    expect(window.getComputedStyle(textEl).fontSize).toBe("18px");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. معيار القبول 3: lineHeight=1.8 -> يظهر في computed style
  // ─────────────────────────────────────────────────────────────
  it("Criterion 3: lineHeight=1.8 generates --store-line-height: 1.8 and appears in computed style", () => {
    const themeInput: StorefrontThemeInput = {
      themeId: "modern-minimal",
      designTokens: {
        typography: {
          fontFamily: "Amiri",
          lineHeight: 1.8,
        },
      },
    };

    const resolved = resolveStorefrontTheme(themeInput);
    const vars = resolvePageStyleVars(resolved, "home");

    expect(vars["--store-line-height"]).toBe("1.8");

    render(
      <StorefrontThemeProvider initialTheme={themeInput} activePageKey="home">
        <SectionLiveInspector />
      </StorefrontThemeProvider>
    );

    const sectionEl = document.querySelector('[data-storefront-section="true"]') as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(window.getComputedStyle(sectionEl).lineHeight).toBe("1.8");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. معيار القبول 4: headingWeight=800 -> العناوين font-weight: 800
  // ─────────────────────────────────────────────────────────────
  it("Criterion 4: headingWeight=800 sets heading elements to font-weight: 800", () => {
    const themeInput: StorefrontThemeInput = {
      themeId: "modern-minimal",
      designTokens: {
        typography: {
          fontFamily: "Changa",
          headingWeight: 800,
        },
      },
    };

    const resolved = resolveStorefrontTheme(themeInput);
    const vars = resolvePageStyleVars(resolved, "home");

    expect(vars["--store-heading-weight"]).toBe("800");

    render(
      <StorefrontThemeProvider initialTheme={themeInput} activePageKey="home">
        <SectionLiveInspector />
      </StorefrontThemeProvider>
    );

    const headingEl = document.querySelector('[data-storefront-element="heading"]') as HTMLElement;
    expect(headingEl).toBeTruthy();
    expect(window.getComputedStyle(headingEl).fontWeight).toBe("800");
  });

  // ─────────────────────────────────────────────────────────────
  // 5. معيار القبول 5: letter-spacing = 0 دائمًا على أقسام وخطوط عربية
  // ─────────────────────────────────────────────────────────────
  it("Criterion 5: letter-spacing is strictly forced to 0 for Arabic fonts, ignoring user adjustments", () => {
    // Test with various Arabic fonts and intentional attempt to specify letter-spacing: 4px
    const arabicFontsToTest = ["Cairo", "Noto Kufi Arabic", "Reem Kufi", "El Messiri", "Rubik"];

    arabicFontsToTest.forEach((font) => {
      const vars = resolveStoreTypographyVars({
        fontFamily: font,
        letterSpacing: "4px", // User attempt to set spacing
      });

      // Strict enforcement: MUST be '0'
      expect(vars["--store-letter-spacing"]).toBe("0");
    });

    const themeInput: StorefrontThemeInput = {
      themeId: "modern-minimal",
      designTokens: {
        typography: {
          fontFamily: "Noto Naskh Arabic",
          letterSpacing: "2px",
        },
      },
    };

    render(
      <StorefrontThemeProvider initialTheme={themeInput} activePageKey="home">
        <SectionLiveInspector />
      </StorefrontThemeProvider>
    );

    const sectionEl = document.querySelector('[data-storefront-section="true"]') as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(window.getComputedStyle(sectionEl).letterSpacing).toBe("0");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. مكتبة الخطوط العربية (8 جديدة + 3 حالية = 11 خطاً) وسلامة الـ Fallback
  // ─────────────────────────────────────────────────────────────
  it("Criterion 6: All 8 new Arabic fonts resolve with safe fallback stack ending in system-ui, sans-serif", () => {
    const expectedNewFonts = [
      "IBM Plex Sans Arabic",
      "Noto Kufi Arabic",
      "Noto Naskh Arabic",
      "Reem Kufi",
      "El Messiri",
      "Changa",
      "Rubik",
      "Amiri",
    ];

    expect(expectedNewFonts.length).toBe(8);

    expectedNewFonts.forEach((fontName) => {
      expect(isArabicFont(fontName)).toBe(true);
      const stack = formatStoreFontFamily(fontName);
      expect(stack.startsWith(`'${fontName}'`)).toBe(true);
      expect(stack).toContain("system-ui");
      expect(stack).toContain("sans-serif");
    });

    // Total registered fonts count is >= 11
    expect(ARABIC_FONTS.length).toBeGreaterThanOrEqual(11);
    expect(ARABIC_FONT_DEFINITIONS.length).toBeGreaterThanOrEqual(11);
  });

  // ─────────────────────────────────────────────────────────────
  // 7. المعاينة في الإعدادات وطابع الصفحة: عرض «أبجد هوز — 0123»
  // ─────────────────────────────────────────────────────────────
  it("Criterion 7: Studio Theme Settings and Page Style Popover render preview text 'أبجد هوز — 0123' for each font", () => {
    const onUpdateTokens = vi.fn();

    // 1. StudioThemeSettingsPanel
    const { unmount: unmountPanel } = render(
      <StudioThemeSettingsPanel
        designTokens={{
          typography: {
            fontFamily: "Noto Kufi Arabic",
            baseFontSize: 18,
            lineHeight: 1.8,
            headingWeight: 800,
            bodyWeight: 400,
          },
        }}
        onUpdateThemeTokens={onUpdateTokens}
      />
    );

    // Font select and preview options
    const select = screen.getByTestId("theme-font-family-select") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("Noto Kufi Arabic");

    // Check preview button for Reem Kufi
    const reemOption = screen.getByTestId("font-option-Reem Kufi");
    expect(reemOption).toBeTruthy();
    expect(reemOption.textContent).toContain("أبجد هوز — 0123");

    // Click to select
    fireEvent.click(reemOption);
    expect(onUpdateTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        typography: expect.objectContaining({ fontFamily: "Reem Kufi" }),
      })
    );

    unmountPanel();

    // 2. StudioPageStylePopover
    const onUpdateStyle = vi.fn();
    render(
      <StudioPageStylePopover
        activePageKey="home"
        pageStyle={{
          fontFamily: "Cairo",
          accent: "#2563eb",
          density: "normal",
          radius: 8,
        }}
        onApplyPreset={vi.fn()}
        onUpdateStyle={onUpdateStyle}
        onResetStyle={vi.fn()}
      />
    );

    // Open popover
    const triggerBtn = screen.getByTestId("page-style-scope-btn");
    fireEvent.click(triggerBtn);

    const popoverSelect = screen.getByTestId("page-style-font-select") as HTMLSelectElement;
    expect(popoverSelect).toBeTruthy();

    const amiriOption = screen.getByTestId("page-style-font-option-Amiri");
    expect(amiriOption).toBeTruthy();
    expect(amiriOption.textContent).toContain("أبجد هوز — 0123");

    fireEvent.click(amiriOption);
    expect(onUpdateStyle).toHaveBeenCalledWith(
      expect.objectContaining({ fontFamily: "Amiri" })
    );
  });

  // ─────────────────────────────────────────────────────────────
  // 8. هوية الصفحة المستقلة (PageStyleScope) وتوافق الـ Fallback
  // ─────────────────────────────────────────────────────────────
  it("Criterion 8: Page-scoped typography overrides theme globals cleanly with safe fallbacks", () => {
    const themeInput: StorefrontThemeInput = {
      themeId: "modern-minimal",
      designTokens: {
        typography: {
          fontFamily: "Cairo",
          baseFontSize: 16,
          lineHeight: 1.5,
          headingWeight: 700,
        },
        pageStyles: {
          shop: {
            fontFamily: "El Messiri",
            baseFontSize: 18,
            lineHeight: 1.8,
            headingWeight: 900,
          },
        },
      },
    };

    const resolved = resolveStorefrontTheme(themeInput);

    // Shop page has overridden typography
    const shopVars = resolvePageStyleVars(resolved, "shop");
    expect(shopVars["--store-font-family"]).toContain("El Messiri");
    expect(shopVars["--store-font-size-base"]).toBe("18px");
    expect(shopVars["--store-line-height"]).toBe("1.8");
    expect(shopVars["--store-heading-weight"]).toBe("900");
    expect(shopVars["--store-letter-spacing"]).toBe("0");

    // Home page retains global Cairo
    const homeVars = resolvePageStyleVars(resolved, "home");
    expect(homeVars["--store-font-family"]).toContain("Cairo");
    expect(homeVars["--store-font-size-base"]).toBe("16px");
    expect(homeVars["--store-line-height"]).toBe("1.5");
    expect(homeVars["--store-heading-weight"]).toBe("700");
  });
});
