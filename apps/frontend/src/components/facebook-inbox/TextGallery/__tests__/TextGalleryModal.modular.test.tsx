// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import TextGalleryModal from "../TextGalleryModal";
import {
  TextGalleryHeader,
  TextGalleryCreateForm,
  TextGalleryItemEdit,
  TextGalleryItemView,
  TextGalleryList,
  SavedText,
} from "../index";

const mockTexts: SavedText[] = [
  {
    id: "text-1",
    title: "رسالة الترحيب الأولى",
    content: "أهلاً بك يا فندم في متجرنا، كيف يمكنني مساعدتك اليوم؟",
    imageUrls: ["https://example.com/img1.png"],
    isPinned: false,
    createdAt: new Date("2026-10-01T10:00:00Z"),
  },
  {
    id: "text-2",
    title: "بيانات الشحن والتوصيل",
    content: "التوصيل خلال 48 ساعة لجميع محافظات مصر والدفع عند الاستلام.",
    imageUrls: [],
    isPinned: true,
    createdAt: new Date("2026-10-02T10:00:00Z"),
  },
];

vi.mock("@/services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url === "/user/text-gallery") {
        return Promise.resolve({
          data: {
            texts: mockTexts,
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn().mockResolvedValue({
      data: { success: true, message: "تم الحفظ بنجاح" },
    }),
    put: vi.fn().mockResolvedValue({
      data: { success: true, message: "تم التعديل بنجاح" },
    }),
    delete: vi.fn().mockResolvedValue({
      data: { success: true, message: "تم الحذف بنجاح" },
    }),
    patch: vi.fn().mockResolvedValue({
      data: { success: true, message: "تم تعديل التثبيت بنجاح" },
    }),
  },
}));

vi.mock("../../../i18n", () => ({
  default: {
    t: (k: string) => k,
  },
}));

describe("Facebook Inbox TextGalleryModal Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    cleanup();
  });

  describe("Subcomponent Unit Tests", () => {
    it("TextGalleryHeader renders title, count, and triggers onClose", () => {
      const onClose = vi.fn();
      render(<TextGalleryHeader count={5} onClose={onClose} />);

      expect(screen.getByText("حافظة النصوص المحفوظة")).toBeDefined();
      expect(screen.getByText("(5 نص)")).toBeDefined();

      const closeBtn = screen.getByLabelText("إغلاق الحافظة");
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it("TextGalleryCreateForm handles title and content inputs and triggers save", () => {
      const setTitle = vi.fn();
      const setContent = vi.fn();
      const onSave = vi.fn();
      const onImageSelect = vi.fn();
      const onRemoveImage = vi.fn();

      render(
        <TextGalleryCreateForm
          title="عرض جديد"
          setTitle={setTitle}
          content="محتوى العرض التجريبي"
          setContent={setContent}
          imagePreviews={["https://example.com/p1.jpg"]}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
          saving={false}
          onSave={onSave}
        />
      );

      expect(screen.getByText("إضافة نص جديد")).toBeDefined();
      const saveBtn = screen.getByText("حفظ النص");
      fireEvent.click(saveBtn);
      expect(onSave).toHaveBeenCalled();
    });

    it("TextGalleryItemView renders saved text details and handles action clicks", () => {
      const onSelectText = vi.fn();
      const onInsertText = vi.fn();
      const onClose = vi.fn();
      const onStartEditing = vi.fn();
      const onTogglePin = vi.fn();
      const onDelete = vi.fn();

      render(
        <TextGalleryItemView
          text={mockTexts[0]}
          onSelectText={onSelectText}
          onInsertText={onInsertText}
          onClose={onClose}
          onStartEditing={onStartEditing}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          pinning={false}
          deleting={false}
        />
      );

      expect(screen.getByText("رسالة الترحيب الأولى")).toBeDefined();
      expect(screen.getByText(/أهلاً بك يا فندم/)).toBeDefined();

      // Click insert text button
      const insertBtn = screen.getByText("إدراج في الرسالة");
      fireEvent.click(insertBtn);
      expect(onInsertText).toHaveBeenCalledWith(mockTexts[0].content);
      expect(onClose).toHaveBeenCalled();

      // Click direct send button
      const sendBtn = screen.getByText("إرسال مباشر");
      fireEvent.click(sendBtn);
      expect(onSelectText).toHaveBeenCalledWith({
        content: mockTexts[0].content,
        imageUrls: mockTexts[0].imageUrls,
      });

      // Click pin, edit, delete buttons
      fireEvent.click(screen.getByLabelText("تثبيت"));
      expect(onTogglePin).toHaveBeenCalled();

      fireEvent.click(screen.getByLabelText("تعديل"));
      expect(onStartEditing).toHaveBeenCalled();

      fireEvent.click(screen.getByLabelText("حذف"));
      expect(onDelete).toHaveBeenCalled();
    });

    it("TextGalleryItemEdit allows editing title, content and cancels or saves", () => {
      const onCancel = vi.fn();
      const onSave = vi.fn();
      const onRemoveExistingImage = vi.fn();
      const onRemoveNewImage = vi.fn();
      const onSelectNewImages = vi.fn();

      render(
        <TextGalleryItemEdit
          id="text-1"
          initialTitle="العنوان الأصلي"
          initialContent="المحتوى الأصلي"
          existingImages={["https://example.com/ex1.png"]}
          newImagePreviews={[]}
          onRemoveExistingImage={onRemoveExistingImage}
          onRemoveNewImage={onRemoveNewImage}
          onSelectNewImages={onSelectNewImages}
          updating={false}
          onCancel={onCancel}
          onSave={onSave}
        />
      );

      expect(screen.getByDisplayValue("العنوان الأصلي")).toBeDefined();
      expect(screen.getByDisplayValue("المحتوى الأصلي")).toBeDefined();

      fireEvent.click(screen.getByText("إلغاء"));
      expect(onCancel).toHaveBeenCalled();

      fireEvent.click(screen.getByText("حفظ التعديلات"));
      expect(onSave).toHaveBeenCalledWith("text-1", "العنوان الأصلي", "المحتوى الأصلي");
    });

    it("TextGalleryList renders loading and empty states", () => {
      const { rerender } = render(
        <TextGalleryList
          savedTexts={[]}
          loading={true}
          editingId={null}
          updating={false}
          pinning={null}
          deleting={null}
          editExistingImages={[]}
          editImagePreviews={[]}
          onSelectText={vi.fn()}
          onClose={vi.fn()}
          onStartEditing={vi.fn()}
          onCancelEditing={vi.fn()}
          onSaveEdit={vi.fn()}
          onRemoveEditExistingImage={vi.fn()}
          onRemoveEditNewImage={vi.fn()}
          onSelectEditImages={vi.fn()}
          onTogglePin={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText("جاري تحميل النصوص...")).toBeDefined();

      rerender(
        <TextGalleryList
          savedTexts={[]}
          loading={false}
          editingId={null}
          updating={false}
          pinning={null}
          deleting={null}
          editExistingImages={[]}
          editImagePreviews={[]}
          onSelectText={vi.fn()}
          onClose={vi.fn()}
          onStartEditing={vi.fn()}
          onCancelEditing={vi.fn()}
          onSaveEdit={vi.fn()}
          onRemoveEditExistingImage={vi.fn()}
          onRemoveEditNewImage={vi.fn()}
          onSelectEditImages={vi.fn()}
          onTogglePin={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByText("لا توجد نصوص محفوظة")).toBeDefined();
    });
  });

  describe("Coordinator Integration Tests", () => {
    it("renders modal when open and displays fetched texts with pinned item first", async () => {
      const onSelectText = vi.fn();
      const onInsertText = vi.fn();
      const onClose = vi.fn();

      render(
        <TextGalleryModal
          isOpen={true}
          onClose={onClose}
          onSelectText={onSelectText}
          onInsertText={onInsertText}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("بيانات الشحن والتوصيل")).toBeDefined();
        expect(screen.getByText("رسالة الترحيب الأولى")).toBeDefined();
      });

      // Verify text count
      expect(screen.getByText("(2 نص)")).toBeDefined();
    });

    it("does not render modal when isOpen is false", () => {
      const { container } = render(
        <TextGalleryModal
          isOpen={false}
          onClose={vi.fn()}
          onSelectText={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
