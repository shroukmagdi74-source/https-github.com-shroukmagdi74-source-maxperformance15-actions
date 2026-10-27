/** @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import UpsellHubPage from "../UpsellHubPage";
import { apiClient } from "../../../services/apiClient";

// Mock apiClient
vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock sonner/i18n-toast
vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useConversionTools hook
vi.mock("../../settings/useConversionTools", () => ({
  useConversionTools: () => ({
    loading: false,
    managedApps: {
      "conversion-suite": {
        app: { status: "ACTIVE" },
        settings: {
          modules: {
            crossSell: true,
            boughtTogether: true,
            cartUpsell: true,
            postPurchaseUpsell: true,
          },
        },
      },
    },
    handleToolToggle: vi.fn(),
  }),
  isAppOperational: () => true,
  ToggleSwitch: ({ label, checked, onToggle }: any) => (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onToggle}
    >
      {checked ? "مفعل" : "معطل"}
    </button>
  ),
}));

describe("UpsellHubPage (Modular)", () => {
  const mockProducts = [
    {
      id: "prod-1",
      name: "حذاء رياضي أنيق",
      sku: "SHOE-01",
      price: 1200,
      isActive: true,
      category: { name: "أحذية" },
      imageUrl: "https://example.com/shoe.jpg",
      metadata: {
        upsellProducts: ["prod-2"],
        crossSellProducts: [],
        relatedProducts: [],
      },
    },
    {
      id: "prod-2",
      name: "حذاء رياضي متطور بريميوم",
      sku: "SHOE-PRO",
      price: 1800,
      isActive: true,
      category: { name: "أحذية" },
      imageUrl: "https://example.com/shoe-pro.jpg",
      metadata: {
        upsellProducts: [],
        crossSellProducts: [],
        relatedProducts: [],
      },
    },
    {
      id: "prod-3",
      name: "قميص صيفي قطن",
      sku: "SHIRT-03",
      price: 450,
      isActive: true,
      category: { name: "ملابس" },
      imageUrl: "https://example.com/shirt.jpg",
      metadata: {
        upsellProducts: [],
        crossSellProducts: [],
        relatedProducts: [],
      },
    },
  ];

  beforeEach(() => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/products")) {
        return Promise.resolve({
          data: { data: mockProducts },
        });
      }
      return Promise.resolve({ data: {} });
    });

    (apiClient.patch as any).mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <UpsellHubPage />
      </BrowserRouter>,
    );

  it("renders header, KPI stats, placements switchboard, and product list", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /عروض الـ Upsell والـ Cross-sell/i,
        }),
      ).toBeInTheDocument();
    });

    // Check KPI cards
    expect(screen.getByText("مواضع الظهور")).toBeInTheDocument();
    expect(screen.getByText("تغطية المنتجات")).toBeInTheDocument();
    expect(screen.getByText("روابط الترقية (Upsell)")).toBeInTheDocument();
    expect(screen.getByText("المكملات (Cross-sell)")).toBeInTheDocument();

    // Check Placements
    expect(
      screen.getByText("صفحة المنتج (Frequently Bought Together)"),
    ).toBeInTheDocument();
    expect(screen.getByText("سلة المشتريات (Cart Quick Add)")).toBeInTheDocument();

    // Check Products
    expect(screen.getByText("حذاء رياضي أنيق")).toBeInTheDocument();
    expect(screen.getByText("حذاء رياضي متطور بريميوم")).toBeInTheDocument();
    expect(screen.getByText("قميص صيفي قطن")).toBeInTheDocument();
  });

  it("filters products by search query", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("حذاء رياضي أنيق")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "ابحث بالاسم، SKU أو الفئة...",
    );
    fireEvent.change(searchInput, { target: { value: "قميص" } });

    expect(screen.queryByText("حذاء رياضي أنيق")).not.toBeInTheDocument();
    expect(screen.getByText("قميص صيفي قطن")).toBeInTheDocument();
  });

  it("filters products by offers status (به عروض / بدون عروض)", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("حذاء رياضي أنيق")).toBeInTheDocument();
    });

    // Click "به عروض" (only prod-1 has upsell)
    const withOffersBtn = screen.getByRole("button", { name: /به عروض/i });
    fireEvent.click(withOffersBtn);

    expect(screen.getByText("حذاء رياضي أنيق")).toBeInTheDocument();
    expect(screen.queryByText("قميص صيفي قطن")).not.toBeInTheDocument();

    // Click "بدون عروض" (prod-2 and prod-3)
    const withoutOffersBtn = screen.getByRole("button", {
      name: /بدون عروض/i,
    });
    fireEvent.click(withoutOffersBtn);

    expect(screen.queryByText("حذاء رياضي أنيق")).not.toBeInTheDocument();
    expect(screen.getByText("قميص صيفي قطن")).toBeInTheDocument();
    expect(screen.getByText("حذاء رياضي متطور بريميوم")).toBeInTheDocument();
  });

  it("opens modal to customize product relations and saves updates", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("حذاء رياضي أنيق")).toBeInTheDocument();
    });

    // Click "تخصيص العروض" on first product
    const customizeButtons = screen.getAllByRole("button", {
      name: /تخصيص العروض/i,
    });
    fireEvent.click(customizeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تخصيص عروض المنتج")).toBeInTheDocument();
    });

    // prod-1 has prod-2 as upsell
    expect(
      screen.getAllByText("حذاء رياضي متطور بريميوم").length,
    ).toBeGreaterThanOrEqual(2);

    // Save changes
    const saveButton = screen.getByRole("button", {
      name: /حفظ التغييرات/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/products/prod-1",
        expect.objectContaining({
          metadata: expect.objectContaining({
            upsellProducts: ["prod-2"],
          }),
        }),
      );
    });
  });
});
