// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import PayrollSimulator from "../hr/components/PayrollSimulator";
import {
  SCENARIOS,
  createInitialSimulationState,
} from "../hr/components/payroll-simulator/helpers";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("../../../services/api", () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

vi.mock("../../services/api", () => ({
  default: {
    get: mockGet,
    post: mockPost,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("PayrollSimulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        employees: [
          {
            id: "emp-1",
            firstName: "كريم",
            lastName: "حسن",
            employeeNumber: "EMP-201",
            avatar: "",
            baseSalary: 15000,
            department: { name: "المالية" },
            position: { title: "محاسب أول" },
          },
        ],
      },
    });
    mockPost.mockResolvedValue({
      data: {
        payroll: {
          baseSalary: 15000,
          totalAllowances: 500,
          overtimeAmount: 0,
          overtimeHours: 0,
          bonuses: 0,
          grossSalary: 15500,
          absentDays: 0,
          attendanceDeduction: 0,
          latePenalty: 0,
          socialInsurance: 1200,
          taxAmount: 800,
          totalDeductions: 2000,
          netSalary: 13500,
          workingDays: 22,
        },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders employee selection sidebar and empty workspace initially", async () => {
    render(<PayrollSimulator />);

    await waitFor(() => {
      expect(screen.getByText("كريم حسن")).toBeInTheDocument();
    });

    expect(screen.getByText("اختيار موظف للتجربة")).toBeInTheDocument();
    expect(screen.getByText("ابدأ تجربة الحسابات الآن")).toBeInTheDocument();
  });

  it("loads simulation controls and runs calculation when an employee is selected", async () => {
    render(<PayrollSimulator />);

    await waitFor(() => {
      expect(screen.getByText("كريم حسن")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("كريم حسن"));

    expect(screen.getByText(/محاكاة راتب: كريم/i)).toBeInTheDocument();
    expect(screen.getByText("حالة طبيعية")).toBeInTheDocument();

    const calcBtn = screen.getByRole("button", { name: /بدء الحساب/i });
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/hr/payroll/calculate/emp-1",
        expect.any(Object)
      );
    });

    expect(screen.getByText("صافي المبلغ المستحق")).toBeInTheDocument();
  });

  it("initializes simulation state and scenarios via helpers", () => {
    const initial = createInitialSimulationState(10000);
    expect(initial.baseSalary).toBe(10000);
    expect(initial.attendance).toHaveLength(22);

    const bonusScenario = SCENARIOS.find((s) => s.id === "overtime_bonus");
    const applied = bonusScenario!.apply(10000);
    expect(applied.allowances["بدل طبيعة عمل"]).toBe(500);
    expect(applied.manualDeductions).toHaveLength(1);
  });
});
