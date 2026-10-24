/* @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StorefrontStudioShell } from "../studio/StorefrontStudioShell";
import { useStudioTouchDrag, computeTouchDropSlot } from "../studio/hooks/useStudioTouchDrag";

const validThreeSections = [
  { key: "sec-hero", type: "hero-banner", settings: { title: "قسم البطل" } },
  { key: "sec-products", type: "featured-products", settings: { title: "المنتجات المميزة" } },
  { key: "sec-newsletter", type: "newsletter", settings: { title: "النشرة البريدية" } },
];

let currentThemeMock: any = {
  id: "modern-minimal",
  name: "max-p",
  direction: "rtl",
  tokens: { colors: {}, typography: {}, shape: {} },
  header: { brandName: "max-p", navigation: [] },
  pages: {
    home: {
      id: "home",
      title: "الرئيسية",
      sections: validThreeSections,
    },
  },
};

vi.mock("../engine/ThemeProvider", () => ({
  useStorefrontTheme: () => ({
    theme: currentThemeMock,
    setTheme: vi.fn(),
  }),
  StorefrontThemeProvider: ({ children, initialTheme }: any) => {
    if (initialTheme) {
      currentThemeMock = initialTheme;
    }
    return <>{children}</>;
  },
}));

vi.mock("../hooks/useSearch", () => ({
  useSearch: () => ({
    query: "",
    results: [],
    loading: false,
    handleSearch: vi.fn(),
    setQuery: vi.fn(),
  }),
}));

vi.mock("../hooks/useStorefrontSettings", () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: {
        id: "company-1",
        name: "max-p",
        logo: "https://example.com/logo.png",
      },
      storefront: {
        settings: {
          storeName: "max-p",
          description: "متجر max-p",
        },
      },
    },
    isLoading: false,
  }),
}));

vi.mock("../hooks/useStorefrontProducts", () => ({
  useStorefrontProducts: () => ({ products: [], loading: false }),
}));

vi.mock("../hooks/useStorefrontCategories", () => ({
  useStorefrontCategories: () => ({ categories: [], loading: false }),
}));

vi.mock("../hooks/useCategories", () => ({
  useCategories: () => ({ categories: [], loading: false, error: null }),
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@maxp.online", companyId: "company-1" },
  }),
}));

function dispatchTouchPointer(
  element: HTMLElement | Window | Document,
  type: string,
  options: { clientX: number; clientY: number; pointerId?: number; pointerType?: string }
) {
  act(() => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clientX", { value: options.clientX });
    Object.defineProperty(event, "clientY", { value: options.clientY });
    Object.defineProperty(event, "pointerType", { value: options.pointerType ?? "touch" });
    Object.defineProperty(event, "pointerId", { value: options.pointerId ?? 1 });
    element.dispatchEvent(event);
  });
}

describe("Ticket MOB-1: Touch Drag-and-Drop Reordering in Storefront Studio", () => {
  const threeSectionsTokens = {
    pages: {
      home: {
        id: "home",
        title: "الرئيسية",
        sections: validThreeSections,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentThemeMock = {
      id: "modern-minimal",
      name: "max-p",
      direction: "rtl",
      tokens: { colors: {}, typography: {}, shape: {} },
      header: { brandName: "max-p", navigation: [] },
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          sections: validThreeSections,
        },
      },
    };
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: pointerdown on handle + pointermove 20px + pointerup -> reordered exactly once
  it("1. pointerdown on drag handle + pointermove 20px + pointerup reorders section cleanly", () => {
    const onChange = vi.fn();
    const onSave = vi.fn();

    render(
      <MemoryRouter>
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={threeSectionsTokens}
          storeName="max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={onSave}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={onChange}
        />
      </MemoryRouter>
    );

    const handles = document.querySelectorAll<HTMLElement>("[data-studio-drag-handle='true']");
    expect(handles.length).toBeGreaterThanOrEqual(3);

    const firstHandle = handles[0];
    expect(firstHandle).toBeTruthy();

    // Start touch drag at (100, 100)
    dispatchTouchPointer(firstHandle, "pointerdown", { clientX: 100, clientY: 100 });

    // Move pointer 20px downwards (exceeds 8px threshold)
    dispatchTouchPointer(firstHandle, "pointermove", { clientX: 100, clientY: 120 });

    // Release pointer
    dispatchTouchPointer(firstHandle, "pointerup", { clientX: 100, clientY: 120 });

    // Verify onChange was triggered with reordered sections
    expect(onChange).toHaveBeenCalled();
    const lastCallArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const resultingSections = lastCallArg.pages.home.sections;
    expect(resultingSections).toBeDefined();
    // sec-hero moved down, so sec-products is now at index 0
    expect(resultingSections[0].key).toBe("sec-products");
    expect(resultingSections[1].key).toBe("sec-hero");
  });

  // Test 2: Movement < 8px -> NO drag initiated (normal scroll)
  it("2. movement < 8px does NOT initiate drag to preserve natural touch scrolling", () => {
    const onChange = vi.fn();

    render(
      <MemoryRouter>
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={threeSectionsTokens}
          storeName="max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={vi.fn()}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={onChange}
        />
      </MemoryRouter>
    );

    const handles = document.querySelectorAll<HTMLElement>("[data-studio-drag-handle='true']");
    const firstHandle = handles[0];
    expect(firstHandle).toBeTruthy();

    // Pointer down at (100, 100)
    dispatchTouchPointer(firstHandle, "pointerdown", { clientX: 100, clientY: 100 });

    // Move only 5px (below 8px threshold)
    dispatchTouchPointer(firstHandle, "pointermove", { clientX: 103, clientY: 104 });

    // Indicator must NOT be present
    expect(document.querySelector("[data-studio-touch-drop-indicator='true']")).toBeNull();

    // Release
    dispatchTouchPointer(firstHandle, "pointerup", { clientX: 103, clientY: 104 });

    // No reordering should happen
    expect(onChange).not.toHaveBeenCalled();
  });

  // Test 3: Escape key during active drag -> cancels drag without reordering
  it("3. Escape key during active touch drag cancels drag and preserves original section order", () => {
    const onChange = vi.fn();

    render(
      <MemoryRouter>
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={threeSectionsTokens}
          storeName="max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={vi.fn()}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={onChange}
        />
      </MemoryRouter>
    );

    const handles = document.querySelectorAll<HTMLElement>("[data-studio-drag-handle='true']");
    const firstHandle = handles[0];
    expect(firstHandle).toBeTruthy();

    // Start drag
    dispatchTouchPointer(firstHandle, "pointerdown", { clientX: 100, clientY: 100 });

    // Move 30px
    dispatchTouchPointer(firstHandle, "pointermove", { clientX: 100, clientY: 130 });

    // Indicator is visible
    expect(document.querySelector("[data-studio-touch-drop-indicator='true']")).not.toBeNull();

    // User presses Escape
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    // Indicator must immediately disappear
    expect(document.querySelector("[data-studio-touch-drop-indicator='true']")).toBeNull();

    // Releasing pointer after Escape does nothing
    dispatchTouchPointer(firstHandle, "pointerup", { clientX: 100, clientY: 130 });

    expect(onChange).not.toHaveBeenCalled();
  });

  // Test 4: touch-action: none on drag handle ONLY, never on canvas
  it("4. touch-action: none is applied strictly to drag handles, NOT to the canvas container", () => {
    render(
      <MemoryRouter>
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={threeSectionsTokens}
          storeName="max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={vi.fn()}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={vi.fn()}
        />
      </MemoryRouter>
    );

    const handles = document.querySelectorAll<HTMLElement>("[data-studio-drag-handle='true']");
    expect(handles.length).toBeGreaterThan(0);

    handles.forEach((handle) => {
      expect(handle.style.touchAction).toBe("none");
      expect(handle.className).toContain("touch-none");
    });

    // Check canvas/stage containers - none of them should have touch-action: none
    const stageContainer = document.querySelector(".min-h-\\[800px\\]");
    expect(stageContainer?.getAttribute("style") || "").not.toContain("touch-action: none");
  });

  // Test 5: Mouse path (mousedown/mousemove/mouseup / pointerType: mouse) remains working untouched
  it("5. desktop mouse path is not intercepted by touch drag hook", () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() =>
      useStudioTouchDrag({
        sections: validThreeSections,
        sectionKeys: ["sec-hero", "sec-products", "sec-newsletter"],
        activePageKey: "home",
        onReorder,
      })
    );

    // Simulate mouse pointerDown
    act(() => {
      result.current.handleTouchPointerDown(
        {
          pointerType: "mouse",
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          currentTarget: document.createElement("button"),
        } as any,
        0,
        "sec-hero"
      );
    });

    // Touch drag should NOT become active for mouse events
    expect(result.current.isTouchDragging).toBe(false);
    expect(result.current.activeTouchDragKey).toBeNull();
  });

  // Test 6: Drop indicator appears during drag and disappears after it
  it("6. drop indicator appears during drag and disappears cleanly after pointerup", () => {
    render(
      <MemoryRouter>
        <StorefrontStudioShell
          themeId="modern-minimal"
          designTokens={threeSectionsTokens}
          storeName="max-p"
          hasPendingChanges={false}
          saving={false}
          onSave={vi.fn()}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          onChange={vi.fn()}
        />
      </MemoryRouter>
    );

    // Initial state: no drop indicator
    expect(document.querySelector("[data-studio-touch-drop-indicator='true']")).toBeNull();

    const handles = document.querySelectorAll<HTMLElement>("[data-studio-drag-handle='true']");
    const firstHandle = handles[0];
    expect(firstHandle).toBeTruthy();

    // Pointerdown + move >= 8px
    dispatchTouchPointer(firstHandle, "pointerdown", { clientX: 100, clientY: 100 });
    dispatchTouchPointer(firstHandle, "pointermove", { clientX: 100, clientY: 125 });

    // Indicator must appear during drag
    expect(document.querySelector("[data-studio-touch-drop-indicator='true']")).not.toBeNull();

    // Release pointer
    dispatchTouchPointer(firstHandle, "pointerup", { clientX: 100, clientY: 125 });

    // Indicator must disappear after drag
    expect(document.querySelector("[data-studio-touch-drop-indicator='true']")).toBeNull();
  });

  // Test 7: computeTouchDropSlot unit test
  it("7. computeTouchDropSlot correctly computes drop slots across boundaries", () => {
    // 3 items, start from 0
    expect(computeTouchDropSlot(100, 100, 0, 3)).toBe(0);
    // Delta Y = +25 -> moves down to slot 1
    expect(computeTouchDropSlot(125, 100, 0, 3)).toBe(1);
    // Delta Y = -25 -> moves up
    expect(computeTouchDropSlot(75, 100, 2, 3)).toBe(1);
  });

  // Test 8: StorefrontStudioShell renders 8 registered sections without TDZ or ErrorBoundary issues
  it("8. renders StorefrontStudioShell cleanly with multiple sections without ErrorBoundary crash", () => {
    const eightValidSections = [
      { key: "sec-1", type: "hero-banner" },
      { key: "sec-2", type: "featured-products" },
      { key: "sec-3", type: "newsletter" },
      { key: "sec-4", type: "promo-strip" },
      { key: "sec-5", type: "product-grid" },
      { key: "sec-6", type: "reviews" },
      { key: "sec-7", type: "features-bar" },
      { key: "sec-8", type: "offer-bento" },
    ];

    currentThemeMock.pages.home.sections = eightValidSections;

    const eightSectionTokens = {
      pages: {
        home: {
          id: "home",
          title: "الرئيسية",
          sections: eightValidSections,
        },
      },
    };

    expect(() => {
      render(
        <MemoryRouter>
          <StorefrontStudioShell
            themeId="modern-minimal"
            designTokens={eightSectionTokens}
            storeName="max-p"
            hasPendingChanges={false}
            saving={false}
            onSave={vi.fn()}
            onBack={vi.fn()}
            onOpenPreview={vi.fn()}
            onChange={vi.fn()}
          />
        </MemoryRouter>
      );
    }).not.toThrow();

    // Verify all 8 drag handles exist
    const handles = screen.getAllByTestId("studio-drag-handle");
    expect(handles.length).toBe(8);
  });
});
