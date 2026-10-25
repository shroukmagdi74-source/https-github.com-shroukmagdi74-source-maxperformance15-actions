/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CustomerLoyalty from "../hr/CustomerLoyalty";
import { apiClient } from "../../services/apiClient";

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPrograms = [
  {
    id: "prog-1",
    name: "VIP Club",
    nameAr: "برنامج النخبة",
    description: "برنامج ولاء حصري لكبار العملاء",
    type: "POINTS",
    status: "ACTIVE",
    pointsPerPurchase: 10,
    pointsPerReferral: 50,
    redemptionRate: 0.05,
    minimumPoints: 100,
    maxPointsPerTransaction: 1000,
    expiryMonths: 12,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    customersCount: 150,
    totalPointsIssued: 50000,
    totalPointsRedeemed: 20000,
  },
];

const mockCustomers = [
  {
    id: "rec-1",
    customer: {
      id: "cust-1",
      firstName: "أحمد",
      lastName: "علي",
      email: "ahmed@example.com",
      phone: "01012345678",
    },
    program: mockPrograms[0],
    currentPoints: 2500,
    totalEarned: 5000,
    totalRedeemed: 2500,
    tier: {
      id: "tier-gold",
      name: "Gold",
      nameAr: "الذهبي",
      minPoints: 2000,
      benefits: ["خصم 10%"],
      color: "#FFD700",
      icon: "crown",
      customersCount: 45,
    },
    joinDate: "2026-02-01T00:00:00Z",
    lastActivity: "2026-03-01T00:00:00Z",
    status: "ACTIVE",
  },
];

const mockTiers = [
  {
    id: "tier-gold",
    name: "Gold",
    nameAr: "المستوى الذهبي",
    minPoints: 2000,
    maxPoints: 5000,
    benefits: ["خصم 10% على المشتريات", "شحن مجاني"],
    color: "#EAB308",
    icon: "crown",
    customersCount: 45,
  },
];

const mockCashbackSettings = {
  id: "cb-1",
  status: "ACTIVE",
  rules: {
    cashbackPercent: 5,
    base: "total",
    trigger: "order_completed",
    maxPerOrder: 200,
    tierOverrides: {
      "tier-gold": 8,
    },
  },
};

const mockWalletStats = {
  totalCashback: 12500,
};

describe("CustomerLoyalty Page Component (Batch 498)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/customer-loyalty/programs")) {
        return Promise.resolve({ data: { success: true, data: mockPrograms } });
      }
      if (url.includes("/hr/customer-loyalty/customers")) {
        return Promise.resolve({ data: { success: true, data: mockCustomers } });
      }
      if (url.includes("/hr/customer-loyalty/tiers")) {
        return Promise.resolve({ data: { success: true, data: mockTiers } });
      }
      if (url.includes("/hr/customer-loyalty/cashback/settings")) {
        return Promise.resolve({ data: { success: true, data: mockCashbackSettings } });
      }
      if (url.includes("/wallet/stats")) {
        return Promise.resolve({ data: { success: true, data: mockWalletStats } });
      }
      return Promise.resolve({ data: { success: true, data: null } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and stats cards correctly", async () => {
    render(
      <MemoryRouter>
        <CustomerLoyalty />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("ولاء العملاء")).toBeTruthy();
      expect(screen.getByText("إدارة برامج ولاء العملاء ومكافآتهم")).toBeTruthy();
    });

    expect(screen.getByText("البرامج النشطة")).toBeTruthy();
    expect(screen.getByText("العملاء المشتركين")).toBeTruthy();
    expect(screen.getByText("إجمالي النقاط")).toBeTruthy();
    expect(screen.getAllByText("المستويات").length).toBeGreaterThan(0);
  });

  it("renders programs tab by default with active programs", async () => {
    render(
      <MemoryRouter>
        <CustomerLoyalty />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("برنامج النخبة")).toBeTruthy();
    });

    expect(screen.getByText("برنامج ولاء حصري لكبار العملاء")).toBeTruthy();
    expect(screen.getByText("نقاط لكل عملية:")).toBeTruthy();
  });

  it("switches to customers tab and displays customer records", async () => {
    render(
      <MemoryRouter>
        <CustomerLoyalty />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("البرامج")).toBeTruthy();
    });

    const customersTabBtn = screen.getByRole("button", { name: /العملاء/i });
    fireEvent.click(customersTabBtn);

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeTruthy();
      expect(screen.getByText("ahmed@example.com")).toBeTruthy();
    });

    expect(screen.getByPlaceholderText("البحث عن عميل...")).toBeTruthy();
  });

  it("switches to tiers, analytics, and cashback tabs smoothly", async () => {
    render(
      <MemoryRouter>
        <CustomerLoyalty />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("المستويات").length).toBeGreaterThan(0);
    });

    // Test Tiers tab
    const tiersButtons = screen.getAllByRole("button", { name: /المستويات/i });
    fireEvent.click(tiersButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("المستوى الذهبي")).toBeTruthy();
      expect(screen.getByText("شحن مجاني")).toBeTruthy();
    });

    // Test Analytics tab
    fireEvent.click(screen.getByRole("button", { name: /التحليلات/i }));
    await waitFor(() => {
      expect(screen.getByText("أداء البرامج")).toBeTruthy();
      expect(screen.getByText("معدل النمو")).toBeTruthy();
    });

    // Test Cashback tab
    fireEvent.click(screen.getByRole("button", { name: /الكاش باك/i }));
    await waitFor(() => {
      expect(screen.getByText("إعدادات الكاش باك")).toBeTruthy();
      expect(screen.getByText("تخصيص الشرائح (Override Tiers)")).toBeTruthy();
    });
  });
});
