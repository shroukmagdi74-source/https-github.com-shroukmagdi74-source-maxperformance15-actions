/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Leaves from "../hr/Leaves";
import api from "../../services/api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        "employee.leaves.manageLeaves": "إدارة الإجازات",
        "employee.leaves.myLeaves": "إجازاتي",
        "employee.leaves.newLeaveRequest": "طلب إجازة جديد",
        "employee.leaves.dialogTitle": "تقديم طلب إجازة",
        "employee.leaves.detailsTitle": "تفاصيل طلب الإجازة",
        "employee.leaves.noLeaveRequests": "لا توجد طلبات إجازة",
        "employee.leaves.pending": "قيد الانتظار",
        "employee.leaves.approved": "مقبولة",
        "employee.leaves.rejected": "مرفوضة",
        "employee.leaves.totalDays": "إجمالي الأيام",
        "employee.leaves.all": "الكل",
        "employee.leaves.export": "تصدير",
        "employee.leaves.day": "يوم",
        "employee.leaves.annual": "إجازة سنوية",
        "employee.leaves.sick": "إجازة مرضية",
        "employee.leaves.employee": "الموظف",
        "employee.leaves.leaveType": "نوع الإجازة",
        "employee.leaves.from": "من",
        "employee.leaves.to": "إلى",
        "employee.leaves.duration": "المدة",
        "employee.leaves.status": "الحالة",
        "employee.leaves.actions": "الإجراءات",
        "employee.leaves.pendingStatus": "قيد الانتظار",
        "employee.leaves.approvedStatus": "مقبول",
        "employee.leaves.rejectedStatus": "مرفوض",
        "employee.leaves.cancelledStatus": "ملغي",
      };
      if (options?.count !== undefined) {
        return `${translations[key] || key} (${options.count})`;
      }
      return translations[key] || key;
    },
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
  },
}));

const mockRequests = [
  {
    id: "leave-1",
    userId: "user-1",
    type: "ANNUAL",
    startDate: "2026-06-01T00:00:00.000Z",
    endDate: "2026-06-05T00:00:00.000Z",
    totalDays: 5,
    status: "PENDING",
    reason: "إجازة سنوية للاستجمام",
    isHalfDay: false,
    halfDayPeriod: null,
    createdAt: "2026-05-20T10:00:00.000Z",
    approvedAt: null,
    rejectionReason: null,
    employee: {
      id: "user-1",
      firstName: "أحمد",
      lastName: "علي",
      avatar: "",
      department: { name: "قسم المبيعات" },
    },
    approver: null,
  },
  {
    id: "leave-2",
    userId: "user-2",
    type: "SICK",
    startDate: "2026-06-10T00:00:00.000Z",
    endDate: "2026-06-11T00:00:00.000Z",
    totalDays: 2,
    status: "APPROVED",
    reason: "وعكة صحية",
    isHalfDay: false,
    halfDayPeriod: null,
    createdAt: "2026-06-09T08:00:00.000Z",
    approvedAt: "2026-06-09T09:00:00.000Z",
    rejectionReason: null,
    employee: {
      id: "user-2",
      firstName: "سارة",
      lastName: "محمد",
      avatar: "",
      department: { name: "قسم التقنية" },
    },
    approver: {
      id: "user-admin",
      firstName: "المدير",
      lastName: "العام",
    },
  },
];

const mockEmployees = [
  {
    id: "user-1",
    firstName: "أحمد",
    lastName: "علي",
    avatar: "",
  },
  {
    id: "user-2",
    firstName: "سارة",
    lastName: "محمد",
    avatar: "",
  },
];

describe("Leaves Page Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/settings") || url.includes("/hr/leaves/my-config")) {
        return Promise.resolve({
          data: {
            settings: {
              workingDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
            },
          },
        });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({
          data: { employees: mockEmployees },
        });
      }
      if (url.includes("/hr/leaves/my-history") || url.includes("/hr/leaves")) {
        return Promise.resolve({
          data: {
            requests: mockRequests,
            pagination: { total: 2, totalPages: 1 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders header, stats cards, and leave requests table", async () => {
    render(
      <MemoryRouter initialEntries={["/leaves"]}>
        <Leaves />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "إدارة الإجازات" })).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeTruthy();
      expect(screen.getByText("سارة محمد")).toBeTruthy();
    });

    expect(screen.getByText("إجازة سنوية")).toBeTruthy();
    expect(screen.getByText("إجازة مرضية")).toBeTruthy();
  });

  it("opens add leave request dialog when clicking new request button", async () => {
    render(
      <MemoryRouter initialEntries={["/leaves"]}>
        <Leaves />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeTruthy();
    });

    const addBtn = screen.getByRole("button", { name: /طلب إجازة جديد/ });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "تقديم طلب إجازة" })).toBeTruthy();
    });
  });

  it("renders details dialog when clicking view on a leave request", async () => {
    render(
      <MemoryRouter initialEntries={["/leaves"]}>
        <Leaves />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeTruthy();
    });

    const actionButtons = screen.getAllByRole("button");
    const viewButtons = actionButtons.filter((btn) => btn.querySelector("svg.lucide-eye"));

    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تفاصيل طلب الإجازة")).toBeTruthy();
    });
  });

  it("renders empty table state when no requests exist", async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/settings") || url.includes("/hr/leaves/my-config")) {
        return Promise.resolve({
          data: { settings: { workingDays: ["sunday", "monday", "tuesday"] } },
        });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({ data: { employees: [] } });
      }
      if (url.includes("/hr/leaves")) {
        return Promise.resolve({
          data: {
            requests: [],
            pagination: { total: 0, totalPages: 0 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter initialEntries={["/leaves"]}>
        <Leaves />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("لا توجد طلبات إجازة")).toBeTruthy();
    });
  });
});
