/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TaskDetailsPage from "../tasks/TaskDetails";

const mockTaskData = {
  id: "task-101",
  title: "تطوير لوحة التحكم وإعادة هيكلة الكود",
  description: "هذه المهمة تتطلب تفكيك الشاشات الضخمة إلى مكونات معيارية وحفظ التغييرات عبر بوابة التنسيق.",
  status: "IN_PROGRESS",
  priority: "HIGH",
  type: "task",
  progress: 65,
  dueDate: "2026-11-01T12:00:00Z",
  startDate: "2026-10-20T09:00:00Z",
  completedDate: null,
  estimatedHours: 40,
  actualHours: 25,
  measurementType: "TIME",
  metricUnit: null,
  metricTargetValue: null,
  metricCurrentValue: 0,
  tags: ["frontend", "refactoring"],
  color: "#6366f1",
  project: {
    id: "proj-1",
    name: "مشروع ماكس بي 2026",
  },
  assignedUser: {
    id: "user-2",
    firstName: "محمد",
    lastName: "أحمد",
    avatar: null,
  },
  createdByUser: {
    id: "user-1",
    firstName: "مختار",
    lastName: "الحناوي",
    avatar: null,
  },
  parentTask: null,
  subtasks: [
    {
      id: "sub-1",
      title: "فصل الترويسة ومربعات الإحصائيات",
      status: "COMPLETED",
      assignedUser: {
        id: "user-2",
        firstName: "محمد",
        lastName: "أحمد",
      },
    },
    {
      id: "sub-2",
      title: "كتابة اختبارات الوحدة الشاملة",
      status: "PENDING",
      assignedUser: {
        id: "user-2",
        firstName: "محمد",
        lastName: "أحمد",
      },
    },
  ],
  comments: [
    {
      id: "comm-1",
      content: "تم إنجاز الجزء الأول بنجاح @محمد",
      createdAt: "2026-10-24T14:30:00Z",
      isEdited: false,
      userId: "user-1",
      user: {
        id: "user-1",
        firstName: "مختار",
        lastName: "الحناوي",
      },
    },
  ],
  attachments: [
    {
      id: "att-1",
      originalName: "architecture-diagram.png",
      fileSize: 204800,
      filePath: "https://example.com/arch.png",
      createdAt: "2026-10-23T11:00:00Z",
      userId: "user-1",
      user: {
        id: "user-1",
        firstName: "مختار",
        lastName: "الحناوي",
      },
    },
  ],
  timeEntries: [
    {
      id: "time-1",
      duration: 150,
      startTime: "2026-10-24T10:00:00Z",
      description: "إعادة بناء وحدات إدارة المهام",
      user: {
        id: "user-2",
        firstName: "محمد",
        lastName: "أحمد",
      },
    },
  ],
  activities: [
    {
      id: "act-1",
      createdAt: "2026-10-24T15:00:00Z",
      action: "تحديث المهمة",
      description: "تم رفع نسبة الإنجاز إلى 65%",
      user: {
        id: "user-2",
        firstName: "محمد",
        lastName: "أحمد",
      },
    },
  ],
  watchersList: [
    {
      id: "user-1",
      firstName: "مختار",
      lastName: "الحناوي",
    },
  ],
  totalTimeMinutes: 150,
  totalTimeHours: 2.5,
  createdAt: "2026-10-20T09:00:00Z",
  updatedAt: "2026-10-24T15:00:00Z",
};

const mockCompanyUsers = [
  {
    id: "user-1",
    firstName: "مختار",
    lastName: "الحناوي",
  },
  {
    id: "user-2",
    firstName: "محمد",
    lastName: "أحمد",
  },
];

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      companyId: "comp-1",
      role: "COMPANY_ADMIN",
    },
  }),
}));

vi.mock("../../utils/tokenManager", () => ({
  default: {
    getAccessToken: () => "mock-token",
  },
}));

vi.mock("../../components/tasks/TaskChecklist", () => ({
  default: () => <div data-testid="task-checklist">قوائم التحقق للمهمة</div>,
}));

vi.mock("../../components/tasks/TaskDependencies", () => ({
  default: () => <div data-testid="task-dependencies">تبعيات المهمة</div>,
}));

describe("TaskDetails Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("userId", "user-1");

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/tasks/task-101/details")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: mockTaskData }),
        } as Response);
      }
      if (url.includes("/tasks/company-users")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: mockCompanyUsers }),
        } as Response);
      }
      if (url.includes("/tasks/running-timer")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: null }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      } as Response);
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders task title, badges, and project name", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-101"]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تطوير لوحة التحكم وإعادة هيكلة الكود")).toBeTruthy();
      expect(screen.getAllByText("مشروع ماكس بي 2026").length).toBeGreaterThan(0);
      expect(screen.getAllByText("قيد التنفيذ").length).toBeGreaterThan(0);
      expect(screen.getAllByText("عالي").length).toBeGreaterThan(0);
    });
  });

  it("renders overview panel with progress and dates", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-101"]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("لوحة التنفيذ")).toBeTruthy();
      expect(screen.getAllByText("65%").length).toBeGreaterThan(0);
      expect(screen.getByText("هذه المهمة تتطلب تفكيك الشاشات الضخمة إلى مكونات معيارية وحفظ التغييرات عبر بوابة التنسيق.")).toBeTruthy();
    });
  });

  it("renders subtasks tab with list of subtasks", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-101"]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("فصل الترويسة ومربعات الإحصائيات")).toBeTruthy();
      expect(screen.getByText("كتابة اختبارات الوحدة الشاملة")).toBeTruthy();
    });
  });

  it("switches tabs between subtasks, comments, time, and checklists", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-101"]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تطوير لوحة التحكم وإعادة هيكلة الكود")).toBeTruthy();
    });

    // Switch to comments tab
    const commentsTabBtn = screen.getByRole("button", { name: /التعليقات/ });
    fireEvent.click(commentsTabBtn);

    await waitFor(() => {
      expect(screen.getByText("تم إنجاز الجزء الأول بنجاح @محمد")).toBeTruthy();
      expect(screen.getByText("إرسال التعليق")).toBeTruthy();
    });

    // Switch to time tracking tab
    const timeTabBtn = screen.getByRole("button", { name: /الوقت/ });
    fireEvent.click(timeTabBtn);

    await waitFor(() => {
      expect(screen.getByText("إجمالي الوقت المسجل")).toBeTruthy();
      expect(screen.getByText("إعادة بناء وحدات إدارة المهام")).toBeTruthy();
    });

    // Switch to checklists tab
    const checklistsTabBtn = screen.getByRole("button", { name: /قوائم التحقق/ });
    fireEvent.click(checklistsTabBtn);

    await waitFor(() => {
      expect(screen.getByTestId("task-checklist")).toBeTruthy();
    });
  });

  it("renders meta sidebar with context and ownership", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks/task-101"]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("السياق والملكية")).toBeTruthy();
      expect(screen.getAllByText("محمد أحمد").length).toBeGreaterThan(0);
      expect(screen.getAllByText("مختار الحناوي").length).toBeGreaterThan(0);
    });
  });
});
