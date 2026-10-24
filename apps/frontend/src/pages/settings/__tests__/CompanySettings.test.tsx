/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CompanySettings from "../CompanySettings";

const mockT = (key: string, fallback?: any) => {
  if (typeof fallback === "string") return fallback;
  return key;
};

vi.mock("react-i18next", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: mockT,
    }),
  };
});

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u-owner", companyId: "comp-123", role: "OWNER" },
  }),
}));

vi.mock("../../../contexts/SidebarSettingsContext", () => ({
  useSidebarSettings: () => ({
    setUserLayout: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("../../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    dateFormat: "YYYY-MM-DD",
    setDateFormat: vi.fn(),
    isLoading: false,
    error: null,
    formatDate: () => "2026-10-24",
  }),
}));

vi.mock("../../../utils/tokenManager", () => ({
  tokenManager: {
    getAccessToken: () => "mock-token-xyz",
  },
}));

const mockCompanyData = {
  id: "comp-123",
  name: "Acme Corp",
  slug: "acme-corp",
  currency: "EGP",
  sidebarLayout: "three-tier",
  timezone: "Africa/Cairo",
  settings: {
    description: "Acme Corp official e-commerce store",
  },
};

const mockUsageData = {
  users: { usage: 5, limit: 10, percentage: 50, unlimited: false, warning: false, exceeded: false },
  orders: { usage: 120, limit: 1000, percentage: 12, unlimited: false, warning: false, exceeded: false },
  storage: { usage: 250, limit: 500, percentage: 50, unlimited: false, warning: false, exceeded: false },
};

const mockUsersData = {
  users: [
    { id: "u-2", firstName: "Ahmed", lastName: "Ali", email: "ahmed@example.com", role: "ADMIN" },
    { id: "u-3", firstName: "Sara", lastName: "Hassan", email: "sara@example.com", role: "MEMBER" },
  ],
};

describe("CompanySettings Page (Batch 462)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/usage")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockUsageData }),
        });
      }
      if (url.includes("/users")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockUsersData }),
        });
      }
      if (url.includes("/companies/comp-123")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockCompanyData }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      });
    }) as any;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it("renders page title and company info tab cleanly after loading", async () => {
    render(<CompanySettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات الشركة")).toBeTruthy();
      expect(screen.getByText("Acme Corp")).toBeTruthy();
    });

    expect(screen.getByText("comp-123")).toBeTruthy();
    expect(screen.getByText("acme-corp")).toBeTruthy();
    expect(screen.getByText("Acme Corp official e-commerce store")).toBeTruthy();
  });

  it("renders navigation tabs including ownership for OWNER role", async () => {
    render(<CompanySettings />);

    await waitFor(() => {
      expect(screen.getByText("عام")).toBeTruthy();
      expect(screen.getByText("المظهر")).toBeTruthy();
      expect(screen.getByText("الاستخدام")).toBeTruthy();
      expect(screen.getByText("الملكية")).toBeTruthy();
    });
  });

  it("switches to appearance tab and shows sidebar layout choices", async () => {
    render(<CompanySettings />);

    await waitFor(() => {
      expect(screen.getByText("المظهر")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("المظهر"));

    expect(screen.getByText("نظام القائمة الجانبية")).toBeTruthy();
  });

  it("switches to usage tab and shows resource consumption cards", async () => {
    render(<CompanySettings />);

    await waitFor(() => {
      expect(screen.getByText("الاستخدام")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("الاستخدام"));

    expect(screen.getByText("إحصائيات الاستخدام")).toBeTruthy();
    expect(screen.getByText("المستخدمين")).toBeTruthy();
    expect(screen.getByText("الطلبات")).toBeTruthy();
    expect(screen.getByText("التخزين (MB)")).toBeTruthy();
  });

  it("switches to ownership tab and displays danger zone with potential new owners", async () => {
    render(<CompanySettings />);

    await waitFor(() => {
      expect(screen.getByText("الملكية")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("الملكية"));

    expect(screen.getByText("نقل ملكية الشركة")).toBeTruthy();
    expect(screen.getByText("منطقة خطر!")).toBeTruthy();
    expect(screen.getByText("اختر المالك الجديد")).toBeTruthy();

    const select = screen.getByLabelText("اختر المالك الجديد");
    expect(select).toBeTruthy();
    expect(screen.getByText(/Ahmed Ali/)).toBeTruthy();
    expect(screen.getByText(/Sara Hassan/)).toBeTruthy();
  });
});
