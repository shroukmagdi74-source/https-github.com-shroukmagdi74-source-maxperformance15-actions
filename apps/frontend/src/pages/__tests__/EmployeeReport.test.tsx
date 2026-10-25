// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import EmployeeReport from "../hr/reports/EmployeeReport";
import {
  getStatusLabel,
  getAttendanceRate,
  buildEmployeeReportCsv,
} from "../hr/reports/employee-report/helpers";

const { mockGet, mockToastError } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("../../../services/api", () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock("../../services/api", () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

const sampleReport = {
  employee: {
    id: "emp-1",
    name: "أحمد علي",
    employeeNumber: "EMP-101",
    department: "تطوير البرمجيات",
    position: "مهندس أول",
  },
  attendance: {
    totalDays: 20,
    presentDays: 18,
    absentDays: 1,
    lateDays: 1,
    totalLateMinutes: 15,
    totalWorkHours: 144,
    overtimeHours: 6,
    records: [
      {
        date: "2026-10-01T00:00:00.000Z",
        checkIn: "2026-10-01T06:00:00.000Z",
        checkOut: "2026-10-01T14:00:00.000Z",
        status: "PRESENT",
        workHours: 8,
        lateMinutes: 0,
      },
    ],
  },
  leaves: {
    totalRequests: 2,
    approved: 1,
    pending: 1,
    rejected: 0,
    totalDaysTaken: 2,
    requests: [
      {
        id: "l-1",
        type: "إجازة سنوية",
        startDate: "2026-10-10",
        endDate: "2026-10-11",
        days: 2,
        status: "APPROVED",
        reason: "ظروف عائلية",
      },
    ],
  },
  advances: {
    totalRequests: 1,
    totalAmount: 1500,
    pending: 0,
    approved: 1,
    requests: [
      {
        id: "adv-1",
        amount: 1500,
        requestDate: "2026-10-05",
        status: "APPROVED",
        reason: "سلفة طارئة",
      },
    ],
  },
  permissions: {
    totalRequests: 1,
    approved: 1,
    totalHours: 2,
    requests: [
      {
        id: "perm-1",
        date: "2026-10-12",
        startTime: "10:00",
        endTime: "12:00",
        totalHours: 2,
        status: "APPROVED",
        reason: "موعد طبي",
      },
    ],
  },
  payroll: {
    baseSalary: 12000,
    allowances: 2000,
    deductions: 500,
    overtimePay: 750,
    netSalary: 14250,
    lastPayment: "2026-09-30",
    manualDeductions: [],
  },
  performance: {
    lastReview: {
      date: "2026-09-15",
      score: 4.6,
      reviewer: "مدير القسم",
    },
    activeGoals: 3,
    completedGoals: 5,
  },
  warnings: {
    total: 1,
    recent: [
      {
        id: "w-1",
        type: "تنبيه تأخير",
        date: "2026-10-03",
        description: "تأخير عن موعد الحضور الرسمي",
      },
    ],
  },
};

describe("EmployeeReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/hr/employees")) {
        return Promise.resolve({
          data: {
            employees: [
              {
                id: "emp-1",
                firstName: "أحمد",
                lastName: "علي",
                employeeNumber: "EMP-101",
              },
            ],
          },
        });
      }
      if (url.includes("/hr/reports/employee")) {
        return Promise.resolve({
          data: {
            success: true,
            report: sampleReport,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders initial empty state and filter controls", async () => {
    render(<EmployeeReport />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/hr/employees");
    });

    expect(screen.getByText("جاهز لعرض التقرير")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /عرض/i })).toBeInTheDocument();
  });

  it("shows validation error when clicking view without selecting an employee", async () => {
    render(<EmployeeReport />);

    const viewBtn = screen.getByRole("button", { name: /عرض/i });
    fireEvent.click(viewBtn);

    expect(mockToastError).toHaveBeenCalledWith("EmployeeReport.msg_57a7");
  });

  it("computes attendance rate, status labels, and CSV content via helpers", () => {
    expect(getStatusLabel("PRESENT")).toBe("حاضر");
    expect(getStatusLabel("ON_LEAVE")).toBe("إجازة");
    expect(getAttendanceRate(sampleReport as any)).toBe("90.0");

    const csv = buildEmployeeReportCsv(sampleReport as any);
    expect(csv).toContain("التاريخ,الحالة,وقت الدخول,وقت الخروج");
    expect(csv).toContain("حاضر");
    expect(csv).toContain("8.00");
  });
});
