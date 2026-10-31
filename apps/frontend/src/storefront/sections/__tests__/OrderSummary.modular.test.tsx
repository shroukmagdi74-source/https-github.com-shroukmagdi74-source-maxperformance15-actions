// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OrderSummary from "../OrderSummary";

const mockCartItems = [
  {
    id: "item-1",
    name: "فستان قطني راقي",
    price: 350,
    quantity: 2,
    basePrice: 350,
  },
];

let mockCurrentCartItems: any[] = [];

vi.mock("../../store/useCartStore", () => ({
  DEFAULT_STOREFRONT_CART_STORAGE_NAME: "storefront-cart-storage",
  useCartStore: () => ({
    items: mockCurrentCartItems,
    getSubtotal: () =>
      mockCurrentCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    hasQuantityOfferFreeShipping: () => false,
    updateQuantity: vi.fn(),
  }),
}));

vi.mock("../../store/useCheckoutStore", () => ({
  useCheckoutStore: () => ({
    appliedCoupon: null,
    setAppliedCoupon: vi.fn(),
    clearAppliedCoupon: vi.fn(),
    paymentMethod: "cod",
    pendingCouponCode: null,
    setPendingCouponCode: vi.fn(),
    tierProgress: null,
  }),
}));

vi.mock("../../hooks/useStorefrontSettings", () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { id: "comp-1", currency: "EGP" },
      storefront: { settings: { currency: "EGP" } },
    },
  }),
}));

vi.mock("../../engine/ThemeProvider", () => ({
  useStorefrontTheme: () => ({
    theme: { id: "standard", direction: "rtl" },
  }),
}));

vi.mock("../../hooks/useMinimumOrderSettings", () => ({
  useMinimumOrderSettings: () => ({
    blocked: false,
    message: "",
    progress: 100,
    remaining: 0,
  }),
}));

vi.mock("../../hooks/useCheckoutShippingQuote", () => ({
  useCheckoutShippingQuote: () => ({
    shippingCost: 50,
    freeShippingDiscount: 0,
    shippingMessage: "",
    isShippingLoading: false,
    trimmedGovernorate: "القاهرة",
    freeShippingActive: false,
  }),
}));

vi.mock("../../../utils/storefrontApi", () => ({
  storefrontApi: {
    validateCoupon: vi.fn().mockResolvedValue({
      data: {
        coupon: { code: "SAVE10", name: "خصم 10%" },
        discountAmount: 70,
        finalAmount: 630,
      },
    }),
  },
}));

vi.mock("../../components/TierProgressBanner", () => ({
  default: () => <div data-testid="tier-progress-banner" />,
}));

describe("OrderSummary - Modular Storefront Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentCartItems = [...mockCartItems];
  });

  afterEach(() => {
    cleanup();
  });

  it("renders null when cart is empty and no persisted items exist", () => {
    mockCurrentCartItems = [];
    const { container } = render(
      <BrowserRouter>
        <OrderSummary />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders order summary with title, line items, totals and checkout button when cart has items", () => {
    mockCurrentCartItems = [...mockCartItems];
    render(
      <BrowserRouter>
        <OrderSummary
          settings={{
            title: "ملخص السلة",
            checkoutButtonText: "إتمام الطلب",
            showLineItems: true,
          }}
        />
      </BrowserRouter>
    );

    expect(screen.getByText("ملخص السلة")).toBeDefined();
    expect(screen.getByText("فستان قطني راقي")).toBeDefined();
    expect(screen.getByText("إتمام الطلب")).toBeDefined();
  });

  it("renders coupon input and apply button", () => {
    mockCurrentCartItems = [...mockCartItems];
    render(
      <BrowserRouter>
        <OrderSummary
          settings={{
            showCouponField: true,
            couponPlaceholder: "كود الخصم",
            couponButtonText: "تطبيق",
          }}
        />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("كود الخصم")).toBeDefined();
    expect(screen.getByRole("button", { name: "تطبيق" })).toBeDefined();
  });
});
