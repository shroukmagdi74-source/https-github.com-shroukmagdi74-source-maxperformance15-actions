// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import SentMessagesStats from "../SentMessagesStats";

const translations: Record<string, string> = {
  "sentMessagesStats.pageTitle": "إحصائيات الرسائل المرسلة",
  "sentMessagesStats.pageSubtitleAlt": "تحليل أداء الرسائل ومعدلات التحويل",
  "sentMessagesStats.lastUpdate": "آخر تحديث: ",
  "sentMessagesStats.filters": "الفلاتر",
  "sentMessagesStats.overview": "نظرة عامة",
  "sentMessagesStats.detailedComparison": "مقارنة مفصلة",
  "sentMessagesStats.tables": "الجداول",
  "sentMessagesStats.retry": "إعادة المحاولة",
  "sentMessagesStats.noMessagesInPeriod": "لا توجد رسائل مرسلة في الفترة المحددة",
};

const mockT = (key: string) => translations[key] || key;
const mockI18n = { language: "ar" };

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

vi.mock("../../../utils/tokenManager", () => ({
  default: {
    getAccessToken: vi.fn(() => "test-token"),
    createAuthHeaders: vi.fn(() => ({ Authorization: "Bearer test-token" })),
  },
}));

vi.mock("../../../components/charts/PieChart", () => ({
  default: () => <div data-testid="mock-pie-chart">Pie Chart</div>,
}));

vi.mock("../../../components/charts/BarChart", () => ({
  default: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
}));

vi.mock("../../../components/filters/DateRangePicker", () => ({
  default: () => <div data-testid="mock-date-range-picker">Date Range Picker</div>,
}));

vi.mock("../../../components/export/ExportButtons", () => ({
  default: ({ filename }: { filename: string }) => (
    <div data-testid={`mock-export-${filename}`}>Export {filename}</div>
  ),
}));

const mockStatsData = {
  summary: {
    messages: {
      totalSent: 1250,
      totalSaved: 950,
      totalIgnored: 300,
      savedPercentage: 76,
      ignoredPercentage: 24,
      conversionRate: 15.4,
    },
    conversations: {
      reached: 820,
      ignored: 180,
      created: 192,
      existed: 628,
      total: 1000,
    },
    revenue: {
      totalRevenue: 45600,
      totalOrderCount: 114,
      avgRevenuePerMessage: 36.48,
      avgRevenuePerConversation: 55.61,
    },
  },
  dailyStats: [
    {
      date: "2026-10-25T00:00:00.000Z",
      saved: 300,
      ignored: 100,
      total: 400,
      conversationsCreated: 60,
      conversationsExisted: 200,
      conversationsIgnored: 50,
      savedReach: 260,
      ignoredReach: 50,
      revenue: 15000,
      orderCount: 38,
    },
    {
      date: "2026-10-26T00:00:00.000Z",
      saved: 350,
      ignored: 110,
      total: 460,
      conversationsCreated: 72,
      conversationsExisted: 230,
      conversationsIgnored: 60,
      savedReach: 302,
      ignoredReach: 60,
      revenue: 18000,
      orderCount: 45,
    },
  ],
  hourlyStats: [
    { hour: 14, count: 120, saved: 95, ignored: 25, revenue: 6500, orderCount: 16 },
    { hour: 18, count: 210, saved: 175, ignored: 35, revenue: 11200, orderCount: 28 },
  ],
  weekdayStats: [
    { day: 1, dayName: "الاثنين", count: 320 },
    { day: 2, dayName: "الثلاثاء", count: 410 },
  ],
  pageStats: [
    { pageId: "page_1", pageName: "متجر سوان الرسمي", count: 750, percentage: 60 },
    { pageId: "page_2", pageName: "صفحة العروض والخصومات", count: 500, percentage: 40 },
  ],
  comparison: {
    previousPeriod: {
      from: "2026-10-18T00:00:00.000Z",
      to: "2026-10-24T00:00:00.000Z",
      totalSent: 1050,
      totalSaved: 780,
      totalRevenue: 38000,
    },
    changes: {
      sentChange: 19,
      savedChange: 21.8,
      revenueChange: 20,
      sentTrend: "up" as const,
      savedTrend: "up" as const,
      revenueTrend: "up" as const,
    },
  },
  period: {
    from: "2026-10-25T00:00:00.000Z",
    to: "2026-10-26T00:00:00.000Z",
  },
};

describe("SentMessagesStats (Modular Architecture)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders header and summary cards when data loads successfully", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("integrations/facebook/connected")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, pages: [{ pageId: "p1", pageName: "صفحة تجريبية" }] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStatsData }),
      });
    }) as any;

    render(<SentMessagesStats />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-pie-chart")).toBeInTheDocument();
    });

    expect(screen.getByText("إحصائيات الرسائل المرسلة")).toBeInTheDocument();
  });

  it("switches to comparison tab and shows comparison details and charts", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("integrations/facebook/connected")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, pages: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStatsData }),
      });
    }) as any;

    render(<SentMessagesStats />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-pie-chart")).toBeInTheDocument();
    });

    const compTabBtn = screen.getByRole("button", { name: "مقارنة مفصلة" });
    fireEvent.click(compTabBtn);

    await waitFor(() => {
      expect(screen.getByTestId("mock-bar-chart")).toBeInTheDocument();
    });
  });

  it("switches to tables tab and displays export buttons and tables", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("integrations/facebook/connected")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, pages: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStatsData }),
      });
    }) as any;

    render(<SentMessagesStats />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-pie-chart")).toBeInTheDocument();
    });

    const tablesTabBtn = screen.getByRole("button", { name: "الجداول" });
    fireEvent.click(tablesTabBtn);

    await waitFor(() => {
      expect(screen.getByTestId("mock-export-daily-stats")).toBeInTheDocument();
      expect(screen.getByTestId("mock-export-page-stats")).toBeInTheDocument();
    });
  });

  it("renders error banner and handles retry correctly", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("integrations/facebook/connected")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, pages: [] }),
        });
      }
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "فشل الاتصال بالخادم" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStatsData }),
      });
    }) as any;

    render(<SentMessagesStats />);

    await waitFor(() => {
      expect(screen.getByText("فشل الاتصال بالخادم")).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: "إعادة المحاولة" });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId("mock-pie-chart")).toBeInTheDocument();
    });
  });

  it("renders empty state when totalSent is 0", async () => {
    const emptyStats = {
      ...mockStatsData,
      summary: {
        ...mockStatsData.summary,
        messages: {
          ...mockStatsData.summary.messages,
          totalSent: 0,
        },
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("integrations/facebook/connected")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, pages: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: emptyStats }),
      });
    }) as any;

    render(<SentMessagesStats />);

    await waitFor(() => {
      expect(screen.getByText("لا توجد رسائل مرسلة في الفترة المحددة")).toBeInTheDocument();
    });
  });
});
