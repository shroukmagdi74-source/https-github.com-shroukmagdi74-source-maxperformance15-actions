// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import EnhancedOrderModal from "../EnhancedOrderModal";

vi.mock("@/services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: { governments: [] } } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
}));

vi.mock("@/hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (val: number) => `${val} ج.م`,
    currency: "EGP",
  }),
}));

vi.mock("@/hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Admin", company: { name: "Test Co" } },
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const translations: Record<string, string> = {
        "orders.orderDetails": "تفاصيل الطلب",
        "orders.close": "إغلاق",
        "orders.detailTabs.details": "التفاصيل",
        "orders.detailTabs.update": "تحديث الطلب",
        "orders.detailTabs.history": "السجل",
        "orders.customerInfo": "بيانات العميل",
        "orders.name": "الاسم",
        "orders.phone": "الهاتف",
        "orders.governorate": "المحافظة",
        "orders.city": "المدينة",
        "orders.products": "المنتجات",
        "orders.noProducts": "لا توجد منتجات",
        "orders.orderSummary": "ملخص الطلب",
        "orders.subtotal": "المجموع الفرعي",
        "orders.tax": "الضريبة",
        "orders.shipping": "الشحن",
        "orders.total": "الإجمالي",
        "orders.unit": "قطعة",
        "orders.quantity": "الكمية",
        "orders.updateOrder": "تحديث حالة الطلب",
        "orders.orderStatus": "حالة الطلب",
        "orders.paymentStatus": "حالة الدفع",
        "orders.pendingPayment": "معلق",
        "orders.completed": "مكتمل",
        "orders.failed": "فاشل",
        "orders.conversation": "المحادثة",
        "orders.viewConversation": "عرض المحادثة",
        "orders.notes": "ملاحظات",
        "orders.viewFullDetails": "عرض التفاصيل الكاملة",
        "orders.printInvoice": "طباعة الفاتورة",
        "orders.printing": "جاري الطباعة...",
        "orders.overridePathRules": "تجاوز قواعد المسار",
      };
      return translations[key] || opts?.defaultValue || key;
    },
  }),
}));

const mockOrder = {
  id: "order-123",
  orderNumber: "ORD-9988",
  customerName: "محمود حسن",
  customerPhone: "01012345678",
  governorate: "القاهرة",
  city: "مدينة نصر",
  status: "PENDING",
  paymentStatus: "pending",
  items: [
    {
      productId: "prod-1",
      productName: "سيروم العناية بالبشرة",
      price: 250,
      quantity: 2,
      total: 500,
    },
  ],
  subtotal: 500,
  shipping: 50,
  tax: 0,
  total: 550,
  notes: "يرجى الاتصال قبل التوصيل",
  conversationId: "conv-456",
};

describe("EnhancedOrderModal - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    render(
      <BrowserRouter>
        <EnhancedOrderModal
          order={mockOrder}
          isOpen={false}
          onClose={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.queryByText("تفاصيل الطلب")).toBeNull();
  });

  it("renders order header, customer info, items, and total when isOpen is true", () => {
    render(
      <BrowserRouter>
        <EnhancedOrderModal
          order={mockOrder}
          isOpen={true}
          onClose={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText("تفاصيل الطلب")).toBeDefined();
    expect(screen.getByText("#ORD-9988")).toBeDefined();
    expect(screen.getByText("محمود حسن")).toBeDefined();
    expect(screen.getByText("01012345678")).toBeDefined();
    expect(screen.getByText("سيروم العناية بالبشرة")).toBeDefined();
    expect(screen.getByText("550 ج.م")).toBeDefined();
  });

  it("switches to Update tab and renders status dropdowns", () => {
    render(
      <BrowserRouter>
        <EnhancedOrderModal
          order={mockOrder}
          isOpen={true}
          onClose={vi.fn()}
        />
      </BrowserRouter>
    );

    const updateTabBtn = screen.getByRole("tab", { name: /تحديث الطلب/i });
    fireEvent.click(updateTabBtn);

    expect(screen.getByText("تحديث حالة الطلب")).toBeDefined();
    expect(screen.getByText("حالة الطلب")).toBeDefined();
    expect(screen.getByText("حالة الدفع")).toBeDefined();
    expect(screen.getByLabelText("تجاوز قواعد المسار")).toBeDefined();
  });

  it("switches to History tab and displays conversation and order notes", () => {
    render(
      <BrowserRouter>
        <EnhancedOrderModal
          order={mockOrder}
          isOpen={true}
          onClose={vi.fn()}
        />
      </BrowserRouter>
    );

    const historyTabBtn = screen.getByRole("tab", { name: /السجل/i });
    fireEvent.click(historyTabBtn);

    expect(screen.getByText("المحادثة")).toBeDefined();
    expect(screen.getByText("عرض المحادثة")).toBeDefined();
    expect(screen.getByText("ملاحظات")).toBeDefined();
    expect(screen.getByText("يرجى الاتصال قبل التوصيل")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();

    render(
      <BrowserRouter>
        <EnhancedOrderModal
          order={mockOrder}
          isOpen={true}
          onClose={onClose}
        />
      </BrowserRouter>
    );

    // The close button with aria-label
    const closeButtons = screen.getAllByRole("button", { name: /إغلاق/i });
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalled();
  });
});
