/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Employees from "../hr/Employees";
import api from "../../services/api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        "employees.pageTitle": "الموظفون",
        "employees.pageSubtitle": "إدارة فريق العمل، بيانات الموظفين والحسابات",
        "employees.addEmployee": "إضافة موظف",
        "employees.import": "استيراد",
        "employees.export": "تصدير",
        "employees.searchPlaceholder": "البحث بالاسم، البريد أو رقم الهاتف...",
        "employees.allStatuses": "جميع الحالات",
        "employees.allDepartments": "جميع الأقسام",
        "employees.allContractTypes": "جميع أنواع العقود",
        "employees.allUserStatuses": "حالة الحساب (الكل)",
        "employees.statusActive": "نشط",
        "employees.statusInactive": "غير نشط",
        "employees.statusSuspended": "موقوف",
        "employees.statusOnLeave": "في إجازة",
        "employees.contractFullTime": "دوام كامل",
        "employees.contractPartTime": "دوام جزئي",
        "employees.hasAccount": "لديه حساب",
        "employees.noAccount": "بدون حساب",
        "employees.colEmployee": "الموظف",
        "employees.colDepartment": "القسم والمنصب",
        "employees.colContact": "التواصل",
        "employees.colContract": "العقد والراتب",
        "employees.colStatus": "الحالة",
        "employees.colUserAccount": "حساب النظام",
        "employees.colActions": "الإجراءات",
        "employees.unspecified": "غير محدد",
        "employees.noEmployees": "لا يوجد موظفون",
        "employees.noEmployeesDesc": "لم يتم العثور على موظفين يطابقون خيارات البحث",
        "employees.addEmployeeBtn": "إضافة أول موظف",
        "employees.addEmployeeTitle": "إضافة موظف جديد",
        "employees.firstName": "الاسم الأول",
        "employees.lastName": "اسم العائلة",
        "employees.email": "البريد الإلكتروني",
        "employees.viewAssets": "العهد والمعدات",
        "employees.edit": "تعديل",
        "employees.deleteConfirm": "هل أنت متأكد من حذف الموظف",
        "employees.deleteEmployee": "حذف الموظف",
        "employees.cancel": "إلغاء",
        "employees.delete": "حذف",
        "employees.errorDeleteEmployee": "فشل حذف الموظف",
        "employees.employeeDeleted": "تم حذف الموظف بنجاح",
      };
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
    info: vi.fn(),
  },
}));

vi.mock("@/components/hr/EmployeeInviteModal", () => ({
  EmployeeInviteModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="invite-modal">Modal Open</div> : null,
}));

const mockEmployees = [
  {
    id: "emp-1",
    employeeNumber: "EMP001",
    firstName: "طارق",
    lastName: "محمود",
    email: "tarek@example.com",
    phone: "01012345678",
    avatar: "",
    status: "ACTIVE",
    position: "مطور برمجيات",
    departmentId: "dept-1",
    department: { id: "dept-1", name: "تكنولوجيا المعلومات" },
    contractType: "FULL_TIME",
    basicSalary: 15000,
    hireDate: "2024-01-01",
    userId: "usr-1",
    user: { id: "usr-1", role: "DEVELOPER" },
  },
  {
    id: "emp-2",
    employeeNumber: "EMP002",
    firstName: "سارة",
    lastName: "إبراهيم",
    email: "sara@example.com",
    phone: "01198765432",
    avatar: "",
    status: "INACTIVE",
    position: "أخصائي موارد بشرية",
    departmentId: "dept-2",
    department: { id: "dept-2", name: "الموارد البشرية" },
    contractType: "PART_TIME",
    basicSalary: 8000,
    hireDate: "2024-03-15",
    userId: null,
    user: null,
  },
];

const mockDepartments = [
  { id: "dept-1", name: "تكنولوجيا المعلومات" },
  { id: "dept-2", name: "الموارد البشرية" },
];

describe("Employees Page (Batch 490)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/employees?")) {
        return Promise.resolve({
          data: {
            employees: mockEmployees,
            pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
          },
        });
      }
      if (url === "/hr/departments") {
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

  it("renders page title and action buttons properly", async () => {
    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );

    expect(screen.getByText("الموظفون")).toBeTruthy();
    expect(
      screen.getByText("إدارة فريق العمل، بيانات الموظفين والحسابات")
    ).toBeTruthy();
    expect(screen.getByText("دعوة موظف برابط")).toBeTruthy();
    expect(screen.getByText("إضافة موظف")).toBeTruthy();
  });

  it("fetches and displays employees list in the table", async () => {
    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("طارق محمود")).toBeTruthy();
      expect(screen.getByText("سارة إبراهيم")).toBeTruthy();
      expect(screen.getByText("EMP001")).toBeTruthy();
      expect(screen.getByText("EMP002")).toBeTruthy();
    });
  });

  it("filters bar renders search input and select elements", async () => {
    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(
      "البحث بالاسم، البريد أو رقم الهاتف..."
    );
    expect(searchInput).toBeTruthy();
  });

  it("opens add employee dialog when clicking add button", async () => {
    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );

    const addBtn = screen.getByText("إضافة موظف");
    fireEvent.click(addBtn);

    await waitFor(() => {
      // Dialog should open and show title and personal info fields
      expect(screen.getByText("إضافة موظف جديد")).toBeTruthy();
      expect(screen.getByText("الاسم الأول")).toBeTruthy();
    });
  });
});
