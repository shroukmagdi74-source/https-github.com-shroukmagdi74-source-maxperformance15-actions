import type { ReactNode } from "react";
import type { ModifierOptionItem } from "../ItemModifierModal";

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  sku: string;
  trackInventory?: boolean;
}

export interface CartItem extends Product {
  cartItemId?: string;
  qty: number;
  selectedModifiers?: ModifierOptionItem[];
  itemNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface ShiftData {
  startTime: Date;
  totalSales: number;
  totalOrders: number;
  totalItems: number;
  cashPayments: number;
  orders: Array<{ orderNumber: string; total: number; paymentMethod: string }>;
}

export interface LastOrder {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  discountType?: string;
  customer: Customer | null;
  date: Date;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  splitDetails?: { cash: number; card: number };
}

export interface OpenTab {
  id: string;
  name: string;
  items: CartItem[];
  customer: Customer | null;
  createdAt: string;
  subtotal?: number;
  total?: number;
  kotPrintedAt?: string | null;
}

export interface PosApiProduct {
  id: string;
  name: string;
  price: number | string;
  sku?: string | null;
  category?: { name?: string | null } | null;
  mainImage?: unknown;
  image?: unknown;
  images?: unknown;
  stock?: number | string | null;
  trackInventory?: boolean | null;
}

export interface PosProductImageProps {
  candidates: string[];
  alt: string;
  className: string;
  fallback: ReactNode;
  requestedWidth: number;
  responsiveWidths?: number[];
  responsiveSizes?: string;
  imageQuality?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}

export const safeJsonParse = <T,>(str: string | null, def: T): T => {
  try {
    return str ? (JSON.parse(str) as T) : def;
  } catch {
    return def;
  }
};
