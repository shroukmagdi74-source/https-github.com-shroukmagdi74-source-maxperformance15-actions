import React from 'react';
import type { Product } from '../../hooks/useProducts';
import type { VolumeDiscountTier } from '../../utils/volumeDiscounts';

export interface PdpQuickOrderFormProps {
  product: Product & {
    imageUrl?: string;
    hasVariants: boolean;
  };
  sectionSettings?: Record<string, unknown>;
  hideHeader?: boolean;
}

export interface PublicOrderResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    id?: string | number;
    orderNumber?: string | number;
    total?: string | number;
    finalTotal?: string | number;
    [key: string]: unknown;
  } | null;
}

export type QuickOrderPaymentMethod = 'cod' | 'wallet' | 'card';

export interface QuickOrderCustomAttribute {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface QuickOrderPricingSummary {
  unitPrice: number;
  comparePrice?: number;
  lineSubtotal: number;
}
