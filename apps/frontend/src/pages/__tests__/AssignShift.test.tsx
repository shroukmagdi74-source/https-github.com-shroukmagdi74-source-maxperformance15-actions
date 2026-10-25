/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AssignShift from "../hr/AssignShift";
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

const mockShift = {
  id: "shift-123",
  name: "المناوبة الصباحية الأولى",
  startTime: "08:00",
  endTime: "16:00",
  color: "#3B82F6",
  assignments: [],
};

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "محمد",
    lastName: "رمضان",
    employeeNumber: "EMP001",
    isActive: true,
    department: { id: "dept-1", name: "العمليات" },
    position: { id: "pos-1", title: "مشرف وردية" },
  },
  {
    id: "emp-2",
    firstName: "نادية",
    lastName: "حسين",
    employeeNumber: "EMP002",
    isActive: true,
    department: { id: "dept-2", name: "خدمة العملاء" },
    position: { id: "pos-2", title: "أخصائي دعم" },
  },
];

describe("AssignShift Component (Batch 507)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/shifts/shift-123")) {
        return Promise.resolve({
          data: {
            shift: mockShift,
          },
        });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({
          data: {
            employees: mockEmployees,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and date range toggle", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/shifts/shift-123/assign"]}>
        <Routes>
          <Route path="/hr/shifts/:id/assign" element={<AssignShift />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تعيين مناوبة")).toBeTruthy();
      expect(
        screen.getByText("اختر موظف أو عدة موظفين لتعيينهم في المناوبة")
      ).toBeTruthy();
      expect(screen.getByText("نطاق تاريخ")).toBeTruthy();
    });
  });

  it("renders shift details card with start and end times", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/shifts/shift-123/assign"]}>
        <Routes>
          <Route path="/hr/shifts/:id/assign" element={<AssignShift />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("المناوبة الصباحية الأولى")).toBeTruthy();
      expect(screen.getByText("08:00")).toBeTruthy();
      expect(screen.getByText("16:00")).toBeTruthy();
      expect(
        screen.getByText("سيتم تسجيل هذا التعيين في ملف الموظف")
      ).toBeTruthy();
    });
  });

  it("renders employee list and allows toggling selection to show summary card", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/shifts/shift-123/assign"]}>
        <Routes>
          <Route path="/hr/shifts/:id/assign" element={<AssignShift />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("محمد رمضان")).toBeTruthy();
      expect(screen.getByText("نادية حسين")).toBeTruthy();
      expect(screen.getByText("#EMP001")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("محمد رمضان"));

    await waitFor(() => {
      expect(screen.getByText("ملخص التعيين")).toBeTruthy();
      expect(screen.getByText("1 موظف × 1 يوم = 1 تعيين")).toBeTruthy();
      expect(screen.getByText("تأكيد التعيين (1)")).toBeTruthy();
    });
  });

  it("toggles date range mode to display end date input", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/shifts/shift-123/assign"]}>
        <Routes>
          <Route path="/hr/shifts/:id/assign" element={<AssignShift />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("نطاق تاريخ")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("نطاق تاريخ"));

    await waitFor(() => {
      expect(screen.getByText("إلغاء نطاق التاريخ")).toBeTruthy();
      expect(screen.getByText("من")).toBeTruthy();
      expect(screen.getByText("إلى")).toBeTruthy();
    });
  });
});
