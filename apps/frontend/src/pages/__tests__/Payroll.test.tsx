/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Payroll from "../hr/Payroll";

const mockPayrolls = [
  {
    id: "pay-1",
    month: 10,
    year: 2026,
    baseSalary: 12000,
    fullMonthBaseSalary: 12000,
    totalAllowances: 1500,
    totalDeductions: 800,
    overtimeAmount: 500,
    overtimeHours: 5,
    bonuses: 1000,
    socialInsurance: 600,
    taxAmount: 400,
    grossSalary: 14500,
    netSalary: 12700,
    attendanceDeduction: 300,
    absentDays: 1,
    latePenalty: 100,
    actualWorkDays: 29,
    workingDays: 30,
    status: "PROCESSED",
    paidAt: null,
    allowances: JSON.stringify({ "بدل سكن": 1000, "بدل انتقال": 500 }),
    deductions: JSON.stringify({ "غياب": 300, "تأخيرات": 100, "سلف": 400 }),
    employee: {
      id: "emp-1",
      firstName: "أحمد",
      lastName: "محمود",
      employeeNumber: "101",
      avatar: "https://example.com/avatar1.png",
      department: { name: "تقنية المعلومات" },
      position: { title: "مطور برمجيات" },
      bankName: "البنك الأهلي",
      bankAccountNumber: "123456789",
      bankIban: "EG123456789012345678901234567",
    },
  },
  {
    id: "pay-2",
    month: 10,
    year: 2026,
    baseSalary: 15000,
    fullMonthBaseSalary: 15000,
    totalAllowances: 2000,
    totalDeductions: 500,
    overtimeAmount: 0,
    bonuses: 500,
    socialInsurance: 700,
    taxAmount: 500,
    grossSalary: 17500,
    netSalary: 15800,
    attendanceDeduction: 0,
    absentDays: 0,
    latePenalty: 0,
    actualWorkDays: 30,
    workingDays: 30,
    status: "DRAFT",
    paidAt: null,
    allowances: JSON.stringify({ "بدل وجبة": 2000 }),
    deductions: JSON.stringify({ "تأمينات": 500 }),
    employee: {
      id: "emp-2",
      firstName: "سارة",
      lastName: "علي",
      employeeNumber: "102",
      avatar: "https://example.com/avatar2.png",
      department: { name: "التسويق" },
      position: { title: "أخصائي تسويق" },
      bankName: "بنك مصر",
      bankAccountNumber: "987654321",
      bankIban: "EG987654321098765432109876543",
    },
  },
];

const mockSummary = {
  month: 10,
  year: 2026,
  totalEmployees: 2,
  totalBaseSalary: 27000,
  totalAllowances: 3500,
  totalDeductions: 1300,
  totalOvertime: 500,
  totalBonuses: 1500,
  totalGross: 32000,
  totalNet: 28500,
  byStatus: {
    PROCESSED: 1,
    DRAFT: 1,
  },
};

const mockAutoStatus = {
  success: true,
  autoDeductionEnabled: true,
  payrollDay: 28,
  absencePenaltyRate: 1.5,
  workingHoursPerDay: 8,
  stats: {
    attendanceCount: 60,
    draftCount: 2,
  },
};

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes("/hr/payroll/auto-status")) {
        return Promise.resolve({ data: mockAutoStatus });
      }
      if (url.includes("/hr/payroll/summary")) {
        return Promise.resolve({ data: { summary: mockSummary } });
      }
      if (url.includes("/hr/payroll")) {
        return Promise.resolve({
          data: {
            payrolls: mockPayrolls,
            pagination: {
              total: 2,
              page: 1,
              limit: 20,
              totalPages: 1,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true, result: { updated: 1, success: ["1"] } } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

vi.mock("../../contexts/CompanyContext", () => ({
  useCompany: () => ({ company: { name: "ماكس بي للتجارة" } }),
}));

vi.mock("../hr/components/PayrollSimulator", () => ({
  default: () => <div data-testid="payroll-simulator">محاكي الرواتب الشامل</div>,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Payroll Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and action buttons", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    expect(screen.getByText("إدارة الرواتب")).toBeTruthy();
    expect(screen.getByText("ملف الصرف")).toBeTruthy();
    expect(screen.getByText("محاكي الرواتب")).toBeTruthy();
    expect(screen.getByText("إعداد الرواتب")).toBeTruthy();
    expect(screen.getByText("أتمتة وحساب الرواتب والخصومات")).toBeTruthy();
  });

  it("renders automation telemetry bar and KPI summary cards", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("نظام الأتمتة:")).toBeTruthy();
      expect(screen.getByText("مفعّل تلقائياً")).toBeTruthy();
      expect(screen.getByText("يوم 28")).toBeTruthy();
      expect(screen.getByText("عدد الموظفين")).toBeTruthy();
      expect(screen.getByText("إجمالي الرواتب")).toBeTruthy();
      expect(screen.getByText("صافي الرواتب")).toBeTruthy();
      expect(screen.getAllByText("الخصومات").length).toBeGreaterThan(0);
    });
  });

  it("renders payrolls list in the table", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
      expect(screen.getByText("سارة علي")).toBeTruthy();
      expect(screen.getByText("مطور برمجيات")).toBeTruthy();
      expect(screen.getByText("أخصائي تسويق")).toBeTruthy();
    });
  });

  it("opens payroll details dialog when clicking view details", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    const moreButtons = screen.getAllByRole("button", { name: "" });
    expect(moreButtons.length).toBeGreaterThan(0);
    fireEvent.click(moreButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("عرض التفاصيل")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("عرض التفاصيل"));

    await waitFor(() => {
      expect(screen.getByText("تفاصيل كشف الراتب")).toBeTruthy();
      expect(screen.getByText("سجل الحضور وساعات العمل والخصومات الآلية")).toBeTruthy();
      expect(screen.getByText("صافي الراتب المستلم")).toBeTruthy();
    });
  });

  it("opens edit modal when clicking edit option", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    const moreButtons = screen.getAllByRole("button", { name: "" });
    fireEvent.click(moreButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تعديل")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("تعديل"));

    await waitFor(() => {
      expect(screen.getByText("تعديل كشف الراتب")).toBeTruthy();
      expect(screen.getByText("تفاصيل البدلات")).toBeTruthy();
      expect(screen.getByText("تفاصيل الخصومات")).toBeTruthy();
      expect(screen.getByText("صافي الراتب المتوقع")).toBeTruthy();
    });
  });

  it("opens payment modal when clicking pay option", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    const moreButtons = screen.getAllByRole("button", { name: "" });
    fireEvent.click(moreButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("صرف")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("صرف"));

    await waitFor(() => {
      expect(screen.getByText("بيانات الدفع")).toBeTruthy();
      expect(screen.getByText("تحويل بنكي")).toBeTruthy();
      expect(screen.getByText("نقدي / كاش")).toBeTruthy();
      expect(screen.getByText("محفظة")).toBeTruthy();
    });
  });

  it("switches to simulator view when clicking simulator button", async () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    );

    const simButton = screen.getByText("محاكي الرواتب");
    fireEvent.click(simButton);

    await waitFor(() => {
      expect(screen.getByTestId("payroll-simulator")).toBeTruthy();
      expect(screen.getByText("عرض الكشوف")).toBeTruthy();
    });
  });
});
