/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeamPerformance360Page from "../hr/TeamPerformance360Page";
import api from "../../services/api";

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

const mockLeaderboardData = {
  summary: {
    totalEmployees: 12,
    evaluatedEmployees: 12,
    averageScore: 86,
    tierCounts: {
      TIER_S: 2,
      TIER_A: 6,
      TIER_B: 3,
      TIER_C: 1,
      TIER_D: 0,
      PENDING_EVALUATION: 0,
    },
    atRiskCount: 1,
    bestDepartment: "الهندسة والبرمجيات",
    needsSupportDepartment: "الدعم الفني",
  },
  departmentStats: [
    { department: "الهندسة والبرمجيات", employeeCount: 8, averageScore: 90 },
    { department: "الدعم الفني", employeeCount: 4, averageScore: 78 },
  ],
  leaderboard: [
    {
      id: "emp-101",
      employeeNumber: "EMP-101",
      name: "حسام حسن",
      departmentName: "الهندسة والبرمجيات",
      positionTitle: "مهندس واجهات أمامية أول",
      compositeScore: 95,
      isEvaluated: true,
      tier: "TIER_S",
      tierLabel: "متميز (Tier S)",
      isAtRisk: false,
      riskFlags: [],
      pillars: {
        delivery: { score: 98, weight: 25, label: "سرعة ومعدل الإنجاز", details: "30/30 منجزة" },
        quality: { score: 94, weight: 25, label: "جودة المخرجات", details: "صفر إرجاعات" },
        punctuality: { score: 92, weight: 20, label: "الانضباط والحضور", details: "التزام كامل" },
        focus: { score: 96, weight: 20, label: "النشاط الرقمي", details: "نشط دائماً" },
        goals: { score: 95, weight: 10, label: "الأهداف ومؤشرات النتائج", details: "محقق 100%" },
      },
      telemetryStats: {
        tasksCompleted: 30,
        totalTasks: 30,
        returns: 0,
        lateDays: 0,
        monitoredDays: 22,
        activeGoals: 4,
        presentDays: 22,
        absentDays: 0,
      },
    },
    {
      id: "emp-102",
      employeeNumber: "EMP-102",
      name: "طارق سليم",
      departmentName: "الدعم الفني",
      positionTitle: "أخصائي دعم فني",
      compositeScore: 58,
      isEvaluated: true,
      tier: "TIER_D",
      tierLabel: "حرج (Tier D)",
      isAtRisk: true,
      riskFlags: ["تكرار التأخر الصباحي 5 أيام", "معدل إرجاع تذاكر مرتفع"],
      pillars: {
        delivery: { score: 60, weight: 25, label: "سرعة ومعدل الإنجاز", details: "12/20 منجزة" },
        quality: { score: 55, weight: 25, label: "جودة المخرجات", details: "4 إرجاعات" },
        punctuality: { score: 50, weight: 20, label: "الانضباط والحضور", details: "5 تأخيرات" },
        focus: { score: 65, weight: 20, label: "النشاط الرقمي", details: "فترات ركود" },
        goals: { score: 60, weight: 10, label: "الأهداف ومؤشرات النتائج", details: "قيد المتابعة" },
      },
      telemetryStats: {
        tasksCompleted: 12,
        totalTasks: 20,
        returns: 4,
        lateDays: 5,
        monitoredDays: 20,
        activeGoals: 2,
        presentDays: 18,
        absentDays: 2,
      },
    },
  ],
  period: "آخر 30 يوماً",
};

describe("TeamPerformance360Page Component (Batch 501)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/performance/team-leaderboard")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockLeaderboardData,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and period mode selector", async () => {
    render(
      <MemoryRouter>
        <TeamPerformance360Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة تقييم الفريق التلقائية 360°")).toBeTruthy();
    });

    expect(screen.getAllByText("آخر 30 يوماً").length).toBeGreaterThan(0);
    expect(screen.getByText("الشهر الحالي")).toBeTruthy();
    expect(screen.getByText("الشهر السابق")).toBeTruthy();
    expect(screen.getByText("تحديث")).toBeTruthy();
  });

  it("renders KPI overview cards with summary metrics", async () => {
    render(
      <MemoryRouter>
        <TeamPerformance360Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("متوسط أداء الشركة")).toBeTruthy();
    });

    expect(screen.getByText("86")).toBeTruthy();
    expect(screen.getByText("فئة النخبة (Tier S & A)")).toBeTruthy();
    expect(screen.getByText("موظفون في دائرة الخطر")).toBeTruthy();
    expect(screen.getByText("القسم الأعلى إنتاجية")).toBeTruthy();
    expect(screen.getAllByText("الهندسة والبرمجيات").length).toBeGreaterThan(0);
  });

  it("renders leaderboard table with employee rows and scores", async () => {
    render(
      <MemoryRouter>
        <TeamPerformance360Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("حسام حسن")).toBeTruthy();
      expect(screen.getByText("طارق سليم")).toBeTruthy();
    });

    expect(screen.getByText("EMP-101")).toBeTruthy();
    expect(screen.getByText("EMP-102")).toBeTruthy();
    expect(screen.getByText("مهندس واجهات أمامية أول")).toBeTruthy();
    expect(screen.getByText("أخصائي دعم فني")).toBeTruthy();
    expect(screen.getByText("خطة تحسين (PIP)")).toBeTruthy();
  });

  it("opens audit drilldown dialog on employee row click", async () => {
    render(
      <MemoryRouter>
        <TeamPerformance360Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("حسام حسن")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("حسام حسن"));

    await waitFor(() => {
      expect(screen.getByText("سجل التدقيق والمطابقة التشغيلية الشامل")).toBeTruthy();
      expect(screen.getByText("المحاور الخمسة وتوزيع الأوزان الفعلي:")).toBeTruthy();
      expect(screen.getByText("إغلاق")).toBeTruthy();
    });
  });
});
