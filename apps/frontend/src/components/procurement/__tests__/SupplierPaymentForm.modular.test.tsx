// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SupplierPaymentForm from "../SupplierPaymentForm";
import {
  PaymentHeader,
  PaymentSupplierInvoiceSection,
  PaymentMethodSection,
  PaymentSummarySidebar,
  PaymentViewVoucher,
  PaymentDeleteDialog,
  PaymentQuickSupplierDialog,
} from "../supplier-payment-form";

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url === "/procurement/suppliers") {
        return Promise.resolve({
          data: {
            suppliers: [
              {
                id: "supp-1",
                name: "شركة الإيمان للمستلزمات",
                phone: "01099887766",
                currentBalance: 5000,
              },
            ],
          },
        });
      }
      if (url.startsWith("/procurement/purchase-invoices")) {
        return Promise.resolve({
          data: {
            invoices: [
              {
                id: "inv-101",
                invoiceNumber: "INV-2026-001",
                invoiceDate: "2026-10-25",
                totalAmount: 12000,
                paidAmount: 7000,
                remainingAmount: 5000,
                status: "PARTIALLY_PAID",
              },
            ],
          },
        });
      }
      if (url.startsWith("/procurement/supplier-payments/pay-123")) {
        return Promise.resolve({
          data: {
            payment: {
              id: "pay-123",
              paymentNumber: "SPAY-2026-0099",
              paymentDate: "2026-10-30",
              amount: 2500,
              paymentMethod: "CASH",
              referenceNumber: "REF-001",
              notes: "دفعة نقدية فورية",
              createdAt: "2026-10-30T10:00:00Z",
              supplier: {
                id: "supp-1",
                name: "شركة الإيمان للمستلزمات",
                phone: "01099887766",
                currentBalance: 2500,
              },
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true, payment: { id: "pay-999" } } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("SupplierPaymentForm - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders SupplierPaymentForm in create mode with header, supplier selector, amount input and summary sidebar", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/procurement/supplier-payments/new"]}>
          <SupplierPaymentForm />
        </MemoryRouter>
      );
    });

    // Check title in create mode
    expect(screen.getByText(/تسجيل سند صرف \/ دفعة جديدة للمورد/)).toBeDefined();

    // Check supplier selection label
    expect(screen.getByText(/المورد المستفيد/)).toBeDefined();

    // Check amount input
    expect(screen.getByPlaceholderText("0.00")).toBeDefined();

    // Check payment methods
    expect(screen.getByRole("button", { name: /نقدي \(كاش من الخزينة\)/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /تحويل بنكي/ })).toBeDefined();

    // Check sidebar title
    expect(screen.getByText(/الأثر المالي للسند/)).toBeDefined();
  });

  it("renders PaymentHeader with correct title for edit and create modes", () => {
    const onBack = vi.fn();
    const { rerender } = render(
      <PaymentHeader isEditing={false} onBack={onBack} />
    );

    expect(screen.getByText(/تسجيل سند صرف/)).toBeDefined();

    rerender(
      <PaymentHeader isEditing={true} paymentNumber="PAY-100" onBack={onBack} />
    );

    expect(screen.getByText(/تعديل سند الصرف \(PAY-100\)/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "العودة لقائمة المدفوعات" }));
    expect(onBack).toHaveBeenCalled();
  });

  it("renders PaymentViewVoucher with printable voucher details and actions", () => {
    const existingPayment = {
      id: "pay-1",
      paymentNumber: "VOUCHER-555",
      paymentDate: "2026-10-31",
      amount: 4500,
      paymentMethod: "CASH",
      createdAt: "2026-10-31T09:00:00Z",
      supplier: {
        id: "supp-1",
        name: "مورد النور للبضائع",
        phone: "01122334455",
      },
    };

    const onBack = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onNewPayment = vi.fn();

    render(
      <PaymentViewVoucher
        existingPayment={existingPayment}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
        onNewPayment={onNewPayment}
      />
    );

    expect(screen.getByText("VOUCHER-555")).toBeDefined();
    expect(screen.getByText("مورد النور للبضائع")).toBeDefined();
    expect(screen.getByText(/طباعة السند/)).toBeDefined();

    fireEvent.click(screen.getByText(/تعديل السند/));
    expect(onEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByText(/حذف السند/));
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders PaymentDeleteDialog and handles delete confirmation", () => {
    const existingPayment = {
      id: "pay-1",
      paymentNumber: "VOUCHER-555",
      paymentDate: "2026-10-31",
      amount: 4500,
      paymentMethod: "CASH",
      createdAt: "2026-10-31T09:00:00Z",
      supplier: {
        id: "supp-1",
        name: "مورد النور للبضائع",
      },
    };

    const onConfirmDelete = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <PaymentDeleteDialog
        open={true}
        onOpenChange={onOpenChange}
        existingPayment={existingPayment}
        deleting={false}
        onConfirmDelete={onConfirmDelete}
      />
    );

    expect(screen.getByText(/تأكيد حذف سند الصرف/)).toBeDefined();
    fireEvent.click(screen.getByText("حذف نهائياً"));
    expect(onConfirmDelete).toHaveBeenCalled();
  });

  it("renders PaymentQuickSupplierDialog and allows typing supplier details", () => {
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();
    const setName = vi.fn();
    const setPhone = vi.fn();

    render(
      <PaymentQuickSupplierDialog
        open={true}
        onOpenChange={onOpenChange}
        quickSupplierName="شركة الأهرام"
        setQuickSupplierName={setName}
        quickSupplierPhone="0123456789"
        setQuickSupplierPhone={setPhone}
        submitting={false}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/إضافة مورد جديد سريعاً/)).toBeDefined();
    expect(screen.getByDisplayValue("شركة الأهرام")).toBeDefined();
    expect(screen.getByDisplayValue("0123456789")).toBeDefined();
  });
});
