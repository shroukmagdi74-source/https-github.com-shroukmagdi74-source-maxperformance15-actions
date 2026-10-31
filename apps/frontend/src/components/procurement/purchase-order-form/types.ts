export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  mobile?: string;
  contactPerson?: string;
  currentBalance?: number;
}

export interface OrderItem {
  id?: string;
  productId: string | null;
  variantId?: string | null;
  productName: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxRate: number | string;
  discountRate: number | string;
  totalPrice: number;
  notes?: string;
}

export interface PurchaseOrderFormData {
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  paymentTerms: string;
  notes: string;
  shippingCost: number | string;
  discountAmount: number | string;
}

export interface PurchaseOrderTotals {
  subtotal: number;
  totalTax: number;
  itemDiscounts: number;
  grandTotal: number;
}
