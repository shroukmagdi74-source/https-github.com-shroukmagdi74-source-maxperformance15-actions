// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import { MetaTemplateTableLoading } from "../table/MetaTemplateTableLoading";
import { MetaTemplateTableEmptyState } from "../table/MetaTemplateTableEmptyState";
import { MetaTemplateBulkToolbar } from "../table/MetaTemplateBulkToolbar";
import { MetaTemplateMessagePreview } from "../table/MetaTemplateMessagePreview";
import { MetaTemplateVarPlayground } from "../table/MetaTemplateVarPlayground";
import { MetaTemplateMobileCard } from "../table/MetaTemplateMobileCard";
import type { MetaTemplate } from "../types";

afterEach(() => {
  cleanup();
});

const mockTemplate: MetaTemplate = {
  id: "tpl_12345678",
  name: "welcome_offer_ar",
  status: "APPROVED",
  category: "MARKETING",
  language: "ar",
  components: [
    { type: "HEADER", format: "TEXT", text: "أهلاً بك في منصتنا" },
    { type: "BODY", text: "مرحباً {{1}}، كود الخصم هو {{2}}" },
    { type: "FOOTER", text: "تطبق الشروط والأحكام" },
    {
      type: "BUTTONS",
      buttons: [{ type: "QUICK_REPLY", text: "تفعيل الكود" }],
    },
  ],
};

describe("MetaTemplateTable Modular Subcomponents", () => {
  describe("MetaTemplateTableLoading", () => {
    it("renders loading skeletons", () => {
      const { container } = render(<MetaTemplateTableLoading />);
      expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    });
  });

  describe("MetaTemplateTableEmptyState", () => {
    it("renders session prompt when no session is selected", () => {
      render(
        <MetaTemplateTableEmptyState
          selectedSessionId=""
          onOpenCreate={vi.fn()}
          onOpenLibrary={vi.fn()}
        />
      );

      expect(screen.getByText("اختر جلسة أولاً")).toBeTruthy();
      expect(screen.queryByText("أنشئ أول قالب")).toBeNull();
    });

    it("renders action buttons when session is selected and triggers clicks", () => {
      const onCreate = vi.fn();
      const onLibrary = vi.fn();

      render(
        <MetaTemplateTableEmptyState
          selectedSessionId="sess_123"
          onOpenCreate={onCreate}
          onOpenLibrary={onLibrary}
        />
      );

      expect(screen.getByText("لا توجد قوالب بعد")).toBeTruthy();

      const createBtn = screen.getByText("أنشئ أول قالب");
      fireEvent.click(createBtn);
      expect(onCreate).toHaveBeenCalledTimes(1);

      const libraryBtn = screen.getByText("تصفّح المكتبة الجاهزة");
      fireEvent.click(libraryBtn);
      expect(onLibrary).toHaveBeenCalledTimes(1);
    });
  });

  describe("MetaTemplateBulkToolbar", () => {
    it("renders nothing when count is 0", () => {
      const { container } = render(
        <MetaTemplateBulkToolbar
          selectedCount={0}
          loading={false}
          onClearSelectedRows={vi.fn()}
          onRefresh={vi.fn()}
          onDeleteSelected={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("renders bulk count and triggers action callbacks", () => {
      const onClear = vi.fn();
      const onRefresh = vi.fn();
      const onDelete = vi.fn();

      render(
        <MetaTemplateBulkToolbar
          selectedCount={3}
          loading={false}
          onClearSelectedRows={onClear}
          onRefresh={onRefresh}
          onDeleteSelected={onDelete}
        />
      );

      expect(screen.getByText("3")).toBeTruthy();

      fireEvent.click(screen.getByText("إلغاء التحديد"));
      expect(onClear).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("تحديث المحدد"));
      expect(onRefresh).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText(/حذف المحدد/));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe("MetaTemplateMessagePreview", () => {
    it("renders WhatsApp message bubble with header, highlighted variables, and buttons", () => {
      const substituteMock = (text: string) => text;

      render(
        <MetaTemplateMessagePreview
          template={mockTemplate}
          variantKey="welcome_offer_ar::ar"
          substituteVars={substituteMock}
        />
      );

      expect(screen.getByText("أهلاً بك في منصتنا")).toBeTruthy();
      expect(screen.getByText("{{1}}")).toBeTruthy();
      expect(screen.getByText("{{2}}")).toBeTruthy();
      expect(screen.getByText("تطبق الشروط والأحكام")).toBeTruthy();
      expect(screen.getByText("تفعيل الكود")).toBeTruthy();
    });
  });

  describe("MetaTemplateVarPlayground", () => {
    it("renders variable count and toggles input playground", () => {
      const onToggle = vi.fn();
      const onChange = vi.fn();

      const { rerender } = render(
        <MetaTemplateVarPlayground
          variantKey="welcome_offer_ar::ar"
          varNumbers={["{{1}}", "{{2}}"]}
          isOpen={false}
          onToggle={onToggle}
          varPreviewValues={{ "welcome_offer_ar::ar::1": "أحمد" }}
          onVarPreviewChange={onChange}
        />
      );

      expect(screen.getByText("تجربة المتغيرات")).toBeTruthy();
      expect(screen.getByText("2")).toBeTruthy();

      fireEvent.click(screen.getByText("تجربة المتغيرات"));
      expect(onToggle).toHaveBeenCalledTimes(1);

      rerender(
        <MetaTemplateVarPlayground
          variantKey="welcome_offer_ar::ar"
          varNumbers={["{{1}}", "{{2}}"]}
          isOpen={true}
          onToggle={onToggle}
          varPreviewValues={{ "welcome_offer_ar::ar::1": "أحمد" }}
          onVarPreviewChange={onChange}
        />
      );

      const input1 = screen.getByLabelText("قيمة المتغير 1");
      expect(input1).toBeTruthy();
      expect(screen.getByDisplayValue("أحمد")).toBeTruthy();

      fireEvent.change(input1, { target: { value: "محمد" } });
      expect(onChange).toHaveBeenCalledWith("welcome_offer_ar::ar::1", "محمد");
    });
  });

  describe("MetaTemplateMobileCard", () => {
    it("renders mobile card with status and handles expand toggle", () => {
      const onToggleGroup = vi.fn();
      const onToggleRow = vi.fn();

      render(
        <MetaTemplateMobileCard
          groupName="welcome_offer_ar"
          groupTemplates={[mockTemplate]}
          isExpanded={false}
          onToggleGroup={onToggleGroup}
          isSelected={false}
          onToggleRow={onToggleRow}
          varPreviewOpen={{}}
          onToggleVarPreview={vi.fn()}
          varPreviewValues={{}}
          onVarPreviewChange={vi.fn()}
          substituteVars={(t) => t}
          onViewTemplate={vi.fn()}
          onEditTemplate={vi.fn()}
          onDeleteTemplate={vi.fn()}
        />
      );

      expect(screen.getByText("welcome_offer_ar")).toBeTruthy();
      expect(screen.getByText("APPROVED")).toBeTruthy();
      expect(screen.getByText("MARKETING")).toBeTruthy();

      fireEvent.click(screen.getByText("welcome_offer_ar"));
      expect(onToggleGroup).toHaveBeenCalledTimes(1);
    });
  });
});
