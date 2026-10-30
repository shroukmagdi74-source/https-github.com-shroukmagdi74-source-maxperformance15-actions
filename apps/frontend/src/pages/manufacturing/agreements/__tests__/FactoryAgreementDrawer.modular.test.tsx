// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  AgreementDrawerHeader,
  AgreementDrawerQuickActions,
  AgreementFinancialStrip,
  AgreementDrawerTabsNav,
  AgreementPaymentsTab,
  AgreementTermsTab,
  AgreementFilesTab,
  AgreementAddPaymentModal,
  AgreementPayModal,
  FactoryAgreement,
} from "../factory-agreement-drawer";
import { FactoryAgreementDrawer } from "../FactoryAgreementDrawer";

// Mock manufacturingApi
vi.mock("../../manufacturingApi", () => ({
  manufacturingApi: {
    getFactoryAgreement: vi.fn(),
    activateAgreement: vi.fn(),
    closeAgreement: vi.fn(),
    cancelAgreement: vi.fn(),
    deleteFactoryAgreement: vi.fn(),
    generateAgreementPayments: vi.fn(),
    createAgreementPayment: vi.fn(),
    payAgreementPayment: vi.fn(),
    cancelAgreementPayment: vi.fn(),
    uploadAgreementFile: vi.fn(),
    deleteAgreementFile: vi.fn(),
  },
}));

const mockAgreement: FactoryAgreement = {
  id: "fa-100",
  companyId: "comp-1",
  code: "FA-2026-001",
  title: "اتفاقية تصنيع تيشرتات صيفية",
  partnerFactoryId: "fact-1",
  partnerFactory: {
    id: "fact-1",
    name: "مصنع النيل للملابس الجاهزة",
  },
  orderId: "ord-1",
  order: {
    id: "ord-1",
    orderNumber: "MFG-2026-088",
  },
  status: "DRAFT",
  pricingMode: "PER_UNIT",
  currency: "EGP",
  totalValue: 100000,
  paidAmount: 20000,
  paidPercent: 20,
  pendingAmount: 50000,
  remainingAmount: 30000,
  payments: [
    {
      id: "pay-1",
      agreementId: "fa-100",
      seq: 1,
      label: "دفعة مقدمة عند التوقيع",
      amount: 20000,
      percent: 20,
      dueDate: "2026-05-01",
      status: "PAID",
      paidAt: "2026-05-02T10:00:00Z",
    },
    {
      id: "pay-2",
      agreementId: "fa-100",
      seq: 2,
      label: "دفعة استلام القماش",
      amount: 50000,
      percent: 50,
      dueDate: "2026-06-01",
      status: "PENDING",
    },
  ],
  files: [
    {
      id: "f-1",
      agreementId: "fa-100",
      fileName: "contract-signed.pdf",
      url: "https://example.com/contract.pdf",
      uploadedAt: "2026-05-01T12:00:00Z",
    },
  ],
  scopeOfOperations: "قص وخياطة وطباعة",
  productsDesc: "تيشرت قطن 100% سنجل جيرسي",
  quantitiesNotes: "5000 قطعة بمقاسات مختلفة",
  qualityTerms: "مستوى فحص AQL 2.5",
  materialOwnership: "الخامات المسلمة ملكية كاملة للشركة",
  wastePolicy: "نسبة الهالك المسموحة 3%",
  deliveryTerms: "التسليم في مخازن العاشر من رمضان",
  reworkPolicy: "إعادة التشغيل على حساب المصنع",
  notes: "ملاحظات سرعة التنفيذ",
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: "2026-05-01T00:00:00Z",
};

describe("FactoryAgreementDrawer Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("AgreementDrawerHeader", () => {
    it("renders code, status, and title", () => {
      const onClose = vi.fn();
      render(
        <AgreementDrawerHeader agreement={mockAgreement} onClose={onClose} />,
      );

      expect(screen.getByText("FA-2026-001")).toBeDefined();
      expect(screen.getByText("مسودة (DRAFT)")).toBeDefined();
      expect(screen.getByText("اتفاقية تصنيع تيشرتات صيفية")).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("AgreementDrawerQuickActions", () => {
    it("renders factory name, order number and draft actions", () => {
      const onActivate = vi.fn();
      const onDeleteDraft = vi.fn();

      render(
        <AgreementDrawerQuickActions
          agreement={mockAgreement}
          actionLoading={false}
          onActivate={onActivate}
          onDeleteDraft={onDeleteDraft}
          onCloseAgreement={vi.fn()}
          onCancelAgreement={vi.fn()}
        />,
      );

      expect(screen.getByText("مصنع النيل للملابس الجاهزة")).toBeDefined();
      expect(screen.getByText(/MFG-2026-088/)).toBeDefined();

      const activateBtn = screen.getByRole("button", {
        name: /تفعيل الاتفاقية/i,
      });
      fireEvent.click(activateBtn);
      expect(onActivate).toHaveBeenCalled();

      const deleteBtn = screen.getByRole("button", { name: /حذف/i });
      fireEvent.click(deleteBtn);
      expect(onDeleteDraft).toHaveBeenCalled();
    });

    it("renders close button when status is ACTIVE", () => {
      const onCloseAgreement = vi.fn();
      const activeAgreement = {
        ...mockAgreement,
        status: "ACTIVE" as const,
      };

      render(
        <AgreementDrawerQuickActions
          agreement={activeAgreement}
          actionLoading={false}
          onActivate={vi.fn()}
          onDeleteDraft={vi.fn()}
          onCloseAgreement={onCloseAgreement}
          onCancelAgreement={vi.fn()}
        />,
      );

      const closeBtn = screen.getByRole("button", {
        name: /إغلاق الاتفاقية/i,
      });
      fireEvent.click(closeBtn);
      expect(onCloseAgreement).toHaveBeenCalled();
    });
  });

  describe("AgreementFinancialStrip", () => {
    it("displays financial metrics with tabular numbers", () => {
      render(<AgreementFinancialStrip agreement={mockAgreement} />);

      expect(screen.getByText(/100,000/)).toBeDefined();
      expect(screen.getByText(/20,000/)).toBeDefined();
      expect(screen.getByText(/50,000/)).toBeDefined();
      expect(screen.getByText(/30,000/)).toBeDefined();
      expect(screen.getByText(/20% مسدد/)).toBeDefined();
    });
  });

  describe("AgreementDrawerTabsNav", () => {
    it("handles tab switching", () => {
      const onTabChange = vi.fn();
      render(
        <AgreementDrawerTabsNav
          activeTab="payments"
          onTabChange={onTabChange}
          agreement={mockAgreement}
        />,
      );

      expect(screen.getByText(/جدول الدفعات/)).toBeDefined();
      expect(screen.getByText(/البنود التعاقدية/)).toBeDefined();
      expect(screen.getByText(/المرفقات والعقود/)).toBeDefined();

      fireEvent.click(screen.getByText(/البنود التعاقدية/));
      expect(onTabChange).toHaveBeenCalledWith("terms");

      fireEvent.click(screen.getByText(/المرفقات والعقود/));
      expect(onTabChange).toHaveBeenCalledWith("files");
    });
  });

  describe("AgreementPaymentsTab", () => {
    it("renders payments table and triggers pay modal", () => {
      const onSelectPaymentToPay = vi.fn();
      const onCancelPayment = vi.fn();

      render(
        <AgreementPaymentsTab
          agreement={mockAgreement}
          actionLoading={false}
          onGenerateDefaultPayments={vi.fn()}
          onOpenAddPaymentModal={vi.fn()}
          onSelectPaymentToPay={onSelectPaymentToPay}
          onCancelPayment={onCancelPayment}
        />,
      );

      expect(screen.getByText("دفعة مقدمة عند التوقيع")).toBeDefined();
      expect(screen.getByText("دفعة استلام القماش")).toBeDefined();
      expect(screen.getByText("مدفوعة (PAID)")).toBeDefined();
      expect(screen.getByText("قيد الانتظار")).toBeDefined();

      const payBtn = screen.getByRole("button", { name: "تسجيل سداد" });
      fireEvent.click(payBtn);
      expect(onSelectPaymentToPay).toHaveBeenCalledWith(
        mockAgreement.payments[1],
      );

      const cancelBtn = screen.getByRole("button", { name: "إلغاء الدفعة" });
      fireEvent.click(cancelBtn);
      expect(onCancelPayment).toHaveBeenCalledWith("pay-2");
    });
  });

  describe("AgreementTermsTab", () => {
    it("renders the 9 contractual terms", () => {
      render(<AgreementTermsTab agreement={mockAgreement} />);

      expect(
        screen.getByText(/1\. نطاق العمليات \(Scope of Operations\)/),
      ).toBeDefined();
      expect(screen.getByText("قص وخياطة وطباعة")).toBeDefined();
      expect(screen.getByText("تيشرت قطن 100% سنجل جيرسي")).toBeDefined();
      expect(screen.getByText("مستوى فحص AQL 2.5")).toBeDefined();
      expect(
        screen.getByText("التسليم في مخازن العاشر من رمضان"),
      ).toBeDefined();
    });
  });

  describe("AgreementFilesTab", () => {
    it("renders uploaded files and handles delete", () => {
      const onDeleteFile = vi.fn();
      render(
        <AgreementFilesTab
          agreement={mockAgreement}
          uploadingFile={false}
          onFileUpload={vi.fn()}
          onDeleteFile={onDeleteFile}
        />,
      );

      expect(screen.getByText("contract-signed.pdf")).toBeDefined();
      const deleteFileBtn = screen.getByRole("button", { name: "حذف الملف" });
      fireEvent.click(deleteFileBtn);
      expect(onDeleteFile).toHaveBeenCalledWith("f-1");
    });
  });

  describe("AgreementAddPaymentModal", () => {
    it("renders inputs and handles submit", () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <AgreementAddPaymentModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={onSubmit}
          actionLoading={false}
          paymentLabel="دفعة الفحص النهائي"
          onPaymentLabelChange={vi.fn()}
          paymentAmount="15000"
          onPaymentAmountChange={vi.fn()}
          paymentDueDate="2026-07-01"
          onPaymentDueDateChange={vi.fn()}
          paymentNotes="تستحق بعد اعتماد العينة"
          onPaymentNotesChange={vi.fn()}
        />,
      );

      expect(screen.getByText("إضافة دفعة مالية جديدة")).toBeDefined();
      expect(screen.getByDisplayValue("دفعة الفحص النهائي")).toBeDefined();
      expect(screen.getByDisplayValue("15000")).toBeDefined();

      const submitBtn = screen.getByRole("button", { name: "إضافة الدفعة" });
      fireEvent.click(submitBtn);
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe("AgreementPayModal", () => {
    it("renders payment details and confirms pay", () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <AgreementPayModal
          payment={mockAgreement.payments[1]}
          onClose={vi.fn()}
          onSubmit={onSubmit}
          actionLoading={false}
          payReference="TRX-8890"
          onPayReferenceChange={vi.fn()}
          payNotes="تم التحويل عبر فودافون كاش"
          onPayNotesChange={vi.fn()}
        />,
      );

      expect(
        screen.getByText(/تسجيل سداد الدفعة: دفعة استلام القماش/),
      ).toBeDefined();
      expect(screen.getByDisplayValue("TRX-8890")).toBeDefined();
      expect(screen.getByDisplayValue("تم التحويل عبر فودافون كاش")).toBeDefined();

      const confirmBtn = screen.getByRole("button", {
        name: /تأكيد سداد الدفعة/i,
      });
      fireEvent.click(confirmBtn);
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe("FactoryAgreementDrawer Coordinator Shell", () => {
    it("returns null when isOpen is false", () => {
      const { container } = render(
        <FactoryAgreementDrawer
          agreementId="fa-100"
          isOpen={false}
          onClose={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders coordinator drawer when isOpen is true", () => {
      render(
        <FactoryAgreementDrawer
          agreementId="fa-100"
          isOpen={true}
          onClose={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      expect(screen.getByText("تفاصيل الاتفاقية")).toBeDefined();
    });
  });
});
