import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { apiClient } from "../../../../services/apiClient";
import {
  CartItem,
  CouponInfo,
  ShippingInfo,
  CreatedOrderDetails,
} from "./types";
import { CustomerBlockEvaluation } from "../../../../services/customerBlocklistService";
import {
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
} from "../../../../hooks/useCustomerByPhone";
import { submitQuickOrder } from "./quickOrderSubmitService";

interface UseQuickOrderCheckoutProps {
  isOpen: boolean;
  convId: string;
  convCustomerId: string;
  convPlatform: string;
  cartItems: CartItem[];
  phone: string;
  customerName: string;
  address: string;
  city: string;
  area: string;
  notes: string;
  customerBlock: CustomerBlockEvaluation | null;
  allowBlockedCustomerOverride: boolean;
  canOverrideBlockedCustomer: boolean;
  eligiblePreviousOrders: EligiblePreviousOrder[];
  exchangeReturnPolicy: ExchangeReturnPolicy | null;
  selectedPreviousOrder: string;
  onOrderCreated?: (orderId: string, order?: any, confirmationMessage?: any) => void;
}

export const useQuickOrderCheckout = ({
  isOpen,
  convId,
  convCustomerId,
  convPlatform,
  cartItems,
  phone,
  customerName,
  address,
  city,
  area,
  notes,
  customerBlock,
  allowBlockedCustomerOverride,
  canOverrideBlockedCustomer,
  eligiblePreviousOrders,
  exchangeReturnPolicy,
  selectedPreviousOrder,
  onOrderCreated,
}: UseQuickOrderCheckoutProps) => {
  const isSubmittingRef = useRef(false);

  // Settings
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [status, setStatus] = useState("CONFIRMED");
  const [requestType, setRequestType] = useState("delivery");
  const [returnAmount, setReturnAmount] = useState("");

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Manual Discount
  const [manualDiscount, setManualDiscount] = useState(0);

  // Scheduled Order
  const [isScheduledOrder, setIsScheduledOrder] = useState(false);
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliveryTime, setScheduledDeliveryTime] = useState("");
  const [scheduledNotes, setScheduledNotes] = useState("");

  // Shipping
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Submission
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderDetails | null>(
    null,
  );
  const [step, setStep] = useState<"products" | "checkout">("products");

  useEffect(() => {
    if (isOpen) {
      setCreatedOrder(null);
    }
  }, [isOpen]);

  // Fetch shipping cost when city changes
  useEffect(() => {
    const fetchShippingCost = async () => {
      if (!city || city.length < 2) {
        setShippingInfo(null);
        return;
      }

      try {
        setLoadingShipping(true);
        const response = await apiClient.get(
          `/shipping-zones/find-price?governorate=${encodeURIComponent(city)}`,
        );

        if (response.data.success) {
          setShippingInfo(response.data.data);
        }
      } catch (error) {
        console.error("Shipping fetch error:", error);
        setShippingInfo(null);
      } finally {
        setLoadingShipping(false);
      }
    };

    const timeoutId = setTimeout(fetchShippingCost, 500);
    return () => clearTimeout(timeoutId);
  }, [city]);

  // Subtotal
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  // Coupon handling
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("يرجى إدخال كود الكوبون");
      return;
    }

    if (subtotal <= 0) {
      toast.error("لا يمكن تطبيق كوبون على سلة فارغة");
      return;
    }

    try {
      setLoadingCoupon(true);
      const response = await apiClient.post("/coupons/validate", {
        code: couponCode.trim(),
        orderAmount: subtotal,
      });

      if (response.data?.success) {
        const { coupon, discountAmount } = response.data.data;
        setAppliedCoupon({
          ...coupon,
          discountAmount,
        });
        toast.success(
          `تم تطبيق الكوبون! خصم ${discountAmount.toLocaleString()} ج.م`,
        );
        setCouponCode("");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "كود الكوبون غير صالح أو منتهي",
      );
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("تم إزالة الكوبون");
  };

  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const totalDiscount = couponDiscount + manualDiscount;
  const shippingCost = shippingInfo?.price || 0;
  const grandTotal = Math.max(0, subtotal - totalDiscount + shippingCost);

  // Validation flags
  const blockPreventsOrder =
    Boolean(customerBlock?.blocked) &&
    !(canOverrideBlockedCustomer && allowBlockedCustomerOverride);

  const isExchangeOrReturn =
    requestType === "exchange" || requestType === "return";
  const previousOrderRequired =
    isExchangeOrReturn && (exchangeReturnPolicy?.requirePreviousOrder ?? false);
  const phoneDigitsCount = String(phone || "").replace(/\D/g, "").length;
  const previousOrderMissing =
    previousOrderRequired &&
    phoneDigitsCount >= 9 &&
    eligiblePreviousOrders.length === 0;
  const explicitOrderLinkMissing =
    previousOrderRequired &&
    Boolean(exchangeReturnPolicy?.requireExplicitOrderLink) &&
    !selectedPreviousOrder;
  const previousOrderPreventsOrder =
    previousOrderMissing || explicitOrderLinkMissing;

  const selectedOrderObj = useMemo(() => {
    return eligiblePreviousOrders.find(
      (o) =>
        o.id === selectedPreviousOrder ||
        o.orderNumber === selectedPreviousOrder,
    );
  }, [eligiblePreviousOrders, selectedPreviousOrder]);

  const handleCreateOrder = async () => {
    if (isSubmittingRef.current || loading) return;
    if (cartItems.length === 0) {
      toast.error("السلة فارغة، يرجى إضافة منتجات أولاً");
      return;
    }
    if (!phone || !customerName) {
      toast.error("يرجى إدخال اسم العميل ورقم هاتفه");
      return;
    }
    if (previousOrderMissing) {
      toast.error(
        `لا يمكن إنشاء طلب ${requestType === "return" ? "مرتجع" : "استبدال"}: يتطلب وجود طلب سابق مؤهل لهذا العميل وفقاً لسياسة المتجر.`,
      );
      return;
    }
    if (explicitOrderLinkMissing) {
      toast.error("يرجى اختيار الطلب السابق المرتبط بالاستبدال أو المرتجع.");
      return;
    }
    if (blockPreventsOrder) {
      toast.error(
        customerBlock?.message || "هذا العميل محظور من إنشاء الطلبات",
      );
      return;
    }
    if (isScheduledOrder && !scheduledDeliveryDate) {
      toast.error("يرجى تحديد تاريخ التوصيل للطلب المجدول");
      return;
    }

    isSubmittingRef.current = true;
    try {
      setLoading(true);
      const result = await submitQuickOrder({
        cartItems,
        convId,
        convCustomerId,
        convPlatform,
        phone,
        customerName,
        address,
        city,
        area,
        notes,
        isScheduledOrder,
        scheduledDeliveryDate,
        scheduledDeliveryTime,
        scheduledNotes,
        status,
        paymentMethod,
        requestType,
        returnAmount,
        isExchangeOrReturn,
        selectedPreviousOrder,
        selectedOrderObj,
        eligiblePreviousOrders,
        appliedCoupon,
        couponDiscount,
        manualDiscount,
        subtotal,
        grandTotal,
        canOverrideBlockedCustomer,
        allowBlockedCustomerOverride,
        shippingCost,
        shippingInfo,
        onOrderCreated,
      });

      if (result) {
        setCreatedOrder(result);
      }
    } catch (error: unknown) {
      console.error("Create order error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,
    status,
    setStatus,
    requestType,
    setRequestType,
    returnAmount,
    setReturnAmount,
    couponCode,
    setCouponCode,
    appliedCoupon,
    loadingCoupon,
    manualDiscount,
    setManualDiscount,
    handleApplyCoupon,
    handleRemoveCoupon,
    isScheduledOrder,
    setIsScheduledOrder,
    scheduledDeliveryDate,
    setScheduledDeliveryDate,
    scheduledDeliveryTime,
    setScheduledDeliveryTime,
    scheduledNotes,
    setScheduledNotes,
    shippingInfo,
    loadingShipping,
    loading,
    createdOrder,
    setCreatedOrder,
    step,
    setStep,
    subtotal,
    couponDiscount,
    totalDiscount,
    shippingCost,
    grandTotal,
    blockPreventsOrder,
    isExchangeOrReturn,
    phoneDigitsCount,
    previousOrderMissing,
    explicitOrderLinkMissing,
    previousOrderPreventsOrder,
    selectedOrderObj,
    handleCreateOrder,
  };
};
