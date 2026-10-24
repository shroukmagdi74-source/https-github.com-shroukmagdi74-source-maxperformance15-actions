/* @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StoreSettings from "../StoreSettings";
import { storeSettingsService } from "../../../services/storeSettingsService";
import { storefrontSettingsService } from "../../../services/storefrontSettingsService";
import { apiClient } from "../../../services/apiClient";

var mockNavigate = vi.fn();
var mockSetSearchParams = vi.fn();
var mockToastSuccess = vi.fn();
var mockToastError = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    new URLSearchParams("tab=branches"),
    mockSetSearchParams,
  ],
}));

vi.mock("sonner", () => {
  const toast = {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  };
  return {
    __esModule: true,
    default: toast,
    toast,
  };
});

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: {
      id: "user-1",
      companyId: "company-1",
    },
  }),
}));

vi.mock("../../../hooks/useCheckoutFormSettings", () => ({
  DEFAULT_CHECKOUT_FORM_SETTINGS: {},
  useCheckoutFormSettings: () => ({
    settings: {
      fullNameRequired: true,
      phoneRequired: true,
      addressRequired: true,
    },
    loading: false,
    saving: false,
    applySettings: vi.fn(),
    handleSave: vi.fn().mockResolvedValue(true),
    loadSettings: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("../../../services/storeSettingsService", () => ({
  storeSettingsService: {
    getBranches: vi.fn(),
    getShippingZones: vi.fn(),
    getCanonicalGovernorates: vi.fn(),
    createBranch: vi.fn(),
    updateBranch: vi.fn(),
    deleteBranch: vi.fn(),
    createShippingZone: vi.fn(),
    updateShippingZone: vi.fn(),
    deleteShippingZone: vi.fn(),
    generateGovernorateVariations: vi.fn().mockReturnValue([]),
  },
}));

vi.mock("../../../services/storefrontSettingsService", () => ({
  storefrontSettingsService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

const mockBranches = [
  { id: "b-1", name: "فرع القاهرة", phone: "0100000000", city: "القاهرة", isActive: true },
];

const mockShippingZones = [
  { id: "z-1", name: "القاهرة والجيزة", price: 50, deliveryTime: "1-2 يوم", isActive: true },
];

describe("StoreSettings Coordinator (Batch 463)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storeSettingsService.getBranches).mockResolvedValue({
      data: { data: mockBranches },
    } as any);
    vi.mocked(storeSettingsService.getShippingZones).mockResolvedValue({
      data: { data: mockShippingZones },
    } as any);
    vi.mocked(storeSettingsService.getCanonicalGovernorates).mockResolvedValue({
      data: { data: [] },
    } as any);
    vi.mocked(storefrontSettingsService.getSettings).mockResolvedValue({
      data: {
        wishlistEnabled: true,
        comparisonEnabled: true,
        enabledPaymentMethods: JSON.stringify(["cod", "card"]),
      },
    } as any);
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: {
          settings: {
            shippingClassFees: { standard: 0, heavy: 50 },
            shippingClassMode: "max",
          },
        },
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and navigation tabs", async () => {
    render(<StoreSettings />);

    await waitFor(() => {
      expect(screen.getByText("الفروع والمخازن")).toBeTruthy();
      expect(screen.getByText("مناطق الشحن وتكلفتها")).toBeTruthy();
      expect(screen.getByText("إعدادات الشيك أوت")).toBeTruthy();
      expect(screen.getByText("بوابات الدفع")).toBeTruthy();
    });
  });

  it("renders branches tab with branches list", async () => {
    render(<StoreSettings />);

    await waitFor(() => {
      expect(screen.getByText("فرع القاهرة")).toBeTruthy();
    });
  });

  it("switches to shipping tab when tab is forced or clicked", async () => {
    render(<StoreSettings forcedTab="shipping" />);

    await waitFor(() => {
      expect(screen.getAllByText(/فئات الشحن/).length).toBeGreaterThan(0);
      expect(screen.getByText(/طريقة الحساب/)).toBeTruthy();
    });
  });

  it("switches to checkout tab and displays wishlist and comparison toggles without emojis", async () => {
    render(<StoreSettings forcedTab="checkout" />);

    await waitFor(() => {
      expect(screen.getByText("زر قائمة المفضلة")).toBeTruthy();
      expect(screen.getByText("زر مقارنة المنتجات")).toBeTruthy();
    });

    const bodyText = document.body.textContent || "";
    expect(bodyText).not.toContain("❤️");
    expect(bodyText).not.toContain("⇄");
  });

  it("switches to payment tab and displays payment sub-tabs", async () => {
    render(<StoreSettings forcedTab="payment" />);

    await waitFor(() => {
      expect(screen.getByText("بطاقات الدفع")).toBeTruthy();
      expect(screen.getByText("الدفع بالمحفظة")).toBeTruthy();
    });
  });
});
