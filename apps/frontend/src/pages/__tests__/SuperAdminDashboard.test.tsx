/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SuperAdminDashboard from "../SuperAdminDashboard";

const mockDashboardData = {
  overview: {
    totalCompanies: 48,
    activeCompanies: 42,
    totalUsers: 312,
    totalCustomers: 8540,
    totalConversations: 24100,
  },
  comparison: {
    companiesGrowth: 12.5,
    usersGrowth: 8.4,
    customersGrowth: 15.2,
  },
  recentActivity: {
    newCompaniesLast30Days: 6,
    newUsersLast30Days: 24,
    newCustomersLast30Days: 450,
  },
  trends: [
    { date: "2026-10-01", companies: 42, users: 290, customers: 8100 },
    { date: "2026-10-15", companies: 45, users: 300, customers: 8300 },
    { date: "2026-10-24", companies: 48, users: 312, customers: 8540 },
  ],
  health: {
    status: "healthy",
    uptime: 172800,
    database: "connected",
    dbStats: {
      queryCount: 15200,
      latency: 4,
      queue: 0,
      active: 8,
    },
    environment: "production",
    timestamp: new Date().toISOString(),
  },
  systems: [
    {
      systemName: "ai_orchestrator",
      displayName: "منسق وكلاء الذكاء الاصطناعي",
      category: "api_keys",
      isEnabled: true,
      resourceUsage: "12% CPU",
    },
    {
      systemName: "whatsapp_gateway",
      displayName: "بوابة واتساب للأعمال",
      category: "messaging",
      isEnabled: true,
      resourceUsage: "24% CPU",
    },
  ],
  alerts: [
    {
      id: "alt-1",
      type: "warning",
      message: "اقتراب استهلاك كوتا رسائل واتساب اليومية من 85%",
      category: "quota",
      action: "REVIEW",
      timestamp: new Date().toISOString(),
    },
  ],
};

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "usr-sa-1",
      firstName: "مختار",
      lastName: "الحناوي",
      role: "SUPER_ADMIN",
    },
    isAuthenticated: true,
  }),
}));

vi.mock("../../hooks/useTheme", () => ({
  useTheme: () => ({
    actualTheme: "dark",
  }),
}));

vi.mock("../../components/ActiveUsersMonitor", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="active-users-monitor">
        <span>مراقبة المستخدمين النشطين</span>
        <button onClick={onClose}>إغلاق</button>
      </div>
    ) : null,
}));

vi.mock("../super-admin/dashboard/PlatformOperationsPulse", () => ({
  PlatformOperationsPulse: () => (
    <div data-testid="platform-operations-pulse">نبض العمليات التشغيلية</div>
  ),
}));

global.fetch = vi.fn((url: string | URL | Request) => {
  const urlStr = String(url);
  if (urlStr.includes("admin/dashboard/aggregated")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: mockDashboardData }),
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  } as Response);
});

describe("SuperAdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, health bar, telemetry ribbon and recent activity", async () => {
    render(<SuperAdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("لوحة تحكم مدير النظام")).toBeTruthy();
      expect(screen.getByText(/مرحباً مختار الحناوي/)).toBeTruthy();
      expect(screen.getByText("حالة النظام:")).toBeTruthy();
      expect(screen.getByText("قاعدة البيانات متصلة")).toBeTruthy();
      expect(screen.getByText("إجمالي الشركات")).toBeTruthy();
      expect(screen.getByText("إجمالي المستخدمين")).toBeTruthy();
      expect(screen.getByText("إجمالي العملاء")).toBeTruthy();
      expect(screen.getByText("إجمالي المحادثات")).toBeTruthy();
      expect(screen.getByText("النشاط ومعدل النمو الأخير")).toBeTruthy();
    });
  });

  it("renders system services and alerts panel", async () => {
    render(<SuperAdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("خدمات النظام الأساسية")).toBeTruthy();
      expect(screen.getByText("منسق وكلاء الذكاء الاصطناعي")).toBeTruthy();
      expect(screen.getByText("بوابة واتساب للأعمال")).toBeTruthy();
      expect(screen.getByText("تنبيهات المنظومة")).toBeTruthy();
      expect(screen.getByText("اقتراب استهلاك كوتا رسائل واتساب اليومية من 85%")).toBeTruthy();
    });
  });

  it("opens active users monitor modal when clicked", async () => {
    render(<SuperAdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("المستخدمون النشطون")).toBeTruthy();
    });

    const activeUsersBtn = screen.getByText("المستخدمون النشطون");
    fireEvent.click(activeUsersBtn);

    await waitFor(() => {
      expect(screen.getByTestId("active-users-monitor")).toBeTruthy();
      expect(screen.getByText("مراقبة المستخدمين النشطين")).toBeTruthy();
    });
  });
});
