// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MerchantProfileDetails from "../MerchantProfileDetails";
import {
  formatInteger,
  formatDate,
  toNumber,
  getDisplayName,
  parsePaymentDetails,
  statusTone,
} from "../merchant-profile-details/helpers";
import { MerchantProfileResponse } from "../merchant-profile-details/types";

// Mock apiClient
const mockGet = vi.fn();

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

vi.mock("../../../hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (amount: number, currency = "EGP") => `${amount} ${currency}`,
    currency: "EGP",
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProfileData: MerchantProfileResponse = {
  merchant: {
    id: "m-123",
    name: "تاجر النيل للتجارة",
    email: "nile@example.com",
    phone: "01012345678",
    address: "القاهرة، مصر",
    commissionRate: 15,
    autoFulfill: true,
    fulfillmentMode: "MERCHANT",
    defaultWarehouseId: "wh-1",
    defaultShippingCompanyId: "sc-1",
    webhookUrl: "https://example.com/webhook",
    isActive: true,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
  user: {
    id: "u-1",
    firstName: "أحمد",
    lastName: "محمود",
    email: "ahmed@example.com",
    phone: "01012345678",
    isActive: true,
    lastLoginAt: "2026-10-25T14:30:00Z",
  },
  defaultWarehouse: {
    id: "wh-1",
    name: "مخزن القاهرة الرئيسي",
    location: "مدينة نصر",
    type: "main",
    isActive: true,
  },
  defaultShippingCompany: {
    id: "sc-1",
    name: "بوسطة إكسبريس",
    isActive: true,
  },
  merchantWarehouses: [
    {
      id: "wh-1",
      name: "مخزن القاهرة الرئيسي",
      location: "مدينة نصر",
      type: "main",
      isActive: true,
      _count: {
        inventories: 120,
        shipments: 45,
      },
    },
  ],
  inventorySummary: {
    linkedProducts: 8,
    availableForSale: 350,
    merchantProductStock: 400,
    physicalQuantity: 420,
    physicalAvailable: 370,
    reservedQuantity: 50,
    stockLocation: "MERCHANT",
    stockLocationLabel: "مخزن التاجر",
  },
  operationsSummary: {
    summary: {
      assignedOrdersCount: 25,
      assignedPieces: 50,
      deliveredOrdersCount: 20,
      deliveredPieces: 40,
    },
    rows: [
      {
        id: "op-1",
        orderId: "ord-1",
        orderNumber: "ORD-9988",
        createdAt: "2026-10-24T12:00:00Z",
        customerName: "عميل تجريبي",
        customerPhone: "01122334455",
        fulfillmentSource: "MERCHANT",
        warehouseName: "مخزن القاهرة",
        shippingCompanyName: "بوسطة",
        operationStatus: "DELIVERED",
        pieces: 2,
        payableAmount: 550,
      },
    ],
  },
  products: [
    {
      id: "mp-1",
      merchantSku: "SKU-NILE-01",
      merchantPrice: 250,
      stock: 50,
      isActive: true,
      product: {
        id: "p-1",
        name: "منتج التيشيرت القطني",
        sku: "TSHIRT-01",
        price: 200,
        stock: 100,
        isActive: true,
      },
      inventorySnapshot: {
        availableForSale: 45,
        stockLocationLabel: "مخزن التاجر",
      },
    },
  ],
  commissions: [
    {
      id: "comm-1",
      amount: 75,
      status: "CONFIRMED",
      orderTotal: 500,
      createdAt: "2026-10-23T11:00:00Z",
      order: {
        id: "ord-1",
        orderNumber: "ORD-9988",
        status: "DELIVERED",
        total: 500,
      },
      merchant_payout: {
        id: "pay-1",
        status: "PENDING",
      },
    },
  ],
  payouts: [
    {
      id: "payout-1",
      amount: 1500,
      currency: "EGP",
      status: "PROCESSED",
      paymentMethod: "تحويل بنكي",
      paymentDetails: JSON.stringify({ bank: "CIB", account: "123456" }),
      transactionId: "TX-5544",
      createdAt: "2026-10-20T10:00:00Z",
      processedAt: "2026-10-21T12:00:00Z",
    },
  ],
  stats: {
    linkedProducts: 8,
    availableForSale: 350,
    merchantProductStock: 400,
    physicalQuantity: 420,
    physicalAvailable: 370,
    reservedQuantity: 50,
    ordersCount: 25,
    assignedPieces: 50,
    deliveredOrders: 20,
    deliveredPieces: 40,
    inShippingOrders: 3,
    inShippingPieces: 6,
    notDeliveredOrders: 2,
    notDeliveredPieces: 4,
    payablePieces: 40,
    pendingPayablePieces: 10,
    expectedReceivableAmount: 12000,
    deliveredPayableAmount: 10000,
    inShippingAmount: 1500,
    notDeliveredAmount: 500,
    shippingCostAmount: 800,
    commissionsCount: 15,
    confirmedCommissionAmount: 2500,
    pendingCommissionAmount: 450,
    paidCommissionAmount: 3000,
    cancelledCommissionAmount: 100,
    availablePayoutAmount: 2500,
    availableCommissionsCount: 12,
    pendingPayoutAmount: 1500,
    confirmedPayoutAmount: 2500,
    paidPayoutAmount: 3000,
    payoutRequestsCount: 3,
    processedPayoutAmount: 3000,
  },
};

describe("MerchantProfileDetails (Modular)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading spinner initially and then displays full merchant profile", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockProfileData,
      },
    });

    render(
      <MemoryRouter initialEntries={["/merchants/m-123/profile"]}>
        <Routes>
          <Route path="/merchants/:id/profile" element={<MerchantProfileDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText(/ملف التاجر:/i)).toBeInTheDocument();
    });

    // Check display name
    expect(screen.getByText(/أحمد محمود/i)).toBeInTheDocument();

    // Check metrics row
    expect(screen.getByText("المتاح للسحب")).toBeInTheDocument();
    expect(screen.getByText("عمولات مؤكدة")).toBeInTheDocument();
    expect(screen.getByText("الرصيد الفعلي")).toBeInTheDocument();
    expect(screen.getByText("طلبات التاجر")).toBeInTheDocument();

    // Check orders table
    expect(screen.getByText("تاريخ الطلبات المرتبطة")).toBeInTheDocument();
    expect(screen.getAllByText("ORD-9988").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("عميل تجريبي")).toBeInTheDocument();

    // Check commissions table
    expect(screen.getByText("عمولات التاجر")).toBeInTheDocument();

    // Check payouts table
    expect(screen.getByText("طلبات السحب")).toBeInTheDocument();
    expect(screen.getByText("تحويل بنكي")).toBeInTheDocument();

    // Check aside panels
    expect(screen.getByText("بيانات الحساب")).toBeInTheDocument();
    expect(screen.getByText("إعدادات التشغيل")).toBeInTheDocument();
    expect(screen.getByText("المخزون والمنتجات")).toBeInTheDocument();
    expect(screen.getByText("منتج التيشيرت القطني")).toBeInTheDocument();
    expect(screen.getByText("مخازن التاجر")).toBeInTheDocument();
    expect(screen.getByText("ملخص مالي")).toBeInTheDocument();
  });

  it("renders not found state when merchant data is unavailable", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: false,
        data: null,
      },
    });

    render(
      <MemoryRouter initialEntries={["/merchants/invalid-id/profile"]}>
        <Routes>
          <Route path="/merchants/:id/profile" element={<MerchantProfileDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("ملف التاجر غير متاح.")).toBeInTheDocument();
    });
    expect(screen.getByText("رجوع للتجار")).toBeInTheDocument();
  });

  it("correctly executes helper functions", () => {
    expect(toNumber(50)).toBe(50);
    expect(toNumber("120.5")).toBe(120.5);
    expect(toNumber(null)).toBe(0);

    expect(formatInteger(1000)).toBe("١٬٠٠٠");
    expect(formatDate(null)).toBe("غير محدد");

    expect(getDisplayName({ id: "1", firstName: "علي", lastName: "حسن" })).toBe("علي حسن");
    expect(getDisplayName(null, "اسم بديل")).toBe("اسم بديل");

    expect(parsePaymentDetails(JSON.stringify({ acc: "123" }))).toBe("acc: 123");
    expect(parsePaymentDetails("")).toBe("غير محدد");

    expect(statusTone("ACTIVE")).toContain("emerald");
    expect(statusTone("PENDING")).toContain("amber");
    expect(statusTone("CANCELLED")).toContain("red");
  });
});
