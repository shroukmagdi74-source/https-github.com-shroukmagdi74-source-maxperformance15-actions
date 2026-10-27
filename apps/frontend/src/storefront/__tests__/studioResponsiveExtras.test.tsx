// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, renderHook, act, cleanup } from "@testing-library/react";
import {
  generateResponsiveCss,
  resolveFontSizeValue,
  formatClampFontSize,
  validateBreakpoints,
  sanitizeBreakpoints,
  DEFAULT_STUDIO_BREAKPOINTS,
  buildSectionStyle,
  styleObjectToCssDeclarations,
  hasDeviceOverrides,
} from "../studio/utils/studioStyleUtils";
import { buildElementTypographyStyle } from "../sections/elements/elementTypography";
import {
  StudioDeviceVisibilityControl,
  StudioBreakpointsControl,
} from "../studio/inspector/StudioResponsiveControls";
import { StudioInspectorLayoutTab } from "../studio/inspector/StudioInspectorLayoutTab";
import { useStorefrontStudioState } from "../studio/hooks/useStorefrontStudioState";

// Mock ThemeProvider
vi.mock("../engine/ThemeProvider", () => ({
  useStorefrontTheme: () => ({
    theme: { id: "modern-minimal", name: "Modern Minimal" },
    pageStyleVars: {},
  }),
}));

// Mock useCartStore
vi.mock("../store/useCartStore", async (importOriginal) => {
  const actual = await importOriginal<any>();
  const mockCartState = { items: [], isOpen: false };
  const fn: any = vi.fn((selector) =>
    selector ? selector(mockCartState) : mockCartState
  );
  fn.getState = vi.fn(() => mockCartState);
  fn.setState = vi.fn();
  return {
    ...actual,
    useCartStore: fn,
    DEFAULT_STOREFRONT_CART_STORAGE_NAME: "test-cart",
  };
});

describe("Storefront Ticket RESP-1 — Device Hide, Clamp Typography & Custom Breakpoints", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Acceptance 2: hiddenOn.mobile=true outputs display:none in mobile media query only
  // ─────────────────────────────────────────────────────────────
  it("1. hiddenOn.mobile=true generates @media (max-width: 767px) with display:none and NO display:none in desktop", () => {
    const settings = {
      hiddenOn: { mobile: true },
      paddingTop: 40,
    };

    const selector = '[data-section-key="sec-hero"]';
    const css = generateResponsiveCss(settings, selector);

    expect(css).toBeTruthy();
    // 1. Mobile media query uses max-width: 767px
    expect(css).toContain("@media (max-width: 767px)");
    // 2. Contains display: none in mobile media query
    expect(css).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*display:\s*none/);
    // 3. Desktop media query is NOT generated for display:none
    expect(css).not.toContain("@media (min-width: 1024px)");
    expect(css).not.toContain("@media (min-width: 1025px)");

    // 4. Base desktop inline style must NOT have display: none (not generic inline)
    const desktopStyle = buildSectionStyle(settings, undefined, "desktop");
    expect(desktopStyle.display).toBeUndefined();

    // 5. hasDeviceOverrides detects hiddenOn.mobile
    expect(hasDeviceOverrides(settings, "mobile")).toBe(true);
    expect(hasDeviceOverrides(settings, "tablet")).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Acceptance 3: clamp: {min:18,vw:2.5,max:32} -> font-size: clamp(18px, 2.5vw, 32px)
  // ─────────────────────────────────────────────────────────────
  it("2. clamp: {min:18,vw:2.5,max:32} resolves to font-size: clamp(18px, 2.5vw, 32px)", () => {
    const clampConfig = { min: 18, vw: 2.5, max: 32 };

    // Format utility
    const formatted = formatClampFontSize(clampConfig);
    expect(formatted).toBe("clamp(18px, 2.5vw, 32px)");

    // resolveFontSizeValue
    const resolved = resolveFontSizeValue(clampConfig);
    expect(resolved).toBe("clamp(18px, 2.5vw, 32px)");

    // buildSectionStyle
    const sectionStyle = buildSectionStyle({ fontSize: clampConfig });
    expect(sectionStyle.fontSize).toBe("clamp(18px, 2.5vw, 32px)");

    // styleObjectToCssDeclarations
    const decls = styleObjectToCssDeclarations({ fontSize: clampConfig });
    expect(decls).toContain("font-size: clamp(18px, 2.5vw, 32px);");

    // Element typography
    const elementStyle = buildElementTypographyStyle({ fontSize: clampConfig as any });
    expect(elementStyle.fontSize).toBe("clamp(18px, 2.5vw, 32px)");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Acceptance 4: Custom breakpoint mobile=600 generates media query using 600
  // ─────────────────────────────────────────────────────────────
  it("3. Custom breakpoint mobile=600 generates @media (max-width: 600px)", () => {
    const settings = {
      breakpoints: { mobile: 600, tablet: 900, desktop: 1200 },
      responsive: {
        mobile: {
          paddingTop: 12,
        },
      },
    };

    const selector = '[data-section-key="sec-custom-bp"]';
    const css = generateResponsiveCss(settings, selector);

    expect(css).toBeTruthy();
    expect(css).toContain("@media (max-width: 600px)");
    expect(css).toContain("padding-top: 12px !important;");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Acceptance 5: Negative test - mobile=900, tablet=700 rejected with clear error + old value kept
  // ─────────────────────────────────────────────────────────────
  it("4. Negative test: mobile=900, tablet=700 (intersecting) is rejected with clear error and keeps old value", () => {
    const current = { mobile: 767, tablet: 1024, desktop: 1280 };
    const invalidAttempt = { mobile: 900, tablet: 700 };

    // 1. Direct validation rejects intersecting values
    const validation = validateBreakpoints(invalidAttempt, current);
    expect(validation.valid).toBe(false);
    expect(validation.error).toBeTruthy();
    expect(validation.error).toMatch(/متقاطعة|أصغر/);

    // 2. Sanitizer preserves old breakpoints
    const sanitized = sanitizeBreakpoints(invalidAttempt, current);
    expect(sanitized.error).toBeTruthy();
    expect(sanitized.breakpoints.mobile).toBe(767);
    expect(sanitized.breakpoints.tablet).toBe(1024);
    expect(sanitized.breakpoints.desktop).toBe(1280);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Negative test: Out-of-bounds breakpoints (< 320 or > 1920) rejected
  // ─────────────────────────────────────────────────────────────
  it("5. Out-of-bounds breakpoints (< 320 or > 1920) are rejected with clear error bounds", () => {
    const current = DEFAULT_STUDIO_BREAKPOINTS;

    // mobile too small (< 320)
    const tooSmall = validateBreakpoints({ mobile: 200 }, current);
    expect(tooSmall.valid).toBe(false);
    expect(tooSmall.error).toContain("320");

    // desktop too large (> 1920)
    const tooLarge = validateBreakpoints({ desktop: 2500 }, current);
    expect(tooLarge.valid).toBe(false);
    expect(tooLarge.error).toContain("1920");

    // tablet >= desktop intersecting
    const tabletIntersecting = validateBreakpoints({ tablet: 1300, desktop: 1200 }, current);
    expect(tabletIntersecting.valid).toBe(false);
    expect(tabletIntersecting.error).toMatch(/متقاطعة|أصغر/);
  });

  // ─────────────────────────────────────────────────────────────
  // 6. hiddenOn for tablet and desktop devices
  // ─────────────────────────────────────────────────────────────
  it("6. hiddenOn.tablet=true and hiddenOn.desktop=true generate respective media queries", () => {
    // Tablet hide
    const tabletSettings = {
      hiddenOn: { tablet: true },
    };
    const tabletCss = generateResponsiveCss(tabletSettings, ".sec-tab");
    expect(tabletCss).toContain("@media (min-width: 768px)");
    expect(tabletCss).toContain("display: none !important;");

    // Desktop hide
    const desktopSettings = {
      hiddenOn: { desktop: true },
    };
    const desktopCss = generateResponsiveCss(desktopSettings, ".sec-desk");
    expect(desktopCss).toContain("@media (min-width: 1024px)");
    expect(desktopCss).toContain("display: none !important;");
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Clamp support in responsive overrides and generateResponsiveCss
  // ─────────────────────────────────────────────────────────────
  it("7. Clamp font size works seamlessly inside responsive device overrides", () => {
    const settings = {
      fontSize: 20,
      responsive: {
        mobile: {
          fontSize: { min: 14, vw: 3, max: 22 },
        },
      },
    };

    const css = generateResponsiveCss(settings, "#hero");
    expect(css).toBeTruthy();
    expect(css).toContain("font-size: clamp(14px, 3vw, 22px) !important;");
  });

  // ─────────────────────────────────────────────────────────────
  // 8. StudioDeviceVisibilityControl UI renders and triggers onChange
  // ─────────────────────────────────────────────────────────────
  it("8. StudioDeviceVisibilityControl renders 3 device toggles and emits updated hiddenOn object", () => {
    const onChangeMock = vi.fn();

    render(
      <StudioDeviceVisibilityControl
        hiddenOn={{ mobile: false, tablet: false, desktop: false }}
        onChange={onChangeMock}
      />
    );

    const mobileBtn = screen.getByTestId("visibility-btn-mobile");
    expect(mobileBtn).toBeTruthy();
    expect(mobileBtn.getAttribute("data-hidden")).toBe("false");

    // Click mobile button to toggle hidden
    fireEvent.click(mobileBtn);
    expect(onChangeMock).toHaveBeenCalledWith({
      mobile: true,
      tablet: false,
      desktop: false,
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 9. StudioBreakpointsControl UI rejects invalid input and displays error
  // ─────────────────────────────────────────────────────────────
  it("9. StudioBreakpointsControl displays validation error when intersecting values are typed", () => {
    const onChangeMock = vi.fn();

    render(
      <StudioBreakpointsControl
        breakpoints={{ mobile: 767, tablet: 1024, desktop: 1280 }}
        onChange={onChangeMock}
      />
    );

    const mobileInput = screen.getByTestId("input-breakpoint-mobile") as HTMLInputElement;
    expect(mobileInput.value).toBe("767");

    // Type mobile = 1100 (which is > tablet 1024)
    fireEvent.change(mobileInput, { target: { value: "1100" } });

    // Error alert must be rendered
    const errorAlert = screen.getByTestId("breakpoint-error-message");
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toMatch(/متقاطعة|أصغر/);

    // onChange must NOT be called with invalid values
    expect(onChangeMock).not.toHaveBeenCalledWith(expect.objectContaining({ mobile: 1100 }));
  });

  // ─────────────────────────────────────────────────────────────
  // 10. StudioInspectorLayoutTab incorporates responsive accordion with visibility & breakpoints
  // ─────────────────────────────────────────────────────────────
  it("10. StudioInspectorLayoutTab renders responsive & breakpoints section with working controls", () => {
    const onUpdateFieldMock = vi.fn();

    render(
      <StudioInspectorLayoutTab
        settings={{
          hiddenOn: { mobile: true },
          breakpoints: { mobile: 640, tablet: 960, desktop: 1280 },
        }}
        onUpdateField={onUpdateFieldMock}
      />
    );

    // Mobile button reflects hidden state
    const mobileBtn = screen.getByTestId("visibility-btn-mobile");
    expect(mobileBtn.getAttribute("data-hidden")).toBe("true");

    // Toggling tablet calls onUpdateField with hiddenOn
    const tabletBtn = screen.getByTestId("visibility-btn-tablet");
    fireEvent.click(tabletBtn);
    expect(onUpdateFieldMock).toHaveBeenCalledWith(
      "hiddenOn",
      expect.objectContaining({ mobile: true, tablet: true })
    );

    // Breakpoint input exists
    const bpInput = screen.getByTestId("input-breakpoint-mobile") as HTMLInputElement;
    expect(bpInput.value).toBe("640");
  });

  // ─────────────────────────────────────────────────────────────
  // 11. useStorefrontStudioState & Undo/Redo integration for hiddenOn and breakpoints
  // ─────────────────────────────────────────────────────────────
  it("11. useStorefrontStudioState records hiddenOn and breakpoints changes into undo history", () => {
    const initialTokens = {
      themeId: "modern-minimal",
      pages: {
        home: {
          sections: [
            {
              type: "hero-banner",
              key: "hero-1",
              settings: {
                hiddenOn: { mobile: false },
                breakpoints: { mobile: 767, tablet: 1024, desktop: 1280 },
              },
            },
          ],
        },
      },
    };

    let latestTokens = initialTokens;
    const { result } = renderHook(() =>
      useStorefrontStudioState({
        themeId: "modern-minimal",
        externalDesignTokens: initialTokens,
        onChange: (next) => {
          latestTokens = next as any;
        },
        onSave: vi.fn(),
      })
    );

    // 1. Update hiddenOn
    act(() => {
      result.current.handleBatchUpdateSectionFields(
        { hiddenOn: { mobile: true } },
        "hero-1",
        "desktop"
      );
    });

    const updatedSec = (latestTokens.pages as any).home.sections[0];
    expect(updatedSec.settings.hiddenOn.mobile).toBe(true);
    expect(result.current.canUndo).toBe(true);

    // 2. Undo reverts hiddenOn.mobile to false
    act(() => {
      result.current.undo();
    });

    const revertedSec = (latestTokens.pages as any).home.sections[0];
    expect(revertedSec.settings.hiddenOn.mobile).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────
  // 12. Backward compatibility with 5R legacy media queries
  // ─────────────────────────────────────────────────────────────
  it("12. Backward compatibility: legacy 5R settings without hiddenOn/breakpoints continue to use 767.98px", () => {
    const legacy5RSettings = {
      paddingTop: 48,
      responsive: {
        mobile: {
          paddingTop: 16,
        },
      },
    };

    const css = generateResponsiveCss(legacy5RSettings, "#legacy-section");
    expect(css).toBeTruthy();
    expect(css).toContain("@media (max-width: 767.98px)");
    expect(css).toContain("padding-top: 16px !important;");
  });
});
