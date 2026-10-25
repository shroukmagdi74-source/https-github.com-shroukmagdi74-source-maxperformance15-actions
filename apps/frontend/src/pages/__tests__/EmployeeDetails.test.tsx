/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EmployeeDetails from "../hr/EmployeeDetails";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const translations: Record<string, string> = {
  "hrDashboard.employeeDetails.overview": "نظرة عامة",
  "hrDashboard.employeeDetails.personal": "البيانات الشخصية",
  "sidebar.attendance": "الحضور",
  "sidebar.leaves": "الإجازات",
  "hrDashboard.employeeDetails.documents": "المستندات",
  "hrDashboard.employeeDetails.salary": "الراتب",
  "hrDashboard.employeeDetails.performance": "الأداء",
};

const mockT = (key: string) => translations[key] || key;

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => {} },
  Trans: ({ children }: any) => children,
  useTranslation: () => ({
    t: mockT,
    i18n: { language: "ar" },
  }),
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

const mockEmployee = {
  id: "emp-555",
  employeeNumber: "EMP555",
  firstName: "عمر",
  lastName: "الشريف",
  email: "omar.sharif@example.com",
  phone: "01012345678",
  mobile: "01187654321",
  avatar: "",
  dateOfBirth: "1992-05-15",
  gender: "MALE",
  maritalStatus: "MARRIED",
  nationalId: "29205151234567",
  address: "شارع التحرير، الدقي",
  city: "الجيزة",
  country: "مصر",
  hireDate: "2022-01-01",
  probationEndDate: "2022-04-01",
  contractType: "FULL_TIME",
  contractEndDate: "2025-01-01",
  status: "ACTIVE",
  baseSalary: 25000,
  annualLeaveBalance: 18,
  sickLeaveBalance: 12,
  bankName: "البنك الأهلي المصري",
  bankAccountNumber: "1234567890",
  bankIban: "EG123456789012345678901234",
  emergencyContactName: "مريم الشريف",
  emergencyContactPhone: "01234567890",
  emergencyContactRelation: "زوجة",
  enableAutoDeduction: true,
  monthlyGraceMinutes: 45,
  maxDailyLateMinutes: 15,
  lateDeductionRate: 50,
  department: { id: "dept-1", name: "إدارة العمليات", color: "#3B82F6" },
  position: { id: "pos-1", title: "مدير العمليات", level: 3 },
  manager: {
    id: "mgr-1",
    firstName: "أحمد",
    lastName: "فؤاد",
    avatar: "",
  },
  subordinates: [
    {
      id: "sub-1",
      firstName: "كريم",
      lastName: "سعيد",
      position: { title: "أخصائي عمليات" },
      avatar: "",
    },
  ],
  employeeDocuments: [
    {
      id: "doc-1",
      title: "صورة بطاقة الرقم القومي",
      type: "NATIONAL_ID",
    },
  ],
  leaveRequests: [],
  attendance: [],
};

describe("EmployeeDetails Page Component (Batch 497)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/employees/emp-555") {
        return Promise.resolve({
          data: {
            employee: mockEmployee,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders employee profile header and action buttons", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/employees/emp-555"]}>
        <Routes>
          <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("ملف الموظف")).toBeTruthy();
      expect(screen.getByText("تعديل")).toBeTruthy();
    });
  });

  it("renders employee hero card details correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/employees/emp-555"]}>
        <Routes>
          <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("عمر الشريف")).toBeTruthy();
      expect(screen.getByText("EMP555")).toBeTruthy();
      expect(screen.getByText("نشط")).toBeTruthy();
      expect(screen.getByText("إدارة العمليات")).toBeTruthy();
      expect(screen.getByText("مدير العمليات")).toBeTruthy();
      expect(screen.getByText("omar.sharif@example.com")).toBeTruthy();
      expect(screen.getByText("أحمد فؤاد")).toBeTruthy();
      expect(screen.getByText("دوام كامل")).toBeTruthy();
    });
  });

  it("renders overview tab stat cards and deduction policy", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/employees/emp-555"]}>
        <Routes>
          <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("رصيد الإجازات السنوية")).toBeTruthy();
      expect(screen.getByText("18 يوم")).toBeTruthy();
      expect(screen.getByText("رصيد الإجازات المرضية")).toBeTruthy();
      expect(screen.getByText("12 يوم")).toBeTruthy();
      expect(screen.getByText("سياسة الخصم والتأخير للموظف")).toBeTruthy();
      expect(screen.getByText("45 دقيقة")).toBeTruthy();
      expect(screen.getByText("15 دقائق")).toBeTruthy();
      expect(screen.getByText("50 جنيه")).toBeTruthy();
      expect(screen.getByText("كريم سعيد")).toBeTruthy();
    });
  });

  it("switches to personal tab and displays detailed personal and contact info", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/employees/emp-555"]}>
        <Routes>
          <Route path="/hr/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("البيانات الشخصية")).toBeTruthy();
    });

    const personalTab = screen.getByText("البيانات الشخصية");
    fireEvent.click(personalTab);

    await waitFor(() => {
      expect(screen.getByText("المعلومات الشخصية")).toBeTruthy();
      expect(screen.getByText("ذكر")).toBeTruthy();
      expect(screen.getByText("متزوج")).toBeTruthy();
      expect(screen.getByText("29205151234567")).toBeTruthy();
      expect(screen.getByText("جهة اتصال الطوارئ")).toBeTruthy();
      expect(screen.getByText("مريم الشريف")).toBeTruthy();
      expect(screen.getByText("المعلومات البنكية")).toBeTruthy();
      expect(screen.getByText("البنك الأهلي المصري")).toBeTruthy();
    });
  });
});
