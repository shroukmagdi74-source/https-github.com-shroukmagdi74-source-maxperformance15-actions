// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import WorkReportRecordsPage from "../hr/work-reporting/WorkReportRecordsPage";
import { companyAwareApi } from "../../services/companyAwareApi";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
  },
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Line: () => null,
  Bar: () => null,
}));

const mockWorkReportPayload = {
  form: {
    id: "form-1",
    title: "تقرير الإنجاز اليومي للمبيعات",
    fields: [
      { key: "callsCount", label: "عدد المكالمات", dataType: "NUMBER", isVisible: true },
      { key: "notes", label: "ملاحظات", dataType: "LONG_TEXT", isVisible: true },
    ],
  },
  analytics: {
    summary: {
      totalSubmissions: 14,
      uniqueEmployees: 3,
    },
    metricCards: [
      { key: "callsCount", label: "عدد المكالمات", dataType: "NUMBER", total: 120, average: 8.5 },
    ],
    dailyTrend: [
      { date: "2026-10-25", submissions: 5, metrics: { callsCount: 45 } },
    ],
    employeeBreakdown: [
      {
        userId: "u-1",
        userDisplayName: "عمر فاروق",
        submissionsCount: 6,
        lastSubmittedAt: "2026-10-25T16:30:00.000Z",
        metrics: [{ key: "callsCount", total: 60, average: 10 }],
      },
    ],
  },
  records: [
    {
      id: "rec-1",
      userDisplayName: "عمر فاروق",
      reportDate: "2026-10-25",
      submittedAt: "2026-10-25T16:30:00.000Z",
      valuesByFieldKey: {
        callsCount: { displayValue: "12" },
        notes: { displayValue: "تم التواصل مع العملاء بنجاح" },
      },
    },
  ],
};

describe("WorkReportRecordsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockResolvedValue({
      data: {
        data: mockWorkReportPayload,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form title, analytics summary cards, employee breakdown, and submission records", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/reporting/forms/form-1/records"]}>
        <Routes>
          <Route
            path="/hr/reporting/forms/:formId/records"
            element={<WorkReportRecordsPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تقرير الإنجاز اليومي للمبيعات")).toBeTruthy();
    });

    expect(screen.getByText("14")).toBeTruthy();
    expect(screen.getAllByText("عمر فاروق").length).toBeGreaterThan(0);
    expect(screen.getByText("تم التواصل مع العملاء بنجاح")).toBeTruthy();
  });
});
