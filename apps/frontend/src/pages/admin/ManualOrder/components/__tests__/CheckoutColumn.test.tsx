// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

import { CartItem } from "../../types";
import {
  normalizeLocationLabel,
  buildVariantSummary,
  getApiErrorMessage,
} from "../checkout-column/types";
import { CheckoutCustomerSection } from "../checkout-column/CheckoutCustomerSection";
import { CheckoutShippingSection } from "../checkout-column/CheckoutShippingSection";
import { CheckoutDiscountsSection } from "../checkout-column/CheckoutDiscountsSection";
import { CheckoutOrderSettingsSection } from "../checkout-column/CheckoutOrderSettingsSection";
import { CheckoutScheduledSection } from "../checkout-column/CheckoutScheduledSection";
import { CheckoutOrderSummary } from "../checkout-column/CheckoutOrderSummary";
import { CheckoutConfirmModal } from "../checkout-column/CheckoutConfirmModal";
import { CheckoutSuccessModal } from "../checkout-column/CheckoutSuccessModal";

const mockT = (key: string, fallback?: string) => {
  const translations: Record<string, string> = {
    "manualOrder.k_89": "بيانات الطلب والشحن",
    "manualOrder.k_90": "بيانات العميل",
    "manualOrder.k_91": "رقم الهاتف",
    "manualOrder.k_93": "الاسم الأول",
    "manualOrder.k_94": "اسم العائلة",
    "manualOrder.k_95": "المحافظة",
    "manualOrder.k_97": "المنطقة / المركز",
    "manualOrder.k_99": "العنوان بالتفصيل",
    "manualOrder.k_24": "الشحن والتوصيل",
    "manualOrder.k_100": "جاري حساب تكلفة الشحن...",
    "manualOrder.k_101": "تكلفة الشحن (",
    "manualOrder.k_102": "مدة التوصيل:",
    "manualOrder.k_103": "لم يتم تحديد سعر شحن لهذه المحافظة",
    "manualOrder.k_104": "اختر المحافظة لمعرفة تكلفة الشحن",
    "manualOrder.k_105": "كوبون الخصم والخصم الإضافي",
    "manualOrder.k_9": "كود الكوبون",
    "manualOrder.k_71": "تطبيق",
    "manualOrder.k_106": "قيمة الخصم: ",
    "manualOrder.k_107": "خصم إضافي يدوي (ج.م)",
    "manualOrder.k_108": "إعدادات الطلب والدفع",
    "manualOrder.k_109": "طريقة الدفع",
    "manualOrder.k_110": "حالة الطلب",
    "manualOrder.k_111": "نوع العملية",
    "manualOrder.k_112": "ملاحظات على الطلب",
    "manualOrder.k_113": "جدولة تسليم الطلب بتاريخ محدد",
    "manualOrder.k_114": "تاريخ التسليم المطلوب",
    "manualOrder.k_115": "وقت التسليم المفضل",
    "manualOrder.k_116": "ملاحظات خاصة بموعد التسليم",
    "manualOrder.k_117": "سيتم حفظ الطلب بحالة مجدول والتنبيه بموعد تسليمه للشحن تلقائياً",
    "manualOrder.k_118": "إجمالي المنتجات (",
    "manualOrder.k_119": "قطعة):",
    "manualOrder.k_23": "الخصم:",
    "manualOrder.k_120": "الإجمالي النهائي:",
    "manualOrder.k_75": "ج.م",
    "manualOrder.k_82": "تأكيد وإنشاء الطلب (",
    "manualOrder.k_83": " ج.م)",
    "manualOrder.k_121": "مراجعة وتأكيد بيانات الطلب",
    "manualOrder.k_122": "يرجى مراجعة تفاصيل الطلب قبل الإرسال النهائي",
    "manualOrder.k_123": "العميل:",
    "manualOrder.k_124": "الهاتف:",
    "manualOrder.k_125": "المنتجات:",
    "manualOrder.k_126": "منتج (",
    "manualOrder.k_127": "تفاصيل المنتجات:",
    "manualOrder.k_128": "الكمية:",
    "manualOrder.k_129": "تعديل",
    "manualOrder.k_130": "تأكيد الطلب",
    "manualOrder.k_61": "تم إنشاء الطلب بنجاح",
    "manualOrder.k_131": "تم تسجيل بيانات الطلب وتحديث المخزون بنجاح",
    "manualOrder.k_132": "عرض تفاصيل الطلب",
    "manualOrder.k_133": "طباعة بوليصة الشحن / الفاتورة",
    "manualOrder.k_134": "إنشاء طلب جديد",
    "manualOrder.k_12": "الدفع عند الاستلام (كاش)",
    "manualOrder.k_13": "محفظة إلكترونية",
    "manualOrder.k_14": "قيد الانتظار",
    "manualOrder.k_15": "مؤكد",
    "manualOrder.k_16": "قيد التجهيز",
    "manualOrder.k_17": "مرتجع",
    "manualOrder.k_18": "استبدال",
    "manualOrder.k_19": "توصيل عادي",
    "manualOrder.k_20": "مرتجع",
    "manualOrder.k_21": "استبدال",
  };
  return translations[key] || fallback || key;
};

const mockCartItems: CartItem[] = [
  {
    productId: "p1",
    name: "Classic Linen Shirt",
    price: 350,
    quantity: 2,
    stock: 10,
    color: "Beige",
    size: "L",
    sku: "CLS-B-L",
  },
];

describe("CheckoutColumn Helpers", () => {
  it("normalizes location labels by removing leading numbers and colons", () => {
    expect(normalizeLocationLabel("24:القاهرة")).toBe("القاهرة");
    expect(normalizeLocationLabel("  الجيزة  ")).toBe("الجيزة");
    expect(normalizeLocationLabel(null)).toBe("");
  });

  it("builds clean variant summaries from item attributes", () => {
    expect(buildVariantSummary(mockCartItems[0])).toBe("Beige / L");
    expect(
      buildVariantSummary({
        productId: "p2",
        name: "Dress",
        price: 500,
        quantity: 1,
        stock: 5,
        variantName: "Custom Silk Edition",
      }),
    ).toBe("Custom Silk Edition");
  });

  it("extracts API error messages with fallback", () => {
    expect(
      getApiErrorMessage(
        { response: { data: { message: "Invalid coupon" } } },
        "Error",
      ),
    ).toBe("Invalid coupon");
    expect(getApiErrorMessage(new Error(), "Fallback Error")).toBe("Fallback Error");
  });
});

describe("CheckoutCustomerSection", () => {
  it("renders customer fields and handles phone input change", () => {
    const setPhone = vi.fn();
    const setFirstName = vi.fn();

    render(
      <CheckoutCustomerSection
        phone=""
        setPhone={setPhone}
        firstName=""
        setFirstName={setFirstName}
        lastName=""
        setLastName={vi.fn()}
        address=""
        setAddress={vi.fn()}
        governorate=""
        setGovernorate={vi.fn()}
        area=""
        setArea={vi.fn()}
        searching={false}
        checkingBlock={false}
        customerBlock={null}
        allowBlockedCustomerOverride={false}
        setAllowBlockedCustomerOverride={vi.fn()}
        canOverrideBlockedCustomer={true}
        canUseTurboLocationLookups={false}
        governments={[]}
        availableAreas={[]}
        loadingGovernments={false}
        loadingAreas={false}
        t={mockT}
      />,
    );

    expect(screen.getByText("بيانات العميل")).toBeDefined();
    const phoneInput = screen.getByPlaceholderText("01xxxxxxxxx");
    fireEvent.change(phoneInput, { target: { value: "01012345678" } });
    expect(setPhone).toHaveBeenCalledWith("01012345678");
  });
});

describe("CheckoutShippingSection", () => {
  it("renders shipping rate when zone is resolved", () => {
    render(
      <CheckoutShippingSection
        loadingShipping={false}
        shippingInfo={{
          zoneId: "zone-1",
          price: 45,
          deliveryTime: "2-3 أيام",
          governorate: "القاهرة",
        }}
        governorate="القاهرة"
        t={mockT}
      />,
    );

    expect(screen.getByText("الشحن والتوصيل")).toBeDefined();
    expect(screen.getByText(/45/)).toBeDefined();
    expect(screen.getByText(/2-3 أيام/)).toBeDefined();
  });
});

describe("CheckoutDiscountsSection", () => {
  it("renders coupon input, applies coupon and manual discount", () => {
    const onApply = vi.fn();
    const setCouponCode = vi.fn();
    const setManualDiscount = vi.fn();

    render(
      <CheckoutDiscountsSection
        couponCode="SAVE10"
        setCouponCode={setCouponCode}
        appliedCoupon={null}
        loadingCoupon={false}
        manualDiscount={0}
        setManualDiscount={setManualDiscount}
        onApplyCoupon={onApply}
        onRemoveCoupon={vi.fn()}
        t={mockT}
      />,
    );

    expect(screen.getByText("كوبون الخصم والخصم الإضافي")).toBeDefined();
    const applyBtn = screen.getByRole("button", { name: "تطبيق" });
    fireEvent.click(applyBtn);
    expect(onApply).toHaveBeenCalled();
  });
});

describe("CheckoutOrderSettingsSection", () => {
  it("renders payment options, status, and request type", () => {
    const setPaymentMethod = vi.fn();
    render(
      <CheckoutOrderSettingsSection
        paymentMethod="CASH"
        setPaymentMethod={setPaymentMethod}
        status="CONFIRMED"
        setStatus={vi.fn()}
        requestType="delivery"
        setRequestType={vi.fn()}
        returnAmount=""
        setReturnAmount={vi.fn()}
        shippingInfo={null}
        notes=""
        setNotes={vi.fn()}
        isEn={false}
        isExchangeOrReturn={false}
        phoneDigitsCount={11}
        previousOrderMissing={false}
        eligiblePreviousOrders={[]}
        exchangeReturnPolicy={null}
        selectedPreviousOrder=""
        setSelectedPreviousOrder={vi.fn()}
        selectedOrderObj={undefined}
        t={mockT}
      />,
    );

    expect(screen.getByText("إعدادات الطلب والدفع")).toBeDefined();
    expect(screen.getByText("الدفع عند الاستلام (كاش)")).toBeDefined();
  });
});

describe("CheckoutScheduledSection", () => {
  it("renders scheduled order toggling and date pickers", () => {
    const setIsScheduled = vi.fn();
    render(
      <CheckoutScheduledSection
        isScheduledOrder={true}
        setIsScheduledOrder={setIsScheduled}
        scheduledDeliveryDate="2026-10-30"
        setScheduledDeliveryDate={vi.fn()}
        scheduledDeliveryTime="14:00"
        setScheduledDeliveryTime={vi.fn()}
        scheduledNotes="Deliver after 2 PM"
        setScheduledNotes={vi.fn()}
        t={mockT}
      />,
    );

    expect(screen.getByText("جدولة تسليم الطلب بتاريخ محدد")).toBeDefined();
    expect(screen.getByText("تاريخ التسليم المطلوب")).toBeDefined();
  });
});

describe("CheckoutOrderSummary", () => {
  it("renders totals and triggers onCreateOrder", () => {
    const onCreate = vi.fn();
    render(
      <CheckoutOrderSummary
        cartItems={mockCartItems}
        subtotal={700}
        totalDiscount={50}
        shippingCost={45}
        grandTotal={695}
        loading={false}
        loadingShipping={false}
        governorate="القاهرة"
        blockPreventsOrder={false}
        previousOrderMissing={false}
        explicitOrderLinkMissing={false}
        previousOrderPreventsOrder={false}
        stockWarnings={[]}
        onCreateOrder={onCreate}
        t={mockT}
      />,
    );

    expect(screen.getAllByText(/695/).length).toBeGreaterThanOrEqual(1);
    const ctaBtn = screen.getByRole("button");
    fireEvent.click(ctaBtn);
    expect(onCreate).toHaveBeenCalled();
  });
});

describe("CheckoutConfirmModal & CheckoutSuccessModal", () => {
  it("renders confirmation modal with customer and items summary", () => {
    const onConfirm = vi.fn();
    render(
      <CheckoutConfirmModal
        show={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        firstName="Karim"
        lastName="Adel"
        phone="01099887766"
        cartItems={mockCartItems}
        grandTotal={695}
        t={mockT}
      />,
    );

    expect(screen.getByText("مراجعة وتأكيد بيانات الطلب")).toBeDefined();
    expect(screen.getByText("Karim Adel")).toBeDefined();

    const confirmBtn = screen.getByRole("button", { name: "تأكيد الطلب" });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("renders success modal with action buttons", () => {
    const onViewOrder = vi.fn();
    const onPrintInvoice = vi.fn();
    const onCreateAnother = vi.fn();

    render(
      <CheckoutSuccessModal
        show={true}
        onClose={vi.fn()}
        createdOrderId="ord-1234"
        isAffiliate={false}
        onViewOrder={onViewOrder}
        onPrintInvoice={onPrintInvoice}
        onCreateAnother={onCreateAnother}
        t={mockT}
      />,
    );

    expect(screen.getByText("تم إنشاء الطلب بنجاح")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "عرض تفاصيل الطلب" }));
    expect(onViewOrder).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "طباعة بوليصة الشحن / الفاتورة" }));
    expect(onPrintInvoice).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "إنشاء طلب جديد" }));
    expect(onCreateAnother).toHaveBeenCalled();
  });
});
