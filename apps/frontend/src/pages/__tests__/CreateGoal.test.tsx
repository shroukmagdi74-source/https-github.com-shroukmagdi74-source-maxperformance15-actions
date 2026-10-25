/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CreateGoal from "../hr/CreateGoal";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
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
    info: vi.fn(),
  },
}));

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "يوسف",
    lastName: "كمال",
    employeeNumber: "EMP301",
  },
];

const mockDepartments = [
  {
    id: "dept-1",
    name: "قسم المبيعات",
  },
];

const mockProjects = [
  {
    id: "proj-1",
    name: "مشروع المنصة الرقمية",
  },
];

const mockTasks = [
  {
    id: "task-1",
    title: "إعداد واجهة المتجر",
    status: "TODO",
    measurementType: "COUNT",
    metricTargetValue: 50,
  },
];

const mockGoals = [
  {
    id: "goal-parent-1",
    title: "هدف الربع الرابع للشركة",
    goalType: "COMPANY",
  },
];

describe("CreateGoal Page Component (Batch 496)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/employees")) {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      if (url.startsWith("/hr/departments")) {
        return Promise.resolve({ data: { departments: mockDepartments } });
      }
      if (url.startsWith("/projects")) {
        return Promise.resolve({ data: { data: mockProjects } });
      }
      if (url.startsWith("/tasks?limit=200")) {
        return Promise.resolve({ data: { data: mockTasks } });
      }
      if (url.startsWith("/tasks/goals?includeDaily=false")) {
        return Promise.resolve({ data: { goals: mockGoals } });
      }
      return Promise.resolve({ data: {} });
    });
    (api.post as any).mockResolvedValue({ data: { success: true } });
    (api.put as any).mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders new goal creation mode properly", async () => {
    render(
      <MemoryRouter initialEntries={["/goals/new"]}>
        <Routes>
          <Route path="/goals/new" element={<CreateGoal />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("بناء هدف جديد")).toBeTruthy();
      expect(screen.getByText("تعريف الهدف")).toBeTruthy();
      expect(screen.getByText("هدف مشروع")).toBeTruthy();
      expect(screen.getByText("هدف موظف")).toBeTruthy();
      expect(screen.getByText("توزيع الهدف على الفريق")).toBeTruthy();
      expect(screen.getAllByText("المهام المرتبطة").length).toBeGreaterThan(0);
      expect(screen.getByText("ملخص الهدف")).toBeTruthy();
    });
  });

  it("switches goal type to employee and shows employee specific fields", async () => {
    render(
      <MemoryRouter initialEntries={["/goals/new"]}>
        <Routes>
          <Route path="/goals/new" element={<CreateGoal />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("هدف موظف")).toBeTruthy();
    });

    const employeeGoalButton = screen.getByText("هدف موظف");
    fireEvent.click(employeeGoalButton);

    await waitFor(() => {
      expect(screen.getByText("الموظف المسؤول")).toBeTruthy();
      expect(screen.getByText("توليد أهداف يومية")).toBeTruthy();
      // Team assignment section should NOT be visible when not a project goal
      expect(screen.queryByText("توزيع الهدف على الفريق")).toBeNull();
    });
  });

  it("renders projects in project selector", async () => {
    render(
      <MemoryRouter initialEntries={["/goals/new"]}>
        <Routes>
          <Route path="/goals/new" element={<CreateGoal />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("مشروع المنصة الرقمية")).toBeTruthy();
    });
  });

  it("allows toggling linked tasks", async () => {
    render(
      <MemoryRouter initialEntries={["/goals/new"]}>
        <Routes>
          <Route path="/goals/new" element={<CreateGoal />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إعداد واجهة المتجر")).toBeTruthy();
    });

    const taskButton = screen.getByText("إعداد واجهة المتجر");
    fireEvent.click(taskButton);

    // Sidebar linked tasks count should update to 1
    await waitFor(() => {
      expect(screen.getByText("1")).toBeTruthy();
    });
  });
});
