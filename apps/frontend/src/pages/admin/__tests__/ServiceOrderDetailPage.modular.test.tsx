// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  STATUS_MAP,
  PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_NAMES,
  formatFileSize,
  ServiceOrderHeader,
  ServiceOrderOverviewCard,
  ServiceOrderFinanceCard,
  ServiceOrderCustomerCard,
  ServiceOrderTeamCard,
  ServiceOrderWhatsAppModal,
  ServiceOrderPaymentModal,
} from "../service-order-detail";

afterEach(() => {
  cleanup();
});

const mockOrder = {
  id: "srv-order-abc12345",
  status: "IN_PROGRESS",
  createdAt: "2026-10-26T12:00:00.000Z",
  updatedAt: "2026-10-26T13:30:00.000Z",
  customerName: "محمود حسن",
  phone: "01012345678",
  description: "تصميم هوية بصرية كاملة وبوسترات سوشيال ميديا",
  service: {
    name: "تصميم جرافيك وهوية",
    category: "تصميم",
    icon: "🎨",
    price: 3500,
  },
  payment: {
    totalAmount: 3500,
    paidAmount: 1500,
    remainingAmount: 2000,
    paymentStatus: "PARTIALLY_PAID",
    invoiceNumber: "INV-2026-1001",
  },
  files: [],
};

describe("ServiceOrderDetail Modular Components (Batch 568)", () => {
  describe("Helper Functions & Mappings", () => {
    it("STATUS_MAP contains correct labels for all statuses", () => {
      expect(STATUS_MAP.NEW.label).toBe("جديد");
      expect(STATUS_MAP.IN_PROGRESS.label).toBe("قيد التنفيذ");
      expect(STATUS_MAP.COMPLETED.label).toBe("مكتمل");
      expect(STATUS_MAP.CANCELLED.label).toBe("ملغي");
    });

    it("PAYMENT_STATUS_MAP contains correct labels", () => {
      expect(PAYMENT_STATUS_MAP.UNPAID.label).toBe("غير مدفوع");
      expect(PAYMENT_STATUS_MAP.PARTIALLY_PAID.label).toBe("مدفوع جزئياً (عربون)");
      expect(PAYMENT_STATUS_MAP.PAID.label).toBe("مدفوع بالكامل");
    });

    it("PAYMENT_METHOD_NAMES maps keys to localized labels", () => {
      expect(PAYMENT_METHOD_NAMES.VODAFONE_CASH).toBe("فودافون كاش / محافظ");
      expect(PAYMENT_METHOD_NAMES.INSTAPAY).toBe("إنستاباي (InstaPay)");
    });

    it("formatFileSize formats bytes correctly", () => {
      expect(formatFileSize(undefined)).toBe("");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(2048)).toBe("2.0 KB");
      expect(formatFileSize(1048576)).toBe("1.0 MB");
    });
  });

  describe("ServiceOrderHeader Component", () => {
    it("renders order ID, status badges, and triggers action buttons", () => {
      const updateStatusMock = vi.fn();
      const openInvoiceMock = vi.fn();
      const openWaMock = vi.fn();
      const deleteMock = vi.fn();

      render(
        <MemoryRouter>
          <ServiceOrderHeader
            order={mockOrder}
            shortId="#ABC12345"
            currentStatus={STATUS_MAP.IN_PROGRESS}
            currentPaymentStatus={PAYMENT_STATUS_MAP.PARTIALLY_PAID}
            updateStatus={updateStatusMock}
            onOpenInvoice={openInvoiceMock}
            onOpenWhatsApp={openWaMock}
            onDelete={deleteMock}
          />
        </MemoryRouter>
      );

      expect(screen.getByText(/طلب خدمة #ABC12345/)).toBeInTheDocument();
      expect(screen.getByText("قيد التنفيذ")).toBeInTheDocument();
      expect(screen.getByText("مدفوع جزئياً (عربون)")).toBeInTheDocument();

      const invoiceBtn = screen.getByTitle("عرض وطباعة الفاتورة");
      fireEvent.click(invoiceBtn);
      expect(openInvoiceMock).toHaveBeenCalled();

      const waBtn = screen.getByTitle("مراسلة واتساب من النظام");
      fireEvent.click(waBtn);
      expect(openWaMock).toHaveBeenCalled();

      const deleteBtn = screen.getByTitle("حذف الطلب");
      fireEvent.click(deleteBtn);
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe("ServiceOrderOverviewCard Component", () => {
    it("renders service details, category, price and customer description", () => {
      render(<ServiceOrderOverviewCard order={mockOrder} />);

      expect(screen.getByText("تصميم جرافيك وهوية")).toBeInTheDocument();
      expect(screen.getByText(/تصنيف الخدمة: تصميم/)).toBeInTheDocument();
      expect(screen.getByText("3500 ج.م")).toBeInTheDocument();
      expect(
        screen.getByText("تصميم هوية بصرية كاملة وبوسترات سوشيال ميديا")
      ).toBeInTheDocument();
    });
  });

  describe("ServiceOrderFinanceCard Component", () => {
    it("renders financial summary and handles record payment trigger", () => {
      const openPaymentMock = vi.fn();
      const openInvoiceMock = vi.fn();
      const sendWaMock = vi.fn();

      render(
        <ServiceOrderFinanceCard
          order={mockOrder}
          onOpenPaymentModal={openPaymentMock}
          onOpenInvoiceModal={openInvoiceMock}
          onSendInvoiceWhatsApp={sendWaMock}
        />
      );

      expect(screen.getByText("الماليات وحالة الدفع")).toBeInTheDocument();
      expect(screen.getByText("3500 ج.م")).toBeInTheDocument();
      expect(screen.getByText("1500 ج.م")).toBeInTheDocument();
      expect(screen.getByText("2000 ج.م")).toBeInTheDocument();

      const recordPayBtn = screen.getByText("تسجيل دفعة");
      fireEvent.click(recordPayBtn);
      expect(openPaymentMock).toHaveBeenCalled();

      const viewInvoiceBtn = screen.getByText("عرض الفاتورة");
      fireEvent.click(viewInvoiceBtn);
      expect(openInvoiceMock).toHaveBeenCalled();
    });
  });

  describe("ServiceOrderCustomerCard Component", () => {
    it("renders customer details and contact action triggers", () => {
      const openWaModalMock = vi.fn();
      const openInternalMock = vi.fn();
      const openExternalMock = vi.fn();

      render(
        <ServiceOrderCustomerCard
          order={mockOrder}
          waDetection={{
            isPreviousChat: true,
            session: { name: "واتساب المبيعات", phoneNumber: "0100000000" },
          }}
          onOpenWhatsAppModal={openWaModalMock}
          onOpenInternalChat={openInternalMock}
          onOpenExternalWhatsApp={openExternalMock}
        />
      );

      expect(screen.getByText("العميل والتواصل الذكي")).toBeInTheDocument();
      expect(screen.getByText("محمود حسن")).toBeInTheDocument();
      expect(screen.getByText("01012345678")).toBeInTheDocument();
      expect(screen.getByText("محادثة سابقة للعميل")).toBeInTheDocument();

      const sendWaBtn = screen.getByText("إرسال واتساب من النظام");
      fireEvent.click(sendWaBtn);
      expect(openWaModalMock).toHaveBeenCalled();

      const internalChatBtn = screen.getByText("شات المنصة");
      fireEvent.click(internalChatBtn);
      expect(openInternalMock).toHaveBeenCalled();

      const externalWaBtn = screen.getByText("wa.me مباشر");
      fireEvent.click(externalWaBtn);
      expect(openExternalMock).toHaveBeenCalled();
    });
  });

  describe("ServiceOrderTeamCard Component", () => {
    it("renders team assignment dropdown and handles change", () => {
      const setAssignedMock = vi.fn();
      const saveMock = vi.fn();

      render(
        <MemoryRouter>
          <ServiceOrderTeamCard
            assignedTo="سارة أحمد"
            setAssignedTo={setAssignedMock}
            teamMembers={[
              { id: "1", name: "سارة أحمد", role: "مصمم" },
              { id: "2", name: "علي كمال", role: "فني" },
            ]}
            savingNotes={false}
            onSaveAssignment={saveMock}
            order={mockOrder}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("فريق العمل والمسؤول")).toBeInTheDocument();
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "علي كمال" } });
      expect(setAssignedMock).toHaveBeenCalledWith("علي كمال");

      const saveBtn = screen.getByTitle("حفظ المسؤول");
      fireEvent.click(saveBtn);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("ServiceOrderPaymentModal Component", () => {
    it("allows entering payment amount and submitting", () => {
      const setPaymentFormMock = vi.fn();
      const savePaymentMock = vi.fn((e) => e.preventDefault());
      const closeMock = vi.fn();

      render(
        <ServiceOrderPaymentModal
          isOpen={true}
          onClose={closeMock}
          paymentForm={{
            totalAmount: 3500,
            newPaymentAmount: "1000",
            paymentMethod: "INSTAPAY",
            newPaymentNote: "دفعة ثانية",
          }}
          setPaymentForm={setPaymentFormMock}
          savingPayment={false}
          handleSavePayment={savePaymentMock}
        />
      );

      expect(screen.getByText("تسجيل دفعة / عربون مالي")).toBeInTheDocument();
      const submitBtn = screen.getByText("حفظ وتحديث الحساب");
      fireEvent.click(submitBtn);
      expect(savePaymentMock).toHaveBeenCalled();
    });
  });

  describe("ServiceOrderWhatsAppModal Component", () => {
    it("renders quick templates and handles template selection", () => {
      const applyTemplateMock = vi.fn();
      const sendSystemMock = vi.fn();
      const closeMock = vi.fn();

      render(
        <ServiceOrderWhatsAppModal
          isOpen={true}
          onClose={closeMock}
          waDetection={{ session: { id: "sess-1", name: "مبيعات", phoneNumber: "0100" } }}
          selectedWaSessionId="sess-1"
          setSelectedWaSessionId={vi.fn()}
          waMessageText="رسالة تجريبية"
          setWaMessageText={vi.fn()}
          sendingWa={false}
          handleSendWhatsAppSystem={sendSystemMock}
          openWhatsAppExternal={vi.fn()}
          applyTemplate={applyTemplateMock}
        />
      );

      expect(screen.getByText("إرسال واتساب من النظام للعميل")).toBeInTheDocument();
      const confirmTemplateBtn = screen.getByText("تأكيد الطلب");
      fireEvent.click(confirmTemplateBtn);
      expect(applyTemplateMock).toHaveBeenCalledWith("CONFIRM");

      const sendBtn = screen.getByText("إرسال الآن من النظام");
      fireEvent.click(sendBtn);
      expect(sendSystemMock).toHaveBeenCalled();
    });
  });
});
