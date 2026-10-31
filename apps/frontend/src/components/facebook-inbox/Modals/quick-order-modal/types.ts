import React from "react";
import { InboxConversation } from "../../../../types/inbox.types";
import {
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
  PreviousOrder,
  CustomerLookupResult,
} from "../../../../hooks/useCustomerByPhone";
import { CustomerBlockEvaluation } from "../../../../services/customerBlocklistService";

export interface ProductVariant {
  id: string;
  sku: string;
  price: number | string;
  stock: number;
  name: string;
  type?: string;
  color?: string;
  size?: string;
  image?: string;
  metadata?: string;
  attributeValues?: Record<string, string>;
  trackInventory?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  sku: string;
  trackInventory?: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  stock: number;
  sku?: string;
  color?: string;
  size?: string;
  attributes?: Record<string, string>;
}

export interface CouponInfo {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discountAmount: number;
}

export interface ShippingInfo {
  zoneId: string | null;
  price: number;
  deliveryTime: string;
  governorate: string | null;
}

export interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Either pass conversation object (Facebook) OR individual fields (any platform) */
  conversation?: InboxConversation;
  customerName?: string;
  customerPhone?: string;
  conversationId?: string;
  customerId?: string;
  platform?: "facebook" | "whatsapp" | "telegram";
  pageName?: string;
  onOrderCreated?: (orderId: string, order?: any, confirmationMessage?: any) => void;
}

export interface VariantSelectionModalProps {
  product: Product;
  selectedAttributes: Record<string, string>;
  onAttributeSelect: (attrName: string, value: string) => void;
  onVariantSelect: (variant: ProductVariant) => void;
  onClose: () => void;
}

export interface CreatedOrderDetails {
  id: string;
  orderNumber?: string;
}
