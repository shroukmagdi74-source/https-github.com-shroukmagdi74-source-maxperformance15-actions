// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import { CreateCampaignHeader } from "../create-campaign/CreateCampaignHeader";
import { CampaignFormFields } from "../create-campaign/CampaignFormFields";
import { CampaignScheduleOptions } from "../create-campaign/CampaignScheduleOptions";
import { CampaignMediaUpload } from "../create-campaign/CampaignMediaUpload";
import { CampaignSettings } from "../create-campaign/CampaignSettings";
import { CampaignPreviewCard } from "../create-campaign/CampaignPreviewCard";
import { CampaignSuccessState } from "../create-campaign/CampaignSuccessState";
import { CampaignSubmitActions } from "../create-campaign/CampaignSubmitActions";
import type { CampaignFormData, CustomerList } from "../create-campaign/types";

afterEach(() => {
  cleanup();
});

const mockFormData: CampaignFormData = {
  name: "حملة الصيف الترويجية",
  message: "مرحباً {customerName}، إليك كود الخصم!",
  targetAudience: "list-1",
  scheduledAt: "2026-10-29",
  scheduledTime: "14:30",
  recipientCount: 1250,
  tags: ["vip", "summer"],
  priority: "high",
  includeImages: true,
  trackClicks: true,
  autoResend: false,
  sendNow: false,
  images: [],
};

const mockCustomerLists: CustomerList[] = [
  {
    id: "list-1",
    name: "عملاء VIP",
    description: "العملاء الذين أنفقوا أكثر من 5000 ج.م",
    count: 1250,
    criteria: "total_spent > 5000",
  },
  {
    id: "list-2",
    name: "عملاء جدد",
    description: "المسجلين خلال آخر 30 يوماً",
    count: 450,
    criteria: "created_at >= 30_days",
  },
];

describe("CreateCampaign Modular Subcomponents", () => {
  describe("CreateCampaignHeader", () => {
    it("renders title, subtitle, and toggles preview mode", () => {
      const onToggle = vi.fn();
      const { rerender } = render(
        <CreateCampaignHeader previewMode={false} onTogglePreview={onToggle} />
      );

      expect(screen.getByText("إنشاء حملة برودكاست جديدة")).toBeTruthy();
      expect(screen.getByText("معاينة")).toBeTruthy();

      fireEvent.click(screen.getByText("معاينة"));
      expect(onToggle).toHaveBeenCalledTimes(1);

      rerender(
        <CreateCampaignHeader previewMode={true} onTogglePreview={onToggle} />
      );
      expect(screen.getByText("إخفاء المعاينة")).toBeTruthy();
    });
  });

  describe("CampaignFormFields", () => {
    it("renders inputs, lists, and triggers variable insertion", () => {
      const onInputChange = vi.fn();
      const onInsertVariable = vi.fn();
      const setRef = vi.fn();

      render(
        <CampaignFormFields
          formData={mockFormData}
          customerLists={mockCustomerLists}
          selectedList={mockCustomerLists[0]}
          loading={false}
          onInputChange={onInputChange}
          onInsertVariable={onInsertVariable}
          setMessageTextareaRef={setRef}
        />
      );

      expect(screen.getByLabelText(/اسم الحملة/)).toBeTruthy();
      expect(screen.getByDisplayValue("حملة الصيف الترويجية")).toBeTruthy();

      expect(screen.getByText("عملاء VIP (1,250 عميل)")).toBeTruthy();
      expect(
        screen.getByText("العملاء الذين أنفقوا أكثر من 5000 ج.م")
      ).toBeTruthy();
      expect(
        screen.getByText(/✓ سيتم الإرسال إلى 1,250 عميل/)
      ).toBeTruthy();

      // Variable insertion buttons
      const customerNameBtn = screen.getByText("اسم العميل");
      fireEvent.click(customerNameBtn);
      expect(onInsertVariable).toHaveBeenCalledWith("{customerName}");

      const firstNameBtn = screen.getByText("الاسم الأول");
      fireEvent.click(firstNameBtn);
      expect(onInsertVariable).toHaveBeenCalledWith("{firstName}");

      const lastNameBtn = screen.getByText("الاسم الأخير");
      fireEvent.click(lastNameBtn);
      expect(onInsertVariable).toHaveBeenCalledWith("{lastName}");
    });
  });

  describe("CampaignScheduleOptions", () => {
    it("renders scheduled inputs when sendNow is false", () => {
      const onSendNowChange = vi.fn();
      const onInputChange = vi.fn();

      render(
        <CampaignScheduleOptions
          formData={mockFormData}
          onSendNowChange={onSendNowChange}
          onInputChange={onInputChange}
        />
      );

      expect(screen.getByText("إرسال فوري (الآن)")).toBeTruthy();
      expect(screen.getByLabelText(/تاريخ الإرسال/)).toBeTruthy();
      expect(screen.getByLabelText(/وقت الإرسال/)).toBeTruthy();

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(onSendNowChange).toHaveBeenCalled();
    });

    it("hides scheduling date and time when sendNow is true", () => {
      render(
        <CampaignScheduleOptions
          formData={{ ...mockFormData, sendNow: true }}
          onSendNowChange={vi.fn()}
          onInputChange={vi.fn()}
        />
      );

      expect(screen.queryByLabelText(/تاريخ الإرسال/)).toBeNull();
      expect(screen.queryByLabelText(/وقت الإرسال/)).toBeNull();
    });
  });

  describe("CampaignMediaUpload", () => {
    it("renders upload dropzone and uploaded images", () => {
      const onImageChange = vi.fn();
      const onRemoveImage = vi.fn();

      const mockFile = new File(["dummy"], "banner.png", { type: "image/png" });
      window.URL.createObjectURL = vi.fn(() => "blob:mock-image-url");

      render(
        <CampaignMediaUpload
          images={[mockFile]}
          onImageChange={onImageChange}
          onRemoveImage={onRemoveImage}
        />
      );

      expect(screen.getByText("اختر الصور")).toBeTruthy();
      expect(screen.getByText("الصور المرفقة (1)")).toBeTruthy();

      const removeBtn = screen.getByRole("button", { name: "حذف صورة 1" });
      fireEvent.click(removeBtn);
      expect(onRemoveImage).toHaveBeenCalledWith(0);
    });
  });

  describe("CampaignSettings", () => {
    it("renders priority select, tags list, and handles tag actions", () => {
      const onNewTagChange = vi.fn();
      const onAddTag = vi.fn();
      const onRemoveTag = vi.fn();
      const onInputChange = vi.fn();

      render(
        <CampaignSettings
          formData={mockFormData}
          newTag="new-tag"
          onNewTagChange={onNewTagChange}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onInputChange={onInputChange}
        />
      );

      expect(screen.getByLabelText(/أولوية الحملة/)).toBeTruthy();
      expect(screen.getByDisplayValue("عالية")).toBeTruthy();

      expect(screen.getByText("vip")).toBeTruthy();
      expect(screen.getByText("summer")).toBeTruthy();

      const addBtn = screen.getByRole("button", { name: "إضافة علامة" });
      fireEvent.click(addBtn);
      expect(onAddTag).toHaveBeenCalled();

      const removeVipBtn = screen.getByRole("button", { name: "حذف علامة vip" });
      fireEvent.click(removeVipBtn);
      expect(onRemoveTag).toHaveBeenCalledWith("vip");

      expect(screen.getByText("تتبع النقرات والتفاعل")).toBeTruthy();
      expect(screen.getByText("تضمين صور في الرسالة")).toBeTruthy();
      expect(
        screen.getByText("إعادة الإرسال للذين لم يقرؤوا (بعد 6 ساعات)")
      ).toBeTruthy();
    });
  });

  describe("CampaignPreviewCard", () => {
    it("renders preview card with preview message and metrics", () => {
      render(
        <CampaignPreviewCard
          formData={mockFormData}
          previewMessage="مرحباً محمد أحمد، إليك كود الخصم!"
        />
      );

      expect(screen.getByText("معاينة الرسالة")).toBeTruthy();
      expect(screen.getByText("شركتك")).toBeTruthy();
      expect(
        screen.getByText("مرحباً محمد أحمد، إليك كود الخصم!")
      ).toBeTruthy();
      expect(screen.getByText("#vip")).toBeTruthy();
      expect(screen.getByText("#summer")).toBeTruthy();
      expect(screen.getByText("1,250")).toBeTruthy();
      expect(screen.getByText("عالية")).toBeTruthy();
    });
  });

  describe("CampaignSuccessState", () => {
    it("renders success state banner with given message", () => {
      render(<CampaignSuccessState message="تم جدولة الحملة بنجاح!" />);

      expect(screen.getByText("تم إنشاء الحملة بنجاح!")).toBeTruthy();
      expect(screen.getByText("تم جدولة الحملة بنجاح!")).toBeTruthy();
    });
  });

  describe("CampaignSubmitActions", () => {
    it("renders submit actions for schedule mode and handles loading", () => {
      const { rerender } = render(
        <CampaignSubmitActions loading={false} sendNow={false} />
      );

      expect(screen.getByText("حفظ كمسودة")).toBeTruthy();
      expect(screen.getByText("جدولة الحملة")).toBeTruthy();

      rerender(<CampaignSubmitActions loading={false} sendNow={true} />);
      expect(screen.getByText("إرسال فوري")).toBeTruthy();

      rerender(<CampaignSubmitActions loading={true} sendNow={false} />);
      expect(screen.getByText("جاري الجدولة...")).toBeTruthy();

      rerender(<CampaignSubmitActions loading={true} sendNow={true} />);
      expect(screen.getByText("جاري الإرسال...")).toBeTruthy();
    });
  });
});
