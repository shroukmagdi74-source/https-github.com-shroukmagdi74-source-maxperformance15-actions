// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  getPriorityColor,
  getPriorityText,
  TaskTemplatesHeader,
  TaskTemplatesEmptyState,
  TaskTemplateCard,
  CreateTemplateModal,
  EditTemplateModal,
  TaskTemplate,
  Project,
  Category,
  NewTemplatePayload,
} from "../templates";

vi.mock("../../../i18n", () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: "ar" },
    }),
  };
});

describe("TaskTemplates Modular Subcomponents", () => {
  afterEach(() => {
    cleanup();
  });

  const mockTemplate: TaskTemplate = {
    id: "tpl-1",
    name: "مهمة مراجعة التصميم",
    description: "قالب لفحص تصاميم الواجهات",
    taskTitle: "مراجعة شاشات UI",
    taskDescription: "فحص ريسبونسيف الموبايل ومطابقة الديزاين",
    priority: "high",
    type: "general",
    estimatedHours: 4,
    tags: ["تصميم", "موبايل"],
    projectId: "proj-1",
    categoryId: "cat-1",
    usageCount: 12,
    createdAt: "2026-10-01",
    updatedAt: "2026-10-15",
  };

  const mockProjects: Project[] = [
    { id: "proj-1", name: "منصة MaxP" },
    { id: "proj-2", name: "متجر سوان" },
  ];

  const mockCategories: Category[] = [
    { id: "cat-1", name: "تصميم" },
    { id: "cat-2", name: "برمجة" },
  ];

  describe("helpers", () => {
    it("returns correct priority colors", () => {
      expect(getPriorityColor("urgent")).toContain("red");
      expect(getPriorityColor("high")).toContain("orange");
      expect(getPriorityColor("medium")).toContain("yellow");
      expect(getPriorityColor("low")).toContain("green");
      expect(getPriorityColor("unknown")).toContain("gray");
    });

    it("returns correct priority text", () => {
      expect(getPriorityText("urgent")).toBe("عاجل");
      expect(getPriorityText("high")).toBe("عالي");
      expect(getPriorityText("medium")).toBe("متوسط");
      expect(getPriorityText("low")).toBe("منخفض");
      expect(getPriorityText("other")).toBe("other");
    });
  });

  describe("TaskTemplatesHeader", () => {
    it("renders title, back link, and handles new template button click", () => {
      const onOpenCreateModal = vi.fn();
      render(
        <MemoryRouter>
          <TaskTemplatesHeader onOpenCreateModal={onOpenCreateModal} />
        </MemoryRouter>
      );

      expect(screen.getByText("قوالب المهام")).toBeInTheDocument();
      expect(screen.getByText("العودة")).toBeInTheDocument();

      const btn = screen.getByRole("button", { name: /قالب جديد/i });
      fireEvent.click(btn);
      expect(onOpenCreateModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("TaskTemplatesEmptyState", () => {
    it("renders empty state message and trigger button", () => {
      const onOpenCreateModal = vi.fn();
      render(<TaskTemplatesEmptyState onOpenCreateModal={onOpenCreateModal} />);

      expect(screen.getByText("لا توجد قوالب بعد")).toBeInTheDocument();
      const btn = screen.getByRole("button", { name: /إنشاء أول قالب/i });
      fireEvent.click(btn);
      expect(onOpenCreateModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("TaskTemplateCard", () => {
    it("renders template info, tags, hours, usage count, and triggers actions", () => {
      const onUse = vi.fn();
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TaskTemplateCard
          template={mockTemplate}
          onUse={onUse}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText("مهمة مراجعة التصميم")).toBeInTheDocument();
      expect(screen.getByText("قالب لفحص تصاميم الواجهات")).toBeInTheDocument();
      expect(screen.getByText("مراجعة شاشات UI")).toBeInTheDocument();
      expect(screen.getByText("عالي")).toBeInTheDocument();
      expect(screen.getByText(/4 ساعة/)).toBeInTheDocument();
      expect(screen.getByText(/استُخدم 12 مرة/)).toBeInTheDocument();
      expect(screen.getByText("تصميم")).toBeInTheDocument();
      expect(screen.getByText("موبايل")).toBeInTheDocument();

      const useBtn = screen.getByRole("button", { name: /استخدام/i });
      fireEvent.click(useBtn);
      expect(onUse).toHaveBeenCalledWith(mockTemplate);

      const editBtn = screen.getByRole("button", { name: "تعديل القالب" });
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalledWith(mockTemplate);

      const deleteBtn = screen.getByRole("button", { name: "حذف القالب" });
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith("tpl-1");
    });
  });

  describe("CreateTemplateModal", () => {
    const defaultPayload: NewTemplatePayload = {
      name: "",
      description: "",
      taskTitle: "",
      taskDescription: "",
      priority: "medium",
      type: "general",
      estimatedHours: 0,
      tags: [],
      projectId: "",
      categoryId: "",
    };

    it("returns null when not open", () => {
      const { container } = render(
        <CreateTemplateModal
          isOpen={false}
          onClose={vi.fn()}
          newTemplate={defaultPayload}
          setNewTemplate={vi.fn()}
          projects={mockProjects}
          categories={mockCategories}
          tagInput=""
          setTagInput={vi.fn()}
          addTag={vi.fn()}
          removeTag={vi.fn()}
          onCreate={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders modal form and handles action triggers", () => {
      const onClose = vi.fn();
      const onCreate = vi.fn();
      const setNewTemplate = vi.fn();

      render(
        <CreateTemplateModal
          isOpen={true}
          onClose={onClose}
          newTemplate={{ ...defaultPayload, name: "قالب تجريبي", tags: ["تجربة"] }}
          setNewTemplate={setNewTemplate}
          projects={mockProjects}
          categories={mockCategories}
          tagInput=""
          setTagInput={vi.fn()}
          addTag={vi.fn()}
          removeTag={vi.fn()}
          onCreate={onCreate}
        />
      );

      expect(screen.getByText("إنشاء قالب جديد")).toBeInTheDocument();
      expect(screen.getByDisplayValue("قالب تجريبي")).toBeInTheDocument();
      expect(screen.getByText("تجربة")).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: /إلغاء/i });
      fireEvent.click(cancelBtn);
      expect(onClose).toHaveBeenCalled();

      const saveBtn = screen.getByRole("button", { name: /إنشاء القالب/i });
      fireEvent.click(saveBtn);
      expect(onCreate).toHaveBeenCalled();
    });
  });

  describe("EditTemplateModal", () => {
    it("returns null when closed or editingTemplate is null", () => {
      const { container } = render(
        <EditTemplateModal
          isOpen={false}
          onClose={vi.fn()}
          editingTemplate={null}
          setEditingTemplate={vi.fn()}
          onUpdate={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders edit inputs and triggers onUpdate and onClose", () => {
      const onClose = vi.fn();
      const onUpdate = vi.fn();
      const setEditingTemplate = vi.fn();

      render(
        <EditTemplateModal
          isOpen={true}
          onClose={onClose}
          editingTemplate={mockTemplate}
          setEditingTemplate={setEditingTemplate}
          onUpdate={onUpdate}
        />
      );

      expect(screen.getByText("تعديل القالب")).toBeInTheDocument();
      expect(screen.getByDisplayValue("مهمة مراجعة التصميم")).toBeInTheDocument();
      expect(screen.getByDisplayValue("مراجعة شاشات UI")).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: /إلغاء/i });
      fireEvent.click(cancelBtn);
      expect(onClose).toHaveBeenCalled();

      const saveBtn = screen.getByRole("button", { name: /حفظ التغييرات/i });
      fireEvent.click(saveBtn);
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});
