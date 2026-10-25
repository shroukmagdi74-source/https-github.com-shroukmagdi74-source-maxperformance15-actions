// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EmployeesPromotion from "../hr/EmployeesPromotion";

const mockGet = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

const samplePromotions = [
  {
    id: "promo-1",
    employeeId: "emp-1",
    fromPositionName: "محاسب",
    toPositionId: "pos-2",
    toPositionName: "مدير مالي",
    fromSalary: 8000,
    toSalary: 12000,
    promotionDate: "2026-10-01T00:00:00.000Z",
    effectiveDate: "2026-11-01T00:00:00.000Z",
    reason: "أداء استثنائي في الإغلاق السنوي",
    status: "PENDING",
    employee: {
      firstName: "خالد",
      lastName: "عمر",
      employeeNumber: "EMP-301",
    },
    toPosition: { id: "pos-2", title: "مدير مالي" },
  },
  {
    id: "promo-2",
    employeeId: "emp-2",
    fromPositionName: "مطور واجهات",
    toPositionId: "pos-3",
    toPositionName: "قائد فريق تقني",
    fromSalary: 14000,
    toSalary: 18500,
    promotionDate: "2026-09-15T00:00:00.000Z",
    effectiveDate: "2026-10-01T00:00:00.000Z",
    reason: "قيادة إطلاق المنصة الجديدة",
    status: "APPROVED",
    employee: {
      firstName: "ريم",
      lastName: "سمير",
      employeeNumber: "EMP-302",
    },
    toPosition: { id: "pos-3", title: "قائد فريق تقني" },
  },
];

describe("EmployeesPromotion (Batch 511)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        promotions: samplePromotions,
      },
    });
  });

  it("renders page header, statistics cards, and promotion list", async () => {
    render(
      <MemoryRouter>
        <EmployeesPromotion />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("ترقيات الموظفين")).toBeDefined();
    });

    expect(screen.getByText("خالد عمر")).toBeDefined();
    expect(screen.getByText("ريم سمير")).toBeDefined();
    expect(screen.getByText("إجمالي الترقيات")).toBeDefined();
  });

  it("filters promotions by search term", async () => {
    render(
      <MemoryRouter>
        <EmployeesPromotion />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("خالد عمر")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(
      "بحث بالاسم، المنصب، أو السبب...",
    );
    fireEvent.change(searchInput, { target: { value: "ريم" } });

    expect(screen.getByText("ريم سمير")).toBeDefined();
    expect(screen.queryByText("خالد عمر")).toBeNull();
  });

  it("approves a pending promotion when approve button is clicked", async () => {
    mockPut.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <EmployeesPromotion />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("اعتماد")).toBeDefined();
    });

    fireEvent.click(screen.getByText("اعتماد"));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/hr/promotions/promo-1", {
        status: "APPROVED",
        rejectionReason: undefined,
      });
    });
  });

  it("renders empty state when no promotions exist", async () => {
    mockGet.mockResolvedValue({ data: { promotions: [] } });

    render(
      <MemoryRouter>
        <EmployeesPromotion />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("لا توجد ترقيات")).toBeDefined();
    });
  });
});
