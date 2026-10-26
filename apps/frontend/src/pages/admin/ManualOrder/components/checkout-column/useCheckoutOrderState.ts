import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CartItem } from "../types";
import { apiClient, type ApiRequestConfig } from "../../../../../services/apiClient";
import {
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
} from "../../../../../hooks/useCustomerByPhone";
import {
  ShippingInfo,
  CouponInfo,
  getApiErrorMessage,
} from "./types";

interface UseCheckoutOrderStateOptions {
  cartItems: CartItem[];
  isAffiliate: boolean;
  governorate: string;
  phone: string;
  searchParamExchangeOrder?: string | null;
  searchParamReturnOrder?: string | null;
}

export function useCheckoutOrderState({
  cartItems,
  isAffiliate,
  governorate,
  phone,
  searchParamExchangeOrder,
  searchParamReturnOrder,
}: UseCheckoutOrderStateOptions) {
  const { t } = useTranslation();

  // Order Settings
  const [status, setStatus] = useState("CONFIRMED");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [requestType, setRequestType] = useState("delivery");
  const [returnAmount, setReturnAmount] = useState<string>("");

  // Exchange & Return Policy State
  const [eligiblePreviousOrders, setEligiblePreviousOrders] = useState<EligiblePreviousOrder[]>([]);
  const [exchangeReturnPolicy, setExchangeReturnPolicy] = useState<ExchangeReturnPolicy | null>(null);
  const [selectedPreviousOrder, setSelectedPreviousOrder] = useState<string>("");

  // Initialize from searchParams
  useEffect(() => {
    if (searchParamExchangeOrder) {
      setRequestType("exchange");
      setStatus("EXCHANGED");
      setSelectedPreviousOrder(searchParamExchangeOrder);
    } else if (searchParamReturnOrder) {
      setRequestType("return");
      setStatus("RETURNED");
      setSelectedPreviousOrder(searchParamReturnOrder);
    }
  }, [searchParamExchangeOrder, searchParamReturnOrder]);

  // Preload order policy on mount (skip for affiliates)
  useEffect(() => {
    if (isAffiliate) return;
    let active = true;
    apiClient
      .get("/order-settings", { _skipErrorToast: true } as ApiRequestConfig)
      .then((res) => {
        if (active && res.data?.data?.exchangeReturnPolicy) {
          setExchangeReturnPolicy(res.data.data.exchangeReturnPolicy);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAffiliate]);

  // Shipping State
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Manual Discount State
  const [manualDiscount, setManualDiscount] = useState(0);

  // Scheduled Order State
  const [isScheduledOrder, setIsScheduledOrder] = useState(false);
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState("");
  const [scheduledDeliveryTime, setScheduledDeliveryTime] = useState("");
  const [scheduledNotes, setScheduledNotes] = useState("");

  // Confirmation & Success Modals State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Calculations
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const shippingCost = shippingInfo?.price || 0;
  const totalDiscount = couponDiscount + manualDiscount;
  const grandTotal = subtotal - totalDiscount + shippingCost;

  // Fetch shipping cost when governorate changes
  useEffect(() => {
    const fetchShippingCost = async () => {
      if (!governorate || governorate.length < 2) {
        setShippingInfo(null);
        return;
      }

      try {
        setLoadingShipping(true);
        const response = await apiClient.get(
          `/shipping-zones/find-price?governorate=${encodeURIComponent(governorate)}`,
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
  }, [governorate]);

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t("manualOrder.k_53"));
      return;
    }

    if (subtotal <= 0) {
      toast.error(t("manualOrder.k_54"));
      return;
    }

    try {
      setLoadingCoupon(true);
      const response = await apiClient.post("/coupons/validate", {
        code: couponCode.trim(),
        orderAmount: subtotal,
      });

      if (response.data.success) {
        const { coupon, discountAmount } = response.data.data;
        setAppliedCoupon({
          ...coupon,
          discountAmount,
        });
        toast.success(
          t("manualOrder.coupon_applied", {
            amount: discountAmount.toLocaleString(),
          }),
        );
        setCouponCode("");
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t("manualOrder.k_55")));
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success(t("manualOrder.k_56"));
  };

  const resetOrderState = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setManualDiscount(0);
    setShippingInfo(null);
    setIsScheduledOrder(false);
    setScheduledDeliveryDate("");
    setScheduledDeliveryTime("");
    setScheduledNotes("");
  };

  // Stock warnings and Policy checks
  const stockWarnings = cartItems.filter((item) => item.quantity > item.stock);
  const isExchangeOrReturn = requestType === "exchange" || requestType === "return";
  const previousOrderRequired = isExchangeOrReturn && (exchangeReturnPolicy?.requirePreviousOrder ?? false);
  const phoneDigitsCount = phone.replace(/\D/g, "").length;
  const previousOrderMissing = previousOrderRequired && phoneDigitsCount >= 9 && eligiblePreviousOrders.length === 0;
  const explicitOrderLinkMissing = previousOrderRequired && Boolean(exchangeReturnPolicy?.requireExplicitOrderLink) && !selectedPreviousOrder;
  const previousOrderPreventsOrder = previousOrderMissing || explicitOrderLinkMissing;

  const selectedOrderObj = useMemo(() => {
    return eligiblePreviousOrders.find(
      (o) => o.id === selectedPreviousOrder || o.orderNumber === selectedPreviousOrder,
    );
  }, [eligiblePreviousOrders, selectedPreviousOrder]);

  return {
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    requestType,
    setRequestType,
    returnAmount,
    setReturnAmount,
    eligiblePreviousOrders,
    setEligiblePreviousOrders,
    exchangeReturnPolicy,
    setExchangeReturnPolicy,
    selectedPreviousOrder,
    setSelectedPreviousOrder,
    selectedOrderObj,
    shippingInfo,
    setShippingInfo,
    loadingShipping,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    loadingCoupon,
    manualDiscount,
    setManualDiscount,
    isScheduledOrder,
    setIsScheduledOrder,
    scheduledDeliveryDate,
    setScheduledDeliveryDate,
    scheduledDeliveryTime,
    setScheduledDeliveryTime,
    scheduledNotes,
    setScheduledNotes,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal,
    createdOrderId,
    setCreatedOrderId,
    subtotal,
    couponDiscount,
    shippingCost,
    totalDiscount,
    grandTotal,
    handleApplyCoupon,
    handleRemoveCoupon,
    resetOrderState,
    stockWarnings,
    isExchangeOrReturn,
    previousOrderRequired,
    phoneDigitsCount,
    previousOrderMissing,
    explicitOrderLinkMissing,
    previousOrderPreventsOrder,
  };
}
