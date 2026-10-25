/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Advances from "../hr/Advances";
import api from "../../services/api";

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
  },
}));

const mockAdvanceRequests = [
  {
    id: "adv-1",
    amount: 5000,
    reason: "ظروف عائلية طارئة",
    requestDate: "2026-03-01T10:00:00Z",
    createdAt: "2026-03-01T10:00:00Z",
    status: "PENDING",
    repaymentType: "INSTALLMENTS",
    installmentsCount: 5,
    monthlyAmount: 1000,
    approvedAt: null,
    remainingBalance: 5000,
    isPaidOff: false,
    employee: {
      id: "emp-101",
      firstName: "كريم",
      lastName: "محمود",
      employeeNumber: "EMP101",
      avatar: "",
      department: { name: "تطوير البرمجيات" },
      position: { title: "مهندس برمجيات أول" },
    },
    installments: [
      {
        id: "inst-1",
        amount: 1000,
        dueDate: "2026-04-01T00:00:00Z",
        status: "PENDING",
        paidAt: null,
      },
    ],
  },
  {
    id: "adv-2",
    amount: 3000,
    reason: "مصاريف علاجية",
    requestDate: "2026-02-15T09:30:00Z",
    createdAt: "2026-02-15T09:30:00Z",
    status: "APPROVED",
    repaymentType: "ONE_TIME",
    installmentsCount: 1,
    monthlyAmount: 3000,
    approvedAt: "2026-02-16T12:00:00Z",
    remainingBalance: 0,
    isPaidOff: true,
    employee: {
      id: "emp-102",
      firstName: "سارة",
      lastName: "أحمد",
      employeeNumber: "EMP102",
      avatar: "",
      department: { name: "التسويق" },
      position: { title: "أخصائية تسويق" },
    },
    installments: [
      {
        id: "inst-2",
        amount: 3000,
        dueDate: "2026-03-01T00:00:00Z",
        status: "PAID",
        paidAt: "2026-03-01T00:00:00Z",
      },
    ],
  },
];

describe("Advances Page Component (Batch 500)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/advances")) {
        return Promise.resolve({
          data: {
            data: mockAdvanceRequests,
            pagination: {
              page: 1,
              limit: 20,
              total: 2,
              totalPages: 1,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header and summary stat cards", async () => {
    render(
      <MemoryRouter>
        <Advances />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إدارة السلف")).toBeTruthy();
      expect(screen.getByText("متابعة طلبات السلف والأقساط")).toBeTruthy();
    });

    expect(screen.getByText("إجمالي الطلبات")).toBeTruthy();
    expect(screen.getAllByText("بانتظار الموافقة").length).toBeGreaterThan(0);
    expect(screen.getAllByText("معتمد").length).toBeGreaterThan(0);
    expect(screen.getByText("إجمالي المبالغ")).toBeTruthy();
    expect(screen.getByText("طلب سلفة جديد")).toBeTruthy();
  });

  it("renders filters card with search and status options", async () => {
    render(
      <MemoryRouter>
        <Advances />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("بحث باسم الموظف...")).toBeTruthy();
    });

    expect(screen.getByText("الكل")).toBeTruthy();
    expect(screen.getByText("كل حالات السداد")).toBeTruthy();
    expect(screen.getByText("تصفية سريعة")).toBeTruthy();
  });

  it("renders table rows with employees and advance details", async () => {
    render(
      <MemoryRouter>
        <Advances />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("كريم محمود")).toBeTruthy();
      expect(screen.getByText("سارة أحمد")).toBeTruthy();
    });

    expect(screen.getByText("مهندس برمجيات أول")).toBeTruthy();
    expect(screen.getByText("أخصائية تسويق")).toBeTruthy();
    expect(screen.getByText("5 أقساط")).toBeTruthy();
    expect(screen.getByText("دفعة واحدة")).toBeTruthy();
  });

  it("opens advance details dialog when clicking details button", async () => {
    render(
      <MemoryRouter>
        <Advances />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByTitle("التفاصيل").length).toBe(2);
    });

    fireEvent.click(screen.getAllByTitle("التفاصيل")[0]);

    await waitFor(() => {
      expect(screen.getByText("تفاصيل الطلب وجدول الأقساط")).toBeTruthy();
      expect(screen.getByText("ظروف عائلية طارئة")).toBeTruthy();
    });
  });
});
