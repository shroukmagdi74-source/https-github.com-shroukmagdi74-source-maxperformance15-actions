/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AgencyDashboard from "../agency/AgencyDashboard";

const mockClients = [
  {
    id: "cl-1",
    name: "براند قمة الأناقة",
    contactPerson: "أحمد ممدوح",
    phone: "01012345678",
    email: "ahmed@example.com",
    pricingModel: "RETAINER",
    baseRetainer: 8000,
    monthlyBudget: 60000,
    currentSpend: 42000,
    monthlySales: 180000,
    monthlyOrders: 350,
    monthlyUnits: 500,
    isOffPlatform: false,
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "cl-2",
    name: "متجر ركن القهوة",
    contactPerson: "سارة إبراهيم",
    phone: "01198765432",
    email: "sara@coffee.test",
    pricingModel: "PERCENT_SPEND",
    pricingRate: 15,
    monthlyBudget: 30000,
    currentSpend: 15000,
    monthlySales: 75000,
    monthlyOrders: 180,
    monthlyUnits: 220,
    isOffPlatform: true,
    status: "active",
    createdAt: "2026-02-01T00:00:00Z",
  },
];

const mockApprovals = [
  {
    id: "app-1",
    clientId: "cl-1",
    clientName: "براند قمة الأناقة",
    title: "ريلز الجمعة البيضاء",
    copyText: "خصومات حصرية تصل إلى 50%",
    channel: "instagram",
    status: "CLIENT_REVIEW",
    createdAt: "2026-10-20T00:00:00Z",
  },
];

const mockInvoices = {
  month: "2026-10",
  agencyName: "وكالة الأداء الرقمي",
  summary: {
    totalClientsCount: 2,
    totalInvoiced: 15250,
    totalPaid: 8000,
    totalUnpaid: 7250,
  },
  statements: [
    {
      clientId: "cl-1",
      clientName: "براند قمة الأناقة",
      pricingModel: "RETAINER",
      isOffPlatform: false,
      month: "2026-10",
      performance: {
        spend: 42000,
        sales: 180000,
        orders: 350,
        units: 500,
        roas: 4.28,
        cpa: 120,
        aov: 514,
      },
      baseAgencyFee: 8000,
      calculationExplanation: "اشتراك شهري ثابت",
      extraServices: [],
      extraServicesSum: 0,
      totalAmount: 8000,
      isPaid: true,
      paidAt: "2026-10-15T00:00:00Z",
    },
    {
      clientId: "cl-2",
      clientName: "متجر ركن القهوة",
      pricingModel: "PERCENT_SPEND",
      isOffPlatform: true,
      month: "2026-10",
      performance: {
        spend: 15000,
        sales: 75000,
        orders: 180,
        units: 220,
        roas: 5.0,
        cpa: 83,
        aov: 416,
      },
      baseAgencyFee: 2250,
      calculationExplanation: "15% من إجمالي الإنفاق الإعلاني (15,000 ج.م)",
      extraServices: [
        {
          id: "srv-1",
          month: "2026-10",
          title: "تصميم هوية بصرية إضافية",
          category: "LOGO_DESIGN",
          amount: 5000,
        },
      ],
      extraServicesSum: 5000,
      totalAmount: 7250,
      isPaid: false,
      paidAt: null,
    },
  ],
};

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn((url: string) => {
      if (url.includes("/agency/overview")) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              metrics: {
                totalClients: 2,
                activeClients: 2,
                totalBudget: 90000,
                totalSpend: 57000,
                totalRetainers: 8000,
                totalAgencyRevenue: 15250,
                unpaidInvoicesCount: 1,
                totalUncollected: 7250,
                pendingApprovals: 1,
                expectedPacingPercent: 75,
                currentDay: 24,
                daysInMonth: 31,
              },
            },
          },
        });
      }
      if (url.includes("/agency/clients")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockClients,
          },
        });
      }
      if (url.includes("/agency/approvals")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockApprovals,
          },
        });
      }
      if (url.includes("/agency/invoices")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockInvoices,
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
    patch: vi.fn(() => Promise.resolve({ data: { success: true, message: "تم تحديث الحالة" } })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("AgencyDashboard", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.print = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders overview metrics and header correctly", async () => {
    render(
      <MemoryRouter>
        <AgencyDashboard />
      </MemoryRouter>,
    );

    // Verify main header
    expect(screen.getByRole("heading", { name: "إدارة الوكالة" })).toBeTruthy();
    expect(screen.getByText("محرك الوكالات الاحترافي 2026")).toBeTruthy();

    // Verify overview tab contents loaded
    await waitFor(() => {
      expect(screen.getByText("عملاء الوكالة")).toBeTruthy();
      expect(screen.getByText("أرباح الوكالة (الشهر)")).toBeTruthy();
      expect(screen.getByText("استهلاك الميزانيات")).toBeTruthy();
      expect(screen.getByText("فواتير بانتظار التحصيل")).toBeTruthy();
    });

    // Pacing tracker
    expect(screen.getByText(/معدل استهلاك الميزانيات الإعلانية/)).toBeTruthy();
  });

  it("switches to clients tab and filters clients", async () => {
    render(
      <MemoryRouter>
        <AgencyDashboard />
      </MemoryRouter>,
    );

    // Switch to clients tab
    const clientsTabButton = screen.getByRole("button", { name: /العملاء والأسعار/i });
    fireEvent.click(clientsTabButton);

    await waitFor(() => {
      expect(screen.getByText("براند قمة الأناقة")).toBeTruthy();
      expect(screen.getByText("متجر ركن القهوة")).toBeTruthy();
    });

    // Search filter
    const searchInput = screen.getByPlaceholderText(/البحث بالاسم أو الحساب الإعلاني/i);
    fireEvent.change(searchInput, { target: { value: "قمة" } });

    await waitFor(() => {
      expect(screen.getByText("براند قمة الأناقة")).toBeTruthy();
      expect(screen.queryByText("متجر ركن القهوة")).toBeNull();
    });
  });

  it("switches to invoices tab and shows summary and statements", async () => {
    render(
      <MemoryRouter>
        <AgencyDashboard />
      </MemoryRouter>,
    );

    // Switch to invoices tab
    const invoicesTabButton = screen.getByRole("button", { name: /الفواتير والأرباح/i });
    fireEvent.click(invoicesTabButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "كشوف حساب وفواتير الوكالة" })).toBeTruthy();
      expect(screen.getByText("إجمالي المستحقات")).toBeTruthy();
      expect(screen.getByText("تم تحصيله")).toBeTruthy();
      expect(screen.getByText("بانتظار التحصيل")).toBeTruthy();
    });

    // Check statements rendered
    expect(screen.getAllByText("معاينة الفاتورة").length).toBeGreaterThan(0);
  });

  it("switches to approvals tab and shows pending creative reviews", async () => {
    render(
      <MemoryRouter>
        <AgencyDashboard />
      </MemoryRouter>,
    );

    // Switch to approvals tab
    const approvalsTabButton = screen.getByRole("button", { name: /الموافقات/i });
    fireEvent.click(approvalsTabButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "موافقات المحتوى والتصاميم" })).toBeTruthy();
      expect(screen.getByText("ريلز الجمعة البيضاء")).toBeTruthy();
      expect(screen.getByText("خصومات حصرية تصل إلى 50%")).toBeTruthy();
    });
  });

  it("switches to integrated tools (suite) tab and displays tools", async () => {
    render(
      <MemoryRouter>
        <AgencyDashboard />
      </MemoryRouter>,
    );

    // Switch to suite tab
    const suiteTabButton = screen.getByRole("button", { name: /الأدوات المتكاملة/i });
    fireEvent.click(suiteTabButton);

    await waitFor(() => {
      expect(screen.getByText("الأدوات المتكاملة لوكالة التسويق")).toBeTruthy();
      expect(screen.getByText(/إعلانات ميتا \(Facebook Ads Pro\)/i)).toBeTruthy();
      expect(screen.getByText(/الإنبوكس الموحد \(Unified Inbox\)/i)).toBeTruthy();
      expect(screen.getByText(/لوحة مهام الفريق \(Kanban OS\)/i)).toBeTruthy();
    });
  });

  it("opens add client dialog when clicking add client button", async () => {
    render(
      <MemoryRouter>
        <AgencyDashboard />
      </MemoryRouter>,
    );

    const addButtons = screen.getAllByRole("button", { name: /إضافة عميل جديد/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("إضافة عميل وكالة جديد")).toBeTruthy();
      expect(screen.getByText("طريقة احتساب أرباح الوكالة (Pricing Model) *")).toBeTruthy();
    });
  });
});
