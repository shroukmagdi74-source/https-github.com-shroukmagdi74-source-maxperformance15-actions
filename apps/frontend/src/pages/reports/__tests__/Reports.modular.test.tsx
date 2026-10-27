// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import Reports from "../Reports";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockT = (key: string, defaultValue?: string) => defaultValue || key;
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: "ar" },
  }),
}));

vi.mock("../../../hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (price: number) => `${Number(price).toLocaleString()} ج.م`,
    currency: "EGP",
  }),
}));

vi.mock("../../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    formatDate: (dateStr: string) => String(dateStr).split("T")[0],
  }),
}));

const mockSalesData = [
  { date: "2026-10-25", sales: 15000, orders: 42, avgOrder: 357 },
  { date: "2026-10-26", sales: 22000, orders: 60, avgOrder: 366 },
];

const mockCustomersData = [
  { week: "الأسبوع 1", newCustomers: 25, conversions: 18, rate: 72 },
  { week: "الأسبوع 2", newCustomers: 30, conversions: 24, rate: 80 },
];

const mockProductsData = [
  { name: "عباية حرير ملكي", sales: 85, quantity: 85 },
  { name: "فستان سهرة كلاسيك", sales: 45, quantity: 45 },
];

const mockModeratorsData = [
  { name: "أحمد علي", messagesCount: 340, conversationsCount: 85 },
  { name: "سارة محمد", messagesCount: 290, conversationsCount: 70 },
];

const mockFunnelData = {
  overallConversionRate: 5.2,
  funnelSteps: [{ step: "زيارة المتجر", count: 4500 }],
};

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn((endpoint: string) => {
      if (endpoint.includes("/reports/sales")) {
        return Promise.resolve({ data: mockSalesData, success: true });
      }
      if (endpoint.includes("/reports/customers")) {
        return Promise.resolve({ data: mockCustomersData, success: true });
      }
      if (endpoint.includes("/reports/conversations")) {
        return Promise.resolve({ data: [], success: true });
      }
      if (endpoint.includes("/reports/products")) {
        return Promise.resolve({ data: mockProductsData, success: true });
      }
      if (endpoint.includes("/reports/performance")) {
        return Promise.resolve({ data: [{ metric: "traffic", value: 4500 }], success: true });
      }
      if (endpoint.includes("/reports/moderators")) {
        return Promise.resolve({ data: mockModeratorsData, success: true });
      }
      if (endpoint.includes("/analytics/sales-funnel")) {
        return Promise.resolve({ data: mockFunnelData, success: true });
      }
      return Promise.resolve({ data: [], success: true });
    }),
  },
}));

describe("Reports Page Modular Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header with title, date inputs, and preset range pills", async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText("التقارير والإحصائيات")).toBeInTheDocument();
    });

    expect(screen.getByText("تحليل شامل لأداء المنصة والمبيعات")).toBeInTheDocument();
    expect(screen.getByText("اليوم")).toBeInTheDocument();
    expect(screen.getByText("أمس")).toBeInTheDocument();
    expect(screen.getByText("آخر 7 أيام")).toBeInTheDocument();
    expect(screen.getByText("آخر 30 يوم")).toBeInTheDocument();
  });

  it("renders summary metric cards with formatted sales and orders", async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText("إجمالي المبيعات")).toBeInTheDocument();
    });

    expect(screen.getByText("إجمالي الطلبات")).toBeInTheDocument();
    expect(screen.getByText("القطع المباعة")).toBeInTheDocument();
    expect(screen.getByText("عملاء جدد")).toBeInTheDocument();
  });

  it("renders top products list correctly", async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText("المنتجات الأكثر مبيعاً")).toBeInTheDocument();
    });

    expect(screen.getByText("عباية حرير ملكي")).toBeInTheDocument();
    expect(screen.getByText("فستان سهرة كلاسيك")).toBeInTheDocument();
  });

  it("renders available reports grid and allows report selection", async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText("التقارير المتاحة")).toBeInTheDocument();
    });

    expect(screen.getAllByText("تقرير المبيعات").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("تقرير العملاء")).toBeInTheDocument();
    expect(screen.getByText("تقرير المودريتورز")).toBeInTheDocument();

    // Click on customers report
    const customersBtn = screen.getByRole("button", { name: /تقرير العملاء/ });
    fireEvent.click(customersBtn);

    await waitFor(() => {
      expect(screen.getByText("الأسبوع 1")).toBeInTheDocument();
    });
  });

  it("renders related views links and triggers navigation on click", async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText("صفحات وإحصائيات ذات صلة")).toBeInTheDocument();
    });

    const pnlButton = screen.getByRole("button", { name: /تقرير الأرباح والخسائر/ });
    expect(pnlButton).toBeInTheDocument();
    fireEvent.click(pnlButton);

    expect(mockNavigate).toHaveBeenCalledWith("/reports/profit-loss");
  });
});
