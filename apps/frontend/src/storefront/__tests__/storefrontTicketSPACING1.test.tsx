// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import {
  TreeRenderer,
  formatSpacingValue,
  resolveSpacingValue,
} from "../engine/tree/TreeRenderer";
import {
  StudioPaddingControl,
  StudioMarginControl,
  FreeNumberInput,
} from "../studio/inspector/StudioDimensionControls";
import { SectionNode } from "../studio/StudioTypes";

describe("Storefront Ticket SPACING-1 — 4-Way Padding and Margin for Sections", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const dummyLeafRenderer = (node: any) => (
    <div key={node.key || node.type} data-testid={`leaf-${node.key || node.type}`}>
      Leaf {node.key || node.type}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // 1. Setting paddingLeft=40 -> style has padding-left: 40px
  // ─────────────────────────────────────────────────────────────
  it("1. Setting paddingLeft=40 applies padding-left: 40px to section element", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-pl",
        settings: {
          paddingLeft: 40,
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.paddingLeft).toBe("40px");
  });

  // ─────────────────────────────────────────────────────────────
  // 2. paddingRight and paddingBottom follow the same behavior
  // ─────────────────────────────────────────────────────────────
  it("2. Setting paddingRight and paddingBottom applies exact pixel values", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-pr-pb",
        settings: {
          paddingRight: 36,
          paddingBottom: 28,
          paddingTop: 16,
          paddingLeft: 20,
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.paddingTop).toBe("16px");
    expect(el.style.paddingRight).toBe("36px");
    expect(el.style.paddingBottom).toBe("28px");
    expect(el.style.paddingLeft).toBe("20px");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. marginTop=24 -> wrapper has margin-top: 24px (not inside section)
  // ─────────────────────────────────────────────────────────────
  it("3. Setting marginTop=24 applies margin-top: 24px to the section wrapper (not inside section)", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-mt",
        settings: {
          marginTop: 24,
          marginRight: 16,
          marginBottom: 32,
          marginLeft: 12,
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const wrapper = container.querySelector('[data-storefront-wrapper="true"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.marginTop).toBe("24px");
    expect(wrapper.style.marginRight).toBe("16px");
    expect(wrapper.style.marginBottom).toBe("32px");
    expect(wrapper.style.marginLeft).toBe("12px");

    // The inner section container does NOT have margin directly, avoiding width:100% conflicts
    const innerEl = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(innerEl).toBeTruthy();
    expect(innerEl.style.marginTop).toBe("");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. String values like '2rem' are passed through as-is
  // ─────────────────────────────────────────────────────────────
  it("4. String values like '2rem' or '1.5em' are preserved as-is without forced px conversion", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-str-units",
        settings: {
          paddingLeft: "2rem",
          paddingRight: "1.5rem",
          marginTop: "3rem",
          marginBottom: "10vh",
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const innerEl = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(innerEl.style.paddingLeft).toBe("2rem");
    expect(innerEl.style.paddingRight).toBe("1.5rem");

    const wrapper = container.querySelector('[data-storefront-wrapper="true"]') as HTMLElement;
    expect(wrapper.style.marginTop).toBe("3rem");
    expect(wrapper.style.marginBottom).toBe("10vh");
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Mobile override mobile.paddingLeft=12 overrides desktop on mobile
  // ─────────────────────────────────────────────────────────────
  it("5. mobile.paddingLeft=12 overrides desktop base value on mobile breakpoint", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-responsive",
        settings: {
          paddingLeft: 40,
          marginTop: 30,
          responsive: {
            mobile: {
              paddingLeft: 12,
              marginTop: 10,
            },
          },
        },
        children: [],
      },
    ];

    // Render with deviceMode="mobile" (canvas inspector simulation)
    const { container } = render(
      <TreeRenderer
        nodes={nodes}
        renderLeafSection={dummyLeafRenderer}
        deviceMode="mobile"
      />
    );

    const innerEl = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(innerEl.style.paddingLeft).toBe("12px");

    const wrapper = container.querySelector('[data-storefront-wrapper="true"]') as HTMLElement;
    expect(wrapper.style.marginTop).toBe("10px");

    // Also check that responsive CSS media queries were generated for live viewport changes
    const styleTag = container.querySelector('style[data-container-style="test-responsive"]');
    expect(styleTag).toBeTruthy();
    expect(styleTag?.innerHTML).toContain("@media (max-width: 639.98px)");
    expect(styleTag?.innerHTML).toContain("padding-left: 12px !important;");
    expect(styleTag?.innerHTML).toContain("margin-top: 10px !important;");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. undefined -> no style is added (not 0px)
  // ─────────────────────────────────────────────────────────────
  it("6. undefined properties do not add inline styles (not 0px)", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-undefined",
        settings: {
          paddingLeft: undefined,
          paddingRight: undefined,
          marginTop: undefined,
          marginLeft: undefined,
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const innerEl = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(innerEl.style.paddingLeft).toBe("");
    expect(innerEl.style.paddingRight).toBe("");

    const wrapper = container.querySelector('[data-storefront-wrapper="true"]') as HTMLElement;
    expect(wrapper.style.marginTop).toBe("");
    expect(wrapper.style.marginLeft).toBe("");

    // Helper function unit check
    expect(formatSpacingValue(undefined)).toBeUndefined();
    expect(formatSpacingValue(null)).toBeUndefined();
    expect(formatSpacingValue("")).toBeUndefined();
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Legacy sections with only paddingTop/paddingBottom remain working
  // ─────────────────────────────────────────────────────────────
  it("7. Legacy sections with only paddingTop and paddingBottom continue to render without errors", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-legacy",
        settings: {
          paddingTop: 48,
          paddingBottom: 24,
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.paddingTop).toBe("48px");
    expect(el.style.paddingBottom).toBe("24px");
  });

  // ─────────────────────────────────────────────────────────────
  // 8. StudioMarginControl UI: 4-way inputs, Link toggle, and reset
  // ─────────────────────────────────────────────────────────────
  it("8. StudioMarginControl renders 4 directional inputs and allows independent adjustments", () => {
    const handleUpdate = vi.fn();
    const handleReset = vi.fn();

    const settings = {
      marginTop: 20,
      marginBottom: 30,
      marginRight: 15,
      marginLeft: 25,
      marginLinked: false,
    };

    render(
      <StudioMarginControl
        settings={settings}
        deviceMode="desktop"
        onUpdateField={handleUpdate}
        onResetField={handleReset}
      />
    );

    expect(screen.getByText("الهامش الخارجي (Margin)")).toBeTruthy();
    expect(screen.getByText("أعلى")).toBeTruthy();
    expect(screen.getByText("أسفل")).toBeTruthy();
    expect(screen.getByText("يمين")).toBeTruthy();
    expect(screen.getByText("يسار")).toBeTruthy();

    // Verify values in inputs
    const inputs = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    expect(inputs.length).toBe(4);
    expect(inputs[0].value).toBe("20");
    expect(inputs[1].value).toBe("30");
    expect(inputs[2].value).toBe("15");
    expect(inputs[3].value).toBe("25");

    // Modify right margin
    fireEvent.change(inputs[2], { target: { value: "45" } });
    expect(handleUpdate).toHaveBeenCalledWith("marginRight", 45);

    // Modify left margin
    fireEvent.change(inputs[3], { target: { value: "10" } });
    expect(handleUpdate).toHaveBeenCalledWith("marginLeft", 10);
  });

  // ─────────────────────────────────────────────────────────────
  // 9. StudioMarginControl Link Mode (موحد vs منفصل)
  // ─────────────────────────────────────────────────────────────
  it("9. StudioMarginControl link toggle updates all directions simultaneously when linked", () => {
    const handleUpdate = vi.fn();
    const handleBatchUpdate = vi.fn();

    const settings = {
      marginTop: 16,
      marginBottom: 16,
      marginRight: 16,
      marginLeft: 16,
      marginLinked: true,
    };

    render(
      <StudioMarginControl
        settings={settings}
        deviceMode="desktop"
        onUpdateField={handleUpdate}
        onBatchUpdateFields={handleBatchUpdate}
      />
    );

    // Linked mode displays unified label
    expect(screen.getByText("موحد (كل الاتجاهات)")).toBeTruthy();

    const unifiedInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(unifiedInput.value).toBe("16");

    fireEvent.change(unifiedInput, { target: { value: "32" } });

    expect(handleBatchUpdate).toHaveBeenCalledWith({
      marginTop: 32,
      marginBottom: 32,
      marginRight: 32,
      marginLeft: 32,
      margin: 32,
      marginLinked: true,
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 10. Responsive Override Badging & Reset Button in StudioMarginControl
  // ─────────────────────────────────────────────────────────────
  it("10. StudioMarginControl displays responsive badge and reset button in mobile mode", () => {
    const handleReset = vi.fn();
    const handleUpdate = vi.fn();

    const settings = {
      marginTop: 40,
      responsive: {
        mobile: {
          marginTop: 15,
        },
      },
    };

    const { container } = render(
      <StudioMarginControl
        settings={settings}
        rawSettings={settings}
        deviceMode="mobile"
        onUpdateField={handleUpdate}
        onResetField={handleReset}
      />
    );

    const badge = screen.getByTestId("badge-customized-margin");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("مُخصص للجوال");

    const resetTopBtn = container.querySelector('button[data-action="reset-marginTop"]') as HTMLButtonElement;
    expect(resetTopBtn).toBeTruthy();
    fireEvent.click(resetTopBtn);
    expect(handleReset).toHaveBeenCalledWith("marginTop");
  });

  // ─────────────────────────────────────────────────────────────
  // 11. FreeNumberInput Arabic Digit Parsing and Empty String Acceptance
  // ─────────────────────────────────────────────────────────────
  it("11. FreeNumberInput parses Arabic numerals and supports empty string without reverting to 0", () => {
    const handleUpdate = vi.fn();

    const { rerender } = render(
      <FreeNumberInput
        label="اختبار"
        value={0}
        onChange={handleUpdate}
      />
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;

    // Typing Arabic numeral '٢'
    fireEvent.keyDown(input, { key: "٢" });
    expect(handleUpdate).toHaveBeenCalledWith(2);

    // Re-render with value=50, then clear it to ""
    rerender(
      <FreeNumberInput
        label="اختبار"
        value={50}
        onChange={handleUpdate}
      />
    );
    expect(input.value).toBe("50");

    fireEvent.change(input, { target: { value: "" } });
    expect(handleUpdate).toHaveBeenCalledWith("");

    // Re-render with value="" -> input value is empty string, not "0"
    rerender(
      <FreeNumberInput
        label="اختبار"
        value=""
        onChange={handleUpdate}
      />
    );
    expect(input.value).toBe("");
  });

  // ─────────────────────────────────────────────────────────────
  // 12. Leaf Section Spacing Integration in TreeRenderer
  // ─────────────────────────────────────────────────────────────
  it("12. Leaf section with spacing settings renders with wrapper and styled content when rendered directly", () => {
    const nodes: SectionNode[] = [
      {
        type: "hero-banner",
        key: "leaf-sec",
        settings: {
          paddingLeft: 40,
          paddingRight: 25,
          marginTop: 24,
          marginBottom: 16,
        },
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const wrapper = container.querySelector('[data-storefront-wrapper="true"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.marginTop).toBe("24px");
    expect(wrapper.style.marginBottom).toBe("16px");

    const content = container.querySelector('[data-storefront-section-content="true"]') as HTMLElement;
    expect(content).toBeTruthy();
    expect(content.style.paddingLeft).toBe("40px");
    expect(content.style.paddingRight).toBe("25px");
  });
});
