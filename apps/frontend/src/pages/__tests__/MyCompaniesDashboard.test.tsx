// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyCompaniesDashboard from "../hr/MyCompaniesDashboard";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockSwitchCompany = vi.fn();

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

const mockUser = { id: "u1", role: "OWNER" };

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockUser,
    switchCompany: (...args: any[]) => mockSwitchCompany(...args),
  }),
}));

vi.mock("../../components/CreateCompanyModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-company-modal">Modal Open</div> : null,
}));

const sampleDashboardData = {
  overview: {
    totalCompanies: 2,
    totalUsers: 18,
    totalTodayOrders: 42,
    totalTodayRevenue: 15400,
    totalUnreadConversations: 5,
    totalLowStockProducts: 3,
  },
  byCompany: [
    {
      company: {
        id: "comp-1",
        name: "شركة النور للتجارة",
        logo: null,
        isDefault: true,
      },
      stats: {
        totalUsers: 12,
        todayOrders: 30,
        todayRevenue: 11200,
        unreadConversations: 3,
        lowStockProducts: 2,
        attendance: { present: 10, late: 1, absent: 1 },
      },
    },
    {
      company: {
        id: "comp-2",
        name: "فرع الإسكندرية",
        logo: null,
        isDefault: false,
      },
      stats: {
        totalUsers: 6,
        todayOrders: 12,
        todayRevenue: 4200,
        unreadConversations: 2,
        lowStockProducts: 1,
        attendance: { present: 5, late: 1, absent: 0 },
      },
    },
  ],
};

describe("MyCompaniesDashboard (Batch 508)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: sampleDashboardData,
      },
    });
  });

  it("renders dashboard header, overview stats, and company cards", async () => {
    render(
      <MemoryRouter>
        <MyCompaniesDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة تحكم شركاتي")).toBeDefined();
    });

    expect(screen.getByText("شركة النور للتجارة")).toBeDefined();
    expect(screen.getByText("فرع الإسكندرية")).toBeDefined();
    expect(screen.getByText("الافتراضية")).toBeDefined();
  });

  it("switches to attendance tab and displays company attendance stats", async () => {
    render(
      <MemoryRouter>
        <MyCompaniesDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة تحكم شركاتي")).toBeDefined();
    });

    fireEvent.click(screen.getByText("الحضور"));

    expect(screen.getAllByText("حاضر").length).toBeGreaterThan(0);
    expect(screen.getAllByText("متأخر").length).toBeGreaterThan(0);
    expect(screen.getAllByText("غائب").length).toBeGreaterThan(0);
  });

  it("switches to reports tab and shows unified reports callout", async () => {
    render(
      <MemoryRouter>
        <MyCompaniesDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة تحكم شركاتي")).toBeDefined();
    });

    fireEvent.click(screen.getByText("التقارير"));

    expect(screen.getByText("التقارير الموحدة")).toBeDefined();
    expect(screen.getByText("الذهاب للتقارير")).toBeDefined();
  });

  it("opens CreateCompanyModal when add company button is clicked", async () => {
    render(
      <MemoryRouter>
        <MyCompaniesDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة تحكم شركاتي")).toBeDefined();
    });

    fireEvent.click(screen.getByText("إضافة شركة"));
    expect(screen.getByTestId("create-company-modal")).toBeDefined();
  });
});
