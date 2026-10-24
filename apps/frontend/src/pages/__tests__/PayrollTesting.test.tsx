/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PayrollTesting from "../hr/PayrollTesting";

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "أحمد",
    lastName: "محمود",
    employeeNumber: "101",
    avatar: "https://example.com/avatar1.png",
    baseSalary: 12000,
    department: { id: "dep-1", name: "تقنية المعلومات" },
    position: { id: "pos-1", title: "مطور برمجيات" },
    email: "ahmed@example.com",
    phone: "01011112222",
    isActive: true,
  },
  {
    id: "emp-2",
    firstName: "سارة",
    lastName: "علي",
    employeeNumber: "102",
    avatar: "https://example.com/avatar2.png",
    baseSalary: 15000,
    department: { id: "dep-2", name: "التسويق" },
    position: { id: "pos-2", title: "أخصائي تسويق" },
    email: "sara@example.com",
    phone: "01033334444",
    isActive: true,
  },
];

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes("/hr/employees")) {
        return Promise.resolve({
          data: {
            employees: mockEmployees,
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PayrollTesting Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page title and empty state initially", async () => {
    render(
      <MemoryRouter>
        <PayrollTesting />
      </MemoryRouter>
    );

    expect(screen.getByText("وحدة اختبار الرواتب الشاملة")).toBeTruthy();
    expect(screen.getByText("ابدأ اختبار الرواتب الآن")).toBeTruthy();
    expect(screen.getByText("اختيار موظف للاختبار")).toBeTruthy();
  });

  it("loads and lists employees in the sidebar", async () => {
    render(
      <MemoryRouter>
        <PayrollTesting />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    expect(screen.getByText("سارة علي")).toBeTruthy();
    expect(screen.getByText(/#101 • تقنية المعلومات/)).toBeTruthy();
  });

  it("selects an employee and displays tabs with employee details", async () => {
    render(
      <MemoryRouter>
        <PayrollTesting />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    const empButton = screen.getByText("أحمد محمود");
    fireEvent.click(empButton);

    await waitFor(() => {
      expect(screen.getByText(/اختبار راتب: أحمد محمود/)).toBeTruthy();
    });

    expect(screen.getByText("بيانات الموظف")).toBeTruthy();
    expect(screen.getByText("الخصومات")).toBeTruthy();
    expect(screen.getByText("الحضور والإجازات")).toBeTruthy();
    expect(screen.getByText("سيناريوهات جاهزة")).toBeTruthy();
  });

  it("allows switching tabs between employee and deductions", async () => {
    render(
      <MemoryRouter>
        <PayrollTesting />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("أحمد محمود"));

    await waitFor(() => {
      expect(screen.getByText("الخصومات")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("الخصومات"));

    await waitFor(() => {
      expect(screen.getByText("الخصومات والجزاءات")).toBeTruthy();
    });

    expect(screen.getByText("نماذج خصومات شائعة")).toBeTruthy();
  });

  it("allows applying a preset scenario", async () => {
    render(
      <MemoryRouter>
        <PayrollTesting />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("أحمد محمود"));

    await waitFor(() => {
      expect(screen.getByText("سيناريوهات جاهزة")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("سيناريوهات جاهزة"));

    await waitFor(() => {
      expect(screen.getByText("حالة طبيعية")).toBeTruthy();
    });

    expect(screen.getByText("تأخير وغيابات")).toBeTruthy();
    expect(screen.getByText("إضافي ومكافآت")).toBeTruthy();

    const applyBtns = screen.getAllByText("تطبيق هذا السيناريو");
    expect(applyBtns.length).toBeGreaterThan(0);
    fireEvent.click(applyBtns[0]);
  });

  it("calculates payroll and shows results in sidebar", async () => {
    render(
      <MemoryRouter>
        <PayrollTesting />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("أحمد محمود"));

    await waitFor(() => {
      expect(screen.getByText("لم يتم حساب الراتب بعد")).toBeTruthy();
    });

    const calcBtn = screen.getByText("حساب الراتب الآن");
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(screen.getAllByText("الراتب الأساسي").length).toBeGreaterThan(0);
      expect(screen.getByText("صافي الراتب")).toBeTruthy();
    });
  });
});
