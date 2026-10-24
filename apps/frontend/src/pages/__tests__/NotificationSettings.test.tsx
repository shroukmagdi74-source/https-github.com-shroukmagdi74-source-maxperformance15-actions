/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotificationSettings from "../NotificationSettings";

const mockUser = {
  id: "user-101",
  email: "admin@maxp.test",
  companyId: "comp-1",
  timezone: "Africa/Cairo",
};

vi.mock("@/hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
  }),
}));

const mockNotificationTypes = [
  {
    id: "order_created",
    name: "طلب جديد",
    description: "تنبيه عند إنشاء طلب جديد من المتجر.",
    category: "orders",
    priority: "high",
    defaultEnabled: true,
    channels: ["push", "browser", "inApp"],
    canDisable: true,
  },
  {
    id: "system_alert",
    name: "تنبيه أمني",
    description: "إشعار عند حدوث محاولة تسجيل دخول مريبة.",
    category: "security",
    priority: "high",
    defaultEnabled: true,
    channels: ["email", "sms"],
    canDisable: false,
  },
];

const mockStats = {
  delivered: {
    total: 1250,
    byChannel: {
      push: 800,
      browser: 300,
      email: 150,
    },
  },
  engagement: {
    openRate: 0.78,
    clickRate: 0.42,
    responseTime: 12,
  },
  preferences: {
    mostUsedChannel: "push",
    quietHoursActive: false,
  },
  trends: [
    { period: "الأسبوع الحالي", delivered: 420, opened: 330, clicked: 180 },
  ],
};

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes("/notifications/settings/")) {
        return Promise.resolve({
          data: {
            data: {
              globalEnabled: true,
              quietHours: { enabled: true, startTime: "23:00", endTime: "07:00", timezone: "Africa/Cairo" },
              channels: {
                push: { enabled: true, sound: true, vibration: true, badge: true },
                browser: { enabled: true, showPreview: true, requireInteraction: false },
                email: { enabled: true, address: "admin@maxp.test", frequency: "immediate", format: "html" },
                sms: { enabled: false, phoneNumber: "", frequency: "immediate" },
                inApp: { enabled: true, showBadge: true, autoMarkRead: false },
              },
            },
          },
        });
      }
      if (url.includes("/notifications/types")) {
        return Promise.resolve({ data: { data: mockNotificationTypes } });
      }
      if (url.includes("/notifications/stats/")) {
        return Promise.resolve({ data: { data: mockStats } });
      }
      return Promise.resolve({ data: { data: {} } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

vi.mock("@/utils/browserNotifications", () => ({
  getBrowserNotificationPermission: () => "granted",
  isBrowserNotificationSupported: () => true,
  requestBrowserNotificationPermission: () => Promise.resolve("granted"),
  showBrowserNotification: () => true,
}));

describe("NotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and tabs correctly", async () => {
    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات التنبيهات والإشعارات")).toBeTruthy();
      expect(screen.getByText("الإعدادات متزامنة")).toBeTruthy();
      expect(screen.getAllByText("الإعدادات العامة").length).toBeGreaterThan(0);
      expect(screen.getByText("أنواع الإشعارات")).toBeTruthy();
      expect(screen.getByText("الإحصائيات")).toBeTruthy();
    });
  });

  it("renders general tab settings with quiet hours and channel cards", async () => {
    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText("تفعيل الإشعارات")).toBeTruthy();
      expect(screen.getByText("ساعات الهدوء")).toBeTruthy();
      expect(screen.getByText("الإشعارات المنبثقة")).toBeTruthy();
      expect(screen.getByText("إشعار المتصفح")).toBeTruthy();
      expect(screen.getByText("البريد الإلكتروني")).toBeTruthy();
      expect(screen.getByText("الرسائل النصية")).toBeTruthy();
    });
  });

  it("switches to types tab and displays notification types", async () => {
    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات التنبيهات والإشعارات")).toBeTruthy();
    });

    const typesTab = screen.getByText("أنواع الإشعارات");
    fireEvent.click(typesTab);

    await waitFor(() => {
      expect(screen.getByText("طلب جديد")).toBeTruthy();
      expect(screen.getByText("تنبيه أمني")).toBeTruthy();
      expect(screen.getByText("أساسي")).toBeTruthy();
    });
  });

  it("switches to stats tab and displays telemetry metrics", async () => {
    render(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات التنبيهات والإشعارات")).toBeTruthy();
    });

    const statsTab = screen.getByText("الإحصائيات");
    fireEvent.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText("إجمالي المرسل")).toBeTruthy();
      expect(screen.getByText("معدل الفتح")).toBeTruthy();
      expect(screen.getByText("وقت الاستجابة")).toBeTruthy();
      expect(screen.getByText("القناة المفضلة")).toBeTruthy();
      expect(screen.getByText("1250")).toBeTruthy();
      expect(screen.getByText("78%")).toBeTruthy();
    });
  });
});
