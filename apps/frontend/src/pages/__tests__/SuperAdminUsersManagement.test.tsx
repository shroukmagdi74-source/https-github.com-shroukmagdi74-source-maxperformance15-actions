/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SuperAdminUsersManagement from "../SuperAdminUsersManagement";

const mockUsers = [
  {
    id: "usr-sa-1",
    firstName: "مختار",
    lastName: "الحناوي",
    email: "mokhtar@maxp.test",
    phone: "+201012345678",
    role: "SUPER_ADMIN",
    skills: "React, Node.js, Architecture",
    department: "Executive",
    availability: "available",
    isActive: true,
    lastLoginAt: "2026-10-24T18:00:00Z",
    avatar: null,
  },
  {
    id: "usr-sa-2",
    firstName: "شروق",
    lastName: "مجدي",
    email: "shrouk@maxp.test",
    phone: "+201098765432",
    role: "COMPANY_ADMIN",
    skills: "Management, Operations",
    department: "Operations",
    availability: "busy",
    isActive: true,
    lastLoginAt: "2026-10-24T19:00:00Z",
    avatar: null,
  },
];

global.fetch = vi.fn((url: string | URL | Request) => {
  const urlStr = String(url);
  if (urlStr.includes("super-admin/users")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: mockUsers,
          pagination: {
            pages: 1,
            total: 2,
          },
        }),
    } as Response);
  }
  if (urlStr.includes("super-admin/dev/settings")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            permissions: {
              SUPER_ADMIN: {},
              COMPANY_ADMIN: {},
              MANAGER: {},
              AGENT: {},
            },
          },
        }),
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  } as Response);
});

describe("SuperAdminUsersManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and telemetry ribbon correctly", async () => {
    render(<SuperAdminUsersManagement />);

    expect(screen.getByText("إدارة المستخدمين")).toBeTruthy();
    expect(screen.getByText("تحديث")).toBeTruthy();
    expect(screen.getByText("إضافة مستخدم")).toBeTruthy();
    expect(screen.getByText("إجمالي المستخدمين")).toBeTruthy();
    expect(screen.getByText("حسابات نشطة")).toBeTruthy();
    expect(screen.getByText("مدراء النظام")).toBeTruthy();
    expect(screen.getByText("حد العرض للصفحة")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getAllByText("مختار الحناوي").length).toBeGreaterThan(0);
      expect(screen.getAllByText("شروق مجدي").length).toBeGreaterThan(0);
    });
  });

  it("opens create user modal when clicking add user button", async () => {
    render(<SuperAdminUsersManagement />);

    const addBtn = screen.getByText("إضافة مستخدم");
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText("إضافة مستخدم جديد")).toBeTruthy();
      expect(screen.getByLabelText("الاسم الأول")).toBeTruthy();
      expect(screen.getByLabelText("الاسم الأخير")).toBeTruthy();
      expect(screen.getByLabelText("البريد الإلكتروني")).toBeTruthy();
    });
  });

  it("opens user details modal when clicking details", async () => {
    render(<SuperAdminUsersManagement />);

    await waitFor(() => {
      expect(screen.getAllByText("مختار الحناوي").length).toBeGreaterThan(0);
    });

    const triggerButtons = screen.getAllByRole("button", { name: "إجراءات المستخدم" });
    fireEvent.click(triggerButtons[0]);

    const viewDetailsItem = await screen.findByText("عرض التفاصيل");
    fireEvent.click(viewDetailsItem);

    await waitFor(() => {
      expect(screen.getByText("تفاصيل المستخدم")).toBeTruthy();
      expect(screen.getAllByText("mokhtar@maxp.test").length).toBeGreaterThan(0);
    });
  });
});
