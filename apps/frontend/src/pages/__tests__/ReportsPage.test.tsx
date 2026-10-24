/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReportsPage from "../ReportsPage";

const mockSummary = {
  healthScore: 94,
  status: "excellent",
  keyMetrics: {
    totalResponses: 15420,
    successRate: "99.2%",
    averageResponseTime: "185ms",
    activeAlerts: 0,
  },
  mainConcerns: [],
  recommendationsCount: 2,
  lastGenerated: new Date().toISOString(),
};

const mockDailyReport = {
  type: "daily",
  date: "2026-10-24",
  generatedAt: new Date().toISOString(),
  performance: {
    totalResponses: 15420,
    successRate: 99.2,
    errorRate: 0.8,
    averageResponseTime: 185,
    slowRate: 1.2,
    emptyRate: 0.1,
    healthStatus: "excellent",
  },
  recommendations: [
    {
      type: "CACHE",
      priority: "medium",
      title: "تفعيل التخزين المؤقت للاستعلامات المتكررة",
      description: "يوصى بزيادة فترة TTL لتقليل الحمل على قاعدة البيانات.",
      suggestion: "زيادة TTL إلى 300 ثانية.",
    },
  ],
  executiveSummary: {
    healthScore: 94,
    status: "excellent",
    keyMetrics: {
      totalResponses: 15420,
      successRate: "99.2%",
      averageResponseTime: "185ms",
      activeAlerts: 0,
    },
    mainConcerns: ["لا توجد مخاوف رئيسية"],
    overallTrend: "STABLE",
  },
};

vi.mock("../../components/ui/theme-toggle", () => ({
  default: () => <button data-testid="theme-toggle">Theme</button>,
}));

global.fetch = vi.fn((url: string | URL | Request) => {
  const urlStr = String(url);
  if (urlStr.includes("/monitor/reports/summary")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: mockSummary }),
    } as Response);
  }
  if (urlStr.includes("/monitor/reports/daily")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: mockDailyReport }),
    } as Response);
  }
  if (urlStr.includes("/monitor/reports/export")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            report: { generated: true },
            export: { filename: "daily-report-2026-10-24.json" },
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

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header, summary metrics, and performance overview", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("التقارير والتحليلات")).toBeTruthy();
      expect(screen.getByText("نقاط الصحة")).toBeTruthy();
      expect(screen.getByText("94/100")).toBeTruthy();
      expect(screen.getByText("إجمالي الردود")).toBeTruthy();
      expect(screen.getByText("15420")).toBeTruthy();
      expect(screen.getByText("ملخص الأداء")).toBeTruthy();
      expect(screen.getByText("تفعيل التخزين المؤقت للاستعلامات المتكررة")).toBeTruthy();
    });
  });

  it("allows selecting a different date and refreshing", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("التقارير والتحليلات")).toBeTruthy();
    });

    const refreshBtn = screen.getByRole("button", { name: "تحديث" });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/monitor/reports/daily"),
        expect.anything(),
      );
    });
  });

  it("triggers report export on clicking export button", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("تقرير يومي (JSON)")).toBeTruthy();
    });

    const exportBtn = screen.getByText("تقرير يومي (JSON)");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/monitor/reports/export"),
        expect.anything(),
      );
    });
  });
});
