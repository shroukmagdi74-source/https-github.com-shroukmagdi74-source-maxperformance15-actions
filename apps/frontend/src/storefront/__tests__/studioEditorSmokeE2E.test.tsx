// @vitest-environment jsdom
import "./setup/storefrontTestSetup";
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, renderHook, act } from "@testing-library/react";

// Mock i18n and toast before any component imports
vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: "ar",
  },
}));

vi.mock("@/i18n", () => ({
  default: {
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: "ar",
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
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

// Mock simple auth hook
const mockStudioUser = { companyId: "test-company-123", name: "Test Store" };
vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockStudioUser,
  }),
}));

// Mock analytics beacon
vi.mock("../analytics/beacon", () => ({
  trackStudioOpen: vi.fn(),
  trackStudioPublish: vi.fn(),
  trackStudioTemplateApply: vi.fn(),
  trackStudioAiOpen: vi.fn(),
  trackStudioError: vi.fn(),
  sendAnalyticsEvent: vi.fn(),
  setStorefrontCompanySlug: vi.fn(),
  setStorefrontCompanyId: vi.fn(),
}));

import { StorefrontStudioShell } from "../studio/StorefrontStudioShell";
import { useStorefrontStudioState } from "../studio/hooks/useStorefrontStudioState";
import { StudioErrorBoundary } from "../studio/StudioErrorBoundary";
import { toast } from "sonner";
import { DEFAULT_STOREFRONT_THEME_ID } from "../themes";

describe("Ticket E2E-1: Storefront Studio Editor Automated Smoke Suite", () => {
  const baseDesignTokens = {
    themeId: DEFAULT_STOREFRONT_THEME_ID,
    pages: {
      home: {
        id: "home",
        title: "الرئيسية",
        sections: [
          {
            key: "sec-hero-1",
            type: "hero-banner",
            settings: {
              title: "مرحبًا بكم في متجرنا",
              subtitle: "اكتشف أحدث التشكيلات والعروض",
            },
          },
          {
            key: "sec-products-1",
            type: "featured-products",
            settings: {
              title: "المنتجات المميزة",
              columns: 4,
            },
          },
        ],
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.setPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/store-pages/")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: "about-us", slug: "about-us", title: "من نحن" },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  // ─────────────────────────────────────────────────────────────
  // سيناريو 1: فتح المحرر بدون ErrorBoundary
  // ─────────────────────────────────────────────────────────────
  it("Scenario 1: Opens editor successfully without triggering ErrorBoundary", () => {
    const onSave = vi.fn();
    const onChange = vi.fn();

    const { queryByTestId } = render(
      <StorefrontStudioShell
        themeId={DEFAULT_STOREFRONT_THEME_ID}
        designTokens={baseDesignTokens}
        storeName="متجر الاختبار"
        hasPendingChanges={false}
        saving={false}
        onSave={onSave}
        onBack={vi.fn()}
        onOpenPreview={vi.fn()}
        onChange={onChange}
      />
    );

    // 1. TopBar and action controls render cleanly
    const settingsButton = screen.getByTestId("studio-page-settings-button");
    expect(settingsButton).toBeTruthy();

    const publishButton = screen.getByTestId("studio-publish-button");
    expect(publishButton).toBeTruthy();

    // 2. Sections in canvas render without crashing
    const sortableSections = document.querySelectorAll(
      "[data-studio-sortable-section='true']"
    );
    expect(sortableSections.length).toBeGreaterThan(0);

    // 3. ZERO ErrorBoundary failures
    const errorFallback = queryByTestId("studio-error-boundary-fallback");
    expect(errorFallback).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // سيناريو 2: إضافة قسم من المكتبة
  // ─────────────────────────────────────────────────────────────
  it("Scenario 2: Adds a new section from the library into the active page", () => {
    let currentTokens = { ...baseDesignTokens };
    const onChange = vi.fn((next) => {
      currentTokens = next;
    });
    const onSave = vi.fn();

    const { result } = renderHook(() =>
      useStorefrontStudioState({
        themeId: DEFAULT_STOREFRONT_THEME_ID,
        designTokens: currentTokens,
        onSave,
        onChange,
      })
    );

    expect(result.current.activeSections.length).toBe(2);

    // Add a promo-strip section from library
    act(() => {
      result.current.handleAddSection("promo-strip");
    });

    // Verify sections count incremented
    expect(result.current.activeSections.length).toBe(3);

    // Verify new section has type promo-strip and starter settings
    const added = result.current.activeSections[2];
    expect(added.type).toBe("promo-strip");
    expect(added.settings.badge).toBe("عرض خاص");

    // Verify newly added section is selected as active in editor
    expect(result.current.selectedSectionKey).toBe(added.key);
    expect(onChange).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // سيناريو 3: تحرير عنوان + حفظ تلقائي
  // ─────────────────────────────────────────────────────────────
  it("Scenario 3: Edits headline/title and propagates changes to save pipeline", () => {
    let currentTokens = { ...baseDesignTokens };
    const onChange = vi.fn((next) => {
      currentTokens = next;
    });
    const onSave = vi.fn();

    const { result } = renderHook(() =>
      useStorefrontStudioState({
        themeId: DEFAULT_STOREFRONT_THEME_ID,
        designTokens: currentTokens,
        onSave,
        onChange,
      })
    );

    // Select the hero section
    act(() => {
      result.current.setSelectedSectionKey("sec-hero-1");
    });

    const newHeadline = "أقوى عروض الموسم الحصرية 2026";

    // Update the title field
    act(() => {
      result.current.handleUpdateSectionField("title", newHeadline, "desktop");
    });

    // Verify field updated in active section settings
    const updatedHero = result.current.activeSections.find(
      (s: any) => s.key === "sec-hero-1"
    );
    expect(updatedHero?.settings?.title).toBe(newHeadline);

    // Verify change handler was triggered with updated design tokens
    expect(onChange).toHaveBeenCalled();
    const lastEmittedTokens = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const emittedHero = (lastEmittedTokens.pages?.home?.sections || []).find(
      (s: any) => s.key === "sec-hero-1"
    );
    expect(emittedHero?.settings?.title).toBe(newHeadline);
  });

  // ─────────────────────────────────────────────────────────────
  // سيناريو 4: إنشاء صفحة + تبديل
  // ─────────────────────────────────────────────────────────────
  it("Scenario 4: Creates a custom page and switches active page with strict isolation", () => {
    let currentTokens = { ...baseDesignTokens };
    const onChange = vi.fn((next) => {
      currentTokens = next;
    });
    const onSave = vi.fn();

    const { result } = renderHook(() =>
      useStorefrontStudioState({
        themeId: DEFAULT_STOREFRONT_THEME_ID,
        designTokens: currentTokens,
        onSave,
        onChange,
      })
    );

    expect(result.current.activePageKey).toBe("home");

    // Duplicate/Create page "home-copy"
    let newPageSlug = "";
    act(() => {
      newPageSlug = result.current.handleDuplicatePage("home");
    });

    expect(newPageSlug).toBe("home-copy");
    expect(result.current.activePageKey).toBe("home-copy");
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("تم تكرار الصفحة بنجاح")
    );

    // Switch back to "home"
    act(() => {
      result.current.setActivePageKey("home");
    });
    expect(result.current.activePageKey).toBe("home");
    expect(result.current.activeSections.length).toBe(2);

    // Switch to cloned page again
    act(() => {
      result.current.setActivePageKey("home-copy");
    });
    expect(result.current.activePageKey).toBe("home-copy");
  });

  // ─────────────────────────────────────────────────────────────
  // سيناريو 5: نشر + استرجاع نسخة
  // ─────────────────────────────────────────────────────────────
  it("Scenario 5: Pre-publish snapshot creation on publish and successful rollback", async () => {
    let currentTokens = { ...baseDesignTokens };
    const onChange = vi.fn((next) => {
      currentTokens = next;
    });
    const onSave = vi.fn();

    const { result } = renderHook(() =>
      useStorefrontStudioState({
        themeId: DEFAULT_STOREFRONT_THEME_ID,
        designTokens: currentTokens,
        onSave,
        onChange,
      })
    );

    // 1. Publish triggers pre-publish snapshot
    await act(async () => {
      await result.current.handlePublish();
    });

    // Verify onSave was called
    expect(onSave).toHaveBeenCalled();

    // Verify snapshot notification toast was triggered with restore action
    expect(toast.success).toHaveBeenCalledWith(
      "تم حفظ نسخة — استرجاع",
      expect.objectContaining({
        action: expect.objectContaining({
          label: "استرجاع",
        }),
      })
    );

    // 2. Modify active page state (mutate title)
    act(() => {
      result.current.setSelectedSectionKey("sec-hero-1");
      result.current.handleUpdateSectionField("title", "عنوان مؤقت بعد النشر", "desktop");
    });

    const mutatedHero = result.current.activeSections.find(
      (s: any) => s.key === "sec-hero-1"
    );
    expect(mutatedHero?.settings?.title).toBe("عنوان مؤقت بعد النشر");

    // 3. Rollback via restore snapshot
    act(() => {
      result.current.handleRestorePrePublishSnapshot();
    });

    // Verify state was restored
    const restoredHero = result.current.activeSections.find(
      (s: any) => s.key === "sec-hero-1"
    );
    expect(restoredHero?.settings?.title).toBe("مرحبًا بكم في متجرنا");
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining("تم استرجاع النسخة السابقة بنجاح")
    );
  });

  // ─────────────────────────────────────────────────────────────
  // اختبار سلبي: إثبات أن الـ suite يمسك كسر حقيقي في المحرر
  // ─────────────────────────────────────────────────────────────
  it("Negative Test: Verifies suite detects and reports section crashes via ErrorBoundary", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const BrokenSection: React.FC<{ shouldCrash?: boolean }> = ({ shouldCrash }) => {
      if (shouldCrash) {
        throw new Error("Deliberate section crash for negative test verification");
      }
      return <div data-testid="healthy-section">قسم سليم</div>;
    };

    const { queryByTestId, getByTestId } = render(
      <StudioErrorBoundary
        sectionKey="critical-hero-banner"
        companyId="test-company-123"
        pageKey="home"
      >
        <BrokenSection shouldCrash={true} />
      </StudioErrorBoundary>
    );

    // The healthy section must not render
    expect(queryByTestId("healthy-section")).toBeNull();

    // ErrorBoundary MUST catch the crash and render localized fallback UI
    const fallback = getByTestId("studio-error-boundary-fallback");
    expect(fallback).toBeTruthy();
    expect(fallback.textContent).toContain("critical-hero-banner");
    expect(fallback.textContent).toContain(
      "Deliberate section crash for negative test verification"
    );

    consoleErrorSpy.mockRestore();
  });
});
