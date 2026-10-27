/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";

import {
  buildBorderDeclarations,
  buildBorderStyle,
  styleObjectToCssDeclarations,
  generateResponsiveCss,
  buildSectionStyle,
  normalizeAspectRatio,
  buildTransformString,
  buildOverlayString,
} from "../studio/utils/studioStyleUtils";
import { StudioBorderControls } from "../studio/inspector/StudioBorderControls";
import { StudioPositionControls } from "../studio/inspector/StudioPositionControls";
import { StudioInspectorLayoutTab } from "../studio/inspector/StudioInspectorLayoutTab";

describe("LAYOUT-1: Advanced Position, Borders, Overlay, Overflow & Aspect Ratio", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // 1. Acceptance Criterion 2: Borders per side with zero omissions
  it("1. border sides: {top:2, bottom:0, left:4, right:0, color:'#f00'} generates border-top and border-left, omitting bottom and right", () => {
    const borderInput = {
      top: 2,
      bottom: 0,
      left: 4,
      right: 0,
      color: "#f00",
    };

    // Direct helper check
    const decls = buildBorderDeclarations(borderInput);
    const css = decls.join(" ");

    expect(css).toContain("border-top: 2px solid #f00;");
    expect(css).toContain("border-left: 4px solid #f00;");
    expect(css).not.toContain("border-bottom");
    expect(css).not.toContain("border-right");

    // via styleObjectToCssDeclarations directly
    const directCss = styleObjectToCssDeclarations(borderInput).join(" ");
    expect(directCss).toContain("border-top: 2px solid #f00;");
    expect(directCss).toContain("border-left: 4px solid #f00;");
    expect(directCss).not.toContain("border-bottom");
    expect(directCss).not.toContain("border-right");

    // via nested border property
    const nestedCss = styleObjectToCssDeclarations({ border: borderInput }).join(" ");
    expect(nestedCss).toContain("border-top: 2px solid #f00;");
    expect(nestedCss).toContain("border-left: 4px solid #f00;");
    expect(nestedCss).not.toContain("border-bottom");
    expect(nestedCss).not.toContain("border-right");
  });

  // 2. Acceptance Criterion 3: Position sticky + top: 20
  it("2. position: sticky + top: 20 generates position: sticky; top: 20px", () => {
    const input = {
      position: "sticky",
      top: 20,
    };

    const decls = styleObjectToCssDeclarations(input);
    const css = decls.join("\n");

    expect(css).toContain("position: sticky;");
    expect(css).toContain("top: 20px;");

    // Also verify style object output
    const styleObj = buildSectionStyle(input);
    expect(styleObj.position).toBe("sticky");
    expect(styleObj.top).toBe("20px");
  });

  // 3. Acceptance Criterion 4: aspectRatio: 16:9 + overflow: hidden
  it("3. aspectRatio: 16:9 + overflow: hidden are present in generated CSS declarations", () => {
    const input = {
      aspectRatio: "16:9",
      overflow: "hidden",
    };

    const decls = styleObjectToCssDeclarations(input);
    const css = decls.join("\n");

    expect(css).toContain("overflow: hidden;");
    expect(css).toMatch(/aspect-ratio:\s*(16\/9|16:9);/);

    const styleObj = buildSectionStyle(input);
    expect((styleObj as any).aspectRatio).toBe("16/9");
    expect(styleObj.overflow).toBe("hidden");
  });

  // 4. Acceptance Criterion 5: Responsive override on mobile generates correct media query
  it("4. responsiveness: property overridden on mobile appears in CSS media query for mobile", () => {
    const settings = {
      position: "static",
      overflow: "visible",
      responsive: {
        mobile: {
          position: "sticky",
          top: 20,
          overflow: "hidden",
          aspectRatio: "16:9",
        },
      },
    };

    const selector = '[data-section-key="hero-1"]';
    const css = generateResponsiveCss(settings, selector);

    expect(css).not.toBeNull();
    expect(css).toContain("@media (max-width: 767.98px)");
    expect(css).toContain("position: sticky !important;");
    expect(css).toContain("top: 20px !important;");
    expect(css).toContain("overflow: hidden !important;");
    expect(css).toContain("aspect-ratio: 16/9 !important;");

    // And desktop style retains base values
    const desktopStyle = buildSectionStyle(settings, undefined, "desktop");
    expect(desktopStyle.position).toBe("static");
    expect(desktopStyle.overflow).toBe("visible");

    // Mobile effective style has overridden values
    const mobileStyle = buildSectionStyle(settings, undefined, "mobile");
    expect(mobileStyle.position).toBe("sticky");
    expect(mobileStyle.top).toBe("20px");
    expect(mobileStyle.overflow).toBe("hidden");
  });

  // 5. buildSectionStyle applies corner radii, overlay, and opacity
  it("5. buildSectionStyle applies corner radii per corner, overlay gradient, and opacity", () => {
    const settings = {
      borderRadiusTopLeft: 8,
      borderRadiusTopRight: 16,
      borderRadiusBottomRight: 24,
      borderRadiusBottomLeft: 0,
      opacity: 0.85,
      overlayColor: "#000000",
      overlayOpacity: 0.4,
    };

    const style = buildSectionStyle(settings);

    expect(style.borderTopLeftRadius).toBe("8px");
    expect(style.borderTopRightRadius).toBe("16px");
    expect(style.borderBottomRightRadius).toBe("24px");
    expect(style.borderBottomLeftRadius).toBe("0px");
    expect(style.opacity).toBe(0.85);
    expect((style as any)["--sf-overlay"]).toContain("rgba(0, 0, 0, 0.4)");
    expect(style.backgroundImage).toContain("linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))");
  });

  // 6. Transform builder: rotate, scale, translate
  it("6. buildTransformString produces valid transform strings and handles resets", () => {
    expect(buildTransformString({ rotate: 45, scale: 1.2 })).toBe("rotate(45deg) scale(1.2)");
    expect(buildTransformString({ translateX: 10, translateY: -20 })).toBe("translate(10px, -20px)");
    expect(buildTransformString({ rotate: 0, scale: 1 })).toBeUndefined();
    expect(buildTransformString({ transform: "skewX(10deg)" })).toBe("skewX(10deg)");
  });

  // 7. StudioBorderControls UI interactions
  it("7. StudioBorderControls toggles linked vs unlinked border width and handles style/color updates", () => {
    const onUpdateField = vi.fn();
    const onBatchUpdateFields = vi.fn();

    render(
      <StudioBorderControls
        settings={{
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderLeftWidth: 2,
          borderColor: "#ff0000",
          borderStyle: "dashed",
        }}
        onUpdateField={onUpdateField}
        onBatchUpdateFields={onBatchUpdateFields}
      />
    );

    // Toggle link button
    const linkBtn = screen.getByTestId("toggle-link-border-width");
    fireEvent.click(linkBtn);

    // When unlinked, directional inputs appear
    expect(screen.getByText("أعلى (Top)")).toBeDefined();
    expect(screen.getByText("يسار (Left)")).toBeDefined();

    // Select style
    const select = screen.getByTestId("select-border-style");
    fireEvent.change(select, { target: { value: "dotted" } });
    expect(onUpdateField).toHaveBeenCalledWith("borderStyle", "dotted");

    // Overlay slider
    const overlayInput = screen.getByTestId("input-overlay-opacity");
    fireEvent.change(overlayInput, { target: { value: "0.5" } });
    expect(onUpdateField).toHaveBeenCalledWith("overlayOpacity", 0.5);

    // Element opacity slider
    const opacityInput = screen.getByTestId("input-element-opacity");
    fireEvent.change(opacityInput, { target: { value: "0.75" } });
    expect(onUpdateField).toHaveBeenCalledWith("opacity", 0.75);
  });

  // 8. StudioPositionControls UI interactions
  it("8. StudioPositionControls allows selecting position mode, setting insets, z-index, and transform", () => {
    const onUpdateField = vi.fn();

    const { rerender } = render(
      <StudioPositionControls
        settings={{ position: "static" }}
        onUpdateField={onUpdateField}
      />
    );

    // Insets should not be visible when static
    expect(screen.queryByText("الإزاحات (Offsets / Insets px)")).toBeNull();

    // Click sticky button
    const stickyBtn = screen.getByTestId("btn-position-sticky");
    fireEvent.click(stickyBtn);
    expect(onUpdateField).toHaveBeenCalledWith("position", "sticky");

    // Re-render as sticky
    rerender(
      <StudioPositionControls
        settings={{ position: "sticky", top: 20 }}
        onUpdateField={onUpdateField}
      />
    );

    // Insets are now visible
    expect(screen.getByText("الإزاحات (Offsets / Insets px)")).toBeDefined();

    // Z-Index input
    const zIndexInput = screen.getByTestId("input-z-index");
    fireEvent.change(zIndexInput, { target: { value: "50" } });
    expect(onUpdateField).toHaveBeenCalledWith("zIndex", 50);

    // Rotate slider
    const rotateInput = screen.getByTestId("input-transform-rotate");
    fireEvent.change(rotateInput, { target: { value: "45" } });
    expect(onUpdateField).toHaveBeenCalledWith("rotate", 45);
  });

  // 9. StudioInspectorLayoutTab UI interactions for overflow & aspectRatio
  it("9. StudioInspectorLayoutTab renders overflow and aspectRatio buttons and fires updates", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioInspectorLayoutTab
        settings={{ overflow: "visible", aspectRatio: "auto" }}
        onUpdateField={onUpdateField}
      />
    );

    // Click overflow hidden button
    const hiddenBtn = screen.getByTestId("btn-overflow-hidden");
    fireEvent.click(hiddenBtn);
    expect(onUpdateField).toHaveBeenCalledWith("overflow", "hidden");

    // Click aspectRatio 16:9 button
    const aspect169Btn = screen.getByTestId("btn-aspect-16:9");
    fireEvent.click(aspect169Btn);
    expect(onUpdateField).toHaveBeenCalledWith("aspectRatio", "16:9");

    // Click custom aspect ratio button
    const customAspectBtn = screen.getByTestId("btn-aspect-custom");
    fireEvent.click(customAspectBtn);
    expect(onUpdateField).toHaveBeenCalledWith("aspectRatio", "21:9");
  });

  // 10. Per-breakpoint responsive badge and reset trigger
  it("10. Responsive customization shows badge and reset button when customized on mobile", () => {
    const onResetField = vi.fn();

    const rawSettings = {
      position: "static",
      responsive: {
        mobile: {
          position: "sticky",
        },
      },
    };

    render(
      <StudioPositionControls
        settings={{ position: "sticky" }}
        rawSettings={rawSettings}
        deviceMode="mobile"
        onUpdateField={vi.fn()}
        onResetField={onResetField}
      />
    );

    // Responsive badge should be visible
    expect(screen.getByTestId("badge-customized-position")).toBeDefined();
    expect(screen.getByText("مُخصص للجوال")).toBeDefined();

    // Click reset button
    const resetBtn = screen.getByRole("button", { name: "إرجاع للأساسي" });
    fireEvent.click(resetBtn);
    expect(onResetField).toHaveBeenCalledWith("position");
  });
});
