// @vitest-environment jsdom
import React, { useState } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  StudioOnboarding,
  ONBOARDING_STEPS,
  STUDIO_ONBOARDING_STORAGE_KEY,
  isOnboardingCompleted,
  markOnboardingCompleted,
  resetOnboarding,
} from "../studio/StudioOnboarding";
import { StudioStatusBar } from "../studio/StudioStatusBar";

// Unicode emoji range regex to verify strict zero-emoji enforcement
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;

describe("Storefront Studio Onboarding (ONB-1)", () => {
  let inMemoryStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    inMemoryStore = {};

    const mockStorage: Storage = {
      getItem: vi.fn((key: string) => inMemoryStore[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        inMemoryStore[key] = String(val);
      }),
      removeItem: vi.fn((key: string) => {
        delete inMemoryStore[key];
      }),
      clear: vi.fn(() => {
        inMemoryStore = {};
      }),
      get length() {
        return Object.keys(inMemoryStore).length;
      },
      key: vi.fn((idx: number) => Object.keys(inMemoryStore)[idx] ?? null),
    };

    try {
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });
    } catch {
      // ignore
    }
    try {
      Object.defineProperty(globalThis, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });
    } catch {
      // ignore
    }
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // Acceptance #5: Steps count = 4 and zero emojis in text
  it("case 1: verified exactly 4 steps exist and all text has zero emojis", () => {
    expect(ONBOARDING_STEPS.length).toBe(4);

    const stepTitlesAr = ONBOARDING_STEPS.map((s) => s.titleAr);
    expect(stepTitlesAr).toEqual([
      "الكشف عن العناصر",
      "إضافة قسم",
      "تحرير نص",
      "نشر",
    ]);

    // Check zero emojis in all steps (Arabic and English)
    ONBOARDING_STEPS.forEach((step) => {
      expect(EMOJI_REGEX.test(step.titleAr)).toBe(false);
      expect(EMOJI_REGEX.test(step.descAr)).toBe(false);
      expect(EMOJI_REGEX.test(step.targetHintAr)).toBe(false);
      expect(EMOJI_REGEX.test(step.titleEn)).toBe(false);
      expect(EMOJI_REGEX.test(step.descEn)).toBe(false);
      expect(EMOJI_REGEX.test(step.targetHintEn)).toBe(false);
    });
  });

  // Acceptance #2: First open (empty localStorage) -> tour is visible -> skip -> hidden + key written
  it("case 2: first run shows onboarding tour; clicking skip hides it and writes localStorage key", () => {
    expect(localStorage.getItem(STUDIO_ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(isOnboardingCompleted()).toBe(false);

    const onClose = vi.fn();
    render(<StudioOnboarding onClose={onClose} />);

    // Assert tour is visible
    const modal = screen.getByTestId("studio-onboarding-modal");
    expect(modal).not.toBeNull();
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("الكشف عن العناصر");
    expect(screen.getByTestId("onboarding-step-indicator").textContent).toContain("الخطوة 1 من 4");

    // Click "تخطي" (Skip)
    const skipButton = screen.getByTestId("onboarding-skip-btn");
    expect(skipButton).not.toBeNull();
    fireEvent.click(skipButton);

    // Assert key is written to localStorage
    expect(localStorage.getItem(STUDIO_ONBOARDING_STORAGE_KEY)).toBe("true");
    expect(isOnboardingCompleted()).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Assert modal is removed from DOM (canvas not blocked)
    expect(screen.queryByTestId("studio-onboarding-modal")).toBeNull();
  });

  // Acceptance #3: Subsequent open -> NOT visible
  it("case 3: subsequent open when key is set does not show the onboarding tour", () => {
    localStorage.setItem(STUDIO_ONBOARDING_STORAGE_KEY, "true");
    expect(isOnboardingCompleted()).toBe(true);

    const onClose = vi.fn();
    render(<StudioOnboarding onClose={onClose} />);

    // Assert NOT visible
    expect(screen.queryByTestId("studio-onboarding-modal")).toBeNull();
  });

  // Acceptance #4: Triggering from '?' button in StudioStatusBar shows tour again
  it("case 4: clicking '?' button in StudioStatusBar reopens the onboarding tour", () => {
    localStorage.setItem(STUDIO_ONBOARDING_STORAGE_KEY, "true");

    const StudioHostWithStatusBar: React.FC = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <StudioStatusBar
            pageLabel="الرئيسية"
            deviceMode="desktop"
            onOpenOnboarding={() => setIsOpen(true)}
          />
          <StudioOnboarding isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      );
    };

    render(<StudioHostWithStatusBar />);

    // Initially closed because localStorage has the key and isOpen=false
    expect(screen.queryByTestId("studio-onboarding-modal")).toBeNull();

    // Click '؟' button in status bar
    const helpBtn = screen.getByRole("button", { name: "؟" });
    expect(helpBtn).not.toBeNull();
    fireEvent.click(helpBtn);

    // Assert tour re-opens!
    expect(screen.getByTestId("studio-onboarding-modal")).not.toBeNull();
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("الكشف عن العناصر");
  });

  // Flow through all 4 steps sequentially to "Finish"
  it("case 5: stepping through all 4 steps updates indicators and finish button marks completed", () => {
    const onClose = vi.fn();
    render(<StudioOnboarding onClose={onClose} />);

    // Step 1: الكشف عن العناصر
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("الكشف عن العناصر");
    expect(screen.getByTestId("onboarding-step-indicator").textContent).toContain("الخطوة 1 من 4");
    expect(screen.queryByTestId("onboarding-prev-btn")).toBeNull(); // No prev on step 1

    // Next -> Step 2: إضافة قسم
    fireEvent.click(screen.getByTestId("onboarding-next-btn"));
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("إضافة قسم");
    expect(screen.getByTestId("onboarding-step-indicator").textContent).toContain("الخطوة 2 من 4");
    expect(screen.getByTestId("onboarding-prev-btn")).not.toBeNull();

    // Next -> Step 3: تحرير نص
    fireEvent.click(screen.getByTestId("onboarding-next-btn"));
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("تحرير نص");
    expect(screen.getByTestId("onboarding-step-indicator").textContent).toContain("الخطوة 3 من 4");

    // Next -> Step 4: نشر
    fireEvent.click(screen.getByTestId("onboarding-next-btn"));
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("نشر");
    expect(screen.getByTestId("onboarding-step-indicator").textContent).toContain("الخطوة 4 من 4");

    // On step 4, the primary button is "إنهاء" (Finish)
    const finishBtn = screen.getByTestId("onboarding-finish-btn");
    expect(finishBtn.textContent).toContain("إنهاء");
    fireEvent.click(finishBtn);

    // Modal is dismissed and key written
    expect(localStorage.getItem(STUDIO_ONBOARDING_STORAGE_KEY)).toBe("true");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("studio-onboarding-modal")).toBeNull();
  });

  // Action: "ابدأ من قالب جاهز"
  it("case 6: clicking 'ابدأ من قالب جاهز' triggers template gallery callback and dismisses tour", () => {
    const onStartFromTemplate = vi.fn();
    const onClose = vi.fn();
    render(
      <StudioOnboarding
        onStartFromTemplate={onStartFromTemplate}
        onClose={onClose}
      />
    );

    const templateBtn = screen.getByTestId("onboarding-start-template-btn");
    expect(templateBtn.textContent).toContain("ابدأ من قالب جاهز");
    fireEvent.click(templateBtn);

    expect(onStartFromTemplate).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(STUDIO_ONBOARDING_STORAGE_KEY)).toBe("true");
    expect(screen.queryByTestId("studio-onboarding-modal")).toBeNull();
  });

  // Server state respect: when serverOnboarded is true, tour does not open on empty localStorage
  it("case 7: respects serverOnboarded flag even with empty localStorage", () => {
    render(<StudioOnboarding serverOnboarded={true} />);
    expect(screen.queryByTestId("studio-onboarding-modal")).toBeNull();
  });

  // English localization & LTR support with zero emojis
  it("case 8: renders in English with LTR direction and zero emojis when lang='en'", () => {
    render(<StudioOnboarding lang="en" />);

    const modal = screen.getByTestId("studio-onboarding-modal");
    expect(modal.getAttribute("dir")).toBe("ltr");

    // English step title
    expect(screen.getByTestId("onboarding-step-title").textContent).toContain("Discover Elements");
    expect(screen.getByTestId("onboarding-step-indicator").textContent).toContain("Step 1 of 4");
    expect(screen.getByTestId("onboarding-skip-btn").textContent).toContain("Skip");
    expect(screen.getByTestId("onboarding-start-template-btn").textContent).toContain("Start from a template");
    expect(screen.getByTestId("onboarding-next-btn").textContent).toContain("Next");

    // Text has zero emoji
    expect(EMOJI_REGEX.test(modal.textContent || "")).toBe(false);
  });
});
