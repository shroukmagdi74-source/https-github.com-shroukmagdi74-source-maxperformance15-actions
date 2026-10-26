// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    actualTheme: "light",
    toggleTheme: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

import { Product, CartItem, ShiftData, LastOrder } from "../pos-page/types";
import { PosTopControlBar } from "../pos-page/PosTopControlBar";
import { PosCategoriesRibbon } from "../pos-page/PosCategoriesRibbon";
import { PosProductsGrid } from "../pos-page/PosProductsGrid";
import { PosCartPanel } from "../pos-page/PosCartPanel";
import { PosPaymentModal } from "../pos-page/PosPaymentModal";
import { PosReceiptModal } from "../pos-page/PosReceiptModal";
import { PosParkTableModal } from "../pos-page/PosParkTableModal";
import { PosShiftReportModal } from "../pos-page/PosShiftReportModal";
import { submitPosOrder } from "../pos-page/posOrderService";

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    "posPage.searchPlaceholder": "بحث باسم المنتج أو الباركود...",
    "posPage.all": "الكل",
    "posPage.notSpecified": "غير مصنف",
    "posPage.clearCartConfirm": "هل تريد تفريغ السلة؟",
    "posPage.totalSales": "إجمالي المبيعات",
    "posPage.ordersCount": "عدد الطلبات",
    "posPage.totalProducts": "المنتجات المباعة",
    "posPage.shiftStart": "بداية الوردية",
    "posPage.newShift": "وردية جديدة",
    "posPage.close": "إغلاق",
    "pos.k_47": "دفع (F4)",
    "pos.k_48": "إتمام الدفع",
    "pos.k_49": "نقداً",
    "pos.k_50": "بطاقة",
    "pos.k_51": "دفع مجزأ",
    "pos.k_52": "تأكيد الدفع وطباعة الفاتورة",
    "pos.k_53": "تم تسجيل الطلب بنجاح",
    "pos.k_54": "طباعة الفاتورة",
    "pos.k_55": "إغلاق",
    "pos.k_6": "المبلغ المطلوب",
    "pos.k_8": "المتبقي للعميل (الفكة)",
    "pos.k_39": "ج.م",
    "pos.k_56": "تقرير الوردية الحالية",
  };
  return translations[key] || key;
};

const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Espresso Single",
    price: 35,
    images: ["/uploads/espresso.png"],
    category: "Coffee",
    stock: 20,
    sku: "ESP-01",
    trackInventory: true,
  },
  {
    id: "prod-2",
    name: "Cheesecake Slice",
    price: 65,
    images: [],
    category: "Desserts",
    stock: 0,
    sku: "CHK-02",
    trackInventory: true,
  },
];

const mockCart: CartItem[] = [
  {
    id: "prod-1",
    name: "Espresso Single",
    price: 35,
    qty: 2,
    images: ["/uploads/espresso.png"],
    category: "Coffee",
    stock: 20,
    sku: "ESP-01",
  },
];

describe("PosTopControlBar", () => {
  it("renders search input with F2 badge and handles search query changes", () => {
    const setSearchQuery = vi.fn();
    const setIsFullscreen = vi.fn();
    const searchRef = { current: null };

    render(
      <PosTopControlBar
        searchQuery=""
        setSearchQuery={setSearchQuery}
        searchRef={searchRef}
        isFullscreen={false}
        setIsFullscreen={setIsFullscreen}
        t={mockT}
      />
    );

    const input = screen.getByPlaceholderText("بحث باسم المنتج أو الباركود...");
    expect(input).toBeDefined();
    expect(screen.getByText("F2")).toBeDefined();
    expect(screen.getByText("الرسيبي")).toBeDefined();
    expect(screen.getByText("الجرد")).toBeDefined();

    fireEvent.change(input, { target: { value: "espresso" } });
    expect(setSearchQuery).toHaveBeenCalledWith("espresso");
  });
});

describe("PosCategoriesRibbon", () => {
  it("renders categories and handles selection", () => {
    const onSelect = vi.fn();
    render(
      <PosCategoriesRibbon
        categories={["الكل", "Coffee", "Desserts"]}
        selectedCategory="الكل"
        onSelectCategory={onSelect}
      />
    );

    expect(screen.getByText("الكل")).toBeDefined();
    expect(screen.getByText("Coffee")).toBeDefined();
    expect(screen.getByText("Desserts")).toBeDefined();

    fireEvent.click(screen.getByText("Coffee"));
    expect(onSelect).toHaveBeenCalledWith("Coffee");
  });
});

describe("PosProductsGrid", () => {
  it("renders loading state", () => {
    render(
      <PosProductsGrid
        products={[]}
        loading={true}
        onAddToCart={vi.fn()}
        t={mockT}
      />
    );
    expect(screen.getByText("جاري تحميل المنتجات...")).toBeDefined();
  });

  it("renders empty state when no products found", () => {
    render(
      <PosProductsGrid
        products={[]}
        loading={false}
        onAddToCart={vi.fn()}
        t={mockT}
      />
    );
    expect(screen.getByText("لا توجد منتجات مطابقة للبحث")).toBeDefined();
  });

  it("renders products and triggers onAddToCart on click", () => {
    const onAddToCart = vi.fn();
    render(
      <PosProductsGrid
        products={mockProducts}
        loading={false}
        onAddToCart={onAddToCart}
        t={mockT}
      />
    );

    expect(screen.getByText("Espresso Single")).toBeDefined();
    expect(screen.getByText("Cheesecake Slice")).toBeDefined();

    fireEvent.click(screen.getByText("Espresso Single"));
    expect(onAddToCart).toHaveBeenCalledWith(mockProducts[0]);
  });
});

describe("PosCartPanel", () => {
  it("renders cart items, quantities, and calculates totals", () => {
    const onUpdateQty = vi.fn();
    const onRemoveItem = vi.fn();
    const onClearCart = vi.fn();
    const onOpenPayment = vi.fn();

    render(
      <PosCartPanel
        cart={mockCart}
        activeTabName={null}
        activeTabId={null}
        openTabs={[]}
        kotSuccessNotice={null}
        kotFiring={false}
        discountType="NONE"
        discountPercent={0}
        rawSubtotal={70}
        discountAmount={0}
        tax={9.8}
        total={79.8}
        onOpenParkModal={vi.fn()}
        onClearCart={onClearCart}
        onUnlinkTab={vi.fn()}
        onRestoreTab={vi.fn()}
        onDeleteTab={vi.fn()}
        onUpdateQty={onUpdateQty}
        onRemoveItem={onRemoveItem}
        onSetDiscount={vi.fn()}
        onOpenShiftReport={vi.fn()}
        onFireKitchenTicket={vi.fn()}
        onOpenPayment={onOpenPayment}
        t={mockT}
      />
    );

    expect(screen.getByText("Espresso Single")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();

    // Trigger payment button
    const payBtn = screen.getByRole("button", { name: /دفع \(F4\)/i });
    expect(payBtn).toBeDefined();
    fireEvent.click(payBtn);
    expect(onOpenPayment).toHaveBeenCalled();
  });
});

describe("PosPaymentModal", () => {
  it("calculates cash change and submits checkout", () => {
    const onCheckout = vi.fn();
    const setPaymentMethod = vi.fn();
    const setCashReceived = vi.fn();

    render(
      <PosPaymentModal
        show={true}
        onClose={vi.fn()}
        total={100}
        paymentMethod="CASH"
        setPaymentMethod={setPaymentMethod}
        cashReceived={150}
        setCashReceived={setCashReceived}
        splitCash={0}
        setSplitCash={vi.fn()}
        splitCard={0}
        setSplitCard={vi.fn()}
        change={50}
        processing={false}
        onCheckout={onCheckout}
        t={mockT}
      />
    );

    expect(screen.getByText("إتمام الدفع")).toBeDefined();
    expect(screen.getAllByText(/100/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/50/).length).toBeGreaterThanOrEqual(1); // change

    const confirmBtn = screen.getByRole("button", { name: /تأكيد الدفع وطباعة الفاتورة/i });
    fireEvent.click(confirmBtn);
    expect(onCheckout).toHaveBeenCalled();
  });
});

describe("PosReceiptModal", () => {
  it("renders order success and print buttons", () => {
    const onPrintReceipt = vi.fn();
    const onPrintKitchenTicket = vi.fn();

    const mockOrder: LastOrder = {
      orderNumber: "ORD-9988",
      items: mockCart,
      subtotal: 70,
      tax: 9.8,
      total: 79.8,
      customer: null,
      date: new Date(),
      paymentMethod: "CASH",
      cashReceived: 100,
      change: 20.2,
    };

    render(
      <PosReceiptModal
        show={true}
        lastOrder={mockOrder}
        onPrintReceipt={onPrintReceipt}
        onPrintKitchenTicket={onPrintKitchenTicket}
        onClose={vi.fn()}
        t={mockT}
      />
    );

    expect(screen.getByText("تم تسجيل الطلب بنجاح")).toBeDefined();
    expect(screen.getByText("ORD-9988")).toBeDefined();

    const printReceiptBtn = screen.getByRole("button", { name: /طباعة الفاتورة/i });
    fireEvent.click(printReceiptBtn);
    expect(onPrintReceipt).toHaveBeenCalled();
  });
});

describe("PosParkTableModal", () => {
  it("renders table parking modal and handles submission", () => {
    const onParkCart = vi.fn((e) => e.preventDefault());
    const setParkTableName = vi.fn();

    render(
      <PosParkTableModal
        show={true}
        onClose={vi.fn()}
        parkTableName="طاولة 5"
        setParkTableName={setParkTableName}
        onParkCart={onParkCart}
      />
    );

    expect(screen.getByText("تعليق الطلب (طاولة / شيك مفتوح)")).toBeDefined();
    const input = screen.getByPlaceholderText("مثال: طاولة 4، صالة 2");
    expect(input).toBeDefined();

    const submitBtn = screen.getByRole("button", { name: /حفظ وتعليق/i });
    fireEvent.click(submitBtn);
    expect(onParkCart).toHaveBeenCalled();
  });
});

describe("PosShiftReportModal", () => {
  it("renders shift metrics and reset button", () => {
    const onResetShift = vi.fn();
    const mockShift: ShiftData = {
      startTime: new Date("2026-10-26T08:00:00Z"),
      totalSales: 4500,
      totalOrders: 32,
      totalItems: 85,
      cashPayments: 3000,
      orders: [],
    };

    render(
      <PosShiftReportModal
        show={true}
        onClose={vi.fn()}
        shiftData={mockShift}
        onResetShift={onResetShift}
        locale="ar-EG"
        t={mockT}
      />
    );

    expect(screen.getByText("تقرير الوردية الحالية")).toBeDefined();
    expect(screen.getByText("32")).toBeDefined();
    expect(screen.getByText("85")).toBeDefined();

    const newShiftBtn = screen.getByRole("button", { name: /وردية جديدة/i });
    fireEvent.click(newShiftBtn);
    expect(onResetShift).toHaveBeenCalled();
  });
});

describe("posOrderService", () => {
  it("submits order payload and returns success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          data: { orderNumber: "ORD-2026-001" },
        }),
    });
    global.fetch = mockFetch;

    const result = await submitPosOrder({
      cart: mockCart,
      customer: null,
      paymentMethod: "CASH",
      discountAmount: 0,
      discountType: "NONE",
      splitCash: 0,
      splitCard: 0,
      subtotal: 70,
      tax: 9.8,
      total: 79.8,
      cashReceived: 100,
    });

    expect(result.success).toBe(true);
    expect(result.orderNumber).toBe("ORD-2026-001");
  });
});
