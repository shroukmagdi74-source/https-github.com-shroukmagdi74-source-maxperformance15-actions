// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import fs from "fs";
import path from "path";

import {
  StorefrontSectionFrame,
  isReducedMotionActive,
} from "../layout/StorefrontSectionFrame";

// Mock ThemeProvider for StorefrontSectionFrame
vi.mock("../engine/ThemeProvider", () => ({
  useStorefrontTheme: () => ({
    theme: { id: "clean-standard", direction: "rtl" },
    pageStyleVars: {
      "--store-accent": "#2b6cf6",
      "--store-font-family": "Cairo, sans-serif",
    },
  }),
  StorefrontThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock analytics beacon
vi.mock("../analytics/beacon", () => ({
  observeSectionView: vi.fn(() => () => {}),
  trackClick: vi.fn(),
}));

describe("Ticket ANIM-1.1: إصلاح حرج — الأقسام بتفضل مخفية (opacity 0)", () => {
  let intersectionCallbacks: Array<(entries: any[]) => void> = [];
  let observedElements: Element[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    intersectionCallbacks = [];
    observedElements = [];

    // Setup Mock IntersectionObserver
    class MockIntersectionObserver {
      observe = vi.fn((el: Element) => {
        observedElements.push(el);
      });
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(callback: any) {
        intersectionCallbacks.push(callback);
      }
    }
    global.IntersectionObserver = MockIntersectionObserver as any;

    // Default window.matchMedia mock (prefers-reduced-motion: false)
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock requestAnimationFrame
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 0) as unknown as number;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id: number) => {
      clearTimeout(id);
    });

    // Default window dimensions
    Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { pathname: "/store/home" },
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. العناصر الظاهرة في الشاشة وقت التحميل: تضاف لها is-visible فورًا
  // ─────────────────────────────────────────────────────────────
  it("Test 1: Elements already in viewport at load time receive is-visible immediately (getBoundingClientRect)", () => {
    // Mock getBoundingClientRect so element is within the 800px viewport
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 50,
      bottom: 400,
      left: 0,
      right: 1000,
      width: 1000,
      height: 350,
    });

    const { container } = render(
      <StorefrontSectionFrame
        index={0}
        sectionEntry={{
          type: "hero",
          key: "hero-top",
          settings: {
            animation: {
              entrance: { type: "fade", duration: 600, delay: 200 },
            },
          },
        }}
        element={<div>محتوى الهيرو</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(sectionEl.getAttribute("data-anim-in")).toBe("fade");
    expect(sectionEl.classList.contains("sf-anim-entrance")).toBe(true);

    // Because it is in the viewport, is-visible is attached immediately
    expect(sectionEl.classList.contains("is-visible")).toBe(true);
    expect(sectionEl.getAttribute("data-anim-visible")).toBe("true");
    expect(sectionEl.style.opacity).toBe("1");

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  // ─────────────────────────────────────────────────────────────
  // 2. العناصر البعيدة (خارج الشاشة): تظهر عند وصول IntersectionObserver
  // ─────────────────────────────────────────────────────────────
  it("Test 2: Offscreen elements remain initial until IntersectionObserver fires or user scrolls", () => {
    // Mock getBoundingClientRect to be well below the fold (top: 1500)
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 1500,
      bottom: 1900,
      left: 0,
      right: 1000,
      width: 1000,
      height: 400,
    });

    const { container } = render(
      <StorefrontSectionFrame
        index={3}
        sectionEntry={{
          type: "products",
          key: "products-grid",
          settings: {
            animation: {
              entrance: { type: "slide-up", duration: 600, delay: 0 },
            },
          },
        }}
        element={<div>شبكة المنتجات</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(sectionEl.getAttribute("data-anim-in")).toBe("slide-up");
    expect(sectionEl.classList.contains("is-visible")).toBe(false);
    expect(sectionEl.style.opacity).toBe("0");
    expect(sectionEl.style.transform).toBe("translateY(30px)");

    // Simulate scroll trigger via IntersectionObserver callback
    expect(intersectionCallbacks.length).toBeGreaterThan(0);
    act(() => {
      intersectionCallbacks.forEach((cb) => {
        cb([{ isIntersecting: true, target: sectionEl }]);
      });
    });

    // After scroll / intersection, becomes visible
    expect(sectionEl.classList.contains("is-visible")).toBe(true);
    expect(sectionEl.getAttribute("data-anim-visible")).toBe("true");
    expect(sectionEl.style.opacity).toBe("1");
    expect(sectionEl.style.transform).toBe("translateY(0)");

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  // ─────────────────────────────────────────────────────────────
  // 3. شبكة الأمان: Fallback 1200ms يضمن الظهور (المحتوى مايسبش مخفي أبدًا)
  // ─────────────────────────────────────────────────────────────
  it("Test 3: Safety net fallback timer (1200ms) guarantees visibility even if observer never triggers", () => {
    vi.useFakeTimers();
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    try {
      // Element initially below viewport
      Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        bottom: 2400,
        left: 0,
        right: 1000,
        width: 1000,
        height: 400,
      });

      const { container } = render(
        <StorefrontSectionFrame
          index={4}
          sectionEntry={{
            type: "testimonials",
            key: "testimonials-sec",
            settings: {
              animation: {
                entrance: { type: "fade", duration: 600, delay: 200 },
              },
            },
          }}
          element={<div>آراء العملاء</div>}
        />
      );

      const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
      expect(sectionEl).toBeTruthy();
      expect(sectionEl.classList.contains("is-visible")).toBe(false);
      expect(sectionEl.style.opacity).toBe("0");

      // Advance timer by 1200ms (fallback activates without observer firing)
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      // Guaranteed visibility
      expect(sectionEl.classList.contains("is-visible")).toBe(true);
      expect(sectionEl.getAttribute("data-anim-visible")).toBe("true");
      expect(sectionEl.style.opacity).toBe("1");
    } finally {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      vi.useRealTimers();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 4. الهوفر: التحويل يشتغل عبر CSS :hover و.sf-anim-hover-lift:hover
  // ─────────────────────────────────────────────────────────────
  it("Test 4: Hover interaction classes and CSS :hover rules are present and enforce translateY(-4px)", () => {
    const { container } = render(
      <StorefrontSectionFrame
        index={1}
        sectionEntry={{
          type: "banner",
          key: "banner-sec",
          settings: {
            animation: {
              hover: "lift",
            },
          },
        }}
        element={<div>بنر تسويقي</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(sectionEl.getAttribute("data-anim-hover")).toBe("lift");
    expect(sectionEl.classList.contains("sf-anim-hover-lift")).toBe(true);

    // Verify CSS rules in storefront-animations.css include .sf-anim-hover-lift:hover with translateY(-4px)
    const cssPath = path.resolve(__dirname, "../styles/storefront-animations.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain(".sf-anim-hover-lift:hover");
    expect(cssContent).toContain("translateY(-4px)");
    expect(cssContent).toContain("!important");
    expect(cssContent).toContain(".sf-anim-hover-scale:hover");
    expect(cssContent).toContain(".sf-anim-hover-glow:hover");
  });

  // ─────────────────────────────────────────────────────────────
  // 5. الكانفس في المحرر: مايسبش الأقسام مخفية (المحرر لازم يشوفها دايمًا)
  // ─────────────────────────────────────────────────────────────
  it("Test 5: Editor canvas never leaves sections hidden", () => {
    // Simulate studio / editor URL
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { pathname: "/settings/storefront/editor" },
    });

    const { container } = render(
      <StorefrontSectionFrame
        index={0}
        sectionEntry={{
          type: "hero",
          key: "hero-editor",
          settings: {
            animation: {
              entrance: { type: "slide-up", duration: 600, delay: 200 },
            },
          },
        }}
        element={<div>قسم داخل المحرر</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    // In editor, section must be visible immediately
    expect(sectionEl.classList.contains("is-visible")).toBe(true);
    expect(sectionEl.style.opacity).toBe("1");

    // Also verify CSS guard for studio canvas
    const cssPath = path.resolve(__dirname, "../styles/storefront-animations.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain("[data-studio-sortable-section]");
    expect(cssContent).toContain("opacity: 1 !important");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. تفضيل تقليل الحركة (prefers-reduced-motion): تعطيل كامل وظهور فوري
  // ─────────────────────────────────────────────────────────────
  it("Test 6: prefers-reduced-motion: reduce reveals content immediately without transition", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <StorefrontSectionFrame
        index={2}
        sectionEntry={{
          type: "cta",
          key: "cta-accessible",
          settings: {
            animation: {
              entrance: { type: "fade", duration: 600, delay: 200 },
            },
          },
        }}
        element={<div>دعوة للإجراء</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(isReducedMotionActive()).toBe(true);
    expect(sectionEl.classList.contains("is-visible")).toBe(true);
    expect(sectionEl.style.opacity).not.toBe("0");
    expect(sectionEl.style.transitionDuration).toBe("");
  });

  // ─────────────────────────────────────────────────────────────
  // 7. القياس الحي المحدد في التكت: fade/600/200 → opacity = 1 في ≤1.5s
  // ─────────────────────────────────────────────────────────────
  it("Test 7: Ticket Criterion Verification — entrance fade/600/200 reaches opacity = 1 in <= 1.5s", () => {
    vi.useFakeTimers();
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    try {
      Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 1800,
        bottom: 2200,
        left: 0,
        right: 1000,
        width: 1000,
        height: 400,
      });

      const { container } = render(
        <StorefrontSectionFrame
          index={5}
          sectionEntry={{
            type: "footer-promo",
            key: "promo-sec",
            settings: {
              animation: {
                entrance: { type: "fade", duration: 600, delay: 200 },
              },
            },
          }}
          element={<div>عرض خاص</div>}
        />
      );

      const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
      expect(sectionEl.style.opacity).toBe("0");

      // Advance 1400ms (<= 1.5s)
      act(() => {
        vi.advanceTimersByTime(1400);
      });

      // Confirm measured opacity is 1
      expect(sectionEl.style.opacity).toBe("1");
      expect(sectionEl.classList.contains("is-visible")).toBe(true);
    } finally {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      vi.useRealTimers();
    }
  });
});
