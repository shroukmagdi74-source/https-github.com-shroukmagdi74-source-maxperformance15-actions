/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Attendance from "../hr/Attendance";
import api from "../../services/api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "ar",
      changeLanguage: () => Promise.resolve(),
    },
  }),
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Attendance Page Component", () => {
  const mockTodayStats = {
    totalEmployees: 10,
    present: 8,
    late: 1,
    absent: 1,
    timezone: "Africa/Cairo",
  };

  const mockEmployees = [
    {
      id: "emp-1",
      firstName: "أحمد",
      lastName: "علي",
      employeeNumber: "EMP-001",
    },
  ];

  const mockRecords = [
    {
      id: "rec-1",
      date: "2026-10-25T09:00:00.000Z",
      checkIn: "2026-10-25T09:05:00.000Z",
      checkOut: null,
      checkInLocation: null,
      checkOutLocation: null,
      checkInMethod: "manual",
      checkOutMethod: null,
      status: "PRESENT",
      workHours: 0,
      overtimeHours: 0,
      lateMinutes: 5,
      earlyLeaveMinutes: 0,
      notes: "ملاحظة حضور تجريبية",
      workMode: "OFFICE",
      employee: {
        id: "emp-1",
        firstName: "أحمد",
        lastName: "علي",
        employeeNumber: "EMP-001",
        avatar: "",
        department: { name: "تقنية المعلومات" },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/attendance/today")) {
        return Promise.resolve({ data: mockTodayStats });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      if (url.includes("/hr/attendance")) {
        return Promise.resolve({
          data: {
            records: mockRecords,
            pagination: { total: 1, totalPages: 1, page: 1, limit: 20 },
            autoCloseSummary: { total: 0, pending: 0, reviewed: 0, adjusted: 0, dismissed: 0 },
            timezone: "Africa/Cairo",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and stats cards correctly", async () => {
    render(
      <MemoryRouter>
        <Attendance />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "الحضور والانصراف" })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("إجمالي الموظفين")).toBeDefined();
      expect(screen.getByText("10")).toBeDefined();
      expect(screen.getByText("8")).toBeDefined();
    });
  });

  it("loads and renders attendance table records", async () => {
    render(
      <MemoryRouter>
        <Attendance />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const empMatches = screen.getAllByText("أحمد علي");
      expect(empMatches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("EMP-001")).toBeDefined();
      expect(screen.getByText("تقنية المعلومات")).toBeDefined();
      const presentMatches = screen.getAllByText("حاضر");
      expect(presentMatches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("opens manual attendance dialog on click", async () => {
    render(
      <MemoryRouter>
        <Attendance />
      </MemoryRouter>,
    );

    const manualBtn = screen.getByRole("button", { name: /تسجيل يدوي/i });
    fireEvent.click(manualBtn);

    await waitFor(() => {
      expect(screen.getByText("تسجيل حضور يدوي")).toBeDefined();
      expect(screen.getByText("اختر موظف")).toBeDefined();
    });
  });

  it("opens delete confirmation modal when delete button is clicked", async () => {
    render(
      <MemoryRouter>
        <Attendance />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const empMatches = screen.getAllByText("أحمد علي");
      expect(empMatches.length).toBeGreaterThanOrEqual(1);
    });

    const deleteBtn = screen.getByTitle("حذف");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText("حذف سجل حضور")).toBeDefined();
      expect(screen.getByText(/هل أنت متأكد من حذف هذا السجل بشكل نهائي؟/i)).toBeDefined();
    });
  });
});
