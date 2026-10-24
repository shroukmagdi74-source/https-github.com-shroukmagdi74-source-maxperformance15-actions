/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import Departments from "../hr/Departments";
import api from "../../services/api";

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", role: "COMPANY_ADMIN", firstName: "مدير", lastName: "النظام" },
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

const mockDepartments = [
  {
    id: "dept-1",
    name: "قسم المبيعات",
    nameEn: "Sales",
    description: "إدارة المبيعات والتسويق",
    color: "#3B82F6",
    isActive: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    parentId: null,
    managerId: "emp-1",
    manager: {
      id: "emp-1",
      firstName: "أحمد",
      lastName: "علي",
      avatar: "",
    },
    parent: null,
    _count: {
      users: 12,
      positions: 3,
      children: 1,
    },
  },
  {
    id: "dept-2",
    name: "قسم الموارد البشرية",
    nameEn: "HR",
    description: "إدارة شؤون الموظفين",
    color: "#10B981",
    isActive: true,
    sortOrder: 2,
    createdAt: "2026-01-02T00:00:00.000Z",
    parentId: null,
    managerId: null,
    manager: null,
    parent: null,
    _count: {
      users: 5,
      positions: 2,
      children: 0,
    },
  },
];

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "أحمد",
    lastName: "علي",
    email: "ahmed@example.com",
    departmentId: "dept-1",
    department: { id: "dept-1", name: "قسم المبيعات" },
    position: { title: "مدير المبيعات" },
  },
];

describe("Departments Page Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/departments")) {
        return Promise.resolve({ data: { departments: mockDepartments } });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders header, stats, and departments list", async () => {
    render(<Departments />);

    expect(screen.getByRole("heading", { name: "إدارة الأقسام" })).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("قسم المبيعات")).toBeTruthy();
      expect(screen.getByText("قسم الموارد البشرية")).toBeTruthy();
    });

    expect(screen.getByText("إجمالي الأقسام")).toBeTruthy();
    expect(screen.getByText("الأقسام النشطة")).toBeTruthy();
    expect(screen.getByText("إجمالي الموظفين")).toBeTruthy();
  });

  it("filters departments when typing into search input", async () => {
    render(<Departments />);

    await waitFor(() => {
      expect(screen.getByText("قسم المبيعات")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("ابحث عن قسم بالاسم أو الوصف...");
    fireEvent.change(searchInput, { target: { value: "المبيعات" } });

    expect(screen.getByText("قسم المبيعات")).toBeTruthy();
    expect(screen.queryByText("قسم الموارد البشرية")).toBeNull();
  });

  it("opens add department dialog when clicking add button", async () => {
    render(<Departments />);

    await waitFor(() => {
      expect(screen.getByText("قسم المبيعات")).toBeTruthy();
    });

    const addBtn = screen.getByRole("button", { name: /إضافة قسم/ });
    fireEvent.click(addBtn);

    expect(screen.getByRole("heading", { name: "إضافة قسم جديد" })).toBeTruthy();
    expect(screen.getByPlaceholderText("مثال: قسم المبيعات")).toBeTruthy();
  });

  it("switches to hierarchy view when clicking hierarchy toggle", async () => {
    render(<Departments />);

    await waitFor(() => {
      expect(screen.getByText("قسم المبيعات")).toBeTruthy();
    });

    const hierarchyBtn = screen.getByRole("button", { name: /الهيكل التنظيمي/ });
    fireEvent.click(hierarchyBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /الهيكل التنظيمي/ })).toBeTruthy();
    });
  });

  it("renders empty state when no departments exist", async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/departments")) {
        return Promise.resolve({ data: { departments: [] } });
      }
      return Promise.resolve({ data: { employees: [] } });
    });

    render(<Departments />);

    await waitFor(() => {
      expect(screen.getByText("لا توجد أقسام مضافة بعد")).toBeTruthy();
    });
  });
});
