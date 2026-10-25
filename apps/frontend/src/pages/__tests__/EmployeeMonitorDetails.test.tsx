// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EmployeeMonitorDetails from "../hr/monitor/EmployeeMonitorDetails";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../hr/monitor/components/TaskPerformanceCard", () => ({
  default: () => <div data-testid="task-performance-card">TaskPerformanceCard</div>,
}));

vi.mock("../hr/monitor/components/ActivityTimelineBar", () => ({
  default: () => <div data-testid="activity-timeline-bar">ActivityTimelineBar</div>,
}));

vi.mock("../hr/monitor/components/BreakDetailsCard", () => ({
  default: () => <div data-testid="break-details-card">BreakDetailsCard</div>,
}));

vi.mock("../hr/monitor/components/AppUsageList", () => ({
  default: () => <div data-testid="app-usage-list">AppUsageList</div>,
}));

vi.mock("../hr/monitor/components/WebUsageList", () => ({
  default: () => <div data-testid="web-usage-list">WebUsageList</div>,
}));

const mockMonitorData = {
  summary: {
    status: "active",
    deviceName: "DESKTOP-HR01",
    totalActiveSeconds: 18000,
    totalIdleSeconds: 1800,
    productivityScore: 88,
    activityRatio: 91,
    clockInTime: "2026-10-26T06:00:00.000Z",
    firstActivityTime: "2026-10-26T06:05:00.000Z",
    checkInMethod: "FINGERPRINT",
    lateStartMinutes: 5,
  },
  employee: {
    firstName: "كريم",
    lastName: "عادل",
    department: { name: "هندسة البرمجيات" },
    position: { title: "مهندس أول" },
  },
  taskPerformance: {
    tasksCompletedCount: 7,
  },
  breaksSummary: {
    totalBreakSeconds: 900,
    totalBreaksCount: 2,
  },
  activities: [{ id: "act-1" }],
  apps: [{ name: "VS Code" }],
  websites: [{ domain: "github.com" }],
};

describe("EmployeeMonitorDetails Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      data: {
        data: mockMonitorData,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders employee monitor header, telemetry cards, and default tasks tab", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/monitor/emp-77"]}>
        <Routes>
          <Route path="/hr/monitor/:employeeId" element={<EmployeeMonitorDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/كريم عادل/)).toBeTruthy();
    });

    expect(screen.getByText("هندسة البرمجيات")).toBeTruthy();
    expect(screen.getByText("متصل ويعمل الآن")).toBeTruthy();
    expect(screen.getByText("88%")).toBeTruthy();
    expect(screen.getByText("بصمة جهاز")).toBeTruthy();
    expect(screen.getByTestId("task-performance-card")).toBeTruthy();
  });

  it("switches between timeline and apps tabs", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/monitor/emp-77"]}>
        <Routes>
          <Route path="/hr/monitor/:employeeId" element={<EmployeeMonitorDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/كريم عادل/)).toBeTruthy();
    });

    fireEvent.click(screen.getByText("المخطط الزمني وفترات الاستراحة"));
    expect(screen.getByTestId("activity-timeline-bar")).toBeTruthy();
    expect(screen.getByTestId("break-details-card")).toBeTruthy();

    fireEvent.click(screen.getByText("البرامج والمواقع المستخدمة"));
    expect(screen.getByTestId("app-usage-list")).toBeTruthy();
    expect(screen.getByTestId("web-usage-list")).toBeTruthy();
  });
});
