// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import QuickOrderModal from "../QuickOrderModal";
import {
  QuickOrderHeader,
  QuickOrderCartItem,
  QuickOrderCartSidebar,
  QuickOrderCustomerForm,
  QuickOrderDeliveryForm,
  QuickOrderPaymentForm,
  QuickOrderFooter,
  VariantSelectionModal,
  parseVariantAttributes,
  extractAttributes,
  isInStock,
  Product,
  CartItem,
} from "../quick-order-modal";

// Mock child components that make heavy external calls
vi.mock("../../../components/ui/GovernorateAreaSearch", () => ({
  GovernorateAreaSearch: () => <div data-testid="governorate-area-search" />,
}));

vi.mock("../../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", role: "ADMIN" },
  }),
}));

vi.mock("@/hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", role: "ADMIN" },
  }),
}));

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", role: "ADMIN" },
  }),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
}));

vi.mock("../../../services/customerBlocklistService", () => ({
  customerBlocklistService: {
    check: vi.fn().mockResolvedValue({ blocked: false }),
  },
}));

vi.mock("../../../services/authService", () => ({
  authService: {
    getAccessToken: () => "mock-token",
  },
}));

vi.mock("../../../utils/geolocation", () => ({
  detectUserGovernorate: vi.fn().mockResolvedValue(null),
}));

describe("QuickOrderModal & Subcomponents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(
      <QuickOrderModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal shell with workflow title when isOpen is true", () => {
    render(
      <QuickOrderModal
        isOpen={true}
        onClose={vi.fn()}
        customerName="أحمد محمد"
        pageName="صفحة المتجر"
      />,
    );

    expect(screen.getByText("طلب سريع")).toBeDefined();
    expect(screen.getByText(/أحمد محمد - صفحة المتجر/)).toBeDefined();
    expect(screen.getByText("المنتجات")).toBeDefined();
    expect(screen.getByText("الدفع والتوصيل")).toBeDefined();
  });

  it("QuickOrderHeader renders step buttons and triggers callbacks", () => {
    const setStep = vi.fn();
    const onClose = vi.fn();

    render(
      <QuickOrderHeader
        initialCustomerName="سارة"
        convPageName="Fashion Store"
        createdOrder={false}
        step="products"
        setStep={setStep}
        cartCount={3}
        showMobileCart={false}
        setShowMobileCart={vi.fn()}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("3")).toBeDefined();
    const checkoutTab = screen.getByText("الدفع والتوصيل");
    fireEvent.click(checkoutTab);
    expect(setStep).toHaveBeenCalledWith("checkout");
  });

  it("QuickOrderCartItem displays item details and controls", () => {
    const item: CartItem = {
      productId: "prod-1",
      name: "قميص قطني كلاسيكي",
      price: 350,
      originalPrice: 350,
      quantity: 2,
      image: "https://example.com/item.jpg",
      stock: 10,
      color: "أزرق",
      size: "L",
    };

    const updateQuantity = vi.fn();
    const updateItemPrice = vi.fn();
    const restoreItemPrice = vi.fn();
    const removeFromCart = vi.fn();

    render(
      <QuickOrderCartItem
        item={item}
        updateQuantity={updateQuantity}
        updateItemPrice={updateItemPrice}
        restoreItemPrice={restoreItemPrice}
        removeFromCart={removeFromCart}
      />,
    );

    expect(screen.getByText("قميص قطني كلاسيكي")).toBeDefined();
    expect(screen.getByText("أزرق")).toBeDefined();
    expect(screen.getByText("L")).toBeDefined();
    expect(screen.getByText("700 ج.م")).toBeDefined();

    const increaseBtn = screen.getByLabelText("زيادة الكمية");
    fireEvent.click(increaseBtn);
    expect(updateQuantity).toHaveBeenCalledWith("prod-1", undefined, 1);
  });

  it("QuickOrderCartSidebar renders list of items and subtotal", () => {
    const items: CartItem[] = [
      {
        productId: "p1",
        name: "منتج تجريبي 1",
        price: 200,
        originalPrice: 200,
        quantity: 1,
        image: "",
        stock: 5,
      },
      {
        productId: "p2",
        name: "منتج تجريبي 2",
        price: 150,
        originalPrice: 150,
        quantity: 2,
        image: "",
        stock: 5,
      },
    ];

    render(
      <QuickOrderCartSidebar
        cartItems={items}
        subtotal={500}
        showMobileCart={false}
        setShowMobileCart={vi.fn()}
        onProceedToCheckout={vi.fn()}
        updateQuantity={vi.fn()}
        updateItemPrice={vi.fn()}
        restoreItemPrice={vi.fn()}
        removeFromCart={vi.fn()}
      />,
    );

    expect(screen.getAllByText("500 ج.م").length).toBeGreaterThan(0);
    expect(screen.getByText("السلة (2)")).toBeDefined();
  });

  it("QuickOrderCustomerForm renders inputs and binds changes", () => {
    const setPhone = vi.fn();
    const setCustomerName = vi.fn();

    render(
      <QuickOrderCustomerForm
        phone="01012345678"
        setPhone={setPhone}
        customerName="علي حسن"
        setCustomerName={setCustomerName}
        loadingCustomerOrders={false}
        customerProfile={null}
        previousOrders={[]}
        checkingBlock={false}
        customerBlock={null}
        allowBlockedCustomerOverride={false}
        setAllowBlockedCustomerOverride={vi.fn()}
        canOverrideBlockedCustomer={true}
      />,
    );

    expect(screen.getByDisplayValue("01012345678")).toBeDefined();
    expect(screen.getByDisplayValue("علي حسن")).toBeDefined();

    const nameInput = screen.getByPlaceholderText("اسم العميل");
    fireEvent.change(nameInput, { target: { value: "علي حسن مصطفى" } });
    expect(setCustomerName).toHaveBeenCalledWith("علي حسن مصطفى");
  });

  it("QuickOrderDeliveryForm renders governorate dropdown and detailed address", () => {
    const setCity = vi.fn();
    const setAddress = vi.fn();

    render(
      <QuickOrderDeliveryForm
        city="القاهرة"
        setCity={setCity}
        area="المعادي"
        setArea={vi.fn()}
        address="شارع 9"
        setAddress={setAddress}
        shippingInfo={{
          zoneId: "zone-1",
          price: 50,
          deliveryTime: "2-3 أيام",
          governorate: "القاهرة",
        }}
        loadingShipping={false}
        isScheduledOrder={false}
        setIsScheduledOrder={vi.fn()}
        scheduledDeliveryDate=""
        setScheduledDeliveryDate={vi.fn()}
        scheduledDeliveryTime=""
        setScheduledDeliveryTime={vi.fn()}
        scheduledNotes=""
        setScheduledNotes={vi.fn()}
        notes=""
        setNotes={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("شارع 9")).toBeDefined();
    expect(screen.getByText("تكلفة الشحن (القاهرة)")).toBeDefined();
    expect(screen.getByText("50 ج.م")).toBeDefined();
  });

  it("QuickOrderPaymentForm renders payment method select and coupon controls", () => {
    const setCouponCode = vi.fn();
    const handleApplyCoupon = vi.fn();

    render(
      <QuickOrderPaymentForm
        cartItems={[]}
        subtotal={1000}
        totalDiscount={100}
        shippingCost={50}
        grandTotal={950}
        appliedCoupon={null}
        couponCode="PROMO50"
        setCouponCode={setCouponCode}
        loadingCoupon={false}
        handleApplyCoupon={handleApplyCoupon}
        handleRemoveCoupon={vi.fn()}
        manualDiscount={0}
        setManualDiscount={vi.fn()}
        paymentMethod="CASH"
        setPaymentMethod={vi.fn()}
        status="CONFIRMED"
        setStatus={vi.fn()}
        requestType="delivery"
        setRequestType={vi.fn()}
        returnAmount=""
        setReturnAmount={vi.fn()}
        shippingInfo={null}
        isExchangeOrReturn={false}
        phoneDigitsCount={11}
        previousOrderMissing={false}
        exchangeReturnPolicy={null}
        eligiblePreviousOrders={[]}
        selectedPreviousOrder=""
        setSelectedPreviousOrder={vi.fn()}
      />,
    );

    expect(screen.getByText("دفع عند الاستلام (كاش)")).toBeDefined();
    expect(screen.getByText("950 ج.م")).toBeDefined();

    const applyBtn = screen.getByText("تطبيق");
    fireEvent.click(applyBtn);
    expect(handleApplyCoupon).toHaveBeenCalled();
  });

  it("QuickOrderFooter triggers create order and cancellation", () => {
    const handleCreateOrder = vi.fn();
    const onClose = vi.fn();

    render(
      <QuickOrderFooter
        createdOrder={false}
        step="checkout"
        setStep={vi.fn()}
        onClose={onClose}
        cartCount={2}
        grandTotal={450}
        setShowMobileCart={vi.fn()}
        handleCreateOrder={handleCreateOrder}
        loading={false}
        phone="01012345678"
        customerName="محمود"
        blockPreventsOrder={false}
        previousOrderPreventsOrder={false}
        isScheduledOrder={false}
        scheduledDeliveryDate=""
        city="الجيزة"
        loadingShipping={false}
      />,
    );

    const submitBtn = screen.getByText("إنشاء الطلب");
    fireEvent.click(submitBtn);
    expect(handleCreateOrder).toHaveBeenCalled();
  });

  it("VariantSelectionModal renders attributes and allows selection", () => {
    const product: Product = {
      id: "prod-1",
      name: "فستان سهرة راقي",
      price: 1200,
      image: "",
      stock: 5,
      sku: "DRESS-01",
      variants: [
        {
          id: "v1",
          sku: "DRESS-01-RED-M",
          price: 1200,
          stock: 3,
          name: "أحمر - M",
          color: "أحمر",
          size: "M",
        },
        {
          id: "v2",
          sku: "DRESS-01-BLACK-L",
          price: 1250,
          stock: 2,
          name: "أسود - L",
          color: "أسود",
          size: "L",
        },
      ],
    };

    const onAttributeSelect = vi.fn();

    render(
      <VariantSelectionModal
        product={product}
        selectedAttributes={{}}
        onAttributeSelect={onAttributeSelect}
        onVariantSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("فستان سهرة راقي")).toBeDefined();
    expect(screen.getByText("أحمر")).toBeDefined();
    expect(screen.getByText("أسود")).toBeDefined();

    fireEvent.click(screen.getByText("أحمر"));
    expect(onAttributeSelect).toHaveBeenCalledWith("اللون", "أحمر");
  });

  it("helpers parseVariantAttributes and isInStock work correctly", () => {
    const v = {
      id: "v1",
      sku: "SKU-1",
      price: 100,
      stock: 0,
      name: "أخضر - XL",
      color: "أخضر",
      size: "XL",
      trackInventory: false,
    };

    const attrs = parseVariantAttributes(v);
    expect(attrs["اللون"]).toBe("أخضر");
    expect(attrs["المقاس"]).toBe("XL");

    // trackInventory is false so should be in stock even if stock is 0
    expect(isInStock(v)).toBe(true);

    // trackInventory is true and stock is 0 -> false
    expect(isInStock({ stock: 0, trackInventory: true })).toBe(false);
    // trackInventory is true and stock > 0 -> true
    expect(isInStock({ stock: 5, trackInventory: true })).toBe(true);
  });
});
