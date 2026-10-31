// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PurchaseInvoiceForm from "../PurchaseInvoiceForm";
import {
  InvoiceHeader,
  InvoiceSupplierSection,
  InvoicePaymentSection,
  QuickSupplierDialog,
} from "../purchase-invoice-form";

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
      if (url === "/treasury/accounts") {
        return Promise.resolve({
          data: {
            accounts: [
              { id: "treasury-1", name: "الخزينة الرئيسية", balance: 25000 },
            ],
          },
        });
      }
      if (url === "/procurement/purchase-orders") {
        return Promise.resolve({
          data: { orders: [] },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock("../components", () => ({
  ProcurementCatalogModal: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="catalog-modal">
        <button onClick={onClose}>Close Catalog</button>
      </div>
    ) : null,
  ProcurementItemCombobox: ({ value, placeholder, onSelect }: any) => (
    <div data-testid="item-combobox">
      <input
        aria-label="Item name"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onSelect?.({ productName: e.target.value, unitPrice: 100 })}
      />
    </div>
  ),
  fetchProcurementCatalog: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../../pages/products/components/QuickAddProductModal", () => ({
  QuickAddProductModal: ({ open, onClose }: any) =>
    open ? <div data-testid="quick-add-product-modal"><button onClick={onClose}>Close</button></div> : null,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("PurchaseInvoiceForm - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders PurchaseInvoiceForm with header, supplier section, items table and payment sidebar", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <PurchaseInvoiceForm />
        </MemoryRouter>
      );
    });

    // Header title
    expect(screen.getByText("إنشاء فاتورة مشتريات جديدة")).toBeDefined();
    // Supplier label
    expect(screen.getByText("المورد *")).toBeDefined();
    // Items section header
    expect(screen.getByText("بنود الفاتورة")).toBeDefined();
    // Financial sidebar title
    expect(screen.getByText("ملخص الحسابات")).toBeDefined();
  });

  it("renders InvoiceHeader directly with toggle and print support", () => {
    const onBack = vi.fn();
    const setAdvanced = vi.fn();

    render(
      <InvoiceHeader
        isEdit={true}
        showAdvancedItemColumns={false}
        setShowAdvancedItemColumns={setAdvanced}
        onBack={onBack}
        t={(k, f) => f}
      />
    );

    expect(screen.getByText("تعديل فاتورة مشتريات")).toBeDefined();
    expect(screen.getByText("طباعة")).toBeDefined();

    const toggleBtn = screen.getByText("إظهار الضريبة والخصم لكل بند");
    fireEvent.click(toggleBtn);
    expect(setAdvanced).toHaveBeenCalledTimes(1);

    const backBtn = screen.getByRole("button", { name: "العودة" });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders InvoicePaymentSection with totals and payment options", () => {
    const setPaymentOption = vi.fn();
    const setFormData = vi.fn();

    render(
      <InvoicePaymentSection
        itemsCount={3}
        totals={{
          subtotal: 1000,
          totalTax: 140,
          itemDiscounts: 50,
          grandTotal: 1090,
          effectivePaid: 0,
          remainingAmount: 1090,
        }}
        formData={{
          supplierId: "supp-1",
          purchaseOrderId: "",
          referenceNumber: "",
          invoiceDate: "2026-10-31",
          dueDate: "2026-11-15",
          notes: "",
          shippingCost: 0,
          discountAmount: 0,
        }}
        setFormData={setFormData}
        paymentOption="UNPAID"
        setPaymentOption={setPaymentOption}
        paymentMethod="CASH"
        setPaymentMethod={vi.fn()}
        customPaidAmount={0}
        setCustomPaidAmount={vi.fn()}
        treasuryAccounts={[]}
        treasuryAccountId=""
        setTreasuryAccountId={vi.fn()}
        saving={false}
        isEdit={false}
        onCancel={vi.fn()}
        t={(k, f) => f}
      />
    );

    expect(screen.getByText("3 بنود")).toBeDefined();
    expect(screen.getAllByText(/١[٬,]٠٩٠|1[,.]090/).length).toBeGreaterThanOrEqual(1);

    const fullPaymentBtn = screen.getByText("سداد فوري");
    fireEvent.click(fullPaymentBtn);
    expect(setPaymentOption).toHaveBeenCalledWith("FULL");
  });

  it("renders QuickSupplierDialog and submits new supplier data", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const setName = vi.fn();
    const setPhone = vi.fn();

    render(
      <QuickSupplierDialog
        isOpen={true}
        setIsOpen={vi.fn()}
        name="مورد تجريبي"
        setName={setName}
        phone="01122334455"
        setPhone={setPhone}
        contact="محمد أحمد"
        setContact={vi.fn()}
        submitting={false}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("إضافة مورد جديد سريعاً")).toBeDefined();
    expect(screen.getByDisplayValue("مورد تجريبي")).toBeDefined();
    expect(screen.getByDisplayValue("01122334455")).toBeDefined();

    const submitBtn = screen.getByText("إضافة وحفظ");
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
