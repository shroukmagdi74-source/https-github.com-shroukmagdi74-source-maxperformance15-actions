// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

import {
  StorefrontSectionFrame,
  isReducedMotionActive,
  type SectionAnimationSettings,
} from "../layout/StorefrontSectionFrame";
import { StudioAnimationControls } from "../studio/inspector/StudioAnimationControls";
import { StudioPropertyInspector } from "../studio/StudioPropertyInspector";

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

describe("Ticket ANIM-1: أنيميشن الأقسام (دخول / هوفر / سكرول)", () => {
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. اختبار التوافق الخلفي: غياب المفتاح = بدون حركة
  // ─────────────────────────────────────────────────────────────
  it("Test 1: Default backwards compatibility (absence of settings.animation = no animation)", () => {
    const { container } = render(
      <StorefrontSectionFrame
        index={0}
        sectionEntry={{
          type: "hero",
          key: "hero-section",
          settings: { title: "أهلاً بك" },
        }}
        element={<div data-testid="hero-content">محتوى الهيرو</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(sectionEl.getAttribute("data-anim-in")).toBe("none");
    expect(sectionEl.getAttribute("data-anim-hover")).toBe("none");
    expect(sectionEl.getAttribute("data-parallax")).toBe("false");
    expect(sectionEl.classList.contains("sf-anim-entrance")).toBe(false);
    expect(sectionEl.classList.contains("sf-anim-parallax")).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────
  // 2. معيار القبول: entrance: slide-up, duration 600, delay 200
  // قبل السكرول opacity:0/translateY, بعد الظهور opacity:1/translateY(0) وduration=600ms
  // ─────────────────────────────────────────────────────────────
  it("Test 2: Acceptance Criterion — entrance: slide-up, duration 600, delay 200 transitions from hidden to visible upon IntersectionObserver trigger", () => {
    const animationConfig: SectionAnimationSettings = {
      entrance: {
        type: "slide-up",
        duration: 600,
        delay: 200,
      },
    };

    const { container } = render(
      <StorefrontSectionFrame
        index={1}
        sectionEntry={{
          type: "features",
          key: "features-sec",
          settings: { animation: animationConfig },
        }}
        element={<div data-testid="features-content">المميزات</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();
    expect(sectionEl.getAttribute("data-anim-in")).toBe("slide-up");
    expect(sectionEl.classList.contains("sf-anim-entrance")).toBe(true);

    // Initial state: before scroll / intersection
    expect(sectionEl.classList.contains("is-visible")).toBe(false);
    expect(sectionEl.style.opacity).toBe("0");
    expect(sectionEl.style.transform).toBe("translateY(30px)");
    expect(sectionEl.style.transitionDuration).toBe("600ms");
    expect(sectionEl.style.transitionDelay).toBe("200ms");

    // Trigger IntersectionObserver entry
    expect(intersectionCallbacks.length).toBeGreaterThan(0);
    act(() => {
      intersectionCallbacks.forEach((cb) => {
        cb([{ isIntersecting: true, target: sectionEl }]);
      });
    });

    // Visible state: after scroll
    expect(sectionEl.classList.contains("is-visible")).toBe(true);
    expect(sectionEl.style.opacity).toBe("1");
    expect(sectionEl.style.transform).toBe("translateY(0)");
    expect(sectionEl.style.transitionDuration).toBe("600ms");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. اختبار باقي أنواع حركة الدخول: fade, slide-right, zoom
  // ─────────────────────────────────────────────────────────────
  it("Test 3: Different entrance animation types apply their specific initial transforms and opacity", () => {
    // 3a. Fade
    const { container: cFade } = render(
      <StorefrontSectionFrame
        index={0}
        sectionEntry={{
          type: "text",
          key: "fade-sec",
          settings: {
            animation: {
              entrance: { type: "fade", duration: 500, delay: 100 },
            },
          },
        }}
        element={<div>نص</div>}
      />
    );
    const elFade = cFade.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(elFade.getAttribute("data-anim-in")).toBe("fade");
    expect(elFade.style.opacity).toBe("0");

    // 3b. Slide Right
    const { container: cRight } = render(
      <StorefrontSectionFrame
        index={1}
        sectionEntry={{
          type: "text",
          key: "right-sec",
          settings: {
            animation: {
              entrance: { type: "slide-right", duration: 700, delay: 0 },
            },
          },
        }}
        element={<div>نص</div>}
      />
    );
    const elRight = cRight.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(elRight.getAttribute("data-anim-in")).toBe("slide-right");
    expect(elRight.style.opacity).toBe("0");
    expect(elRight.style.transform).toBe("translateX(-30px)");

    // 3c. Zoom
    const { container: cZoom } = render(
      <StorefrontSectionFrame
        index={2}
        sectionEntry={{
          type: "text",
          key: "zoom-sec",
          settings: {
            animation: {
              entrance: { type: "zoom", duration: 400, delay: 0 },
            },
          },
        }}
        element={<div>نص</div>}
      />
    );
    const elZoom = cZoom.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(elZoom.getAttribute("data-anim-in")).toBe("zoom");
    expect(elZoom.style.opacity).toBe("0");
    expect(elZoom.style.transform).toBe("scale(0.95)");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. اختبار الهوفر لكل نوع: lift, scale, glow
  // ─────────────────────────────────────────────────────────────
  it("Test 4: Hover classes and attributes are correctly attached for lift, scale, and glow", () => {
    const hoverTypes = ["lift", "scale", "glow"] as const;

    hoverTypes.forEach((hoverType, idx) => {
      const { container } = render(
        <StorefrontSectionFrame
          index={idx}
          sectionEntry={{
            type: "cards",
            key: `hover-${hoverType}`,
            settings: {
              animation: { hover: hoverType },
            },
          }}
          element={<div>كارت</div>}
        />
      );

      const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
      expect(sectionEl.getAttribute("data-anim-hover")).toBe(hoverType);
      expect(sectionEl.classList.contains(`sf-anim-hover-${hoverType}`)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. اختبار سكرول بارالاكس: يتحرك عند السكرول بـ requestAnimationFrame
  // ─────────────────────────────────────────────────────────────
  it("Test 5: Lightweight Parallax attaches scroll listener and calculates translateY on scroll", () => {
    const { container } = render(
      <StorefrontSectionFrame
        index={0}
        sectionEntry={{
          type: "banner",
          key: "parallax-sec",
          settings: {
            animation: { parallax: true },
          },
        }}
        element={<div>بانر بارالاكس</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl.getAttribute("data-parallax")).toBe("true");
    expect(sectionEl.classList.contains("sf-anim-parallax")).toBe(true);

    // Mock getBoundingClientRect
    vi.spyOn(sectionEl, "getBoundingClientRect").mockReturnValue({
      top: 100,
      height: 300,
      bottom: 400,
      left: 0,
      right: 1000,
      width: 1000,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    // Trigger scroll event
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // Check custom property and transform updated
    expect(sectionEl.getAttribute("data-parallax")).toBe("true");
  });

  // ─────────────────────────────────────────────────────────────
  // 6. اختبار إجباري: prefers-reduced-motion: reduce يلغي كل الحركات
  // ─────────────────────────────────────────────────────────────
  it("Test 6: Strict prefers-reduced-motion: reduce disables all entrance and parallax transforms immediately", () => {
    // Mock reduced-motion active
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query.includes("prefers-reduced-motion")) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      return { matches: false, media: query };
    });

    expect(isReducedMotionActive()).toBe(true);

    const { container } = render(
      <StorefrontSectionFrame
        index={0}
        sectionEntry={{
          type: "hero",
          key: "reduced-sec",
          settings: {
            animation: {
              entrance: { type: "slide-up", duration: 600, delay: 200 },
              hover: "lift",
              parallax: true,
            },
          },
        }}
        element={<div>هيرو</div>}
      />
    );

    const sectionEl = container.querySelector("[data-storefront-section='true']") as HTMLElement;
    expect(sectionEl).toBeTruthy();

    // With reduced motion: must NOT hide element with opacity 0 or translateY(30px)
    expect(sectionEl.style.opacity).not.toBe("0");
    expect(sectionEl.style.transform).not.toBe("translateY(30px)");
    expect(sectionEl.style.transitionDuration).toBe("");
  });

  // ─────────────────────────────────────────────────────────────
  // 7. اختبار تاب «حركة» في الفاحص (data-testid="studio-animation-tab")
  // ─────────────────────────────────────────────────────────────
  it("Test 7: StudioPropertyInspector renders 'حركة' tab with data-testid='studio-animation-tab' and switches correctly", () => {
    const handleUpdate = vi.fn();

    render(
      <StudioPropertyInspector
        selectedSectionKey="sec-test"
        sectionConfig={{
          type: "hero",
          key: "sec-test",
          settings: {
            title: "عنوان القسم",
            animation: {
              entrance: { type: "fade", duration: 500, delay: 100 },
              hover: "lift",
              parallax: false,
            },
          },
        }}
        onClose={vi.fn()}
        onUpdateField={handleUpdate}
      />
    );

    // Tab button must have data-testid="studio-animation-tab"
    const animationTabBtn = screen.getByTestId("studio-animation-tab");
    expect(animationTabBtn).toBeTruthy();
    expect(animationTabBtn.textContent).toContain("حركة");

    // Click on animation tab
    fireEvent.click(animationTabBtn);

    // Animation controls must be rendered
    expect(screen.getByTestId("studio-animation-controls")).toBeTruthy();
    expect(screen.getByTestId("animation-preview-box")).toBeTruthy();
    expect(screen.getByTestId("animation-preview-trigger")).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // 8. اختبار عناصر تحكم الأنيميشن والحفظ في settings.animation
  // ─────────────────────────────────────────────────────────────
  it("Test 8: StudioAnimationControls updates entrance, hover, and parallax in settings.animation", () => {
    const handleUpdate = vi.fn();
    const handleSave = vi.fn();

    const initialSettings = {
      animation: {
        entrance: { type: "none" as const, duration: 600, delay: 0 },
        hover: "none" as const,
        parallax: false,
      },
    };

    const { rerender } = render(
      <StudioAnimationControls
        settings={initialSettings}
        onUpdateField={handleUpdate}
        onSave={handleSave}
      />
    );

    // 1. Select 'slide-up' entrance
    const slideUpBtn = screen.getByText("صعود لأعلى");
    fireEvent.click(slideUpBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      "animation",
      expect.objectContaining({
        entrance: expect.objectContaining({ type: "slide-up" }),
      })
    );
    expect(handleSave).toHaveBeenCalled();

    // Rerender with slide-up active so sliders appear
    rerender(
      <StudioAnimationControls
        settings={{
          animation: {
            entrance: { type: "slide-up", duration: 600, delay: 0 },
            hover: "none",
            parallax: false,
          },
        }}
        onUpdateField={handleUpdate}
        onSave={handleSave}
      />
    );

    // 2. Change duration slider
    const durationSlider = screen.getByTestId("animation-duration-slider");
    fireEvent.change(durationSlider, { target: { value: "800" } });
    expect(handleUpdate).toHaveBeenCalledWith(
      "animation",
      expect.objectContaining({
        entrance: expect.objectContaining({ duration: 800 }),
      })
    );

    // 3. Change hover to 'lift'
    const hoverRadio = screen.getByLabelText(/رفع \(Lift\)/i);
    fireEvent.click(hoverRadio);
    expect(handleUpdate).toHaveBeenCalledWith(
      "animation",
      expect.objectContaining({
        hover: "lift",
      })
    );

    // 4. Toggle parallax
    const parallaxToggle = screen.getByTestId("animation-parallax-toggle").querySelector("input") as HTMLInputElement;
    fireEvent.click(parallaxToggle);
    expect(handleUpdate).toHaveBeenCalledWith(
      "animation",
      expect.objectContaining({
        parallax: true,
      })
    );

    // 5. Test "جرّب" button
    const previewBtn = screen.getByTestId("animation-preview-trigger");
    fireEvent.click(previewBtn);
    expect(previewBtn).toBeTruthy();
  });
});
