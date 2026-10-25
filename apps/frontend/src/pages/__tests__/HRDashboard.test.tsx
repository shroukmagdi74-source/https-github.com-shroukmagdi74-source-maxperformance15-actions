/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HRDashboard from "../hr/HRDashboard";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u-1", companyId: "comp-1" },
  }),
}));

const translations: Record<string, string> = {
  "hrDashboard.pageTitle": "لوحة تحكم الموارد البشرية",
  "hrDashboard.overview": "نظرة عامة على الموظفين والحضور والإجراءات",
  "hrDashboard.manageEmployees": "إدارة الموظفين",
  "hrDashboard.attendance": "سجل الحضور",
  "hrDashboard.totalEmployees": "إجمالي الموظفين",
  "hrDashboard.todaysAttendance": "حضور اليوم",
  "hrDashboard.pendingLeaves": "طلبات إجازة معلقة",
  "hrDashboard.totalDepartments": "إجمالي الأقسام",
  "hrDashboard.todaysAttendanceTitle": "حضور اليوم",
  "hrDashboard.viewAll": "عرض الكل",
  "hrDashboard.present": "حاضر",
  "hrDashboard.late": "متأخر",
  "hrDashboard.absent": "غائب",
  "hrDashboard.attendanceRate": "نسبة الحضور",
  "hrDashboard.recentCheckins": "آخر تسجيلات الدخول",
  "hrDashboard.leavesRequests": "طلبات الإجازات",
  "hrDashboard.pendingPermissions": "أذونات معلقة",
  "hrDashboard.pendingAdvances": "سلف معلقة",
  "hrDashboard.warnings": "الإنذارات",
  "hrDashboard.recruitmentOverview": "نظرة عامة على التوظيف",
  "hrDashboard.activeJobs": "وظائف نشطة",
  "hrDashboard.totalApplicants": "المتقدمين",
  "hrDashboard.interviews": "المقابلات",
  "hrDashboard.pendingReviews": "مراجعات معلقة",
  "hrDashboard.hiredThisMonth": "تم توظيفهم هذا الشهر",
  "hrDashboard.recentHires": "التعيينات الحديثة",
  "hrDashboard.departments": "الأقسام",
  "hrDashboard.employeesCount": "موظف",
  "hrDashboard.quickActions": "إجراءات سريعة",
  "hrDashboard.employees": "الموظفين",
  "hrDashboard.rewards": "المكافآت",
  "hrDashboard.attendanceLabel": "الحضور والانصراف",
  "hrDashboard.leaves": "الإجازات",
  "hrDashboard.payroll": "الرواتب",
  "hrDashboard.reports": "التقارير",
  "hrDashboard.approve": "موافقة",
  "hrDashboard.reject": "رفض",
  "common.days": "أيام",
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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockDashboardData = {
  employees: {
    totalEmployees: 42,
    activeEmployees: 40,
    byDepartment: [],
    byContractType: [],
    byStatus: [],
    recentHires: [
      {
        id: "emp-new",
        firstName: "خالد",
        lastName: "إبراهيم",
        position: { title: "مطور برمجيات" },
        hireDate: "2026-10-01",
        avatar: "",
      },
    ],
    upcomingBirthdays: [],
  },
  attendance: {
    date: "2026-10-25",
    totalEmployees: 42,
    present: 35,
    late: 4,
    absent: 3,
    records: [
      {
        checkIn: "2026-10-25T09:05:00.000Z",
        status: "PRESENT",
        employee: {
          id: "emp-1",
          firstName: "طارق",
          lastName: "فؤاد",
          department: { name: "الهندسة" },
          avatar: "",
        },
      },
    ],
  },
  pendingLeaves: [
    {
      id: "leave-1",
      type: "سنوية",
      totalDays: 3,
      employee: {
        id: "emp-2",
        firstName: "منى",
        lastName: "يوسف",
        department: { name: "التسويق" },
      },
    },
  ],
  departments: {
    totalDepartments: 5,
    departments: [
      {
        id: "dept-1",
        name: "التطوير والبرمجة",
        color: "#3B82F6",
        employeeCount: 15,
      },
    ],
  },
  pendingPermissions: [
    {
      id: "perm-1",
      type: "شخصي",
      duration: 60,
      employee: {
        id: "emp-3",
        firstName: "أحمد",
        lastName: "سامي",
      },
    },
  ],
  pendingAdvances: [
    {
      id: "adv-1",
      amount: 2500,
      createdAt: "2026-10-24T10:00:00.000Z",
      employee: {
        id: "emp-4",
        firstName: "محمود",
        lastName: "حسن",
      },
    },
  ],
  recruitment: {
    activeJobs: 3,
    totalApplicants: 28,
    scheduledInterviews: 6,
    pendingReviews: 12,
    hiredThisMonth: 2,
  },
  warnings: {
    total: 2,
    bySeverity: [{ severity: "MEDIUM", _count: 2 }],
    acknowledged: 1,
  },
};

describe("HRDashboard Page Component (Batch 495)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/dashboard")) {
        return Promise.resolve({
          data: {
            dashboard: mockDashboardData,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    (api.post as any).mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders hero banner with title and buttons", async () => {
    render(
      <MemoryRouter>
        <HRDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة تحكم الموارد البشرية")).toBeTruthy();
      expect(screen.getByText("إدارة الموظفين")).toBeTruthy();
      expect(screen.getByText("سجل الحضور")).toBeTruthy();
    });
  });

  it("renders key stats in the top stats grid", async () => {
    render(
      <MemoryRouter>
        <HRDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إجمالي الموظفين")).toBeTruthy();
      expect(screen.getByText("42")).toBeTruthy();
      expect(screen.getAllByText("حضور اليوم").length).toBeGreaterThan(0);
      expect(screen.getAllByText("35").length).toBeGreaterThan(0);
      expect(screen.getByText("طلبات إجازة معلقة")).toBeTruthy();
      expect(screen.getByText("إجمالي الأقسام")).toBeTruthy();
      expect(screen.getByText("5")).toBeTruthy();
    });
  });

  it("renders attendance details and recent check-ins", async () => {
    render(
      <MemoryRouter>
        <HRDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("طارق فؤاد")).toBeTruthy();
      expect(screen.getByText("الهندسة")).toBeTruthy();
      expect(screen.getByText("83%")).toBeTruthy(); // 35 / 42 * 100
    });
  });

  it("renders pending leave request with approve and reject buttons", async () => {
    render(
      <MemoryRouter>
        <HRDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("منى يوسف")).toBeTruthy();
      expect(screen.getByText("سنوية")).toBeTruthy();
      expect(screen.getByText("3 أيام")).toBeTruthy();
    });

    const approveButtons = screen.getAllByText("موافقة");
    expect(approveButtons.length).toBeGreaterThan(0);
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });

  it("renders recruitment, recent hires, and quick actions", async () => {
    render(
      <MemoryRouter>
        <HRDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("نظرة عامة على التوظيف")).toBeTruthy();
      expect(screen.getByText("وظائف نشطة")).toBeTruthy();
      expect(screen.getByText("خالد إبراهيم")).toBeTruthy();
      expect(screen.getByText("مطور برمجيات")).toBeTruthy();
      expect(screen.getByText("إجراءات سريعة")).toBeTruthy();
    });
  });
});
