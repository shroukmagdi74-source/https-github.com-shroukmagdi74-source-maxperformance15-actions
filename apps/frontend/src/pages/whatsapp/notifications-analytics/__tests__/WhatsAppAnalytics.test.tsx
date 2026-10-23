/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";

import WhatsAppAnalytics from "../../WhatsAppAnalytics";
import { apiClient } from "../../../../services/apiClient";

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: {
        dir: () => "rtl",
        language: "ar",
      },
      t: (key: string, options?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
          "whatsappAnalytics.title": "تحليلات إشعارات واتساب",
          "whatsappAnalytics.description": "مؤشرات أداء الإشعارات ومعدلات التسليم والقراءة",
          "whatsappAnalytics.stats.total": "إجمالي المرسل",
          "whatsappAnalytics.stats.delivered": "تم التسليم",
          "whatsappAnalytics.stats.read": "تمت القراءة",
          "whatsappAnalytics.stats.failed": "فشل الإرسال",
          "whatsappAnalytics.stats.deliveryRate": "معدل التسليم",
          "whatsappAnalytics.stats.readRate": "معدل القراءة",
          "whatsappAnalytics.charts.byCategory": "الرسائل حسب التصنيف",
          "whatsappAnalytics.charts.topEvents": "أهم الأحداث المشغلة",
          "whatsappAnalytics.charts.noData": "لا توجد بيانات متاحة",
          "whatsappAnalytics.logs.title": "سجل الإشعارات المرسلة",
          "whatsappAnalytics.logs.recipient": "المستلم",
          "whatsappAnalytics.logs.type": "نوع الإشعار",
          "whatsappAnalytics.logs.status": "الحالة",
          "whatsappAnalytics.logs.error": "سبب الفشل",
          "whatsappAnalytics.logs.date": "التاريخ",
          "whatsappAnalytics.logs.rowsPerPage": "عدد السجلات:",
          "whatsappAnalytics.logs.noLogs": "لا توجد إشعارات مسجلة",
          "whatsappAnalytics.timeRange.label": "النطاق",
          "whatsappAnalytics.timeRange.last30Days": "آخر ٣٠ يوم",
          "common.refresh": "تحديث",
          "common.back": "رجوع",
          "common.all": "الكل",
          "common.previous": "السابق",
          "common.next": "التالي",
          "whatsappNotifications.tabs.orders": "الطلبات",
          "whatsappNotifications.tabs.marketing": "التسويق",
          "whatsappNotifications.orders.orderCreated": "إنشاء طلب جديد",
          "whatsappNotifications.status.delivered": "تم التسليم",
          "whatsappNotifications.status.sent": "تم الإرسال",
        };
        if (key === "whatsappAnalytics.logs.displayedRows" && options) {
          return `عرض ${options.from} - ${options.to} من ${options.count}`;
        }
        return translations[key] || key;
      },
    }),
  };
});

describe("WhatsAppAnalytics", () => {
  const mockStats = {
    total: 120,
    sent: 115,
    delivered: 100,
    read: 75,
    failed: 5,
    deliveryRate: "87.0",
    readRate: "75.0",
    byCategory: {
      ORDERS: 80,
      MARKETING: 40,
    },
    byEvent: {
      ORDER_CREATED: 60,
      PROMOTIONAL: 40,
    },
  };

  const mockLogs = [
    {
      id: "log-1",
      recipientPhone: "+201012345678",
      recipientName: "كريم محمود",
      category: "ORDERS",
      eventType: "ORDER_CREATED",
      content: "تم استلام طلبك بنجاح",
      status: "DELIVERED",
      sentAt: "2026-10-23T10:00:00Z",
      createdAt: "2026-10-23T10:00:00Z",
      failureReason: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp-notifications/stats")) {
        return Promise.resolve({ data: { stats: mockStats } });
      }
      if (url.includes("/whatsapp-notifications/logs")) {
        return Promise.resolve({
          data: {
            logs: mockLogs,
            pagination: { total: 45, page: 1, limit: 10 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <WhatsAppAnalytics companyId="comp-1" companyName="متجر النور" />
      </MemoryRouter>
    );

  it("renders page header and hero metric cards", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/تحليلات إشعارات واتساب/i)).toBeInTheDocument();
    });

    expect(screen.getByText("إجمالي المرسل")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getAllByText("تم التسليم").length).toBeGreaterThan(0);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getAllByText("تمت القراءة").length).toBeGreaterThan(0);
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("فشل الإرسال")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders delivery and read rate cards with percentages", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText("معدل التسليم").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("معدل القراءة").length).toBeGreaterThan(0);
    expect(screen.getAllByText("87%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("75%").length).toBeGreaterThan(0);
  });

  it("renders category volume and top events breakdowns", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("الرسائل حسب التصنيف")).toBeInTheDocument();
    });

    expect(screen.getByText("أهم الأحداث المشغلة")).toBeInTheDocument();
    expect(screen.getByText("الطلبات")).toBeInTheDocument();
    expect(screen.getAllByText("إنشاء طلب جديد").length).toBeGreaterThan(0);
  });

  it("renders notification logs table with recipient info and pagination", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("سجل الإشعارات المرسلة")).toBeInTheDocument();
    });

    expect(screen.getByText("كريم محمود")).toBeInTheDocument();
    expect(screen.getByText("+201012345678")).toBeInTheDocument();
    expect(screen.getByText("عرض 1 - 10 من 45")).toBeInTheDocument();
  });

  it("triggers data reload when clicking refresh button", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/تحليلات إشعارات واتساب/i)).toBeInTheDocument();
    });

    const callsBefore = (apiClient.get as any).mock.calls.length;

    const refreshBtn = screen.getByRole("button", { name: /تحديث/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect((apiClient.get as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
