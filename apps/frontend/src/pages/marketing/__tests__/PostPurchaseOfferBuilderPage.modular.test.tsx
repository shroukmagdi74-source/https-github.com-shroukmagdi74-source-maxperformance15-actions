/** @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import PostPurchaseOfferBuilderPage from "../PostPurchaseOfferBuilderPage";
import { apiClient } from "../../../services/apiClient";

// Mock apiClient
vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Analytics tab to keep test focused
vi.mock("../components/PostPurchaseOfferAnalyticsTab", () => ({
  PostPurchaseOfferAnalyticsTab: () => (
    <div data-testid="analytics-tab-content">محتوى التحليلات والأداء</div>
  ),
}));

describe("PostPurchaseOfferBuilderPage (Modular)", () => {
  const mockOffer = {
    enabled: true,
    productId: "prod-1",
    productName: "ساعة ذكية فاخرة",
    originalPrice: 1000,
    offerPrice: 700,
    discountType: "percentage",
    discountValue: 30,
    freeShipping: true,
    triggerCondition: "all",
    triggerProductIds: [],
    badgeText: "عرض خاص لمرة واحدة فقط!",
    title: "أضف هذه الساعة الذكية لطلبك بخصم 30%",
    subtitle: "شحن مجاني مع نفس الطرد",
    description: "ساعة مقاومة للماء مع بطارية تدوم 7 أيام",
    acceptButtonText: "نعم! أضف هذا العرض لطلبي",
    declineButtonText: "لا شكراً، اكتفِ بطلبي الأصلي فقط",
    timerMinutes: 5,
    features: ["ضمان لمدة عامين", "مقاومة للماء حتى عمق 50 متر"],
  };

  const mockCatalog = [
    {
      id: "prod-1",
      name: "ساعة ذكية فاخرة",
      price: 1000,
      sku: "WATCH-01",
      imageUrl: "https://example.com/watch.jpg",
    },
    {
      id: "prod-2",
      name: "سماعات بلوتوث لاسلكية",
      price: 500,
      sku: "AUDIO-02",
      imageUrl: "https://example.com/audio.jpg",
    },
  ];

  beforeEach(() => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/post-purchase-offer")) {
        return Promise.resolve({
          data: { data: mockOffer },
        });
      }
      if (url.includes("/products")) {
        return Promise.resolve({
          data: { data: mockCatalog },
        });
      }
      return Promise.resolve({ data: {} });
    });

    (apiClient.put as any).mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders page header and active offer status after loading", async () => {
    render(<PostPurchaseOfferBuilderPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /أداة العرض الخاص بعد الطلب/i,
        }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("العرض نشط في المتجر")).toBeInTheDocument();
    expect(screen.getByText("ساعة ذكية فاخرة")).toBeInTheDocument();
    expect(screen.getByText("حفظ الإعدادات")).toBeInTheDocument();
  });

  it("switches tabs between Builder and Analytics", async () => {
    render(<PostPurchaseOfferBuilderPage />);

    await waitFor(() => {
      expect(screen.getByText("التحليلات والأداء")).toBeInTheDocument();
    });

    // Click Analytics tab
    fireEvent.click(screen.getByText("التحليلات والأداء"));

    expect(screen.getByTestId("analytics-tab-content")).toBeInTheDocument();

    // Switch back to Builder tab
    fireEvent.click(screen.getByText("الإعدادات وتصميم العرض"));
    expect(screen.getByText("منتج العرض والتسعير")).toBeInTheDocument();
  });

  it("toggles trigger conditions and selects products for specific condition", async () => {
    render(<PostPurchaseOfferBuilderPage />);

    await waitFor(() => {
      expect(screen.getByText("إمتى يظهر العرض للمشتري؟")).toBeInTheDocument();
    });

    const specificProductsRadio = screen.getByText("منتجات معينة فقط");
    fireEvent.click(specificProductsRadio);

    await waitFor(() => {
      expect(screen.getByText("المنتجات المفعلة للعرض:")).toBeInTheDocument();
    });

    // Select all trigger products
    const selectAllBtn = screen.getByText("تحديد الكل");
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/2 محددة/)).toBeInTheDocument();
  });

  it("adds and removes feature bullets", async () => {
    render(<PostPurchaseOfferBuilderPage />);

    await waitFor(() => {
      expect(screen.getByText("ميزات وضمانات العرض:")).toBeInTheDocument();
    });

    // Click Add Feature
    const addBtn = screen.getByText("إضافة ميزة");
    fireEvent.click(addBtn);

    expect(screen.getByDisplayValue("ميزة إضافية للعرض")).toBeInTheDocument();

    // Remove feature
    const removeButtons = screen.getAllByLabelText("حذف الميزة");
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByDisplayValue("ضمان لمدة عامين")).not.toBeInTheDocument();
  });

  it("saves offer settings successfully via apiClient.put", async () => {
    render(<PostPurchaseOfferBuilderPage />);

    await waitFor(() => {
      expect(screen.getByText("حفظ الإعدادات")).toBeInTheDocument();
    });

    const saveButton = screen.getByText("حفظ الإعدادات");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/post-purchase-offer",
        expect.objectContaining({
          enabled: true,
          productId: "prod-1",
        }),
      );
    });
  });
});
