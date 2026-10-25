/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PositionsManagement from "../hr/PositionsManagement";
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

const mockPositions = [
  {
    id: "pos-1",
    title: "مدير تسويق رقمي",
    description: "قيادة استراتيجيات التسويق الرقمي وإدارة الحملات الإعلانية.",
    code: "MKT-01",
    level: 3,
    departmentId: "dept-1",
    minSalary: 15000,
    maxSalary: 25000,
    department: {
      id: "dept-1",
      name: "إدارة التسويق",
    },
    _count: {
      users: 4,
    },
  },
  {
    id: "pos-2",
    title: "مطور برمجيات متقدم",
    description: "تطوير وصيانة التطبيقات السحابية والأنظمة الخلفية.",
    code: "DEV-02",
    level: 2,
    departmentId: "dept-2",
    minSalary: 20000,
    maxSalary: 35000,
    department: {
      id: "dept-2",
      name: "تكنولوجيا المعلومات",
    },
    _count: {
      users: 8,
    },
  },
];

const mockDepartments = [
  { id: "dept-1", name: "إدارة التسويق" },
  { id: "dept-2", name: "تكنولوجيا المعلومات" },
];

describe("PositionsManagement Component (Batch 505)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/positions")) {
        return Promise.resolve({
          data: {
            positions: mockPositions,
          },
        });
      }
      if (url.includes("/hr/departments")) {
        return Promise.resolve({
          data: {
            departments: mockDepartments,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and new position button", async () => {
    render(
      <MemoryRouter>
        <PositionsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إدارة المناصب")).toBeTruthy();
      expect(screen.getByText("إضافة وتعديل وحذف المناصب الوظيفية")).toBeTruthy();
      expect(screen.getByText("منصب جديد")).toBeTruthy();
    });
  });

  it("renders positions list with department, salary, and user counts", async () => {
    render(
      <MemoryRouter>
        <PositionsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("مدير تسويق رقمي")).toBeTruthy();
      expect(screen.getByText("مطور برمجيات متقدم")).toBeTruthy();
      expect(screen.getByText("إدارة التسويق")).toBeTruthy();
      expect(screen.getByText("تكنولوجيا المعلومات")).toBeTruthy();
      expect(screen.getByText("4 موظف")).toBeTruthy();
      expect(screen.getByText("8 موظف")).toBeTruthy();
    });
  });

  it("opens create position dialog on clicking new position button", async () => {
    render(
      <MemoryRouter>
        <PositionsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("منصب جديد")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("منصب جديد"));

    await waitFor(() => {
      expect(screen.getByText("إنشاء منصب جديد")).toBeTruthy();
      expect(screen.getByText("أدخل بيانات المنصب الجديد")).toBeTruthy();
      expect(screen.getByText("حفظ المنصب")).toBeTruthy();
    });
  });

  it("opens delete confirmation dialog on clicking delete button", async () => {
    render(
      <MemoryRouter>
        <PositionsManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("مدير تسويق رقمي")).toBeTruthy();
    });

    const trashButtons = screen.getAllByRole("button").filter((b) =>
      b.className.includes("text-red-500")
    );
    expect(trashButtons.length).toBeGreaterThan(0);

    fireEvent.click(trashButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تأكيد الحذف")).toBeTruthy();
      expect(
        screen.getByText(
          'هل أنت متأكد من حذف المنصب "مدير تسويق رقمي"؟ هذا الإجراء لا يمكن التراجع عنه.'
        )
      ).toBeTruthy();
    });
  });
});
