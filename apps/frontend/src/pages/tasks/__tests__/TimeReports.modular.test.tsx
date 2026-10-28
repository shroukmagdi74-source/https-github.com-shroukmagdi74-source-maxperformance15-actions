// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import {
  formatDuration,
  formatDate,
  formatTime,
  exportToCSV,
} from "../time-reports/helpers";
import { TimeReportsHeader } from "../time-reports/TimeReportsHeader";
import { TimeReportsSummaryCards } from "../time-reports/TimeReportsSummaryCards";
import { TimeReportsTabsNav } from "../time-reports/TimeReportsTabsNav";
import { TimeReportsEntriesTab } from "../time-reports/TimeReportsEntriesTab";
import { TimeReportsEvaluationTab } from "../time-reports/TimeReportsEvaluationTab";
import { TimeReportsUsersTab } from "../time-reports/TimeReportsUsersTab";
import { TimeReportsProjectsTab } from "../time-reports/TimeReportsProjectsTab";
import { TimeReportsDailyTab } from "../time-reports/TimeReportsDailyTab";
import type {
  TimeEntry,
  TimeEvaluationSummary,
  TimeEvaluationTask,
  UserTimeStats,
  ProjectTimeStats,
  DailyStats,
} from "../time-reports/types";

// Mock react-router-dom Link
vi.mock("react-router-dom", () => ({
  Link: ({ to, children, className, title }: any) => (
    <a href={to} className={className} title={title}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("TimeReports Modular Subcomponents", () => {
  describe("helpers", () => {
    it("formats durations accurately", () => {
      expect(formatDuration(0)).toBe("0س 0د");
      expect(formatDuration(45)).toBe("0س 45د");
      expect(formatDuration(90)).toBe("1س 30د");
      expect(formatDuration(150)).toBe("2س 30د");
    });

    it("formats dates and times or returns fallback for invalid inputs", () => {
      expect(formatDate("")).toBe("—");
      expect(formatDate("invalid-date")).toBe("—");
      expect(formatDate("2026-10-28T09:00:00Z")).not.toBe("—");

      expect(formatTime("")).toBe("—");
      expect(formatTime("invalid-date")).toBe("—");
      expect(formatTime("2026-10-28T09:00:00Z")).not.toBe("—");
    });

    it("handles CSV export trigger safely", () => {
      const mockClick = vi.fn();
      const createObjectURLMock = vi.fn(() => "blob:mock-url");
      window.URL.createObjectURL = createObjectURLMock;

      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
        set href(val: string) {},
        set download(val: string) {},
        click: mockClick,
      } as any);

      const mockEntries: TimeEntry[] = [
        {
          id: "e-1",
          taskId: "t-1",
          taskTitle: "Design Banner",
          projectName: "Marketing Q4",
          userId: "u-1",
          userName: "Ahmed",
          startTime: "2026-10-28T10:00:00Z",
          endTime: "2026-10-28T11:00:00Z",
          duration: 60,
          description: "Created landing banner",
          createdAt: "2026-10-28T10:00:00Z",
        },
      ];

      exportToCSV(mockEntries, "2026-10-01", "2026-10-28");
      expect(mockClick).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });

  describe("TimeReportsHeader", () => {
    it("renders title, back link, and triggers CSV export", () => {
      const onExport = vi.fn();
      render(<TimeReportsHeader onExportCSV={onExport} />);

      expect(screen.getByText("تقارير الوقت")).toBeTruthy();
      expect(screen.getByText("العودة")).toBeTruthy();
      const exportBtn = screen.getByRole("button", { name: /تصدير CSV/i });
      expect(exportBtn).toBeTruthy();

      fireEvent.click(exportBtn);
      expect(onExport).toHaveBeenCalledTimes(1);
    });
  });

  describe("TimeReportsSummaryCards", () => {
    it("renders the 6 summary metric cards with formatted values", () => {
      const summary: TimeEvaluationSummary = {
        totalTasks: 15,
        totalEstimatedHours: 40,
        totalActualHours: 42,
        overallAccuracyPct: 92,
        totalReworkMinutes: 65,
      };

      render(
        <TimeReportsSummaryCards
          totalMinutes={150}
          filteredCount={8}
          userCount={3}
          projectCount={2}
          summary={summary}
        />
      );

      expect(screen.getByText("إجمالي الوقت")).toBeTruthy();
      expect(screen.getByText("2س 30د")).toBeTruthy();

      expect(screen.getByText("عدد السجلات")).toBeTruthy();
      expect(screen.getByText("8")).toBeTruthy();

      expect(screen.getByText("المستخدمين النشطين")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();

      expect(screen.getByText("المشاريع النشطة")).toBeTruthy();
      expect(screen.getByText("2")).toBeTruthy();

      expect(screen.getByText("دقة التقدير")).toBeTruthy();
      expect(screen.getByText("92%")).toBeTruthy();

      expect(screen.getByText("إعادة العمل")).toBeTruthy();
      expect(screen.getByText("65 د")).toBeTruthy();
    });
  });

  describe("TimeReportsTabsNav", () => {
    it("renders all 5 tabs and triggers onTabChange", () => {
      const onTabChange = vi.fn();
      render(
        <TimeReportsTabsNav
          activeTab="entries"
          onTabChange={onTabChange}
        />
      );

      expect(screen.getByText("سجلات الوقت")).toBeTruthy();
      expect(screen.getByText("تقييم الوقت وإعادة العمل")).toBeTruthy();
      expect(screen.getByText("حسب المستخدم")).toBeTruthy();
      expect(screen.getByText("حسب المشروع")).toBeTruthy();
      expect(screen.getByText("حسب اليوم")).toBeTruthy();

      fireEvent.click(screen.getByText("تقييم الوقت وإعادة العمل"));
      expect(onTabChange).toHaveBeenCalledWith("evaluation");
    });
  });

  describe("TimeReportsEntriesTab", () => {
    it("renders empty state when there are no entries", () => {
      render(<TimeReportsEntriesTab entries={[]} />);
      expect(screen.getByText("لا توجد سجلات وقت في هذه الفترة")).toBeTruthy();
    });

    it("renders table with entries data", () => {
      const mockEntries: TimeEntry[] = [
        {
          id: "entry-1",
          taskId: "task-101",
          taskTitle: "Refactor Auth Service",
          projectName: "Backend Core",
          userId: "user-1",
          userName: "Mokhtar",
          startTime: "2026-10-28T09:00:00Z",
          endTime: "2026-10-28T10:30:00Z",
          duration: 90,
          description: "Fixed token expiration bug",
          createdAt: "2026-10-28T09:00:00Z",
        },
      ];

      render(<TimeReportsEntriesTab entries={mockEntries} />);

      expect(screen.getByText("Refactor Auth Service")).toBeTruthy();
      expect(screen.getByText("Backend Core")).toBeTruthy();
      expect(screen.getByText("Mokhtar")).toBeTruthy();
      expect(screen.getByText("1س 30د")).toBeTruthy();
      expect(screen.getByText("Fixed token expiration bug")).toBeTruthy();
    });
  });

  describe("TimeReportsEvaluationTab", () => {
    it("renders summary strip and handles empty tasks", () => {
      const summary: TimeEvaluationSummary = {
        totalTasks: 10,
        totalEstimatedHours: 25,
        totalActualHours: 28,
        overallAccuracyPct: 88,
        totalReworkMinutes: 45,
      };

      render(<TimeReportsEvaluationTab summary={summary} tasks={[]} />);

      expect(screen.getByText("المهام المقيّمة")).toBeTruthy();
      expect(screen.getByText("10")).toBeTruthy();
      expect(screen.getByText("25 س")).toBeTruthy();
      expect(screen.getByText("28 س")).toBeTruthy();
      expect(screen.getByText("88%")).toBeTruthy();
      expect(screen.getByText("45 دقيقة")).toBeTruthy();
      expect(screen.getByText("لا توجد بيانات تقييم وقت أو مهام مطابقة في هذه الفترة")).toBeTruthy();
    });

    it("renders evaluation tasks table with metrics and return reason labels", () => {
      const tasks: TimeEvaluationTask[] = [
        {
          taskId: "t-1",
          title: "Build Checkout Flow",
          status: "IN_REVIEW",
          assignedTo: "u-1",
          assigneeName: "Omar",
          projectName: "Swan Storefront",
          estimatedMinutes: 120,
          estimatedHours: 2,
          actualMinutes: 150,
          actualHours: 2.5,
          diffMinutes: 30,
          diffHours: 0.5,
          diffPct: 25,
          accuracyPct: 75,
          sessionsCount: 3,
          firstSession: "2026-10-20T10:00:00Z",
          lastSession: "2026-10-21T10:00:00Z",
          reworkMinutes: 20,
          returnReasonType: "QUALITY",
          returnSeverity: 2,
        },
      ];

      render(<TimeReportsEvaluationTab summary={null} tasks={tasks} />);

      expect(screen.getByText("Build Checkout Flow")).toBeTruthy();
      expect(screen.getByText("Omar")).toBeTruthy();
      expect(screen.getByText("IN_REVIEW")).toBeTruthy();
      expect(screen.getByText("2 س")).toBeTruthy();
      expect(screen.getByText("2.5 س")).toBeTruthy();
      expect(screen.getByText("جودة دون المستوى المطلوب")).toBeTruthy();
      expect(screen.getByText("(متوسط)")).toBeTruthy();
      expect(screen.getByText("20 د")).toBeTruthy();
    });
  });

  describe("TimeReportsUsersTab", () => {
    it("renders empty state when no users", () => {
      render(<TimeReportsUsersTab userStats={[]} totalMinutes={0} />);
      expect(screen.getByText("لا توجد بيانات")).toBeTruthy();
    });

    it("renders user cards with rank and progress width", () => {
      const userStats: UserTimeStats[] = [
        {
          userId: "u-1",
          userName: "Sara",
          totalMinutes: 120,
          tasksCount: 4,
        },
      ];

      render(<TimeReportsUsersTab userStats={userStats} totalMinutes={240} />);
      expect(screen.getByText("Sara")).toBeTruthy();
      expect(screen.getByText("2س 0د")).toBeTruthy();
      expect(screen.getByText("(4 سجل)")).toBeTruthy();
    });
  });

  describe("TimeReportsProjectsTab", () => {
    it("renders empty state when no projects", () => {
      render(<TimeReportsProjectsTab projectStats={[]} totalMinutes={0} />);
      expect(screen.getByText("لا توجد بيانات")).toBeTruthy();
    });

    it("renders project cards with rank and progress width", () => {
      const projectStats: ProjectTimeStats[] = [
        {
          projectId: "p-1",
          projectName: "Platform V2",
          totalMinutes: 180,
          tasksCount: 5,
        },
      ];

      render(<TimeReportsProjectsTab projectStats={projectStats} totalMinutes={360} />);
      expect(screen.getByText("Platform V2")).toBeTruthy();
      expect(screen.getByText("3س 0د")).toBeTruthy();
      expect(screen.getByText("(5 سجل)")).toBeTruthy();
    });
  });

  describe("TimeReportsDailyTab", () => {
    it("renders empty state when no daily stats", () => {
      render(<TimeReportsDailyTab dailyStats={[]} />);
      expect(screen.getByText("لا توجد بيانات")).toBeTruthy();
    });

    it("renders daily cards with percentage of 8-hour workday", () => {
      const dailyStats: DailyStats[] = [
        {
          date: "2026-10-28",
          totalMinutes: 240,
          entriesCount: 3,
        },
      ];

      render(<TimeReportsDailyTab dailyStats={dailyStats} />);
      expect(screen.getByText("4س 0د")).toBeTruthy();
      expect(screen.getByText("(3 سجل)")).toBeTruthy();
      expect(screen.getByText("50% من يوم العمل")).toBeTruthy();
    });
  });
});
