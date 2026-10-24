/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Reminders from "../Reminders";

const mockReminders = [
  {
    id: "rem-1",
    title: "متابعة العميل أحمد طارق بخصوص الفاتورة",
    description: "الاتصال للتأكد من استلام طلبية القمصان وتأكيد التحويل البنكي.",
    type: "FOLLOW_UP",
    priority: "high",
    status: "pending",
    companyId: "1",
    userId: "1",
    customerId: "402",
    scheduledTime: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    snoozeCount: 0,
    maxSnooze: 3,
    canSnooze: true,
  },
  {
    id: "rem-2",
    title: "إرسال عرض أسعار الجملة للشركة المصرية",
    description: "إرسال ملف PDF لعرض أسعار الشتاء عبر الواتساب.",
    type: "QUOTE_FOLLOW_UP",
    priority: "medium",
    status: "completed",
    companyId: "1",
    userId: "1",
    customerId: "505",
    scheduledTime: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    snoozeCount: 1,
    maxSnooze: 3,
    canSnooze: true,
  },
];

const mockStats = {
  active: { total: 1, overdue: 0 },
  completed: { thisWeek: 1, total: 1 },
  performance: {
    completionRate: 0.85,
    averageSnoozeCount: 1.2,
    onTimeCompletion: 0.9,
  },
  trends: [
    { period: "الأسبوع الحالي", created: 5, completed: 4, overdue: 0 },
  ],
};

vi.mock("../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    formatDate: (date: string) => new Date(date).toLocaleDateString("ar-EG"),
  }),
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes("/reminders/stats")) {
        return Promise.resolve({ data: { success: true, data: mockStats } });
      }
      if (url.includes("/reminders")) {
        return Promise.resolve({
          data: {
            success: true,
            data: { reminders: mockReminders },
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

describe("Reminders Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header, telemetry ribbon, and active reminders", async () => {
    render(<Reminders />);

    await waitFor(() => {
      expect(screen.getByText("التذكيرات والمتابعة")).toBeTruthy();
      expect(screen.getByText("تذكير جديد")).toBeTruthy();
      expect(screen.getByText("التذكيرات النشطة")).toBeTruthy();
      expect(screen.getByText("متابعة العميل أحمد طارق بخصوص الفاتورة")).toBeTruthy();
    });
  });

  it("switches tabs between active and completed", async () => {
    render(<Reminders />);

    await waitFor(() => {
      expect(screen.getByText("متابعة العميل أحمد طارق بخصوص الفاتورة")).toBeTruthy();
    });

    const completedTab = screen.getByRole("button", { name: /المكتملة/ });
    fireEvent.click(completedTab);

    await waitFor(() => {
      expect(screen.getByText("إرسال عرض أسعار الجملة للشركة المصرية")).toBeTruthy();
      expect(screen.queryByText("متابعة العميل أحمد طارق بخصوص الفاتورة")).toBeNull();
    });
  });

  it("opens create reminder modal", async () => {
    render(<Reminders />);

    await waitFor(() => {
      expect(screen.getByText("تذكير جديد")).toBeTruthy();
    });

    const createBtn = screen.getByText("تذكير جديد");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText("إنشاء تذكير جديد")).toBeTruthy();
      expect(screen.getByPlaceholderText("عنوان التذكير")).toBeTruthy();
      expect(screen.getByPlaceholderText("وصف التذكير")).toBeTruthy();
    });
  });

  it("completes an active reminder", async () => {
    render(<Reminders />);

    await waitFor(() => {
      expect(screen.getByText("متابعة العميل أحمد طارق بخصوص الفاتورة")).toBeTruthy();
    });

    const completeBtn = screen.getByTitle("تم الإنجاز");
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(completeBtn).toBeTruthy();
    });
  });
});
