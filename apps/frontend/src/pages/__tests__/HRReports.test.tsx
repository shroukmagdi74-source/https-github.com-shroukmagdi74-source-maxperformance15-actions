/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import HRReports from "../hr/HRReports";
import api from "../../services/api";

// Mock Recharts to avoid DOM measuring errors in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockAttendanceReport = {
  totalEmployees: 40,
  presentDays: 800,
  absentDays: 20,
  lateDays: 30,
  averageWorkHours: 8,
  attendanceRate: 95,
  byDepartment: [
    { department: "المبيعات", rate: 96, employees: 10 },
    { department: "التقنية", rate: 94, employees: 15 },
  ],
};

const mockLeaveReport = {
  totalRequests: 25,
  approved: 20,
  rejected: 3,
  pending: 2,
  totalDaysTaken: 60,
  byType: [
    { type: "سنوية", count: 15, days: 45 },
    { type: "مرضية", count: 10, days: 15 },
  ],
};

const mockPayrollReport = {
  totalPayroll: 350000,
  totalBaseSalary: 300000,
  totalAllowances: 40000,
  totalDeductions: 10000,
  totalOvertime: 20000,
  averageSalary: 14000,
  byDepartment: [
    { department: "المبيعات", total: 150000, employees: 10 },
    { department: "التقنية", total: 200000, employees: 15 },
  ],
};

describe("HRReports Page Component (Batch 491)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/reports/attendance")) {
        return Promise.resolve({
          data: { report: mockAttendanceReport },
        });
      }
      if (url.startsWith("/hr/reports/leaves")) {
        return Promise.resolve({
          data: { report: mockLeaveReport },
        });
      }
      if (url.startsWith("/hr/reports/payroll")) {
        return Promise.resolve({
          data: { report: mockPayrollReport },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header, title, and action buttons properly", async () => {
    render(<HRReports />);

    expect(screen.getByText("تقارير الموارد البشرية")).toBeTruthy();
    expect(screen.getByText("تحديث")).toBeTruthy();
    expect(screen.getByText("تصدير")).toBeTruthy();
  });

  it("renders all 11 report tab buttons in tabs list", async () => {
    render(<HRReports />);

    expect(screen.getByText("الحضور")).toBeTruthy();
    expect(screen.getByText("الإجازات")).toBeTruthy();
    expect(screen.getByText("الرواتب")).toBeTruthy();
    expect(screen.getByText("الإنذارات")).toBeTruthy();
    expect(screen.getByText("التدريب")).toBeTruthy();
    expect(screen.getByText("الأداء")).toBeTruthy();
    expect(screen.getByText("المؤشرات")).toBeTruthy();
    expect(screen.getByText("التأخير والغياب")).toBeTruthy();
    expect(screen.getByText("العمل الإضافي")).toBeTruthy();
    expect(screen.getByText("معدل الدوران")).toBeTruthy();
    expect(screen.getByText("تقارير الموظفين")).toBeTruthy();
  });

  it("fetches and displays attendance report summary cards", async () => {
    render(<HRReports />);

    await waitFor(() => {
      expect(screen.getByText("معدل الانضباط")).toBeTruthy();
      expect(screen.getByText("95%")).toBeTruthy();
      expect(screen.getByText("800")).toBeTruthy();
      expect(screen.getByText("20")).toBeTruthy();
    });
  });

  it("switches to leaves tab and displays leave report data", async () => {
    render(<HRReports />);

    const leavesTab = screen.getByText("الإجازات");
    fireEvent.click(leavesTab);

    await waitFor(() => {
      expect(screen.getByText("طلبات الإجازة")).toBeTruthy();
      expect(screen.getByText("25")).toBeTruthy();
      expect(screen.getByText("الأيام المستهلكة")).toBeTruthy();
      expect(screen.getByText("60")).toBeTruthy();
    });
  });

  it("switches to payroll tab and displays payroll report data", async () => {
    render(<HRReports />);

    const payrollTab = screen.getByText("الرواتب");
    fireEvent.click(payrollTab);

    await waitFor(() => {
      expect(screen.getByText("إجمالي الرواتب الصافية")).toBeTruthy();
      expect(screen.getByText("الرواتب الأساسية")).toBeTruthy();
      expect(screen.getByText("إجمالي البدلات")).toBeTruthy();
      expect(screen.getByText("إجمالي الخصومات")).toBeTruthy();
    });
  });
});
