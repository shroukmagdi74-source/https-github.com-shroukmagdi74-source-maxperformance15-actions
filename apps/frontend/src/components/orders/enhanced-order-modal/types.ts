import React from "react";

export interface StatusOption {
  code: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface EnhancedOrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate?: (updatedOrder: any) => void;
  canManagePaymentStatus?: boolean;
  orderStatuses?: StatusOption[];
}

export type ModalTabKey = "details" | "update" | "history";

export interface NormalizedOrderItem {
  productName: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  originalPrice?: number | string;
  productColor?: string;
  productSize?: string;
  confidence?: number;
  metadata?: {
    color?: string;
    productColor?: string;
    size?: string;
    productSize?: string;
    confidence?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export const isCancellationStatus = (status?: string | null): boolean => {
  const normalizedStatus = String(status || "").trim().toUpperCase();
  return normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED";
};

export const FALLBACK_ORDER_STATUSES: StatusOption[] = [
  { code: "PENDING", name: "قيد الانتظار" },
  { code: "CONFIRMED", name: "مؤكد" },
  { code: "ON_HOLD", name: "معلق" },
  { code: "PROCESSING", name: "قيد التجهيز" },
  { code: "SHIPPED", name: "تم الشحن" },
  { code: "DELIVERED", name: "تم التسليم" },
  { code: "CANCELLED", name: "ملغي" },
  { code: "REFUNDED", name: "مسترد" },
  { code: "PARTIALLY_REFUNDED", name: "مسترد جزئياً" },
];
