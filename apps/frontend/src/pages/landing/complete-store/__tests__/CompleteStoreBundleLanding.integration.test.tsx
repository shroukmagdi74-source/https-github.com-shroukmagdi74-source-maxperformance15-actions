import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock utilities that use import.meta.env under Jest
jest.mock("../../../../utils/platformSiteMetaPixel", () => ({
  trackPlatformSiteLead: jest.fn(),
  trackPlatformSiteInitiateCheckout: jest.fn(),
}));
jest.mock("../../../../utils/facebookPixel", () => ({
  trackInitiateCheckout: jest.fn(),
}));
jest.mock("../../../../utils/tokenManager", () => ({
  __esModule: true,
  default: {
    getAccessToken: jest.fn(),
    getToken: jest.fn(),
    createAuthHeaders: jest.fn(() => ({})),
  },
  tokenManager: {
    getAccessToken: jest.fn(),
    getToken: jest.fn(),
    createAuthHeaders: jest.fn(() => ({})),
  },
}));
jest.mock("../../../../services/publicLeadService", () => ({
  submitPublicLead: jest.fn(),
}));

import CompleteStoreBundleLanding from "../../CompleteStoreBundleLanding";

describe("CompleteStoreBundleLanding - Integration & Price Source Verification", () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })) as unknown as typeof IntersectionObserver;

    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("سيناريو 1: قراءة الأسعار من الـAPI — 17 سطر، facebook-ads-pro = 199، المجموع 2,936، الباقة 999", async () => {
    const liveApiResponse = {
      success: true,
      data: {
        id: "cmlpstorebundle999a",
        slug: "store-complete-bundle",
        name: "باقة المتجر الكاملة",
        monthlyPrice: 5, // فترة التيست في الـDB
        trialDays: 7,
        apps: [
          { slug: "store", monthlyPrice: 699 },
          { slug: "order-workflow", monthlyPrice: 149 },
          { slug: "whatsapp-business", monthlyPrice: 350 },
          { slug: "bot-automation", monthlyPrice: 149 },
          { slug: "bulk-orders", monthlyPrice: 99 },
          { slug: "order-preparation-hold", monthlyPrice: 0 },
          { slug: "order-shipping-turbo", monthlyPrice: 149 },
          { slug: "inventory-pro", monthlyPrice: 199 },
          { slug: "returns-settings", monthlyPrice: 99 },
          { slug: "returns-reasons-analytics", monthlyPrice: 99 },
          { slug: "orders-analytics", monthlyPrice: 99 },
          { slug: "profit-analytics", monthlyPrice: 99 },
          { slug: "campaign-attribution", monthlyPrice: 149 },
          { slug: "campaign-attribution-analytics", monthlyPrice: 0 },
          { slug: "facebook-ads-pro", monthlyPrice: 199 },
          { slug: "facebook-pages-connect", monthlyPrice: 99 },
          { slug: "unified-inbox", monthlyPrice: 299 },
        ],
      },
    };

    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => liveApiResponse,
    } as Response);

    render(
      <MemoryRouter initialEntries={["/lp/store-complete-bundle"]}>
        <CompleteStoreBundleLanding />
      </MemoryRouter>
    );

    // التحقق من ظهور الفاتورة
    const invoice = await screen.findByTestId("csb-invoice");
    expect(invoice).toBeInTheDocument();

    // التحقق من وجود 17 سطر
    const rows = invoice.querySelectorAll(".csb-row");
    expect(rows).toHaveLength(17);

    // التحقق من أن facebook-ads-pro يظهر بسعر 199 ج.م
    expect(screen.getAllByText("إعلانات فيسبوك وانستجرام").length).toBeGreaterThan(0);
    expect(invoice).toHaveTextContent("199");

    // التحقق من المجموع (2,936) وسعر الباقة (999)
    await waitFor(() => {
      expect(invoice).toHaveTextContent("2,936");
      expect(invoice).toHaveTextContent("999");
    });

    // الهيرو يعرض 999
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("999");
  });

  it("سيناريو 2: فشل الـAPI (Network Error) — تعرض الصفحة القيم الافتراضية ولا تكسر", async () => {
    jest.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout / offline"));

    render(
      <MemoryRouter initialEntries={["/lp/store-complete-bundle"]}>
        <CompleteStoreBundleLanding />
      </MemoryRouter>
    );

    const invoice = await screen.findByTestId("csb-invoice");
    expect(invoice).toBeInTheDocument();

    // 17 سطر موجودين بالكامل
    const rows = invoice.querySelectorAll(".csb-row");
    expect(rows).toHaveLength(17);

    // القيم الافتراضية معروضة
    expect(invoice).toHaveTextContent("2,936");
    expect(invoice).toHaveTextContent("999");

    // الصفحة لا تكسر والهيرو يعمل
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("999");
  });
});
