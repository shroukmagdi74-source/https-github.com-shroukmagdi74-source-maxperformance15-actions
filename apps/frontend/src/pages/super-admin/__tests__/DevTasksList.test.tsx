// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

afterEach(() => {
  cleanup();
});
import {
  Task,
  Pagination,
  DevTasksStats,
  DevTasksFilters,
} from "../dev-tasks-list/types";
import { DevTasksHeader } from "../dev-tasks-list/DevTasksHeader";
import { DevTasksStatsRibbon } from "../dev-tasks-list/DevTasksStatsRibbon";
import { DevTasksFilterBar } from "../dev-tasks-list/DevTasksFilterBar";
import { DevTasksBulkBar } from "../dev-tasks-list/DevTasksBulkBar";
import { DevTasksTable } from "../dev-tasks-list/DevTasksTable";
import { DevTasksPagination } from "../dev-tasks-list/DevTasksPagination";
import { DevTasksConfirmModal } from "../dev-tasks-list/DevTasksConfirmModal";

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Implement OAuth Login",
    description: "Connect Facebook and Google OAuth",
    type: "FEATURE",
    status: "IN_PROGRESS",
    priority: "HIGH",
    component: "backend",
    assigneeId: "user-1",
    assigneeName: "Ahmed Ali",
    assigneeAvatar: null,
    reporterName: "Super Admin",
    projectId: "proj-1",
    projectName: "MaxP Platform",
    projectColor: "#3b82f6",
    releaseId: "rel-1",
    releaseVersion: "1.0.0",
    dueDate: "2026-11-01",
    estimatedHours: 12,
    actualHours: 4,
    progress: 35,
    tags: ["auth", "security"],
    commentsCount: 3,
    attachmentsCount: 1,
    subtasksCount: 2,
    createdAt: "2026-10-20",
    updatedAt: "2026-10-25",
  },
  {
    id: "task-2",
    title: "Fix Mobile Menu Padding",
    description: "Align single-depth containers on iOS",
    type: "BUG",
    status: "DONE",
    priority: "CRITICAL",
    component: "frontend",
    assigneeId: "user-2",
    assigneeName: "Sara QA",
    assigneeAvatar: null,
    reporterName: "Lead Dev",
    projectId: "proj-1",
    projectName: "MaxP Platform",
    projectColor: "#3b82f6",
    releaseId: null,
    releaseVersion: null,
    dueDate: null,
    estimatedHours: 2,
    actualHours: 2,
    progress: 100,
    tags: ["mobile", "css"],
    commentsCount: 0,
    attachmentsCount: 0,
    subtasksCount: 0,
    createdAt: "2026-10-24",
    updatedAt: "2026-10-26",
  },
];

const mockStats: DevTasksStats = {
  overview: {
    totalTasks: 42,
    overdueTasks: 3,
    activeProjects: 5,
  },
  tasksByStatus: {
    IN_PROGRESS: 14,
    DONE: 25,
  },
};

const mockPagination: Pagination = {
  total: 42,
  page: 1,
  limit: 20,
  totalPages: 3,
};

const mockFilters: DevTasksFilters = {
  search: "",
  status: "",
  priority: "",
  type: "",
  projectId: "",
  assigneeId: "",
  component: "",
  releaseId: "",
  dueDateFrom: "",
  dueDateTo: "",
  tags: "",
  dateType: "dueDate",
};

describe("DevTasksList Modular Subcomponents Unit Tests", () => {
  it("renders DevTasksHeader with title, count, and export actions", () => {
    const onExport = vi.fn();
    render(
      <MemoryRouter>
        <DevTasksHeader total={42} onExport={onExport} />
      </MemoryRouter>,
    );

    expect(screen.getByText("قائمة المهام")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("تصدير CSV")).toBeDefined();
    expect(screen.getByText("Kanban")).toBeDefined();
    expect(screen.getByText("مهمة جديدة")).toBeDefined();
  });

  it("renders DevTasksStatsRibbon telemetry values accurately", () => {
    render(<DevTasksStatsRibbon stats={mockStats} />);

    expect(screen.getByText("المهام النشطة")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("قيد العمل")).toBeDefined();
    expect(screen.getByText("14")).toBeDefined();
    expect(screen.getByText("مكتملة")).toBeDefined();
    expect(screen.getByText("25")).toBeDefined();
    expect(screen.getByText("متأخرة")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("مشاريع نشطة")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });

  it("renders DevTasksFilterBar with quick controls", () => {
    const dummySetFilters = vi.fn();
    const dummySetHideCompleted = vi.fn();
    const dummySetShowMyTasksOnly = vi.fn();
    const dummyHandleSearch = vi.fn();
    const dummyHandleFilterChange = vi.fn();
    const dummyClearFilters = vi.fn();
    const dummyOnOpenSidebar = vi.fn();

    render(
      <DevTasksFilterBar
        filters={mockFilters}
        setFilters={dummySetFilters}
        settings={null}
        hideCompleted={true}
        setHideCompleted={dummySetHideCompleted}
        showMyTasksOnly={false}
        setShowMyTasksOnly={dummySetShowMyTasksOnly}
        handleSearch={dummyHandleSearch}
        handleFilterChange={dummyHandleFilterChange}
        clearFilters={dummyClearFilters}
        onOpenSidebar={dummyOnOpenSidebar}
      />,
    );

    expect(screen.getByPlaceholderText("بحث في المهام بالاسم، الوصف، أو الرقم...")).toBeDefined();
    expect(screen.getByText("كل الحالات")).toBeDefined();
    expect(screen.getByText("كل الأولويات")).toBeDefined();
    expect(screen.getByText("كل الأنواع")).toBeDefined();
    expect(screen.getByText("إخفاء المكتملة")).toBeDefined();
    expect(screen.getByText("مهامي فقط")).toBeDefined();
    expect(screen.getByText("فلاتر متقدمة")).toBeDefined();
  });

  it("renders DevTasksBulkBar when tasks are selected", () => {
    const dummySetBulkAction = vi.fn();
    const dummyOnDeselectAll = vi.fn();
    const dummyOnExecute = vi.fn();

    render(
      <DevTasksBulkBar
        selectedCount={5}
        bulkAction=""
        setBulkAction={dummySetBulkAction}
        teamMembers={[{ id: "m1", userId: "u1", name: "Ahmed" }]}
        onDeselectAll={dummyOnDeselectAll}
        onExecute={dummyOnExecute}
      />,
    );

    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("إلغاء التحديد")).toBeDefined();
    expect(screen.getByText("اختر إجراء...")).toBeDefined();
  });

  it("renders DevTasksTable rows, badges, and progress meters", () => {
    const dummyOnSort = vi.fn();
    const dummyOnToggleSelectAll = vi.fn();
    const dummyOnToggleSelectTask = vi.fn();
    const dummyOnDeleteTask = vi.fn();
    const dummyOnRetry = vi.fn();

    render(
      <MemoryRouter>
        <DevTasksTable
          tasks={mockTasks}
          loading={false}
          error={null}
          selectedTasks={["task-1"]}
          sortBy="updatedAt"
          sortOrder="desc"
          settings={null}
          userPermissions={{ canEdit: true, canDelete: true }}
          onSort={dummyOnSort}
          onToggleSelectAll={dummyOnToggleSelectAll}
          onToggleSelectTask={dummyOnToggleSelectTask}
          onDeleteTask={dummyOnDeleteTask}
          onRetry={dummyOnRetry}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Implement OAuth Login")).toBeDefined();
    expect(screen.getByText("Fix Mobile Menu Padding")).toBeDefined();
    expect(screen.getByText("Ahmed Ali")).toBeDefined();
    expect(screen.getByText("Sara QA")).toBeDefined();
    expect(screen.getByText("35%")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("renders DevTasksPagination with current range and total", () => {
    const onPageChange = vi.fn();
    const onLimitChange = vi.fn();

    render(
      <DevTasksPagination
        pagination={mockPagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />,
    );

    expect(screen.getByText("صفحة 1 من 3")).toBeDefined();
    expect(screen.getByText("20 / صفحة")).toBeDefined();
  });

  it("renders DevTasksConfirmModal and responds to confirm/cancel", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <DevTasksConfirmModal
        modal={{
          show: true,
          title: "حذف مهمة",
          message: "هل أنت متأكد من الحذف؟",
          onConfirm,
        }}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText("حذف مهمة")).toBeDefined();
    expect(screen.getByText("هل أنت متأكد من الحذف؟")).toBeDefined();

    fireEvent.click(screen.getByText("تأكيد الحذف"));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByText("إلغاء"));
    expect(onCancel).toHaveBeenCalled();
  });
});
