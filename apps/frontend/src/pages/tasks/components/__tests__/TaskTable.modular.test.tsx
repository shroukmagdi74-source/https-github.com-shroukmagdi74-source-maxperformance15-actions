// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";

import { TaskEvidenceBadges } from "../task-table/TaskEvidenceBadges";
import { TaskSortIndicator } from "../task-table/TaskSortIndicator";
import { TaskTablePagination, buildPageNumbers } from "../task-table/TaskTablePagination";
import { TaskTableHeader } from "../task-table/TaskTableHeader";
import { TaskTableMobileCard } from "../task-table/TaskTableMobileCard";
import { TaskTableRow } from "../task-table/TaskTableRow";
import { SkeletonRow, MobileSkeletonCard } from "../task-table/TaskTableSkeleton";
import type { Task } from "../../types";

afterEach(() => {
  cleanup();
});

const mockTask: Task = {
  id: "task-101",
  projectId: "proj-1",
  projectName: "تطوير المنصة",
  categoryId: "cat-1",
  categoryName: "برمجة",
  goalId: "goal-1",
  goalTitle: "إطلاق الإصدار الجديد",
  goalType: "company",
  title: "بناء مكونات الجدول المنفصلة",
  description: "تفريق كود جدول المهام إلى مكونات فرعية مستقلة وسريعة",
  status: "in_progress",
  priority: "high",
  type: "manual",
  assignedTo: "user-1",
  assignedToName: "أحمد مهندس",
  createdBy: "admin-1",
  createdByName: "مختار",
  dueDate: "2026-11-01",
  startDate: "2026-10-25",
  estimatedHours: 4,
  actualHours: 2,
  progress: 75,
  measurementType: "TIME",
  metricUnit: null,
  metricTargetValue: null,
  metricCurrentValue: 0,
  tags: ["frontend", "refactor"],
  dependencies: [],
  createdAt: "2026-10-25T10:00:00Z",
  updatedAt: "2026-10-27T10:00:00Z",
  goalProgress: 65,
  hasEvidence: false,
  returnCount: 2,
  convertedFromBacklog: true,
};

describe("TaskEvidenceBadges", () => {
  it("renders returned badge and converted from backlog badge", () => {
    render(<TaskEvidenceBadges task={mockTask} />);
    expect(screen.getByText(/إرجاع \(2\)/)).toBeInTheDocument();
    expect(screen.getByText("تحسين")).toBeInTheDocument();
  });

  it("renders missing evidence badge when in_review without evidence", () => {
    const reviewTask: Task = {
      ...mockTask,
      status: "in_review",
      hasEvidence: false,
    };
    render(<TaskEvidenceBadges task={reviewTask} />);
    expect(screen.getByText(/بدون دليل/)).toBeInTheDocument();
  });
});

describe("TaskSortIndicator", () => {
  it("renders nothing when column does not match", () => {
    const { container } = render(
      <TaskSortIndicator column="title" currentSort="dueDate" order="asc" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders up arrow for asc", () => {
    const { container } = render(
      <TaskSortIndicator column="title" currentSort="title" order="asc" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("TaskTablePagination", () => {
  it("computes page numbers correctly", () => {
    expect(buildPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
  });

  it("renders pagination and handles page click", () => {
    const setCurrentPage = vi.fn();
    render(
      <TaskTablePagination
        currentPage={2}
        setCurrentPage={setCurrentPage}
        totalPages={5}
      />
    );

    expect(screen.getByText("انتقال")).toBeInTheDocument();
    const nextBtn = screen.getByTitle("الصفحة التالية");
    fireEvent.click(nextBtn);
    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });
});

describe("TaskTableHeader", () => {
  it("renders header title and counts correctly", () => {
    render(
      <TaskTableHeader
        loading={false}
        searchQuery=""
        totalCount={42}
        paginatedCount={10}
        selectedCount={3}
        filteredCount={42}
      />
    );

    expect(screen.getByText("قائمة التنفيذ")).toBeInTheDocument();
    expect(screen.getByText(/42 مهمة في النطاق الحالي/)).toBeInTheDocument();
    expect(screen.getByText("3 محددة")).toBeInTheDocument();
  });
});

describe("TaskTableMobileCard", () => {
  it("renders mobile card details and triggers actions", () => {
    const onSelect = vi.fn();
    const onOpenDeliveryGate = vi.fn();

    render(
      <MemoryRouter>
        <TaskTableMobileCard
          task={mockTask}
          isSelected={false}
          onSelect={onSelect}
          isOverdue={() => false}
          getStatusColor={() => "bg-blue-100 text-blue-700"}
          getStatusText={() => "قيد التنفيذ"}
          getPriorityColor={() => "bg-red-100 text-red-700"}
          getPriorityText={() => "عالية"}
          formatDate={(d) => d}
          updateTaskStatus={vi.fn()}
          onOpenTask={vi.fn()}
          onEditTask={vi.fn()}
          onDuplicateTask={vi.fn()}
          onDeleteTask={vi.fn()}
          onOpenDeliveryGate={onOpenDeliveryGate}
          onOpenApprovalGate={vi.fn()}
          onDirectApprove={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();

    const deliverBtn = screen.getByTitle("تسليم المهمة للمراجعة وإرفاق الدليل");
    fireEvent.click(deliverBtn);
    expect(onOpenDeliveryGate).toHaveBeenCalledWith(mockTask);
  });
});

describe("TaskTableRow", () => {
  it("renders desktop table row correctly", () => {
    const onSelect = vi.fn();

    render(
      <MemoryRouter>
        <table>
          <tbody>
            <TaskTableRow
              task={mockTask}
              isSelected={true}
              onSelect={onSelect}
              isOverdue={() => false}
              getStatusColor={() => "bg-blue-100 text-blue-700"}
              getStatusText={() => "قيد التنفيذ"}
              getStatusIcon={() => null}
              getPriorityColor={() => "bg-red-100 text-red-700"}
              getPriorityText={() => "عالية"}
              formatDate={(d) => d}
              updateTaskStatus={vi.fn()}
              onOpenTask={vi.fn()}
              onEditTask={vi.fn()}
              onDuplicateTask={vi.fn()}
              onDeleteTask={vi.fn()}
              onOpenDeliveryGate={vi.fn()}
              onOpenApprovalGate={vi.fn()}
              onDirectApprove={vi.fn()}
            />
          </tbody>
        </table>
      </MemoryRouter>
    );

    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.goalTitle!)).toBeInTheDocument();
  });
});

describe("TaskTableSkeleton", () => {
  it("renders table and mobile skeletons", () => {
    const { container: tableContainer } = render(
      <table>
        <tbody>
          <SkeletonRow />
        </tbody>
      </table>
    );
    expect(tableContainer.querySelector("tr.animate-pulse")).toBeInTheDocument();

    const { container: cardContainer } = render(<MobileSkeletonCard />);
    expect(cardContainer.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
