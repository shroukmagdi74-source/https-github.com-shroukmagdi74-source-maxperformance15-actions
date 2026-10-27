/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";

import type { StudioStyleClass } from "../studio/StudioTypes";
import {
  mergeClassStyle,
  buildSectionStyle,
  buildElementStyle,
  generateClassesCss,
  styleObjectToCssDeclarations,
  copySectionStyle,
  pasteSectionStyle,
} from "../studio/utils/studioStyleUtils";
import { StudioClassControls } from "../studio/inspector/StudioClassControls";

describe("CLASSES-1: Storefront Studio Element Classes, Pseudo-States, and Style Copy/Paste", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // 1. Basic class resolution into section settings
  it("1. mergeClassStyle merges matching class settings into section settings", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "hero-card",
        name: "Hero Card",
        settings: {
          backgroundColor: "#112233",
          borderRadius: 12,
          paddingTop: 24,
        },
      },
    ];

    const sectionSettings = {
      classId: "hero-card",
      title: "عنوان القسم",
    };

    const merged = mergeClassStyle(sectionSettings, classes);
    expect(merged.backgroundColor).toBe("#112233");
    expect(merged.borderRadius).toBe(12);
    expect(merged.paddingTop).toBe(24);
    expect(merged.title).toBe("عنوان القسم");
  });

  // 2. One class assigned to two sections and modifying it updates both
  it("2. One class assigned to two sections reflects modifications in both sections", () => {
    let classes: StudioStyleClass[] = [
      {
        id: "shared-badge",
        name: "Shared Badge",
        settings: {
          backgroundColor: "#ff0000",
          fontSize: 18,
          borderRadius: 8,
        },
      },
    ];

    const sectionA = {
      classId: "shared-badge",
      title: "قسم المنتجات الأول",
    };
    const sectionB = {
      classId: "shared-badge",
      title: "قسم المنتجات الثاني",
    };

    // Initial styles
    const styleA1 = buildSectionStyle(sectionA, undefined, undefined, classes);
    const styleB1 = buildSectionStyle(sectionB, undefined, undefined, classes);
    expect(styleA1.backgroundColor).toBe("#ff0000");
    expect(styleB1.backgroundColor).toBe("#ff0000");
    expect(styleA1.borderRadius).toBe("8px");
    expect(styleB1.borderRadius).toBe("8px");

    // Modify the class
    classes = [
      {
        id: "shared-badge",
        name: "Shared Badge",
        settings: {
          backgroundColor: "#00ff00",
          fontSize: 24,
          borderRadius: 16,
        },
      },
    ];

    const styleA2 = buildSectionStyle(sectionA, undefined, undefined, classes);
    const styleB2 = buildSectionStyle(sectionB, undefined, undefined, classes);
    expect(styleA2.backgroundColor).toBe("#00ff00");
    expect(styleB2.backgroundColor).toBe("#00ff00");
    expect(styleA2.borderRadius).toBe("16px");
    expect(styleB2.borderRadius).toBe("16px");
  });

  // 3. Inline section style overrides class style (الستايل المضمّن يتغلب على الـclass)
  it("3. Inline section style overrides class style upon property conflict", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "header-style",
        name: "Header Class",
        settings: {
          backgroundColor: "#111111",
          color: "#ffffff",
          paddingTop: 32,
        },
      },
    ];

    const sectionSettings = {
      classId: "header-style",
      backgroundColor: "#0055ff", // Inline override!
      color: "#eeeeee", // Inline override!
      // paddingTop not specified inline, should inherit 32px from class
    };

    const merged = mergeClassStyle(sectionSettings, classes);
    expect(merged.backgroundColor).toBe("#0055ff");
    expect(merged.color).toBe("#eeeeee");
    expect(merged.paddingTop).toBe(32);

    const computedStyle = buildSectionStyle(sectionSettings, undefined, undefined, classes);
    expect(computedStyle.backgroundColor).toBe("#0055ff");
    expect(computedStyle.color).toBe("#eeeeee");
    expect(computedStyle.paddingTop).toBe("32px");
  });

  // 4. Responsive cascading: class responsive overrides + section responsive precedence
  it("4. Responsive overrides in class cascade properly, and section overrides take precedence", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "banner-class",
        name: "Banner Class",
        settings: {
          paddingTop: 40,
          fontSize: 20,
          responsive: {
            mobile: {
              paddingTop: 16,
              fontSize: 14,
            },
          },
        },
      },
    ];

    const sectionSettings = {
      classId: "banner-class",
      responsive: {
        mobile: {
          paddingTop: 24, // Inline mobile override beats class mobile override!
        },
      },
    };

    const desktopStyle = buildSectionStyle(sectionSettings, undefined, "desktop", classes);
    expect(desktopStyle.paddingTop).toBe("40px");

    const mobileStyle = buildSectionStyle(sectionSettings, undefined, "mobile", classes);
    expect(mobileStyle.paddingTop).toBe("24px"); // Section mobile override wins
    expect(mobileStyle.fontSize).toBe("14px"); // From class mobile override
  });

  // 5. CSS generation for base class and pseudo-states (hover, focus, active)
  it("5. generateClassesCss produces [data-sf-class=\"<id>\"]:hover/:focus/:active selectors", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "btn-accent",
        name: "Accent Button",
        settings: {
          backgroundColor: "#2b6cf6",
          color: "#ffffff",
          borderRadius: 8,
        },
        states: {
          hover: {
            backgroundColor: "#1e54c7",
            transform: "translateY(-2px)",
          },
          focus: {
            outline: "2px solid #2b6cf6",
          },
          active: {
            backgroundColor: "#17429e",
            transform: "scale(0.97)",
          },
        },
      },
    ];

    const css = generateClassesCss(classes);

    // Base rule
    expect(css).toContain('[data-sf-class="btn-accent"] {');
    expect(css).toContain("background-color: #2b6cf6;");
    expect(css).toContain("color: #ffffff;");
    expect(css).toContain("border-radius: 8px;");

    // :hover rule
    expect(css).toContain('[data-sf-class="btn-accent"]:hover {');
    expect(css).toContain("background-color: #1e54c7;");
    expect(css).toContain("transform: translateY(-2px);");

    // :focus rule
    expect(css).toContain('[data-sf-class="btn-accent"]:focus {');
    expect(css).toContain("outline: 2px solid #2b6cf6;");

    // :active rule
    expect(css).toContain('[data-sf-class="btn-accent"]:active {');
    expect(css).toContain("background-color: #17429e;");
    expect(css).toContain("transform: scale(0.97);");
  });

  // 6. CSS generation filtering and edge cases
  it("6. generateClassesCss filters non-CSS properties and handles empty states safely", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "clean-box",
        name: "Clean Box",
        settings: {
          id: "clean-box", // structural, should be filtered
          name: "Clean Box", // structural, should be filtered
          classId: "clean-box", // structural, should be filtered
          backgroundColor: "#ffffff",
          paddingTop: 12,
        },
        states: {
          hover: {}, // empty state, should not generate hover rule
        },
      },
      {
        id: "",
        name: "Invalid Empty ID",
        settings: { backgroundColor: "#000" },
      },
    ];

    const css = generateClassesCss(classes);

    expect(css).toContain('[data-sf-class="clean-box"] {');
    expect(css).toContain("background-color: #ffffff;");
    expect(css).toContain("padding-top: 12px;");
    expect(css).not.toContain("class-id:");
    expect(css).not.toContain("name:");
    expect(css).not.toContain('[data-sf-class="clean-box"]:hover');
    expect(css).not.toContain('[data-sf-class=""]');

    expect(generateClassesCss([])).toBe("");
    expect(generateClassesCss(null)).toBe("");
  });

  // 7. copySectionStyle copies only style properties without touching content
  it("7. copySectionStyle copies only style properties without transferring content", () => {
    const sectionSettings = {
      // Content fields (MUST NOT BE COPIED)
      title: "عرض نهاية الأسبوع الاستثنائي",
      subtitle: "خصومات تصل إلى 50%",
      content: "تفاصيل العرض والشروط والأحكام",
      buttonText: "تسوق الآن",
      buttonLink: "/categories/all",
      image: "https://example.com/banner.jpg",
      products: ["prod-1", "prod-2", "prod-3"],

      // Style fields (MUST BE COPIED)
      backgroundColor: "#f9fafb",
      borderRadius: 16,
      shadow: "card",
      paddingTop: 48,
      paddingBottom: 48,
      classId: "promo-banner",
      responsive: {
        mobile: {
          paddingTop: 24,
        },
      },
    };

    const copied = copySectionStyle(sectionSettings);

    // Style properties exist
    expect(copied.backgroundColor).toBe("#f9fafb");
    expect(copied.borderRadius).toBe(16);
    expect(copied.shadow).toBe("card");
    expect(copied.paddingTop).toBe(48);
    expect(copied.paddingBottom).toBe(48);
    expect(copied.classId).toBe("promo-banner");
    expect(copied.responsive).toEqual({ mobile: { paddingTop: 24 } });

    // Content properties must be absent
    expect(copied.title).toBeUndefined();
    expect(copied.subtitle).toBeUndefined();
    expect(copied.content).toBeUndefined();
    expect(copied.buttonText).toBeUndefined();
    expect(copied.buttonLink).toBeUndefined();
    expect(copied.image).toBeUndefined();
    expect(copied.products).toBeUndefined();
  });

  // 8. pasteSectionStyle applies style onto target without corrupting target content
  it("8. pasteSectionStyle applies style onto target without overwriting target content", () => {
    const targetSettings = {
      // Target content
      title: "من نحن",
      subtitle: "قصة علامتنا التجارية",
      buttonText: "معرفة المزيد",
      buttonLink: "/about",

      // Existing target style
      backgroundColor: "#000000",
      paddingBottom: 16,
    };

    const copiedStyle = {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      paddingTop: 36,
      classId: "about-card",
    };

    const pasted = pasteSectionStyle(targetSettings, copiedStyle);

    // Target content is strictly preserved
    expect(pasted.title).toBe("من نحن");
    expect(pasted.subtitle).toBe("قصة علامتنا التجارية");
    expect(pasted.buttonText).toBe("معرفة المزيد");
    expect(pasted.buttonLink).toBe("/about");

    // Style is applied
    expect(pasted.backgroundColor).toBe("#ffffff");
    expect(pasted.borderRadius).toBe(12);
    expect(pasted.paddingTop).toBe(36);
    expect(pasted.classId).toBe("about-card");

    // Non-conflicting target style remains intact
    expect(pasted.paddingBottom).toBe(16);
  });

  // 9. buildElementStyle integrates classes with inline overrides and typography
  it("9. buildElementStyle correctly combines class styles with element-level overrides", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "title-preset",
        name: "Title Preset",
        settings: {
          fontSize: 28,
          fontWeight: 700,
          color: "#1e293b",
          paddingTop: 10,
        },
      },
    ];

    const elementSettings = {
      classId: "title-preset",
      color: "#2563eb", // Override color inline
      borderRadius: 6,
    };

    const style = buildElementStyle(elementSettings, classes);
    expect(style.color).toBe("#2563eb"); // Inline wins
    expect(style.paddingTop).toBe("10px"); // Inherited from class
    expect(style.borderRadius).toBe("6px");
  });

  // 10. StudioClassControls UI component interaction
  it("10. StudioClassControls renders, switches state tabs, and fires callbacks", () => {
    const classes: StudioStyleClass[] = [
      {
        id: "cls-1",
        name: "بطاقة مميزة",
        settings: { backgroundColor: "#ffffff" },
        states: { hover: { backgroundColor: "#f0f0f0" } },
      },
    ];

    const onCopyStyle = vi.fn();
    const onPasteStyle = vi.fn();
    const onAssignClass = vi.fn();
    const onCreateClass = vi.fn();
    const onUpdateClass = vi.fn();

    render(
      <StudioClassControls
        classes={classes}
        selectedClassId="cls-1"
        assignedClassId="cls-1"
        hasCopiedStyle={true}
        onCopyStyle={onCopyStyle}
        onPasteStyle={onPasteStyle}
        onAssignClass={onAssignClass}
        onCreateClass={onCreateClass}
        onUpdateClass={onUpdateClass}
      />
    );

    // Verify copy & paste buttons
    const btnCopy = screen.getByTestId("btn-copy-style");
    const btnPaste = screen.getByTestId("btn-paste-style");
    expect(btnCopy).toBeDefined();
    expect(btnPaste).toBeDefined();

    fireEvent.click(btnCopy);
    expect(onCopyStyle).toHaveBeenCalledTimes(1);

    fireEvent.click(btnPaste);
    expect(onPasteStyle).toHaveBeenCalledTimes(1);

    // Verify create class button
    const btnCreate = screen.getByTestId("btn-create-class");
    fireEvent.click(btnCreate);
    expect(onCreateClass).toHaveBeenCalledWith("كلاس 2");

    // Verify state tabs render and can be clicked
    const hoverTab = screen.getByTestId("state-tab-hover");
    fireEvent.click(hoverTab);
    expect(screen.getByText("لون الخلفية (hover)")).toBeDefined();

    const focusTab = screen.getByTestId("state-tab-focus");
    fireEvent.click(focusTab);
    expect(screen.getByText("لون الخلفية (focus)")).toBeDefined();

    // Verify assigned class selector
    const selector = screen.getByTestId("select-assigned-class") as HTMLSelectElement;
    expect(selector.value).toBe("cls-1");
  });
});
