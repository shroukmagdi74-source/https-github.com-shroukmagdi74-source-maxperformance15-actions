// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TaskPerformanceCard from "../hr/monitor/components/TaskPerformanceCard";

describe("TaskPerformanceCard Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders task metrics, completed tasks, and open tasks", () => {
    render(
      <TaskPerformanceCard
        totalActiveSeconds={14400}
        totalIdleSeconds={1800}
        taskPerformance={{
          tasksCompletedCount: 3,
          tasksOpenCount: 2,
          tasksOverdueCount: 1,
          tasksCreatedCount: 1,
          tasksPerHour: 0.75,
          avgActiveSecondsPerTask: 4800,
          avgIdleSecondsPerTask: 600,
          activeRatioPct: 89,
          idleRatioPct: 11,
          idleToActiveRatio: "0.1",
          tasks: [
            {
              id: "t-1",
              title: "تطوير واجهة التقارير",
              status: "COMPLETED",
              priority: "HIGH",
              projectName: "منصة الموارد البشرية",
              completedAt: "2026-10-25T14:00:00.000Z",
            },
          ],
          openTasks: [
            {
              id: "t-2",
              title: "مراجعة الأداء الأمني",
              status: "IN_PROGRESS",
              priority: "URGENT",
              projectName: "الأمن السيبراني",
            },
          ],
          createdTasks: [
            {
              id: "t-3",
              title: "تحديث دليل الموظف",
              assignedToName: "هدى سامي",
              projectName: "العمليات",
            },
          ],
        }}
      />
    );

    expect(screen.getByText("3 مهام منفذة")).toBeTruthy();
    expect(screen.getByText("2 قيد التنفيذ")).toBeTruthy();
    expect(screen.getByText("تطوير واجهة التقارير")).toBeTruthy();
    expect(screen.getByText("مراجعة الأداء الأمني")).toBeTruthy();
    expect(screen.getByText("تحديث دليل الموظف")).toBeTruthy();
  });
});
