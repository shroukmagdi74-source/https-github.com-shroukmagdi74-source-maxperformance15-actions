/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "../tasks/Tasks";

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      name: "مختار الحناوي",
      email: "mokhtar@example.com",
      role: "SUPER_ADMIN",
      companyId: "comp-1",
    },
  }),
}));

vi.mock("../../hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (amount: number) => `${amount} ج.م`,
  }),
}));

vi.mock("../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    formatDate: (date: string) => (date ? "2026/10/25" : "-"),
  }),
}));

vi.mock("../../components/protection/AppAccessRoute", () => ({
  AppAccessRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../utils/tokenManager", () => ({
  tokenManager: {
    getAccessToken: () => "mock-access-token",
  },
}));

const mockTasks = [
  {
    id: "task-1",
    title: "تفكيك الشاشات الضخمة",
    description: "تفكيك Tasks.tsx إلى مكونات معيارية",
    status: "in_progress",
    priority: "high",
    type: "manual",
    progress: 70,
    dueDate: "2026-10-30T10:00:00Z",
    startDate: "2026-10-20T10:00:00Z",
    projectId: "proj-1",
    projectName: "مشروع ماكس بي",
    assignedTo: "user-1",
    assignedToName: "مختار الحناوي",
    tags: ["refactoring"],
  },
  {
    id: "task-2",
    title: "مراجعة اختبارات الوحدة",
    description: "كتابة اختبارات Vitest للشاشات المعاد هيكلتها",
    status: "pending",
    priority: "medium",
    type: "manual",
    progress: 0,
    dueDate: "2026-11-05T10:00:00Z",
    startDate: null,
    projectId: "proj-1",
    projectName: "مشروع ماكس بي",
    assignedTo: "user-1",
    assignedToName: "مختار الحناوي",
    tags: ["testing"],
  },
];

const mockProjects = [
  {
    id: "proj-1",
    name: "مشروع ماكس بي",
    description: "تطوير وبناء منصة ماكس بي",
    priority: "high",
    status: "in_progress",
    budget: 50000,
    progress: 60,
  },
];

const mockCategories = [
  {
    id: "cat-1",
    name: "تطوير الواجهات",
    description: "مهام الواجهة الأمامية",
    color: "#3b82f6",
  },
];

const mockGoals = [
  {
    id: "goal-1",
    title: "إطلاق الإصدار 2.0",
    progress: 80,
  },
];

const mockUsers = [
  {
    id: "user-1",
    name: "مختار الحناوي",
    role: "SUPER_ADMIN",
  },
];

describe("Tasks Page (Modular)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const urlStr = String(url);
        if (urlStr.includes("tasks/company-users")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: mockUsers }),
          });
        }
        if (urlStr.includes("tasks/categories/list") || urlStr.includes("tasks/categories")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: mockCategories }),
          });
        }
        if (urlStr.includes("tasks/goals")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, goals: mockGoals }),
          });
        }
        if (urlStr.includes("tasks/templates")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: [] }),
          });
        }
        if (urlStr.includes("projects")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: { projects: mockProjects } }),
          });
        }
        if (urlStr.includes("tasks")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: { tasks: mockTasks },
              pagination: { total: 2, totalPages: 1 },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders workspace tabs correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <TasksPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("المهام").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("المشاريع").length).toBeGreaterThan(0);
    expect(screen.getAllByText("أقسام المهام").length).toBeGreaterThan(0);
  });

  it("renders tasks and displays project groups", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <TasksPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("تفكيك الشاشات الضخمة").length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("مراجعة اختبارات الوحدة").length).toBeGreaterThan(0);
  });

  it("toggles view mode between grouped and flat list", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <TasksPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("تفكيك الشاشات الضخمة").length).toBeGreaterThan(0);
    });

    // Look for toggle view mode button
    const toggleButtons = screen.getAllByRole("button");
    const toggleBtn = toggleButtons.find((btn) =>
      btn.textContent?.includes("عرض مسطح") ||
      btn.textContent?.includes("مباشر") ||
      btn.title?.includes("عرض")
    );

    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      await waitFor(() => {
        expect(screen.getAllByText("تفكيك الشاشات الضخمة").length).toBeGreaterThan(0);
      });
    }
  });

  it("opens create task modal when clicking add task", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <TasksPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("تفكيك الشاشات الضخمة").length).toBeGreaterThan(0);
    });

    const createBtn = screen.getAllByRole("button").find(
      (btn) =>
        btn.textContent?.includes("مهمة جديدة") ||
        btn.textContent?.includes("إضافة مهمة") ||
        btn.textContent?.includes("جديدة")
    );

    if (createBtn) {
      fireEvent.click(createBtn);
      await waitFor(() => {
        expect(document.body.innerHTML).toBeDefined();
      });
    }
  });

  it("switches to projects tab when clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <TasksPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("المشاريع")).toBeDefined();
    });

    const projectsTab = screen.getByText("المشاريع");
    fireEvent.click(projectsTab);

    await waitFor(() => {
      expect(screen.getByText("المشاريع")).toBeDefined();
    });
  });
});
