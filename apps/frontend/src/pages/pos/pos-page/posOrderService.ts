import { config } from "../../../config";
import { authService } from "../../../services/authService";
import { CartItem, Customer } from "./types";

export interface SubmitPosOrderParams {
  cart: CartItem[];
  customer: Customer | null;
  paymentMethod: "CASH" | "CARD" | "SPLIT";
  discountAmount: number;
  discountType: "NONE" | "PERCENT" | "VIP_COMP";
  splitCash: number;
  splitCard: number;
  activeTabId?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  cashReceived: number;
}

export interface SubmitPosOrderResult {
  success: boolean;
  orderNumber?: string;
  message?: string;
}

export async function submitPosOrder(
  params: SubmitPosOrderParams,
): Promise<SubmitPosOrderResult> {
  const token = authService.getAccessToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const sanitizedCart = params.cart.map((i) => ({
    ...i,
    productId: i.id.includes("_") ? i.id.split("_")[0] : i.id,
  }));

  const res = await fetch(`${config.apiUrl}/pos/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      cart: sanitizedCart,
      customer: params.customer,
      paymentMethod: params.paymentMethod,
      discount: params.discountAmount,
      discountType: params.discountType,
      splitDetails:
        params.paymentMethod === "SPLIT"
          ? { cash: params.splitCash, card: params.splitCard }
          : null,
      tableTabId: params.activeTabId || undefined,
      subtotal: params.subtotal,
      tax: params.tax,
      total: params.total,
      cashReceived:
        params.paymentMethod === "CASH"
          ? params.cashReceived
          : params.paymentMethod === "SPLIT"
          ? params.splitCash
          : 0,
    }),
  });

  const data = await res.json();
  if (data?.success) {
    return {
      success: true,
      orderNumber: data.data?.orderNumber,
    };
  }
  return {
    success: false,
    message: data?.message || "Order submission failed",
  };
}
