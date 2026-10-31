import { toast } from "sonner";
import i18n from "../../../../i18n";
import { tToast } from "../../../../utils/i18n-toast";
import { apiClient } from "../../../../services/apiClient";
import { CartItem, CouponInfo, ShippingInfo, CreatedOrderDetails } from "./types";
import { EligiblePreviousOrder } from "../../../../hooks/useCustomerByPhone";

export interface SubmitQuickOrderParams {
  cartItems: CartItem[];
  convId: string;
  convCustomerId: string;
  convPlatform: string;
  phone: string;
  customerName: string;
  address: string;
  city: string;
  area: string;
  notes: string;
  isScheduledOrder: boolean;
  scheduledDeliveryDate: string;
  scheduledDeliveryTime: string;
  scheduledNotes: string;
  status: string;
  paymentMethod: string;
  requestType: string;
  returnAmount: string;
  isExchangeOrReturn: boolean;
  selectedPreviousOrder: string;
  selectedOrderObj?: EligiblePreviousOrder;
  eligiblePreviousOrders: EligiblePreviousOrder[];
  appliedCoupon: CouponInfo | null;
  couponDiscount: number;
  manualDiscount: number;
  subtotal: number;
  grandTotal: number;
  canOverrideBlockedCustomer: boolean;
  allowBlockedCustomerOverride: boolean;
  shippingCost: number;
  shippingInfo: ShippingInfo | null;
  onOrderCreated?: (orderId: string, order?: any, confirmationMessage?: any) => void;
}

export const submitQuickOrder = async (
  params: SubmitQuickOrderParams,
): Promise<CreatedOrderDetails | null> => {
  const {
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
  } = params;

  const scheduledDateTime =
    isScheduledOrder && scheduledDeliveryDate
      ? new Date(
          `${scheduledDeliveryDate}${scheduledDeliveryTime ? "T" + scheduledDeliveryTime : "T00:00:00"}`,
        ).toISOString()
      : null;

  const extractionMethod =
    convPlatform === "whatsapp" ? "whatsapp_inbox" : "facebook_inbox";
  const source =
    convPlatform === "whatsapp" ? "whatsapp_inbox" : "facebook_inbox";

  const payload = {
    products: cartItems.map((item) => ({
      productId: item.productId,
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      variantId: item.variantId,
      sku: item.sku,
      productColor: item.color ? String(item.color) : null,
      productSize: item.size != null ? String(item.size) : null,
      productImage: item.image,
      attributes:
        item.attributes ||
        (item.color || item.size
          ? {
              ...(item.color ? { اللون: item.color } : {}),
              ...(item.size ? { المقاس: item.size } : {}),
            }
          : undefined),
    })),
    customerId: convCustomerId,
    customerPhone: phone,
    customerName: customerName.trim(),
    customerAddress: (address || "")
      .replace(/,\s*\d+:[^,]+,\s*\d+/g, "")
      .replace(/\b\d+:[^,]+,\s*\d+\b/g, "")
      .replace(/\b\d+:[^\s,]+/g, "")
      .replace(/,\s*\d+\s*$/g, "")
      .replace(/^[,\s\-\:\.\t،\-–\/]+|[,\s\-\:\.\t،\-–\/]+$/g, "")
      .replace(/\s+/g, " ")
      .trim(),
    governorate: (city || "").replace(/^\d+:/, "").trim(),
    city: (area || city || "").replace(/^\d+:/, "").trim(),
    area: (area || city || "").replace(/^\d+:/, "").trim(),
    notes: notes,
    status: isScheduledOrder ? "SCHEDULED" : status,
    paymentMethod: paymentMethod,
    extractionMethod,
    conversationId: convId,
    platform: convPlatform,
    source,
    requestType: requestType,
    returnAmount: returnAmount ? parseFloat(returnAmount) : undefined,
    ...(isExchangeOrReturn
      ? {
          originalOrderId:
            selectedPreviousOrder ||
            eligiblePreviousOrders[0]?.id ||
            undefined,
          originalOrderNumber:
            selectedOrderObj?.orderNumber ||
            eligiblePreviousOrders[0]?.orderNumber ||
            undefined,
        }
      : {}),
    couponId: appliedCoupon?.id,
    couponCode: appliedCoupon?.code,
    couponDiscount: couponDiscount,
    manualDiscount: manualDiscount,
    subtotal: subtotal,
    totalAmount: grandTotal,
    isScheduled: isScheduledOrder,
    scheduledDeliveryDate: scheduledDateTime,
    scheduledNotes: isScheduledOrder ? scheduledNotes : undefined,
    allowBlockedCustomerOverride:
      canOverrideBlockedCustomer && allowBlockedCustomerOverride,
    shippingCost: shippingCost,
    shippingZoneId: shippingInfo?.zoneId,
  };

  const response = await apiClient.post("/orders-enhanced", payload);

  if (response.data?.success) {
    tToast.success("QuickOrderModal.success_create_5c00");
    const orderObj = response.data.order || response.data.data;
    const orderId = orderObj?.id;
    const orderNumber = orderObj?.orderNumber;
    const confirmationMessage = response.data.confirmationMessage;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("inbox:order-created", {
          detail: {
            order: orderObj,
            orderId,
            orderNumber,
            conversationId: convId,
            confirmationMessage,
          },
        }),
      );
    }

    if (onOrderCreated && orderId) {
      onOrderCreated(orderId, orderObj, confirmationMessage);
    }

    return {
      id: orderId ? String(orderId) : "new",
      orderNumber: orderNumber ? String(orderNumber) : undefined,
    };
  } else {
    toast.error(
      "فشل إنشاء الطلب: " +
        (response.data?.error || i18n.t("QuickOrderModal.msg_4223")),
    );
    return null;
  }
};
