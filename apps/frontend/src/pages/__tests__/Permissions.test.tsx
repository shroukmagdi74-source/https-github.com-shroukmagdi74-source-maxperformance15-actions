/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Permissions from "../hr/Permissions";
import api from "../../services/api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        "employee.permissions.title": "أذونات الموظفين",
        "employee.permissions.totalRecords": `إجمالي السجلات (${options?.count ?? 0})`,
        "employee.permissions.export": "تصدير",
        "employee.permissions.newPermission": "طلب إذن جديد",
        "employee.permissions.pendingApproval": "بانتظار الموافقة",
        "employee.permissions.request": "طلب",
        "employee.permissions.respondQuickly": "يرجى الرد بسرعة",
        "employee.permissions.totalHours": "إجمالي الساعات",
        "employee.permissions.hour": "ساعة",
        "employee.permissions.deductedPermissions": "الأذونات المخصومة",
        "employee.permissions.deductedFromSalary": "تخصم من الراتب",
        "employee.permissions.officialWorkHours": "مهمات عمل رسمية",
        "employee.permissions.assignments": "مهام خارجية",
        "employee.permissions.all": "الكل",
        "employee.permissions.pendingTab": "قيد الانتظار",
        "employee.permissions.approvedTab": "مقبولة",
        "employee.permissions.rejectedTab": "مرفوضة",
        "employee.permissions.typePlaceholder": "نوع الإذن",
        "employee.permissions.allTypes": "جميع الأنواع",
        "employee.permissions.exitDeductible": "إذن خروج مخصوم",
        "employee.permissions.emergencyNonDeductible": "إذن طارئ غير مخصوم",
        "employee.permissions.externalAssignment": "مأمورية خارجية",
        "employee.permissions.compensatory": "إذن تعويضي",
        "employee.permissions.approvedStatus": "مقبول",
        "employee.permissions.rejectedStatus": "مرفوض",
        "employee.permissions.dialogTitle": "طلب إذن انصراف / عودة",
        "employee.permissions.dialogDesc": "يرجى تعبئة البيانات بدقة",
        "employee.permissions.employeeLabel": "الموظف",
        "employee.permissions.employeePlaceholder": "اختر الموظف",
        "employee.permissions.typeLabel": "نوع الإذن",
        "employee.permissions.dateLabel": "التاريخ",
        "employee.permissions.urgencyLabel": "درجة الأهمية",
        "employee.permissions.urgent": "عاجل",
        "employee.permissions.normal": "عادي",
        "employee.permissions.exitTime": "وقت الخروج",
        "employee.permissions.returnTime": "وقت العودة",
        "employee.permissions.totalHoursLabel": "إجمالي الساعات",
        "employee.permissions.reasonLabel": "سبب الإذن",
        "employee.permissions.reasonPlaceholder": "اكتب سبب طلب الإذن هنا...",
        "employee.permissions.documentsLink": "رابط المستندات الداعمة",
        "employee.permissions.documentsPlaceholder": "https://...",
        "employee.permissions.cancelButton": "إلغاء",
        "employee.permissions.submitButton": "إرسال الطلب",
        "employee.permissions.detailsTitle": "تفاصيل الإذن",
        "employee.permissions.deleteTitle": "تأكيد الحذف",
        "employee.permissions.deleteConfirm": "هل أنت متأكد من رغبتك في حذف هذا الطلب؟",
        "employee.permissions.confirmDelete": "نعم، حذف",
        "employee.permissions.cancelDelete": "تراجع",
        "employee.permissions.rejectDialogTitle": "رفض الطلب",
        "employee.permissions.rejectDialogDesc": "يرجى ذكر سبب الرفض لتوضيحه للموظف",
        "employee.permissions.confirmReject": "تأكيد الرفض",
        "employee.permissions.backButton": "رجوع",
        "employee.permissions.approve": "قبول",
        "employee.permissions.reject": "رفض",
        "employee.permissions.delete": "حذف",
        "employee.permissions.detailsButton": "تفاصيل",
        "employee.permissions.colEmployee": "الموظف",
        "employee.permissions.colType": "النوع",
        "employee.permissions.colDate": "التاريخ",
        "employee.permissions.colTime": "الوقت",
        "employee.permissions.colDuration": "المدة",
        "employee.permissions.colStatus": "الحالة",
        "employee.permissions.colActions": "الإجراءات",
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

describe("Permissions Page Component", () => {
  const mockStats = {
    pendingCount: 2,
    totalHours: 12.5,
    byType: {
      DEDUCTIBLE: 3,
      FIXED_HOURS: 2,
      NON_DEDUCTIBLE: 1,
      COMPENSATORY: 0,
    },
  };

  const mockEmployees = [
    {
      id: "emp-101",
      firstName: "سارة",
      lastName: "محمود",
      avatar: "",
      department: { name: "الموارد البشرية" },
    },
  ];

  const mockRequests = [
    {
      id: "perm-1",
      type: "DEDUCTIBLE",
      date: "2026-10-25T00:00:00.000Z",
      startTime: "10:00",
      endTime: "12:00",
      totalHours: 2,
      status: "PENDING",
      reason: "ظرف عائلي طارئ",
      details: "مراجعة مشفى",
      isUrgent: true,
      isCompensated: false,
      createdAt: "2026-10-25T08:00:00.000Z",
      employee: {
        id: "emp-101",
        firstName: "سارة",
        lastName: "محمود",
        avatar: "",
        employeeNumber: "EMP-101",
        department: { name: "الموارد البشرية" },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/permissions/stats")) {
        return Promise.resolve({ data: { data: mockStats } });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      if (url.includes("/hr/permissions")) {
        return Promise.resolve({
          data: {
            requests: mockRequests,
            pagination: { total: 1, totalPages: 1, page: 1, limit: 20 },
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
        <Permissions />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "أذونات الموظفين" })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("بانتظار الموافقة")).toBeDefined();
      expect(screen.getByText("12.5")).toBeDefined();
    });
  });

  it("loads and displays permission requests in the table", async () => {
    render(
      <MemoryRouter>
        <Permissions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const nameMatches = screen.getAllByText("سارة محمود");
      expect(nameMatches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("ظرف عائلي طارئ")).toBeDefined();
    });
  });

  it("opens add permission dialog when clicking new permission button", async () => {
    render(
      <MemoryRouter>
        <Permissions />
      </MemoryRouter>,
    );

    const newBtn = screen.getByRole("button", { name: /طلب إذن جديد/i });
    fireEvent.click(newBtn);

    await waitFor(() => {
      expect(screen.getByText("طلب إذن انصراف / عودة")).toBeDefined();
      expect(screen.getByText("يرجى تعبئة البيانات بدقة")).toBeDefined();
    });
  });

  it("opens delete confirmation modal when delete button is clicked", async () => {
    render(
      <MemoryRouter>
        <Permissions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const nameMatches = screen.getAllByText("سارة محمود");
      expect(nameMatches.length).toBeGreaterThanOrEqual(1);
    });

    const deleteBtns = screen.getAllByTitle("حذف");
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(screen.getByText("تأكيد الحذف")).toBeDefined();
      expect(screen.getByText("هل أنت متأكد من رغبتك في حذف هذا الطلب؟")).toBeDefined();
    });
  });
});
