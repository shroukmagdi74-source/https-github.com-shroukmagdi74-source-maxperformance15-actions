// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreatePromotion from "../hr/CreatePromotion";
import api from "../../services/api";
import { calculateSalaryIncrease } from "../hr/create-promotion/helpers";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
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
  },
}));

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "أحمد",
    lastName: "حسن",
    employeeNumber: "EMP-101",
    baseSalary: 10000,
    position: { id: "pos-1", title: "مهندس برمجيات" },
  },
];

describe("CreatePromotion (Batch 517)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/employees") {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      if (url === "/hr/positions") {
        return Promise.resolve({
          data: { positions: [{ id: "pos-1", title: "مهندس برمجيات" }] },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders create promotion header, sidebar, and movement details form", async () => {
    render(
      <MemoryRouter>
        <CreatePromotion />
      </MemoryRouter>
    );

    expect(await screen.findByText("ترقية جديدة")).toBeDefined();
    expect(screen.getByText("الموظف المعني")).toBeDefined();
    expect(screen.getByText("تفاصيل الحركة الوظيفية")).toBeDefined();
    expect(screen.getByText("المنصب الحالي")).toBeDefined();
    expect(screen.getByText("المنصب الجديد")).toBeDefined();
  });

  it("displays salary increase analysis when current and new salaries are entered", async () => {
    render(
      <MemoryRouter>
        <CreatePromotion />
      </MemoryRouter>
    );

    await screen.findByText("ترقية جديدة");

    const salaryInputs = screen.getAllByPlaceholderText("0.00");
    fireEvent.change(salaryInputs[0], { target: { value: "10000" } });
    fireEvent.change(salaryInputs[1], { target: { value: "12500" } });

    expect(await screen.findByText("تحليل الراتب")).toBeDefined();
    expect(screen.getByText("+2,500")).toBeDefined();
    expect(screen.getByText("25.00%")).toBeDefined();
  });

  it("shows validation errors when submitting empty required fields", async () => {
    render(
      <MemoryRouter>
        <CreatePromotion />
      </MemoryRouter>
    );

    await screen.findByText("ترقية جديدة");

    fireEvent.click(screen.getByText("حفظ الترقية"));

    await waitFor(() => {
      expect(screen.getByText("يجب اختيار الموظف")).toBeDefined();
      expect(screen.getByText("المنصب الجديد مطلوب")).toBeDefined();
    });
  });

  it("calculates salary increase diff and percentage accurately", () => {
    expect(calculateSalaryIncrease(undefined, 12000)).toBeNull();
    expect(calculateSalaryIncrease(10000, 13000)).toEqual({
      diff: 3000,
      percent: 30,
    });
  });
});
