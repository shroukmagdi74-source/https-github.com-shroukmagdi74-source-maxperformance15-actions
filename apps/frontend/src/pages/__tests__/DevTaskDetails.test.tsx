/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DevTaskDetails from "../super-admin/DevTaskDetails";

vi.mock("../../utils/tokenManager", () => ({
  default: {
    getAccessToken: () => "mock-access-token",
  },
  tokenManager: {
    getAccessToken: () => "mock-access-token",
  },
}));

vi.mock("../../i18n", () => ({
  default: {
    dir: () => "rtl",
  },
}));

vi.mock("../../contexts/TimerContext", () => ({
  useTimer: () => ({
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    getTimerForTask: vi.fn().mockReturnValue(null),
    getElapsedSecondsForTask: vi.fn().mockReturnValue(125),
  }),
}));

const mockTaskData = {
  id: "dev-task-123",
  title: "إعادة بناء وتفكيك الصفحات المعيارية",
  description: "تفكيك DevTaskDetails.tsx إلى مكونات مستقلة تحت 300 سطر",
  status: "IN_PROGRESS",
  priority: "HIGH",
  type: "FEATURE",
  assignee: {
    user: {
      id: "user-101",
      firstName: "أحمد",
      lastName: "المهندس",
    },
  },
  reporter: {
    user: {
      firstName: "مختار",
      lastName: "الحناوي",
    },
  },
  project: {
    name: "MaxP Platform",
    color: "#4f46e5",
  },
  estimatedHours: 8,
  actualHours: 4,
  subtasks: [
    {
      id: "sub-1",
      title: "تجهيز useDevTaskDetailsController",
      status: "COMPLETED",
      priority: "HIGH",
    },
  ],
  checklists: [
    {
      id: "chk-1",
      title: "قائمة التحقق المعمارية",
      items: [
        { id: "item-1", content: "عزل المودالات", isCompleted: true },
        { id: "item-2", content: "اختبارات الوحدة", isCompleted: false },
      ],
    },
  ],
  comments: [
    {
      id: "comment-1",
      author: {
        user: {
          firstName: "مختار",
          lastName: "الحناوي",
        },
      },
      content: "تم تقسيم الشاشة بنجاح وفصل المودالات.",
      createdAt: "2026-10-25T01:30:00Z",
    },
  ],
  attachments: [
    {
      id: "att-1",
      fileName: "architecture.pdf",
      originalName: "architecture.pdf",
      fileSize: 204800,
      createdAt: "2026-10-25T01:00:00Z",
    },
  ],
  timeLogs: [
    {
      id: "time-1",
      member: {
        user: {
          firstName: "أحمد",
          lastName: "المهندس",
        },
      },
      duration: 120,
      startTime: "2026-10-25T00:00:00Z",
      description: "برمجة المتحكم",
    },
  ],
  activities: [],
};

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={["/super-admin/dev-tasks/dev-task-123"]}>
      <Routes>
        <Route
          path="/super-admin/dev-tasks/:id"
          element={<DevTaskDetails />}
        />
      </Routes>
    </MemoryRouter>
  );

describe("DevTaskDetails (Batch 482)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/dev/tasks/")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
                data: mockTaskData,
              }),
          });
        }
        if (url.includes("/dev/settings")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
                data: { smartTimeTracking: true },
              }),
          });
        }
        if (url.includes("/user/permissions")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
                data: {
                  permissions: {
                    canEdit: true,
                    canDelete: true,
                  },
                },
              }),
          });
        }
        if (url.includes("/dev/team")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: true,
                data: [
                  {
                    id: "user-101",
                    userId: "user-101",
                    name: "أحمد المهندس",
                    department: "Engineering",
                    availability: "available",
                  },
                ],
              }),
          });
        }
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: {} }),
        });
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders task title, assignee, and navigation tabs cleanly", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("إعادة بناء وتفكيك الصفحات المعيارية")
      ).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: /نظرة عامة/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /المهام الفرعية/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /القوائم/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /التعليقات/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /المرفقات/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /تتبع الوقت/ })).toBeTruthy();
  });

  it("switches to checklists tab and displays checklist items", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("إعادة بناء وتفكيك الصفحات المعيارية")
      ).toBeTruthy();
    });

    const checklistsTabBtn = screen.getByRole("button", { name: /القوائم/ });
    fireEvent.click(checklistsTabBtn);

    expect(screen.getByText("قائمة التحقق المعمارية")).toBeTruthy();
    expect(screen.getByText("عزل المودالات")).toBeTruthy();
    expect(screen.getByText("اختبارات الوحدة")).toBeTruthy();
  });

  it("switches to comments tab and displays existing comment", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("إعادة بناء وتفكيك الصفحات المعيارية")
      ).toBeTruthy();
    });

    const commentsTabBtn = screen.getByRole("button", { name: /التعليقات/ });
    fireEvent.click(commentsTabBtn);

    expect(
      screen.getByText("تم تقسيم الشاشة بنجاح وفصل المودالات.")
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("اكتب تعليقاً...")).toBeTruthy();
  });

  it("switches to time tracking tab and displays timer and previous logs", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.getByText("إعادة بناء وتفكيك الصفحات المعيارية")
      ).toBeTruthy();
    });

    const timeTabBtn = screen.getByRole("button", { name: /تتبع الوقت/ });
    fireEvent.click(timeTabBtn);

    expect(screen.getByText("سجل الأوقات السابقة")).toBeTruthy();
    expect(screen.getByText("برمجة المتحكم")).toBeTruthy();
    expect(screen.getByText("ابدأ التسجيل")).toBeTruthy();
  });
});
