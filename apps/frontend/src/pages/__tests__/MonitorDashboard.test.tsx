// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MonitorDashboard } from "../hr/monitor/MonitorDashboard";
import {
  formatSeconds,
  getCheckInMethodLabel,
  parseTeamOverviewData,
} from "../hr/monitor/dashboard/helpers";

const { mockGet, mockPost, mockPut, mockUseAuth } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock("../../services/api", () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
  },
  apiClient: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
  },
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../hr/monitor/EmployeeMonitorDetails", () => ({
  default: ({ employeeIdProp }: { employeeIdProp: string }) => (
    <div data-testid="employee-monitor-details">Details for {employeeIdProp}</div>
  ),
}));

describe("MonitorDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: "u-1", role: "OWNER" },
    });
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/employee-monitor/alerts")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "alert-1",
                employeeId: "emp-2",
                employeeName: "سارة خالد",
                type: "LATE_START",
                severity: "warning",
                title: "تأخر بدء النشاط",
                message: "الفارق بين البصمة وأول نشاط تجاوز 20 دقيقة",
                isRead: false,
                timestamp: "2026-10-26T06:30:00.000Z",
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          data: [
            {
              employeeId: "emp-1",
              employee: {
                firstName: "أحمد",
                lastName: "محمود",
                department: { name: "تطوير البرمجيات" },
                position: { title: "مهندس برمجيات" },
              },
              status: "active",
              totalActiveSeconds: 18000,
              totalIdleSeconds: 1200,
              productivityScore: 88,
              topApp: "VS Code",
              completedTasksCount: 6,
              lateStartMinutes: 10,
              clockInTime: "2026-10-26T06:00:00.000Z",
            },
            {
              employeeId: "emp-2",
              employee: {
                firstName: "سارة",
                lastName: "خالد",
                department: { name: "المبيعات" },
                position: { title: "تنفيذي مبيعات" },
              },
              status: "offline",
              totalActiveSeconds: 7200,
              totalIdleSeconds: 600,
              productivityScore: 72,
              topApp: "Google Chrome",
              completedTasksCount: 3,
              lateStartMinutes: 25,
            },
          ],
        },
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders unauthorized shield when user is not manager or HR", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u-2", role: "AGENT" },
    });
    render(<MonitorDashboard />);
    expect(screen.getByText("غير مصرح بالوصول")).toBeInTheDocument();
  });

  it("renders team activity table, KPI cards, and alerts for OWNER", async () => {
    render(<MonitorDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText("أحمد محمود").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("سارة خالد").length).toBeGreaterThan(0);
    expect(
      screen.getByText("الفارق بين البصمة وأول نشاط تجاوز 20 دقيقة")
    ).toBeInTheDocument();
    expect(screen.getAllByText("VS Code").length).toBeGreaterThan(0);
  });

  it("filters team members by status and search query", async () => {
    render(<MonitorDashboard />);

    await waitFor(() => {
      expect(screen.getAllByText("أحمد محمود").length).toBeGreaterThan(0);
    });

    const offlineFilterBtn = screen.getByRole("button", { name: "غير متصل" });
    fireEvent.click(offlineFilterBtn);

    expect(screen.queryAllByText("أحمد محمود").length).toBe(0);
    expect(screen.getAllByText("سارة خالد").length).toBeGreaterThan(0);
  });

  it("correctly formats seconds and computes team overview stats via helpers", () => {
    expect(formatSeconds(0)).toBe("0 س 0 د");
    expect(formatSeconds(5400)).toBe("1 س 30 د");
    expect(getCheckInMethodLabel("biometric")).toBe("بصمة");
    expect(getCheckInMethodLabel("mobile")).toBe("موبايل");

    const parsed = parseTeamOverviewData([
      {
        employeeId: "1",
        employeeName: "A",
        status: "active",
        totalActiveSeconds: 3600,
        totalIdleSeconds: 600,
        productivityScore: 90,
        topApp: "Cursor",
        completedTasksCount: 4,
        lateStartMinutes: 10,
        clockInTime: "2026-10-26T06:00:00.000Z",
      },
    ]);

    expect(parsed.stats.activeNow).toBe(1);
    expect(parsed.stats.avgProductivity).toBe(90);
    expect(parsed.stats.totalTasksCompleted).toBe(4);
    expect(parsed.stats.avgWarmupMinutes).toBe(10);
  });
});
