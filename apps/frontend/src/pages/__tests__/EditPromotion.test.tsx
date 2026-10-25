// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditPromotion from "../hr/EditPromotion";

const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    put: (...args: any[]) => mockPut(...args),
  },
}));

const sampleEmployees = [
  {
    id: "emp-1",
    firstName: "محمود",
    lastName: "سعيد",
    employeeNumber: "EMP-101",
    baseSalary: 10000,
    position: { id: "pos-1", title: "محاسب" },
  },
];

const samplePromotion = {
  id: "promo-1",
  userId: "emp-1",
  fromPositionId: "pos-1",
  fromPositionName: "محاسب",
  toPositionId: "pos-2",
  toPositionName: "رئيس حسابات",
  fromSalary: 10000,
  toSalary: 14000,
  promotionDate: "2026-10-01T00:00:00.000Z",
  effectiveDate: "2026-11-01T00:00:00.000Z",
  reason: "كفاءة متميزة في إدارة الحسابات",
  notes: "يستحق الترقية",
  status: "APPROVED",
};

describe("EditPromotion (Batch 509)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/hr/employees") {
        return Promise.resolve({ data: { employees: sampleEmployees } });
      }
      if (url === "/hr/promotions/promo-1") {
        return Promise.resolve({ data: { promotion: samplePromotion } });
      }
      if (url === "/hr/positions") {
        return Promise.resolve({ data: { positions: [] } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/hr/promotions/promo-1/edit"]}>
        <Routes>
          <Route path="/hr/promotions/:id/edit" element={<EditPromotion />} />
        </Routes>
      </MemoryRouter>,
    );

  it("renders edit promotion header, status badge, and employee details", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("تعديل ترقية")).toBeDefined();
    });

    expect(screen.getByText("تمت الموافقة")).toBeDefined();
    expect(screen.getAllByText("محمود سعيد").length).toBeGreaterThan(0);
    expect(screen.getByText("EMP-101")).toBeDefined();
  });

  it("renders salary increase analysis card with calculated difference and percentage", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("تحليل الراتب")).toBeDefined();
    });

    expect(screen.getByText("+4,000")).toBeDefined();
    expect(screen.getByText("40.00%")).toBeDefined();
  });

  it("populates movement fields and reason from fetched promotion", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue("رئيس حسابات")).toBeDefined();
    });

    expect(
      screen.getByDisplayValue("كفاءة متميزة في إدارة الحسابات"),
    ).toBeDefined();
    expect(screen.getByText("حفظ التعديلات")).toBeDefined();
  });

  it("shows not-found fallback when promotion API fails", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/hr/employees") {
        return Promise.resolve({ data: { employees: sampleEmployees } });
      }
      return Promise.reject(new Error("Not found"));
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("الترقية غير موجودة")).toBeDefined();
    });
  });
});
