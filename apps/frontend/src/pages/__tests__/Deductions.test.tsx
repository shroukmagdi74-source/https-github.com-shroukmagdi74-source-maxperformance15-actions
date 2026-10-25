/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import Deductions from "../hr/Deductions";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockDeductions = [
  {
    id: "ded-1",
    employeeId: "emp-1",
    type: "PENALTY",
    category: "مخالفة سلوكية",
    amount: 500,
    reason: "التأخر غير المبرر عن الاجتماع",
    description: "تفاصيل المخالفة",
    date: "2026-10-15T00:00:00.000Z",
    effectiveMonth: 10,
    effectiveYear: 2026,
    status: "PENDING",
    appliedToPayroll: false,
    employee: {
      id: "emp-1",
      firstName: "أحمد",
      lastName: "علي",
      email: "ahmed@example.com",
      employeeNumber: "EMP101",
    },
  },
  {
    id: "ded-2",
    employeeId: "emp-2",
    type: "DAMAGE",
    category: "تلف عهدة",
    amount: 1200,
    reason: "كسر شاشة الجهاز",
    description: "تقرير الصيانة",
    date: "2026-10-18T00:00:00.000Z",
    effectiveMonth: 10,
    effectiveYear: 2026,
    status: "APPROVED",
    appliedToPayroll: true,
    employee: {
      id: "emp-2",
      firstName: "منى",
      lastName: "حسن",
      email: "mona@example.com",
      employeeNumber: "EMP102",
    },
  },
];

const mockStats = {
  total: 2,
  totalAmount: "1700",
  byStatus: [
    { status: "PENDING", _count: 1 },
    { status: "APPROVED", _count: 1 },
  ],
};

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "أحمد",
    lastName: "علي",
    employeeNumber: "EMP101",
  },
  {
    id: "emp-2",
    firstName: "منى",
    lastName: "حسن",
    employeeNumber: "EMP102",
  },
];

describe("Deductions Page Component (Batch 492)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/deductions") {
        return Promise.resolve({
          data: {
            success: true,
            deductions: mockDeductions,
          },
        });
      }
      if (url === "/hr/deductions/stats") {
        return Promise.resolve({
          data: {
            success: true,
            stats: mockStats,
          },
        });
      }
      if (url === "/hr/employees") {
        return Promise.resolve({
          data: {
            success: true,
            employees: mockEmployees,
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and action button", async () => {
    render(<Deductions />);

    await waitFor(() => {
      expect(screen.getByText("إدارة الخصومات")).toBeTruthy();
      expect(screen.getByText("إدارة الخصومات اليدوية للموظفين")).toBeTruthy();
      expect(screen.getByText("إضافة خصم جديد")).toBeTruthy();
    });
  });

  it("renders stats cards correctly", async () => {
    render(<Deductions />);

    await waitFor(() => {
      expect(screen.getByText("إجمالي الخصومات")).toBeTruthy();
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
      expect(screen.getAllByText("في الانتظار").length).toBeGreaterThan(0);
      expect(screen.getAllByText("موافق عليها").length).toBeGreaterThan(0);
    });
  });

  it("renders deductions list in table", async () => {
    render(<Deductions />);

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeTruthy();
      expect(screen.getByText("EMP101")).toBeTruthy();
      expect(screen.getAllByText("غرامة").length).toBeGreaterThan(0);
      expect(screen.getByText("التأخر غير المبرر عن الاجتماع")).toBeTruthy();
      expect(screen.getByText("منى حسن")).toBeTruthy();
      expect(screen.getByText("EMP102")).toBeTruthy();
      expect(screen.getAllByText("تعويض عن ضرر").length).toBeGreaterThan(0);
      expect(screen.getByText("كسر شاشة الجهاز")).toBeTruthy();
    });
  });

  it("opens create deduction modal when clicking add button", async () => {
    render(<Deductions />);

    await waitFor(() => {
      expect(screen.getByText("إضافة خصم جديد")).toBeTruthy();
    });

    const addBtn = screen.getByText("إضافة خصم جديد");
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText("الموظف *")).toBeTruthy();
      expect(screen.getByText("النوع *")).toBeTruthy();
      expect(screen.getByText("المبلغ *")).toBeTruthy();
    });
  });

  it("opens details modal when clicking view details", async () => {
    render(<Deductions />);

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeTruthy();
    });

    const viewButtons = screen.getAllByTitle("عرض التفاصيل");
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تفاصيل الخصم")).toBeTruthy();
      expect(screen.getByText("مخالفة سلوكية")).toBeTruthy();
    });
  });
});
