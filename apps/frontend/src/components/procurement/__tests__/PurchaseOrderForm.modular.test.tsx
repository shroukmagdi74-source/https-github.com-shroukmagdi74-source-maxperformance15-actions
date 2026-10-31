// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PurchaseOrderForm from "../PurchaseOrderForm";
import {
  OrderHeader,
  OrderSupplierSection,
  OrderItemsTable,
  OrderTermsSection,
  OrderSummarySidebar,
  OrderQuickSupplierDialog,
} from "../purchase-order-form";

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url === "/procurement/suppliers") {
        return Promise.resolve({
          data: {
            suppliers: [
              {
                id: "supp-10",
                name: "شركة النيل للمعدات",
                phone: "01011223344",
                currentBalance: 8500,
              },
            ],
          },
        });
      }
      if (url.startsWith("/procurement/purchase-orders/po-123")) {
        return Promise.resolve({
          data: {
            order: {
              id: "po-123",
              supplierId: "supp-10",
              orderDate: "2026-10-30",
              expectedDelivery: "2026-11-05",
              paymentTerms: "50% مقدم",
              notes: "فحص الجودة مطلوب",
              shippingCost: 200,
              discountAmount: 100,
              items: [
                {
                  id: "item-1",
                  productId: "prod-1",
                  productName: "مادة زركونيا سوبر",
                  quantity: 10,
                  unitPrice: 500,
                  taxRate: 14,
                  discountRate: 5,
                  totalPrice: 5415,
                },
              ],
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true, order: { id: "po-999" } } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock("../components", () => ({
  ProcurementCatalogModal: ({ open, onClose }: any) =>
    open ? <div data-testid="catalog-modal"><button onClick={onClose}>Close Catalog</button></div> : null,
  ProcurementItemCombobox: ({ value, placeholder, onSelect }: any) => (
    <div data-testid="item-combobox">
      <input
        aria-label="Item name"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onSelect?.({ productName: e.target.value, unitPrice: 150 })}
      />
    </div>
  ),
  fetchProcurementCatalog: vi.fn().mockResolvedValue([]),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("PurchaseOrderForm - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders PurchaseOrderForm with header, supplier section, items table, and summary sidebar", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <PurchaseOrderForm />
        </MemoryRouter>
      );
    });

    // Check header title
    expect(screen.getByText(/إنشاء أمر شراء جديد/)).toBeDefined();

    // Check items table section
    expect(screen.getByText(/الأصناف والخامات/)).toBeDefined();

    // Check summary title
    expect(screen.getByText(/ملخص المبالغ/)).toBeDefined();
  });

  it("renders OrderHeader with correct title for create and edit modes", () => {
    const onBack = vi.fn();
    const onToggle = vi.fn();

    const { rerender } = render(
      <OrderHeader
        isEdit={false}
        showAdvancedItemColumns={false}
        onBack={onBack}
        onToggleAdvancedColumns={onToggle}
      />
    );

    expect(screen.getByText(/إنشاء أمر شراء جديد/)).toBeDefined();

    rerender(
      <OrderHeader
        isEdit={true}
        showAdvancedItemColumns={true}
        onBack={onBack}
        onToggleAdvancedColumns={onToggle}
      />
    );

    expect(screen.getByText(/تعديل أمر شراء/)).toBeDefined();
    expect(screen.getByText(/طباعة/)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "العودة لأوامر الشراء" }));
    expect(onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByText(/إخفاء الضرائب والخصومات الفرعية/));
    expect(onToggle).toHaveBeenCalled();
  });

  it("renders OrderSupplierSection and allows toggling supplier combobox", () => {
    const setFormData = vi.fn();
    const setSupplierSearchOpen = vi.fn();
    const setSupplierSearchQuery = vi.fn();
    const onOpenQuick = vi.fn();

    render(
      <OrderSupplierSection
        formData={{
          supplierId: "supp-10",
          orderDate: "2026-10-31",
          expectedDelivery: "2026-11-05",
          paymentTerms: "",
          notes: "",
          shippingCost: 0,
          discountAmount: 0,
        }}
        setFormData={setFormData}
        suppliers={[
          { id: "supp-10", name: "شركة النيل للمعدات", currentBalance: 8500 },
        ]}
        selectedSupplier={{
          id: "supp-10",
          name: "شركة النيل للمعدات",
          currentBalance: 8500,
        }}
        filteredSuppliers={[
          { id: "supp-10", name: "شركة النيل للمعدات", currentBalance: 8500 },
        ]}
        supplierSearchOpen={false}
        setSupplierSearchOpen={setSupplierSearchOpen}
        supplierSearchQuery=""
        setSupplierSearchQuery={setSupplierSearchQuery}
        supplierDropdownRef={{ current: null }}
        onOpenQuickSupplier={onOpenQuick}
      />
    );

    expect(screen.getByText("شركة النيل للمعدات")).toBeDefined();
    expect(screen.getByText(/الرصيد الحالي:/)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /\+ مورد جديد/ }));
    expect(onOpenQuick).toHaveBeenCalled();
  });

  it("renders OrderItemsTable and adds a new item", () => {
    const addItem = vi.fn();
    const removeItem = vi.fn();
    const updateItem = vi.fn();
    const updateItemDetails = vi.fn();
    const onOpenCatalog = vi.fn();

    render(
      <OrderItemsTable
        items={[
          {
            productId: null,
            productName: "ديسك زركونيا أبيض",
            description: "",
            quantity: 5,
            unitPrice: 200,
            taxRate: 0,
            discountRate: 0,
            totalPrice: 1000,
          },
        ]}
        catalogItems={[]}
        showAdvancedItemColumns={false}
        itemInputRefs={{ current: [] }}
        updateItem={updateItem}
        updateItemDetails={updateItemDetails}
        handlePriceKeyDown={vi.fn()}
        addItem={addItem}
        removeItem={removeItem}
        onOpenCatalogModal={onOpenCatalog}
      />
    );

    expect(screen.getAllByDisplayValue("ديسك زركونيا أبيض")[0]).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /إضافة بند جديد/ }));
    expect(addItem).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /استعراض منتجات المتجر/ }));
    expect(onOpenCatalog).toHaveBeenCalled();
  });

  it("renders OrderTermsSection and allows typing notes", () => {
    const setFormData = vi.fn();
    render(
      <OrderTermsSection
        formData={{
          supplierId: "",
          orderDate: "2026-10-31",
          expectedDelivery: "",
          paymentTerms: "تسليم فوري",
          notes: "تغليف محكم",
          shippingCost: 0,
          discountAmount: 0,
        }}
        setFormData={setFormData}
      />
    );

    expect(screen.getByDisplayValue("تسليم فوري")).toBeDefined();
    expect(screen.getByDisplayValue("تغليف محكم")).toBeDefined();
  });

  it("renders OrderQuickSupplierDialog and allows inputting supplier info", () => {
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <OrderQuickSupplierDialog
        open={true}
        onOpenChange={onOpenChange}
        quickSupplierName="شركة الأهرام للأسنان"
        setQuickSupplierName={vi.fn()}
        quickSupplierPhone="01099887766"
        setQuickSupplierPhone={vi.fn()}
        quickSupplierContact="أحمد مصطفى"
        setQuickSupplierContact={vi.fn()}
        submitting={false}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/إضافة مورد جديد سريعاً/)).toBeDefined();
    expect(screen.getByDisplayValue("شركة الأهرام للأسنان")).toBeDefined();
    expect(screen.getByDisplayValue("01099887766")).toBeDefined();
    expect(screen.getByDisplayValue("أحمد مصطفى")).toBeDefined();
  });
});
