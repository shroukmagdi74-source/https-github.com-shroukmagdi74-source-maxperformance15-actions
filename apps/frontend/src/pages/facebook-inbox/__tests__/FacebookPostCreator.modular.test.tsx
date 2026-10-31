// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  FacebookPostCreatorHeader,
  FacebookPageSelector,
  FacebookContentEditor,
  FacebookScheduleAndPublish,
  FacebookPostPreviewCard,
  FacebookPublishResultCard,
  FacebookPage,
} from "../facebook-post-creator";
import FacebookPostCreator from "../FacebookPostCreator";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        "facebookPostCreator.pageTitle": "إنشاء منشور جديد",
        "facebookPostCreator.pageSubtitle": "نشر على صفحات فيسبوك المرتبطة",
        "facebookPostCreator.cancel": "إلغاء",
        "facebookPostCreator.selectPages": "تحديد الصفحات",
        "facebookPostCreator.selectAll": "تحديد الكل",
        "facebookPostCreator.deselectAll": "إلغاء تحديد الكل",
        "facebookPostCreator.selectedCount": `تم تحديد ${options?.count || 0} صفحة`,
        "facebookPostCreator.feedTab": "منشور عام (Feed)",
        "facebookPostCreator.storyTab": "قصة (Story)",
        "facebookPostCreator.statusTab": "نص",
        "facebookPostCreator.mediaTab": "وسائط",
        "facebookPostCreator.linkTab": "رابط",
        "facebookPostCreator.writeSomething": "اكتب منشورك هنا...",
        "facebookPostCreator.storyNote": "أضف نصاً لقصتك...",
        "facebookPostCreator.linkLabel": "عنوان الرابط",
        "facebookPostCreator.linkPlaceholder": "example.com/product",
        "facebookPostCreator.uploadLabel": "اضغط لرفع الصور أو الفيديو",
        "facebookPostCreator.uploadHint": "PNG, JPG, MP4 حتى 100 ميجابايت",
        "facebookPostCreator.scheduleLabel": "جدولة المنشور لوقت لاحق",
        "facebookPostCreator.scheduleHint": "يجب أن يكون الموعد بعد 10 دقائق على الأقل",
        "facebookPostCreator.publishNow": "نشر الآن",
        "facebookPostCreator.schedulePost": "جدولة المنشور",
        "facebookPostCreator.publishing": "جاري النشر...",
        "facebookPostCreator.previewTitle": "معاينة المنشور",
        "facebookPostCreator.previewPlaceholder": "هنا ستظهر معاينة لمنشورك...",
        "facebookPostCreator.successTitle": "تم النشر بنجاح!",
        "facebookPostCreator.published": "تم النشر",
        "facebookPostCreator.scheduled": "تمت الجدولة",
        "facebookPostCreator.failed": "فشل النشر",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock companyAwareApi
vi.mock("../../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn().mockResolvedValue({ data: { success: true, pages: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

// Mock uploadService
vi.mock("../../../services/uploadService", () => ({
  uploadService: {
    uploadMedia: vi.fn().mockResolvedValue({
      success: true,
      data: { url: "https://example.com/img.jpg" },
    }),
  },
}));

const mockPages: FacebookPage[] = [
  {
    id: "p-1",
    pageId: "fb-101",
    pageName: "صفحة متجر الأحذية",
    status: "ACTIVE",
  },
  {
    id: "p-2",
    pageId: "fb-102",
    pageName: "صفحة الملابس الرياضية",
    status: "ACTIVE",
  },
];

describe("FacebookPostCreator Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("FacebookPostCreatorHeader", () => {
    it("renders page title and triggers onCancel", () => {
      const onCancel = vi.fn();
      render(<FacebookPostCreatorHeader onCancel={onCancel} />);

      expect(screen.getByText("إنشاء منشور جديد")).toBeDefined();
      expect(screen.getByText("نشر على صفحات فيسبوك المرتبطة")).toBeDefined();

      const cancelBtn = screen.getByRole("button", { name: "إلغاء" });
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("FacebookPageSelector", () => {
    it("renders pages list and handles page toggle and select-all", () => {
      const onToggle = vi.fn();
      const onSelectAll = vi.fn();

      render(
        <FacebookPageSelector
          pages={mockPages}
          selectedPages={["fb-101"]}
          loading={false}
          onTogglePageSelection={onToggle}
          onSelectAll={onSelectAll}
        />,
      );

      expect(screen.getByText("تحديد الصفحات")).toBeDefined();
      expect(screen.getByText("صفحة متجر الأحذية")).toBeDefined();
      expect(screen.getByText("صفحة الملابس الرياضية")).toBeDefined();
      expect(screen.getByText("تم تحديد 1 صفحة")).toBeDefined();

      fireEvent.click(screen.getByText("صفحة الملابس الرياضية"));
      expect(onToggle).toHaveBeenCalledWith("fb-102");

      const selectAllBtn = screen.getByText("تحديد الكل");
      fireEvent.click(selectAllBtn);
      expect(onSelectAll).toHaveBeenCalled();
    });
  });

  describe("FacebookContentEditor", () => {
    it("renders post type tabs and handles content changes", () => {
      const onPostTypeChange = vi.fn();
      const onActiveTabChange = vi.fn();
      const onMessageChange = vi.fn();
      const onRemoveMedia = vi.fn();

      render(
        <FacebookContentEditor
          postType="FEED"
          onPostTypeChange={onPostTypeChange}
          activeTab="MEDIA"
          onActiveTabChange={onActiveTabChange}
          message="خصم خاص بمناسبة العام الجديد"
          onMessageChange={onMessageChange}
          linkUrl="https://example.com/sale"
          onLinkUrlChange={vi.fn()}
          mediaPreviews={[
            { url: "blob:http://localhost/preview1.jpg", type: "image" },
          ]}
          onMediaChange={vi.fn()}
          onRemoveMedia={onRemoveMedia}
        />,
      );

      expect(screen.getByText("منشور عام (Feed)")).toBeDefined();
      expect(screen.getByText("قصة (Story)")).toBeDefined();

      fireEvent.click(screen.getByText("قصة (Story)"));
      expect(onPostTypeChange).toHaveBeenCalledWith("STORY");

      expect(
        screen.getByDisplayValue("خصم خاص بمناسبة العام الجديد"),
      ).toBeDefined();

      const removeBtn = screen.getByRole("button", { name: "حذف الوسيط" });
      fireEvent.click(removeBtn);
      expect(onRemoveMedia).toHaveBeenCalledWith(0);
    });
  });

  describe("FacebookScheduleAndPublish", () => {
    it("handles scheduling toggle and submit action", () => {
      const onScheduleToggle = vi.fn();
      const onSubmit = vi.fn();

      render(
        <FacebookScheduleAndPublish
          isScheduled={false}
          onIsScheduledChange={onScheduleToggle}
          scheduledDate=""
          onScheduledDateChange={vi.fn()}
          onSubmit={onSubmit}
          submitting={false}
          disabled={false}
        />,
      );

      expect(screen.getByText("جدولة المنشور لوقت لاحق")).toBeDefined();
      const scheduleCheckbox = screen.getByRole("checkbox");
      fireEvent.click(scheduleCheckbox);
      expect(onScheduleToggle).toHaveBeenCalledWith(true);

      const publishBtn = screen.getByRole("button", { name: "نشر الآن" });
      fireEvent.click(publishBtn);
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe("FacebookPostPreviewCard", () => {
    it("renders message preview and media count correctly", () => {
      render(
        <FacebookPostPreviewCard
          message="عرض حصري اليوم فقط"
          linkUrl="https://example.com/shoes"
          activeTab="LINK"
          mediaPreviews={[
            { url: "blob:http://localhost/1.jpg", type: "image" },
            { url: "blob:http://localhost/2.jpg", type: "image" },
            { url: "blob:http://localhost/3.jpg", type: "image" },
            { url: "blob:http://localhost/4.jpg", type: "image" },
            { url: "blob:http://localhost/5.jpg", type: "image" },
          ]}
        />,
      );

      expect(screen.getByText("معاينة المنشور")).toBeDefined();
      expect(screen.getByText("عرض حصري اليوم فقط")).toBeDefined();
      expect(screen.getByText("https://example.com/shoes")).toBeDefined();
      expect(screen.getByText("+1")).toBeDefined();
    });
  });

  describe("FacebookPublishResultCard", () => {
    it("renders publishing results breakdown", () => {
      const mockResult = {
        success: true,
        message: "تم اكتمال النشر بنجاح على الصفحات المحددة",
        results: [
          { pageName: "صفحة متجر الأحذية", success: true },
          { pageName: "صفحة الملابس الرياضية", success: false, error: "انتهت صلاحية الرمز المميز" },
        ],
      };

      render(
        <FacebookPublishResultCard
          result={mockResult}
          isScheduled={false}
        />,
      );

      expect(screen.getByText("تم النشر بنجاح!")).toBeDefined();
      expect(screen.getByText("تم اكتمال النشر بنجاح على الصفحات المحددة")).toBeDefined();
      expect(screen.getByText("صفحة متجر الأحذية")).toBeDefined();
      expect(screen.getByText("تم النشر")).toBeDefined();
      expect(screen.getByText("فشل النشر")).toBeDefined();
      expect(screen.getByText("انتهت صلاحية الرمز المميز")).toBeDefined();
    });
  });

  describe("FacebookPostCreator Coordinator Shell", () => {
    it("renders coordinator component cleanly", () => {
      render(<FacebookPostCreator />);
      expect(screen.getByText("إنشاء منشور جديد")).toBeDefined();
      expect(screen.getByText("تحديد الصفحات")).toBeDefined();
    });
  });
});
