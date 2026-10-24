/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Notifications from "../Notifications";

const mockNotifications = [
  {
    id: "notif-1",
    type: "order",
    title: "طلب بيع جديد #1042",
    message: "تم تسجيل طلب بيع جديد بقيمة 1,250 ج.م من العميل أحمد سامي.",
    timestamp: new Date().toISOString(),
    isRead: false,
    data: { orderId: "1042" },
  },
  {
    id: "notif-2",
    type: "incident",
    title: "انقطاع الاتصال ببوابة الدفع",
    message: "توقف مؤقت في خدمة فودافون كاش، جاري إعادة المحاولة تلقائياً.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
  },
];

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "usr-admin", role: "COMPANY_ADMIN", companyId: "comp-1" },
    isAuthenticated: true,
  }),
}));

vi.mock("../../services/socketService", () => ({
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn((url: string) => {
      if (url.includes("/notifications/recent")) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            notifications: mockNotifications,
          },
        });
      }
      return Promise.resolve({ status: 200, data: { success: true } });
    }),
    post: vi.fn(() => Promise.resolve({ status: 200, data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ status: 200, data: { success: true } })),
  },
}));

describe("Notifications Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header, telemetry and notification list", async () => {
    render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("مركز التنبيهات")).toBeTruthy();
      expect(screen.getByText("إجمالي الإشعارات")).toBeTruthy();
      expect(screen.getByText("طلب بيع جديد #1042")).toBeTruthy();
      expect(screen.getByText("انقطاع الاتصال ببوابة الدفع")).toBeTruthy();
    });
  });

  it("filters notifications by read status", async () => {
    render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("طلب بيع جديد #1042")).toBeTruthy();
    });

    const unreadTab = screen.getByRole("button", { name: /غير مقروءة/ });
    fireEvent.click(unreadTab);

    await waitFor(() => {
      expect(screen.getByText("طلب بيع جديد #1042")).toBeTruthy();
      expect(screen.queryByText("انقطاع الاتصال ببوابة الدفع")).toBeNull();
    });
  });

  it("marks a notification as read", async () => {
    render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("طلب بيع جديد #1042")).toBeTruthy();
    });

    const markReadBtn = screen.getByTitle("تحديد كمقروء");
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(screen.queryByTitle("تحديد كمقروء")).toBeNull();
    });
  });

  it("deletes a notification", async () => {
    render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("طلب بيع جديد #1042")).toBeTruthy();
    });

    const deleteButtons = screen.getAllByTitle("حذف الإشعار");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("طلب بيع جديد #1042")).toBeNull();
    });
  });
});
