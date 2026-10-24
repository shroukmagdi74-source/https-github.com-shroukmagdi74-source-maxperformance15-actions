// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import {
  TreeRenderer,
  resolveGridTemplateColumns,
  resolveChildLayout,
} from "../engine/tree/TreeRenderer";
import {
  StudioContainerControls,
  StudioChildLayoutControls,
  GRID_FRACTION_PRESETS,
} from "../studio/inspector/StudioContainerControls";
import { SectionNode } from "../studio/StudioTypes";

describe("Storefront Ticket GRID-1 — Proportional Columns + Order + ColumnSpan", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const dummyLeafRenderer = (node: any) => (
    <div
      key={node.key || node.type}
      data-testid={`leaf-${node.key || node.type}`}
    >
      Leaf {node.key || node.type}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // 1. columnFractions=[2,1] -> grid-template-columns: 2fr 1fr
  // ─────────────────────────────────────────────────────────────
  it("1. columnFractions=[2,1] applies grid-template-columns: 2fr 1fr to the container", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-fractions-arr",
        settings: {
          columns: 2,
          columnFractions: [2, 1],
        },
        children: [
          { type: "text", key: "c1" },
          { type: "image", key: "c2" },
        ],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("2fr 1fr");
  });

  // ─────────────────────────────────────────────────────────────
  // 1b. columnFractions string "2fr 1fr" or space separated
  // ─────────────────────────────────────────────────────────────
  it("1b. columnFractions as string '2fr 1fr' produces grid-template-columns: 2fr 1fr", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-fractions-str",
        settings: {
          columns: 2,
          columnFractions: "2fr 1fr",
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.gridTemplateColumns).toBe("2fr 1fr");
  });

  // ─────────────────────────────────────────────────────────────
  // 2. columnWidths=[30,70] -> 30% 70%
  // ─────────────────────────────────────────────────────────────
  it("2. columnWidths=[30,70] applies grid-template-columns: 30% 70%", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-widths-arr",
        settings: {
          columns: 2,
          columnWidths: [30, 70],
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("30% 70%");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Without proportions -> repeat(3, minmax(0, 1fr)) (regression)
  // ─────────────────────────────────────────────────────────────
  it("3. Without proportions, columns=3 produces repeat(3, minmax(0, 1fr)) exactly (regression)", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-no-proportions",
        settings: {
          columns: 3,
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. order on a child -> style.order
  // ─────────────────────────────────────────────────────────────
  it("4. order on a child applies style.order", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-order-parent",
        settings: { columns: 2 },
        children: [
          {
            type: "hero",
            key: "child-reordered",
            settings: { order: 2 },
          },
        ],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const wrapper = container.querySelector('[data-wrapper-key="child-reordered"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.order).toBe("2");

    const leaf = screen.getByTestId("leaf-child-reordered");
    expect(leaf).toBeTruthy();
    expect(leaf.style.order).toBe("2");
  });

  // ─────────────────────────────────────────────────────────────
  // 5. columnSpan=2 -> gridColumn: span 2
  // ─────────────────────────────────────────────────────────────
  it("5. columnSpan=2 on a child applies gridColumn: span 2", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-span-parent",
        settings: { columns: 3 },
        children: [
          {
            type: "banner",
            key: "child-spanned",
            settings: { columnSpan: 2 },
          },
        ],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const wrapper = container.querySelector('[data-wrapper-key="child-spanned"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.gridColumn).toBe("span 2");

    const leaf = screen.getByTestId("leaf-child-spanned");
    expect(leaf).toBeTruthy();
    expect(leaf.style.gridColumn).toBe("span 2");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Preset «2:1» in UI writes columnFractions=[2,1]
  // ─────────────────────────────────────────────────────────────
  it("6. Preset '2:1' in UI writes columnFractions=[2,1]", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioContainerControls
        settings={{ columns: 2 }}
        deviceMode="desktop"
        onUpdateField={onUpdateField}
      />
    );

    const presetBtn = screen.getByRole("button", { name: "2:1" });
    expect(presetBtn).toBeTruthy();

    fireEvent.click(presetBtn);

    expect(onUpdateField).toHaveBeenCalledWith("columnFractions", [2, 1]);
  });

  // ─────────────────────────────────────────────────────────────
  // 7. «إرجاع للمتساوي» removes columnFractions and columnWidths
  // ─────────────────────────────────────────────────────────────
  it("7. 'إرجاع للمتساوي' removes both columnFractions and columnWidths", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioContainerControls
        settings={{
          columns: 2,
          columnFractions: [2, 1],
          columnWidths: [60, 40],
        }}
        deviceMode="desktop"
        onUpdateField={onUpdateField}
      />
    );

    const resetBtn = screen.getByRole("button", { name: /إرجاع للمتساوي/i });
    expect(resetBtn).toBeTruthy();

    fireEvent.click(resetBtn);

    expect(onUpdateField).toHaveBeenCalledWith("columnFractions", null);
    expect(onUpdateField).toHaveBeenCalledWith("columnWidths", null);
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Single column container: no grid (flex) like before
  // ─────────────────────────────────────────────────────────────
  it("8. Single column container renders flex (not grid) like before", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "test-single-col",
        settings: {
          columns: 1,
          direction: "column",
        },
        children: [
          { type: "item-a", key: "item-a" },
        ],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
    expect(el.style.gridTemplateColumns).toBe("");
  });

  // ─────────────────────────────────────────────────────────────
  // 9. Additional Presets verification (3:1, 1:2, 1:3, 70/30)
  // ─────────────────────────────────────────────────────────────
  it("9. Fraction presets (3:1, 1:2, 1:3, 70/30) trigger appropriate columnFractions", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioContainerControls
        settings={{ columns: 2 }}
        deviceMode="desktop"
        onUpdateField={onUpdateField}
      />
    );

    const preset31 = screen.getByRole("button", { name: "3:1" });
    fireEvent.click(preset31);
    expect(onUpdateField).toHaveBeenCalledWith("columnFractions", [3, 1]);

    const preset12 = screen.getByRole("button", { name: "1:2" });
    fireEvent.click(preset12);
    expect(onUpdateField).toHaveBeenCalledWith("columnFractions", [1, 2]);

    const preset7030 = screen.getByRole("button", { name: "70/30" });
    fireEvent.click(preset7030);
    expect(onUpdateField).toHaveBeenCalledWith("columnFractions", [70, 30]);
  });

  // ─────────────────────────────────────────────────────────────
  // 10. Column Width Sliders % in UI update columnWidths
  // ─────────────────────────────────────────────────────────────
  it("10. Column width slider changes write columnWidths and clear columnFractions", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioContainerControls
        settings={{ columns: 2, columnWidths: [50, 50] }}
        deviceMode="desktop"
        onUpdateField={onUpdateField}
      />
    );

    const slider0 = screen.getByTestId("slider-col-width-0");
    fireEvent.change(slider0, { target: { value: "65" } });

    expect(onUpdateField).toHaveBeenCalledWith("columnWidths", [65, 50]);
    expect(onUpdateField).toHaveBeenCalledWith("columnFractions", null);
  });

  // ─────────────────────────────────────────────────────────────
  // 11. Child Tab in StudioContainerControls allows editing order & columnSpan
  // ─────────────────────────────────────────────────────────────
  it("11. Switching to Child tab in StudioContainerControls allows editing order and columnSpan", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioContainerControls
        settings={{ columns: 2, order: 1, columnSpan: 1 }}
        deviceMode="desktop"
        onUpdateField={onUpdateField}
      />
    );

    const childTabBtn = screen.getByTestId("container-child-tab");
    fireEvent.click(childTabBtn);

    const orderInput = screen.getByTestId("input-child-order");
    expect(orderInput).toBeTruthy();
    fireEvent.change(orderInput, { target: { value: "3" } });
    expect(onUpdateField).toHaveBeenCalledWith("order", 3);

    const span2Btn = screen.getByRole("button", { name: "2" });
    fireEvent.click(span2Btn);
    expect(onUpdateField).toHaveBeenCalledWith("columnSpan", 2);
  });

  // ─────────────────────────────────────────────────────────────
  // 12. Manager Acceptance: Child with order: 2 displays after child with order: 1
  // ─────────────────────────────────────────────────────────────
  it("12. Manager Acceptance: two children in 2:1 container, child with order: 2 displays after child with order: 1", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "manager-container",
        settings: {
          columns: 2,
          columnFractions: [2, 1],
        },
        children: [
          {
            type: "hero",
            key: "first-node",
            settings: { order: 2 },
          },
          {
            type: "sidebar",
            key: "second-node",
            settings: { order: 1 },
          },
        ],
      },
    ];

    const { container } = render(
      <TreeRenderer nodes={nodes} renderLeafSection={dummyLeafRenderer} />
    );

    const gridContainer = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(gridContainer.style.gridTemplateColumns).toBe("2fr 1fr");

    const firstWrapper = container.querySelector('[data-wrapper-key="first-node"]') as HTMLElement;
    const secondWrapper = container.querySelector('[data-wrapper-key="second-node"]') as HTMLElement;

    expect(firstWrapper.style.order).toBe("2");
    expect(secondWrapper.style.order).toBe("1");
  });

  // ─────────────────────────────────────────────────────────────
  // 13. Responsive override for columnFractions
  // ─────────────────────────────────────────────────────────────
  it("13. Mobile override responsive.mobile.columnFractions overrides desktop values in mobile mode", () => {
    const nodes: SectionNode[] = [
      {
        type: "container",
        key: "responsive-grid-container",
        settings: {
          columns: 2,
          columnFractions: [2, 1],
          responsive: {
            mobile: {
              columns: 2,
              columnFractions: [1, 1],
            },
          },
        },
        children: [],
      },
    ];

    const { container } = render(
      <TreeRenderer
        nodes={nodes}
        renderLeafSection={dummyLeafRenderer}
        deviceMode="mobile"
      />
    );

    const el = container.querySelector('[data-storefront-container="true"]') as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("1fr 1fr");

    const styleTag = container.querySelector('style[data-container-style="responsive-grid-container"]');
    expect(styleTag).toBeTruthy();
    expect(styleTag?.innerHTML).toContain("grid-template-columns: 1fr 1fr !important;");
  });

  // ─────────────────────────────────────────────────────────────
  // 14. Direct helper unit verification for resolveGridTemplateColumns & resolveChildLayout
  // ─────────────────────────────────────────────────────────────
  it("14. Direct helper verification for resolveGridTemplateColumns, resolveChildLayout, and exported presets", () => {
    expect(resolveGridTemplateColumns({ columnFractions: [2, 1] }, 2)).toBe("2fr 1fr");
    expect(resolveGridTemplateColumns({ columnWidths: [70, 30] }, 2)).toBe("70% 30%");
    expect(resolveGridTemplateColumns({ columnFractions: "3fr 1fr" }, 2)).toBe("3fr 1fr");
    expect(resolveGridTemplateColumns({}, 3)).toBe("repeat(3, minmax(0, 1fr))");

    expect(resolveChildLayout({ order: 4, columnSpan: 2 })).toEqual({
      order: 4,
      columnSpan: "span 2",
    });
    expect(resolveChildLayout({ columnSpan: "span 3" })).toEqual({
      columnSpan: "span 3",
    });
    expect(resolveChildLayout({})).toEqual({});

    expect(GRID_FRACTION_PRESETS.length).toBeGreaterThan(0);
    expect(typeof StudioChildLayoutControls).toBe("function");
  });
});
