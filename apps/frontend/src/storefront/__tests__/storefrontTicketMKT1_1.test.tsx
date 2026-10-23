// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { StudioThemeGalleryPanel } from "../studio/StudioThemeGalleryPanel";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Ticket MKT-1.1: Storefront Studio Theme Gallery - Activation Before Save & Error Transparency", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("accessToken", "mock-token-xyz");
    localStorage.setItem("companyId", "company-test-123");
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Calls activate endpoint before calling onApplyTheme
  // ─────────────────────────────────────────────────────────────
  it("calls POST /theme-catalog/:themeId/activate with Authorization and company headers before calling onApplyTheme", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes("/activate")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: "تم تطبيق القالب على المتجر بنجاح",
            data: { themeId: "elegant-luxe" },
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="khemet-fashion-eg"
        designTokens={{ themeId: "khemet-fashion-eg" }}
        companyId="company-test-123"
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Click apply on elegant-luxe
    const applyBtn = screen.getByTestId("theme-apply-btn-elegant-luxe");
    fireEvent.click(applyBtn);

    const confirmModal = screen.getByTestId("theme-confirm-modal");
    expect(confirmModal).toBeDefined();

    // Confirm apply
    const confirmBtn = screen.getByTestId("confirm-apply-theme-btn");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Check that activate endpoint was called with POST
    const activateCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/theme-catalog/elegant-luxe/activate")
    );
    expect(activateCall).toBeDefined();
    const [activateUrl, activateOptions] = activateCall!;
    expect(activateUrl).toContain("/storefront-settings/theme-catalog/elegant-luxe/activate");
    expect(activateOptions?.method).toBe("POST");

    const headers = activateOptions?.headers as Record<string, string>;
    expect(headers).toBeDefined();
    expect(headers["Authorization"]).toContain("Bearer mock-token-xyz");
    expect(headers["X-Company-Id"]).toBe("company-test-123");

    // Check that onApplyTheme was called after successful activation
    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledTimes(1);
    });
    const [appliedId, tokens] = mockApply.mock.calls[0];
    expect(appliedId).toBe("elegant-luxe");
    expect(tokens.themeId).toBe("elegant-luxe");
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Failed activate displays server error message (no silent failure)
  // ─────────────────────────────────────────────────────────────
  it("displays server error message inline and via toast when activate fails, and halts saving (zero silent failure)", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const serverErrorMessage = "القالب المحدد يحتاج تفعيلًا أولًا من مكتبة القوالب";

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/activate")) {
        return {
          ok: false,
          status: 400,
          json: async () => ({
            success: false,
            message: serverErrorMessage,
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="khemet-fashion-eg"
        designTokens={{ themeId: "khemet-fashion-eg" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Apply bold-fashion
    const applyBtn = screen.getByTestId("theme-apply-btn-bold-fashion");
    fireEvent.click(applyBtn);

    const confirmBtn = screen.getByTestId("confirm-apply-theme-btn");
    fireEvent.click(confirmBtn);

    // Error message must appear inline
    await waitFor(() => {
      const errorAlert = screen.getByTestId("theme-apply-error");
      expect(errorAlert).toBeDefined();
      expect(errorAlert.textContent).toContain(serverErrorMessage);
    });

    // Toast error must be called with server error message
    expect(toast.error).toHaveBeenCalledWith(serverErrorMessage);

    // Modal must NOT close silently
    expect(screen.getByTestId("theme-confirm-modal")).toBeDefined();

    // CRITICAL: onApplyTheme must NEVER be called if activate fails
    expect(mockApply).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Success updates themeId, preserves pages, and updates badge
  // ─────────────────────────────────────────────────────────────
  it("strictly preserves all pages, pageOverrides, pageStyles, global, typography, and i18n, updates active badge, and closes modal upon success", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const merchantPages = {
      home: { id: "home", sections: [{ type: "custom-hero", key: "h1" }] },
      shop: { id: "shop", sections: [{ type: "custom-shop", key: "s1" }] },
      customLanding: { id: "landing", sections: [{ type: "lead-magnet", key: "l1" }] },
    };
    const merchantPageOverrides = {
      home: { title: "متجري الذهبي" },
    };
    const merchantPageStyles = {
      home: { background: "#000", density: "compact" },
    };
    const merchantGlobal = { header: { sticky: true } };
    const merchantTypography = { fontFamily: "Almarai", headingWeight: "800" };
    const merchantI18n = { defaultLocale: "ar", supportedLocales: ["ar", "en"] };

    const initialTokens = {
      themeId: "khemet-fashion-eg",
      pages: merchantPages,
      pageOverrides: merchantPageOverrides,
      pageStyles: merchantPageStyles,
      global: merchantGlobal,
      typography: merchantTypography,
      i18n: merchantI18n,
    };

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/activate")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: "تم تفعيل القالب بنجاح",
            data: { themeId: "allure" },
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="khemet-fashion-eg"
        designTokens={initialTokens}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Initial applied theme badge
    expect(screen.getByTestId("applied-theme-id").textContent).toBe("khemet-fashion-eg");

    // Apply allure
    const applyBtn = screen.getByTestId("theme-apply-btn-allure");
    fireEvent.click(applyBtn);

    const confirmBtn = screen.getByTestId("confirm-apply-theme-btn");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledTimes(1);
    });

    const [targetThemeId, resultingTokens] = mockApply.mock.calls[0];
    expect(targetThemeId).toBe("allure");
    expect(resultingTokens.themeId).toBe("allure");

    // Strictly preserved merchant work
    expect(resultingTokens.pages).toEqual(merchantPages);
    expect(resultingTokens.pageOverrides).toEqual(merchantPageOverrides);
    expect(resultingTokens.pageStyles).toEqual(merchantPageStyles);
    expect(resultingTokens.global).toEqual(merchantGlobal);
    expect(resultingTokens.typography).toEqual(merchantTypography);
    expect(resultingTokens.i18n).toEqual(merchantI18n);

    // Modal dismissed
    await waitFor(() => {
      expect(screen.queryByTestId("theme-confirm-modal")).toBeNull();
    });

    // Applied badge updated to allure
    expect(screen.getByTestId("applied-theme-id").textContent).toBe("allure");
    expect(toast.success).toHaveBeenCalledWith("تم تفعيل القالب بنجاح");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Loading state and disabled buttons prevent double-submit
  // ─────────────────────────────────────────────────────────────
  it("enters loading state with spinner and disables button during activation to prevent double-submit", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    let resolveActivate: (value: any) => void;
    const activatePromise = new Promise((resolve) => {
      resolveActivate = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/activate")) {
        return activatePromise;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      };
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="khemet-fashion-eg"
        designTokens={{ themeId: "khemet-fashion-eg" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Click apply on elegant-luxe
    const applyBtn = screen.getByTestId("theme-apply-btn-elegant-luxe");
    fireEvent.click(applyBtn);

    const confirmBtn = screen.getByTestId("confirm-apply-theme-btn");
    fireEvent.click(confirmBtn);

    // Button enters loading state immediately
    await waitFor(() => {
      expect(confirmBtn.textContent).toContain("جاري التفعيل والتطبيق...");
      expect((confirmBtn as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByTestId("theme-apply-spinner")).toBeDefined();
    });

    // Try clicking again while loading (double-submit attempt)
    fireEvent.click(confirmBtn);

    // Resolve activate promise
    resolveActivate!({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "تم تفعيل القالب بنجاح" }),
    });

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledTimes(1);
    });

    // Verify activate fetch was called only once despite click attempt during loading
    const activateCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/activate")
    );
    expect(activateCalls.length).toBe(1);
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Does not make network call if target is already the applied theme
  // ─────────────────────────────────────────────────────────────
  it("does not trigger activation network call if target is already the applied theme", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="elegant-luxe"
        designTokens={{ themeId: "elegant-luxe" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // The apply button on elegant-luxe is disabled and marked as "مطبق"
    const currentBtn = screen.getByTestId("theme-apply-btn-elegant-luxe");
    expect((currentBtn as HTMLButtonElement).disabled).toBe(true);
    expect(currentBtn.textContent).toContain("مطبق");

    // Clicking does not open confirm modal
    fireEvent.click(currentBtn);
    expect(screen.queryByTestId("theme-confirm-modal")).toBeNull();

    // No activate calls were made
    const activateCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/activate")
    );
    expect(activateCalls.length).toBe(0);
    expect(mockApply).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Unavailable themes (like modern-minimal) are marked and disabled
  // ─────────────────────────────────────────────────────────────
  it("marks unavailable themes (e.g. modern-minimal) with badge, explanation note, and disables apply button", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="khemet-luxe-eg"
        designTokens={{ themeId: "khemet-luxe-eg" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // modern-minimal card
    const card = screen.getByTestId("theme-card-modern-minimal");
    expect(card).toBeDefined();

    // Unavailable badge is visible
    const badge = screen.getByTestId("theme-unavailable-badge-modern-minimal");
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("غير متاح للتطبيق");

    // Explanation note is visible
    const note = screen.getByTestId("theme-unavailable-note-modern-minimal");
    expect(note).toBeDefined();
    expect(note.textContent).toContain("القالب المحدد غير متاح للتطبيق حاليًا");

    // Apply button is disabled with text "غير متاح"
    const applyBtn = screen.getByTestId("theme-apply-btn-modern-minimal") as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(true);
    expect(applyBtn.textContent).toContain("غير متاح");

    // Clicking does not open confirm modal
    fireEvent.click(applyBtn);
    expect(screen.queryByTestId("theme-confirm-modal")).toBeNull();
    expect(mockApply).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Preview modal for unavailable theme disables apply button
  // ─────────────────────────────────────────────────────────────
  it("disables the apply action inside preview modal for an unavailable theme", async () => {
    const mockApply = vi.fn();
    const mockClose = vi.fn();

    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <StudioThemeGalleryPanel
        currentThemeId="khemet-luxe-eg"
        designTokens={{ themeId: "khemet-luxe-eg" }}
        onApplyTheme={mockApply}
        onClose={mockClose}
      />
    );

    // Open preview for modern-minimal
    const previewBtn = screen.getByTestId("theme-preview-btn-modern-minimal");
    fireEvent.click(previewBtn);

    const previewModal = screen.getByTestId("theme-preview-modal");
    expect(previewModal).toBeDefined();

    // Apply button inside preview modal is disabled
    const previewApplyBtn = screen.getByTestId("theme-preview-apply-btn") as HTMLButtonElement;
    expect(previewApplyBtn.disabled).toBe(true);
    expect(previewApplyBtn.textContent).toContain("غير متاح للتطبيق");

    // Clicking does nothing
    fireEvent.click(previewApplyBtn);
    expect(screen.queryByTestId("theme-confirm-modal")).toBeNull();
  });
});
