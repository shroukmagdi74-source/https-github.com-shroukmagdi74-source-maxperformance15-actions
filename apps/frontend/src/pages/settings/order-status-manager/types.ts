export type OrderStatusType = "order" | "payment" | "shipping" | "preparation";

export interface OrderStatus {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  color: string;
  icon?: string;
  sortOrder: number;
  statusType: OrderStatusType;
  source: "system" | "woocommerce" | "custom";
  isSystemStatus: boolean;
  isActive: boolean;
  mapsToSystem?: string;
  wooCommerceStatus?: string;
  notifyCustomer: boolean;
  notifyAdmin: boolean;
  allowStatusEdit: boolean;
}

export interface NewStatusInput {
  code: string;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  icon: string;
  statusType: OrderStatusType;
  mapsToSystem: string;
  wooCommerceStatus: string;
  notifyCustomer: boolean;
  notifyAdmin: boolean;
  allowStatusEdit: boolean;
}

export const SYSTEM_STATUSES = [
  "PENDING",
  "DRAFT",
  "CONFIRMED",
  "ON_HOLD",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

export const PRESET_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#EF4444",
  "#6B7280",
  "#EC4899",
  "#F97316",
  "#14B8A6",
] as const;

export const AVAILABLE_ICONS = [
  "Clock",
  "CheckCircle",
  "Package",
  "Truck",
  "XCircle",
  "RotateCcw",
  "Tag",
  "ShoppingCart",
  "CreditCard",
  "AlertCircle",
  "Cog",
] as const;
