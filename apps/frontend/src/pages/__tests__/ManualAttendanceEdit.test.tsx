/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ManualAttendanceEdit from "../hr/ManualAttendanceEdit";
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
    info: vi.fn(),
  },
}));

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "أحمد",
    lastName: "محمود",
    employeeNumber: "EMP101",
    avatar: "",
    department: { name: "الهندسة" },
  },
  {
    id: "emp-2",
    firstName: "سارة",
    lastName: "علي",
    employeeNumber: "EMP102",
    avatar: "",
    department: { name: "التسويق" },
  },
];

const mockAttendanceRecords = [
  {
    id: "rec-1",
    date: "2026-10-25T00:00:00.000Z",
    checkIn: "2026-10-25T09:00:00.000Z",
    checkOut: "2026-10-25T17:00:00.000Z",
    status: "PRESENT",
    workHours: 8,
    overtimeHours: 0,
    lateMinutes: 15,
    earlyLeaveMinutes: 0,
    notes: "حضور في الموعد",
    employee: {
      id: "emp-1",
      firstName: "أحمد",
      lastName: "محمود",
      avatar: "",
      employeeNumber: "EMP101",
      department: { name: "الهندسة" },
    },
  },
];

describe("ManualAttendanceEdit Page Component (Batch 494)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/employees")) {
        return Promise.resolve({
          data: {
            employees: mockEmployees,
          },
        });
      }
      if (url.startsWith("/hr/attendance")) {
        return Promise.resolve({
          data: {
            records: mockAttendanceRecords,
            pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    (api.put as any).mockResolvedValue({ data: { success: true } });
    (api.post as any).mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header and page notice", async () => {
    render(
      <MemoryRouter>
        <ManualAttendanceEdit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تعديل الحضور اليدوي")).toBeTruthy();
      expect(screen.getByText("التعديلات تُحفظ فوراً عند الضغط على حفظ")).toBeTruthy();
    });
  });

  it("renders filter controls and all-employees checkbox", async () => {
    render(
      <MemoryRouter>
        <ManualAttendanceEdit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("عرض جميع الموظفين (حتى بدون سجلات حضور)")
      ).toBeTruthy();
      expect(screen.getByText("فترة زمنية")).toBeTruthy();
    });
  });

  it("renders attendance table with employee records", async () => {
    render(
      <MemoryRouter>
        <ManualAttendanceEdit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("سجلات الحضور")).toBeTruthy();
      expect(screen.getByText("أحمد محمود")).toBeTruthy();
      expect(screen.getByText("EMP101")).toBeTruthy();
      expect(screen.getByText("حاضر")).toBeTruthy();
      expect(screen.getByText("8.0 ساعة")).toBeTruthy();
      expect(screen.getByText("تعديل")).toBeTruthy();
    });
  });

  it("toggles into edit mode and shows save/cancel buttons", async () => {
    render(
      <MemoryRouter>
        <ManualAttendanceEdit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تعديل")).toBeTruthy();
    });

    const editBtn = screen.getByText("تعديل");
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("حفظ")).toBeTruthy();
      expect(screen.getByText("إلغاء")).toBeTruthy();
    });

    // Clicking cancel exits edit mode
    const cancelBtn = screen.getByText("إلغاء");
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByText("تعديل")).toBeTruthy();
    });
  });
});
