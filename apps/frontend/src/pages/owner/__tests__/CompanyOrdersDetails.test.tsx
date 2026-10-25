// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CompanyOrdersDetails from "../CompanyOrdersDetails";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({ companyId: "comp-1" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          company: { id: "comp-1", name: "متجر الأناقة", logo: null },
          orders: [
            {
              id: "ord-1",
              orderNumber: "ORD-901",
              status: "DELIVERED",
              total: 1250,
              subtotal: 1200,
              shippingCost: 50,
              discount: 0,
              createdAt: "2026-10-20T10:00:00Z",
              customer: {
                name: "أحمد علي",
                phone: "01012345678",
                address: "المعادي",
                city: "القاهرة",
              },
              items: [],
              itemsCount: 3,
            },
          ],
          stats: {
            totalOrders: 1,
            totalRevenue: 1250,
            completedOrders: 1,
            pendingOrders: 0,
            cancelledOrders: 0,
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      },
    }),
  },
}));

describe("CompanyOrdersDetails", () => {
  it("renders company name, stats, and order number", async () => {
    render(<CompanyOrdersDetails />);
    await waitFor(() => {
      expect(screen.getByText("متجر الأناقة")).toBeTruthy();
      expect(screen.getByText("#ORD-901")).toBeTruthy();
    });
  });
});
