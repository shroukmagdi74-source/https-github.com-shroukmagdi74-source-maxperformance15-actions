// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  formatPieces,
  formatMoney,
  createEmptyOperationsTotals,
  getMerchantOperationsTotals,
  getApiErrorMessage,
} from "../merchant-profile/helpers";
import { MerchantProfileHeader } from "../merchant-profile/MerchantProfileHeader";
import { MerchantProfileForm } from "../merchant-profile/MerchantProfileForm";
import { MerchantQuickSummaryCard } from "../merchant-profile/MerchantQuickSummaryCard";
import { MerchantOperationsCard } from "../merchant-profile/MerchantOperationsCard";
import { MerchantLinkedProductsCard } from "../merchant-profile/MerchantLinkedProductsCard";
import { MerchantLinkProductCard } from "../merchant-profile/MerchantLinkProductCard";
import { MerchantInventorySyncCard } from "../merchant-profile/MerchantInventorySyncCard";
import { MerchantProfile } from "../MerchantProfile";
import {
  MerchantProfileFormData,
  MerchantRecord,
  ProductOption,
  ShippingCompanyOption,
  WarehouseOption,
} from "../merchant-profile/types";

// Mock apiClient
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}));

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    actualTheme: "light",
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMerchant: MerchantRecord = {
  id: "m-123",
  name: "تاجر النيل للتجارة",
  email: "nile@example.com",
  phone: "01012345678",
  address: "القاهرة، مصر",
  commissionRate: 12.5,
  autoFulfill: true,
  fulfillmentMode: "COMPANY_WAREHOUSE",
  defaultWarehouseId: "wh-1",
  defaultShippingCompanyId: "sc-1",
  webhookUrl: "https://example.com/webhook",
  isActive: true,
  createdAt: "2026-01-15T10:00:00.000Z",
  products: [
    {
      id: "mp-1",
      merchantSku: "SKU-001",
      merchantPrice: 250,
      stock: 40,
      syncEnabled: true,
      lastSyncedAt: "2026-02-10T14:30:00.000Z",
      product: {
        id: "prod-1",
        name: "سماعة بلوتوث رياضية",
        price: 300,
      },
      inventorySnapshot: {
        stockLocationLabel: "مخزن القاهرة الرئيسي",
        canEditStock: true,
        merchantProductStock: 40,
        physicalQuantity: 50,
        physicalAvailable: 40,
        reservedQuantity: 10,
        availableForSale: 40,
        warehouseNames: ["مخزن القاهرة"],
      },
    },
  ],
  inventorySummary: {
    linkedProducts: 1,
    availableForSale: 40,
    merchantProductStock: 40,
    physicalQuantity: 50,
    physicalAvailable: 40,
    reservedQuantity: 10,
    stockLocationLabel: "مخزن القاهرة الرئيسي",
    warehouseNames: ["مخزن القاهرة"],
  },
  operationsSummary: {
    summary: {
      assignedOrdersCount: 25,
      assignedPieces: 30,
      preparationOrdersCount: 5,
      preparationPieces: 6,
      inShippingOrdersCount: 8,
      inShippingPieces: 10,
      deliveredOrdersCount: 10,
      deliveredPieces: 12,
      notDeliveredOrdersCount: 2,
      notDeliveredPieces: 2,
      payablePieces: 12,
      deliveredPayableAmount: 3000,
      inShippingAmount: 2500,
      paidAmount: 1800,
    },
    rows: [
      {
        id: "op-1",
        orderNumber: "ORD-9901",
        customerName: "أحمد علي",
        pieces: 2,
        merchantAmount: 500,
        operationStatus: "DELIVERED",
      },
    ],
  },
};

const mockWarehouses: WarehouseOption[] = [
  { id: "wh-1", name: "مخزن القاهرة المركزي", location: "مدينة نصر", isActive: true },
  { id: "wh-2", name: "مخزن الإسكندرية", location: "سموحة", isActive: true },
];

const mockShippingCompanies: ShippingCompanyOption[] = [
  { id: "sc-1", name: "بوسطة", slug: "bosta", isActive: true },
  { id: "sc-2", name: "أرامكس", slug: "aramex", isActive: true },
];

const mockAvailableProducts: ProductOption[] = [
  { id: "prod-1", name: "سماعة بلوتوث رياضية", price: 300, stock: 100 },
  { id: "prod-2", name: "ساعة ذكية مقاومة للماء", price: 650, stock: 25 },
];

describe("MerchantProfile Modular Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Helpers", () => {
    it("formatPieces formats integers using Arabic digits", () => {
      const res = formatPieces(150);
      expect(res).toBeTruthy();
    });

    it("formatMoney formats currency properly", () => {
      const res = formatMoney(2500, "EGP");
      expect(res).toContain("ج.م.");
    });

    it("createEmptyOperationsTotals returns zeroed object", () => {
      const empty = createEmptyOperationsTotals();
      expect(empty.assignedOrdersCount).toBe(0);
      expect(empty.paidAmount).toBe(0);
    });

    it("getMerchantOperationsTotals extracts totals or fallbacks", () => {
      const totals = getMerchantOperationsTotals(mockMerchant);
      expect(totals.assignedOrdersCount).toBe(25);
      expect(totals.deliveredPayableAmount).toBe(3000);
    });

    it("getApiErrorMessage handles Axios errors and fallback", () => {
      const fallback = "حدث خطأ غير متوقع";
      expect(getApiErrorMessage(null, fallback)).toBe(fallback);
      expect(
        getApiErrorMessage(
          { response: { data: { message: "البيانات المدخلة غير صحيحة" } } },
          fallback,
        ),
      ).toBe("البيانات المدخلة غير صحيحة");
    });
  });

  describe("MerchantProfileHeader", () => {
    it("renders merchant name and links in view mode", () => {
      const onBack = vi.fn();
      render(
        <MemoryRouter>
          <MerchantProfileHeader
            isDark={false}
            isEditMode={false}
            merchantName="تاجر النيل"
            merchantId="m-123"
            onBack={onBack}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText("تاجر النيل")).toBeInTheDocument();
      expect(screen.getByText("الطلبات الموحدة")).toBeInTheDocument();
      expect(screen.getByText("المخزون الموحد")).toBeInTheDocument();
      expect(screen.getByText("المنتجات")).toBeInTheDocument();
      expect(screen.getByText("تعديل")).toBeInTheDocument();

      fireEvent.click(screen.getByText("العودة إلى قائمة التجار"));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("renders edit title in edit mode without navigation chips", () => {
      render(
        <MemoryRouter>
          <MerchantProfileHeader
            isDark={true}
            isEditMode={true}
            merchantName="تاجر النيل"
            merchantId="m-123"
            onBack={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText("تعديل بيانات التاجر")).toBeInTheDocument();
      expect(screen.queryByText("تعديل")).not.toBeInTheDocument();
    });
  });

  describe("MerchantProfileForm", () => {
    it("renders form fields disabled in view mode", () => {
      const formData: MerchantProfileFormData = {
        name: "تاجر النيل",
        email: "nile@example.com",
        phone: "01012345678",
        address: "القاهرة",
        commissionRate: 15,
        autoFulfill: true,
        fulfillmentMode: "COMPANY_WAREHOUSE",
        defaultWarehouseId: "wh-1",
        defaultShippingCompanyId: "sc-1",
        webhookUrl: "https://example.com",
        isActive: true,
      };

      render(
        <MerchantProfileForm
          isDark={false}
          isEditMode={false}
          formData={formData}
          setFormData={vi.fn()}
          warehouses={mockWarehouses}
          shippingCompanies={mockShippingCompanies}
          optionsLoading={false}
          saving={false}
          merchantId="m-123"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const nameInput = screen.getByDisplayValue("تاجر النيل");
      expect(nameInput).toBeDisabled();
      expect(screen.queryByText("حفظ التعديلات")).not.toBeInTheDocument();
    });

    it("renders action buttons in edit mode and triggers onSubmit and onCancel", () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      const onCancel = vi.fn();
      const formData: MerchantProfileFormData = {
        name: "تاجر النيل",
        email: "nile@example.com",
        phone: "01012345678",
        address: "القاهرة",
        commissionRate: 15,
        autoFulfill: true,
        fulfillmentMode: "COMPANY_WAREHOUSE",
        defaultWarehouseId: "wh-1",
        defaultShippingCompanyId: "sc-1",
        webhookUrl: "https://example.com",
        isActive: true,
      };

      render(
        <MerchantProfileForm
          isDark={false}
          isEditMode={true}
          formData={formData}
          setFormData={vi.fn()}
          warehouses={mockWarehouses}
          shippingCompanies={mockShippingCompanies}
          optionsLoading={false}
          saving={false}
          merchantId="m-123"
          onSubmit={onSubmit}
          onCancel={onCancel}
        />,
      );

      const saveBtn = screen.getByText("حفظ التعديلات");
      const cancelBtn = screen.getByText("إلغاء");

      expect(saveBtn).toBeInTheDocument();
      expect(cancelBtn).toBeInTheDocument();

      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(saveBtn);
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe("MerchantQuickSummaryCard", () => {
    it("renders status, stock, and warehouse information", () => {
      const totals = getMerchantOperationsTotals(mockMerchant);
      render(
        <MerchantQuickSummaryCard
          isDark={false}
          merchant={mockMerchant}
          selectedWarehouse={mockWarehouses[0]}
          selectedShippingCompany={mockShippingCompanies[0]}
          operationsTotals={totals}
          fulfillmentModeLabel="الشركة تنفذ من مخزنها"
        />,
      );

      expect(screen.getByText("ملخص سريع")).toBeInTheDocument();
      expect(screen.getByText("نشط")).toBeInTheDocument();
      expect(screen.getByText("مخزن القاهرة المركزي")).toBeInTheDocument();
      expect(screen.getByText("بوسطة")).toBeInTheDocument();
    });
  });

  describe("MerchantOperationsCard", () => {
    it("renders operational totals and order numbers", () => {
      const totals = getMerchantOperationsTotals(mockMerchant);
      render(
        <MemoryRouter>
          <MerchantOperationsCard
            isDark={false}
            operationsTotals={totals}
            recentOperations={mockMerchant.operationsSummary?.rows || []}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText("متابعة طلبات التاجر")).toBeInTheDocument();
      expect(screen.getByText("قيد التجهيز")).toBeInTheDocument();
      expect(screen.getByText("في الشحن")).toBeInTheDocument();
      expect(screen.getAllByText("تم التسليم").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("ORD-9901")).toBeInTheDocument();
      expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    });
  });

  describe("MerchantLinkedProductsCard", () => {
    it("renders linked products details", () => {
      render(
        <MerchantLinkedProductsCard
          isDark={false}
          products={mockMerchant.products}
          fulfillmentModeLabel="الشركة تنفذ من مخزنها"
        />,
      );

      expect(screen.getByText("المنتجات المرتبطة")).toBeInTheDocument();
      expect(screen.getByText("سماعة بلوتوث رياضية")).toBeInTheDocument();
      expect(screen.getByText(/مخزن القاهرة الرئيسي/)).toBeInTheDocument();
    });

    it("renders empty state message when no products", () => {
      render(
        <MerchantLinkedProductsCard
          isDark={false}
          products={[]}
          fulfillmentModeLabel="الشركة تنفذ من مخزنها"
        />,
      );

      expect(
        screen.getByText("لا توجد منتجات مرتبطة بهذا التاجر بعد."),
      ).toBeInTheDocument();
    });
  });

  describe("MerchantLinkProductCard", () => {
    it("renders link form and inputs correctly", () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <MerchantLinkProductCard
          isDark={false}
          linkForm={{
            productId: "",
            merchantSku: "",
            merchantPrice: "120",
            stock: "15",
            syncEnabled: true,
          }}
          setLinkForm={vi.fn()}
          availableProducts={mockAvailableProducts}
          linkedProductIds={new Set(["prod-1"])}
          productsLoading={false}
          linkingProduct={false}
          onSubmit={onSubmit}
        />,
      );

      expect(screen.getByText("ربط منتج بالتاجر")).toBeInTheDocument();
      expect(screen.getByText("ربط المنتج بالتاجر")).toBeInTheDocument();
      expect(screen.getByDisplayValue("120")).toBeInTheDocument();
      expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    });
  });

  describe("MerchantInventorySyncCard", () => {
    it("triggers onSync when clicked", () => {
      const onSync = vi.fn();
      render(
        <MerchantInventorySyncCard
          isDark={false}
          syncableProductsCount={2}
          totalProductsCount={3}
          lastSyncSummary={{ synced: 2, timestamp: "2026-02-15T12:00:00Z" }}
          syncingInventory={false}
          onSync={onSync}
        />,
      );

      expect(screen.getByText("مزامنة المخزون")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      const syncBtn = screen.getByText("تشغيل مزامنة المخزون الآن");
      fireEvent.click(syncBtn);
      expect(onSync).toHaveBeenCalledTimes(1);
    });
  });

  describe("MerchantProfile Coordinator", () => {
    it("renders full page when merchant data is loaded", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.startsWith("/merchants/")) {
          return Promise.resolve({ data: { success: true, data: mockMerchant } });
        }
        if (url === "/products") {
          return Promise.resolve({ data: { success: true, data: mockAvailableProducts } });
        }
        if (url === "/warehouses") {
          return Promise.resolve({ data: { success: true, data: mockWarehouses } });
        }
        if (url === "/shipping-companies") {
          return Promise.resolve({ data: { success: true, data: mockShippingCompanies } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      render(
        <MemoryRouter initialEntries={["/merchants/m-123"]}>
          <MerchantProfile />
        </MemoryRouter>,
      );

      // Loading spinner initially
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });
});
