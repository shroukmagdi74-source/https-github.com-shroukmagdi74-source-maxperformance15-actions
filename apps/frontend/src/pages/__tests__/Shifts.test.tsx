/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Shifts from "../hr/Shifts";
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

const mockShifts = [
  {
    id: "shift-1",
    name: "الدوام الصباحي الأساسي",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    color: "#3B82F6",
    isActive: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00Z",
    _count: {
      shiftAssignments: 14,
    },
  },
  {
    id: "shift-2",
    name: "الدوام المسائي",
    startTime: "16:00",
    endTime: "00:00",
    breakDuration: 30,
    color: "#10B981",
    isActive: false,
    sortOrder: 2,
    createdAt: "2026-01-02T00:00:00Z",
    _count: {
      shiftAssignments: 6,
    },
  },
];

describe("Shifts Page Component (Batch 499)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/shifts") {
        return Promise.resolve({
          data: {
            shifts: mockShifts,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header and stat cards properly", async () => {
    render(
      <MemoryRouter>
        <Shifts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("المناوبات")).toBeTruthy();
      expect(screen.getByText("إدارة مناوبات العمل وجداول الموظفين")).toBeTruthy();
    });

    expect(screen.getByText("الإجمالي")).toBeTruthy();
    expect(screen.getByText("نشطة")).toBeTruthy();
    expect(screen.getByText("معطلة")).toBeTruthy();
    expect(screen.getAllByText("الموظفين").length).toBeGreaterThan(0);
  });

  it("displays shifts cards with work times and assignments count", async () => {
    render(
      <MemoryRouter>
        <Shifts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("الدوام الصباحي الأساسي")).toBeTruthy();
      expect(screen.getByText("الدوام المسائي")).toBeTruthy();
    });

    expect(screen.getByText("09:00 - 17:00")).toBeTruthy();
    expect(screen.getByText("16:00 - 00:00")).toBeTruthy();
    expect(screen.getAllByText("عرض التفاصيل").length).toBe(2);
  });

  it("opens create shift modal dialog when clicking new shift button", async () => {
    render(
      <MemoryRouter>
        <Shifts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /مناوبة جديدة/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /مناوبة جديدة/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("مثال: الدوام الصباحي (A)")).toBeTruthy();
      expect(screen.getByText("قوالب سريعة")).toBeTruthy();
      expect(screen.getByText("ساعات العمل الصافية")).toBeTruthy();
    });
  });

  it("toggles view mode between grid and table", async () => {
    render(
      <MemoryRouter>
        <Shifts />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("شبكة")).toBeTruthy();
      expect(screen.getByText("جدول")).toBeTruthy();
    });

    // Click table mode button
    fireEvent.click(screen.getByRole("button", { name: /جدول/i }));

    await waitFor(() => {
      // Table headers or table elements render
      expect(screen.getByText("الدوام الصباحي الأساسي")).toBeTruthy();
    });
  });
});
