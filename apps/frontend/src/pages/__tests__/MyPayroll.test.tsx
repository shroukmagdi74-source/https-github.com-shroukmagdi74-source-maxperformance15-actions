// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import MyPayroll from "../hr/MyPayroll";

const mockGet = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

vi.mock("../../contexts/CompanyContext", () => ({
  useCompany: () => ({
    company: { id: "c1", name: "شركة النور" },
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params?.name) return `${key}:${params.name}`;
      return key;
    },
  }),
}));

const samplePayrollData = {
  id: "pay-1",
  month: 10,
  year: 2026,
  baseSalary: 12000,
  netSalary: 11500,
  grossSalary: 13500,
  totalAllowances: 1500,
  totalDeductions: 2000,
  attendanceDeduction: 200,
  latePenalty: 100,
  overtimeHours: 5,
  overtimeAmount: 500,
  bonuses: 1000,
  socialInsurance: 1200,
  taxAmount: 500,
  periodStart: "2026-10-01",
  periodEnd: "2026-10-31",
  status: "PAID",
  allowances: JSON.stringify({ "بدل انتقال": 1000 }),
  deductions: JSON.stringify({ "سلفة": 300 }),
  employee: {
    id: "emp-1",
    firstName: "طارق",
    lastName: "حسن",
    employeeNumber: "EMP-902",
    avatar: "",
    baseSalary: 12000,
    position: { title: "مهندس برمجيات" },
    bankName: "البنك الأهلي المصري",
    bankAccountNumber: "1234567890123456",
  },
};

describe("MyPayroll (Batch 510)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        payroll: samplePayrollData,
      },
    });
  });

  it("renders employee hero card, position badge, and print button", async () => {
    render(<MyPayroll />);

    await waitFor(() => {
      expect(screen.getByText("طارق حسن")).toBeDefined();
    });

    expect(screen.getByText("ID: EMP-902")).toBeDefined();
    expect(screen.getByText("مهندس برمجيات")).toBeDefined();
    expect(screen.getByText("employee.payroll.printStatement")).toBeDefined();
  });

  it("renders allowances, overtime, and deductions breakdown", async () => {
    render(<MyPayroll />);

    await waitFor(() => {
      expect(screen.getByText("بدل انتقال")).toBeDefined();
    });

    expect(screen.getByText("(5H APPROVED)")).toBeDefined();
    expect(screen.getByText("سلفة")).toBeDefined();
  });

  it("renders bank payment details and masked account number", async () => {
    render(<MyPayroll />);

    await waitFor(() => {
      expect(screen.getByText("البنك الأهلي المصري")).toBeDefined();
    });

    expect(screen.getByText("**** **** 3456")).toBeDefined();
  });

  it("shows empty state when no payroll record is returned", async () => {
    mockGet.mockResolvedValue({
      data: { payroll: null },
    });

    render(<MyPayroll />);

    await waitFor(() => {
      expect(screen.getByText("employee.payroll.noData")).toBeDefined();
    });
  });
});
