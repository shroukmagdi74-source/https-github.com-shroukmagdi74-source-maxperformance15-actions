// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateEditReward from "../hr/rewards/CreateEditReward";
import {
  validateRewardForm,
  getCategoryLabel,
  getMethodLabel,
} from "../hr/rewards/create-edit/helpers";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
  },
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
  },
}));

describe("CreateEditReward Helpers", () => {
  it("maps category and method labels and validates required fields", () => {
    expect(getCategoryLabel("EMPLOYEE_OF_MONTH")).toBe("موظف الشهر");
    expect(getMethodLabel("FIXED_AMOUNT")).toBe("مبلغ ثابت");

    const errors = validateRewardForm({
      userId: "",
      rewardTypeId: "",
      calculatedValue: "0",
      periodStart: "2026-05-10",
      periodEnd: "2026-05-01",
      appliedMonth: "5",
      appliedYear: "2026",
      reason: "",
      rewardName: "",
      rewardCategory: "OTHER",
    });

    expect(errors.userId).toBe("يجب اختيار الموظف");
    expect(errors.rewardTypeId).toBe("يجب اختيار نوع المكافأة");
    expect(errors.calculatedValue).toBe("يجب إدخال قيمة صحيحة للمكافأة");
    expect(errors.periodEnd).toBe(
      "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    );
  });
});

describe("CreateEditReward Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/hr/employees") {
        return Promise.resolve({
          data: {
            success: true,
            employees: [
              {
                id: "emp-1",
                firstName: "سارة",
                lastName: "محمود",
                employeeNumber: "EMP-205",
                departmentRelation: { name: "المبيعات" },
              },
            ],
          },
        });
      }
      if (url === "/hr/rewards/types") {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "rt-1",
                name: "Employee of Month",
                nameAr: "موظف الشهر",
                category: "EMPLOYEE_OF_MONTH",
                calculationMethod: "FIXED_AMOUNT",
                value: 1500,
                eligibilityConditions: {
                  minTargetProgress: 90,
                  maxAbsenceCount: 0,
                },
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  it("renders employee and reward type options and displays selected reward type summary", async () => {
    render(
      <MemoryRouter>
        <CreateEditReward />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/سارة محمود - EMP-205/)).toBeTruthy();
    });

    expect(screen.getByText(/موظف الشهر \(موظف الشهر\)/)).toBeTruthy();

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "rt-1" } });

    await waitFor(() => {
      expect(screen.getByText("نوع المكافأة المختارة")).toBeTruthy();
    });
    expect(screen.getByText("1,500")).toBeTruthy();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(
      <MemoryRouter>
        <CreateEditReward />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("إضافة المكافأة")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("إضافة المكافأة"));

    expect(screen.getByText("يجب اختيار الموظف")).toBeTruthy();
    expect(screen.getByText("يجب اختيار نوع المكافأة")).toBeTruthy();
  });
});
