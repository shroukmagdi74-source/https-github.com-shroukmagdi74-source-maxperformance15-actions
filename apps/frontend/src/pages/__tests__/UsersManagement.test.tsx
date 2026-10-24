/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UsersManagement from "../UsersManagement";

if (typeof window !== "undefined" && !window.PointerEvent) {
  (window as any).PointerEvent = class PointerEvent extends MouseEvent {};
}

const mockUser = {
  id: "u-current-admin",
  companyId: "comp-123",
  role: "COMPANY_ADMIN",
  company: {
    activeApps: ["store", "crm", "pos"],
  },
};

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

const mockT = (key: string, fallbackOrOpts?: any) => {
  if (typeof fallbackOrOpts === "string") return fallbackOrOpts;
  if (fallbackOrOpts && typeof fallbackOrOpts === "object") {
    if (typeof fallbackOrOpts.defaultValue === "string") {
      return fallbackOrOpts.defaultValue;
    }
  }
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

vi.mock("sonner", () => {
  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };
  return {
    __esModule: true,
    default: toastMock,
    toast: toastMock,
  };
});

const mockUsersList = [
  {
    id: "user-1",
    firstName: "مختار",
    lastName: "الحناوي",
    email: "mokhtar@maxp.online",
    phone: "01000000000",
    role: "COMPANY_ADMIN",
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: "2026-10-24T12:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    employee: {
      employeeNumber: "EMP-001",
      status: "ACTIVE",
      department: { id: "dep-1", name: "الإدارة العامة" },
      position: { id: "pos-1", title: "المدير التنفيذي" },
    },
  },
  {
    id: "user-2",
    firstName: "سارة",
    lastName: "أحمد",
    email: "sara@maxp.online",
    phone: "01111111111",
    role: "AGENT",
    isActive: false,
    isEmailVerified: false,
    lastLoginAt: null,
    createdAt: "2026-05-15T00:00:00Z",
    employee: null,
  },
];

const mockRoles = {
  COMPANY_ADMIN: { name: "مدير الشركة" },
  MANAGER: { name: "مدير قسم" },
  AGENT: { name: "وكيل / موظف" },
};

describe("UsersManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      const urlStr = String(url);
      if (urlStr.includes("/users?")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                users: mockUsersList,
                pagination: { totalPages: 1, total: 2 },
                counts: { total: 2, active: 1, neverLoggedIn: 1, inactive: 1 },
              },
            }),
        });
      }
      if (urlStr.includes("/roles")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockRoles }),
        });
      }
      if (urlStr.includes("/invitations")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { invitations: [] } }),
        });
      }
      if (urlStr.includes("/departments")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              departments: [{ id: "dep-1", name: "الإدارة العامة" }],
            }),
        });
      }
      if (urlStr.includes("/positions")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              positions: [{ id: "pos-1", title: "المدير التنفيذي" }],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }) as any;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and action buttons correctly", async () => {
    render(<UsersManagement />);

    expect(screen.getByText("إدارة المستخدمين")).toBeTruthy();
    expect(screen.getByText("دعوة موظف برابط")).toBeTruthy();
    expect(screen.getByText("إضافة مستخدم")).toBeTruthy();
    expect(screen.getByText("دعوة مستخدم")).toBeTruthy();
    expect(screen.getByText("تصدير CSV")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("مختار الحناوي")).toBeTruthy();
      expect(screen.getByText("سارة أحمد")).toBeTruthy();
    });
  });

  it("renders metrics strip with users counts", async () => {
    render(<UsersManagement />);

    expect(screen.getAllByText("إجمالي المستخدمين").length).toBeGreaterThan(0);
    expect(screen.getAllByText("النشطون فعلياً").length).toBeGreaterThan(0);
    expect(screen.getAllByText("لم يسجلوا الدخول").length).toBeGreaterThan(0);
    expect(screen.getAllByText("غير النشطين").length).toBeGreaterThan(0);
    expect(screen.getAllByText("الدعوات المعلقة").length).toBeGreaterThan(0);
  });

  it("opens add user modal when clicking add user button", async () => {
    render(<UsersManagement />);

    const addBtn = screen.getByText("إضافة مستخدم");
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText("إضافة مستخدم جديد")).toBeTruthy();
      expect(screen.getByLabelText("الاسم الأول")).toBeTruthy();
      expect(screen.getByLabelText("اسم العائلة")).toBeTruthy();
    });
  });

  it("opens quick invite modal when clicking invite user button", async () => {
    render(<UsersManagement />);

    const inviteBtn = screen.getByText("دعوة مستخدم");
    fireEvent.click(inviteBtn);

    await waitFor(() => {
      expect(screen.getByText("دعوة مستخدم جديد")).toBeTruthy();
    });
  });

  it("switches tabs between all users and invitations", async () => {
    render(<UsersManagement />);

    await waitFor(() => {
      expect(screen.getByText("مختار الحناوي")).toBeTruthy();
    });

    const invitationsTabs = screen.getAllByText("الدعوات المعلقة");
    // Find the one that's inside a button or tab
    const tabBtn = invitationsTabs.find(el => el.closest("button") || el.tagName === "BUTTON") || invitationsTabs[0];
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(screen.getByText("لا توجد دعوات معلقة")).toBeTruthy();
    });
  });
});
