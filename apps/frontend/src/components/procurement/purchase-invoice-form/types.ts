import { ProcurementCatalogItem } from "../components";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  mobile?: string;
  contactPerson?: string;
  currentBalance?: number;
}

export interface PurchaseOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items?: any[];
}

export interface InvoiceItem {
  id?: string;
  productId: string | null;
  variantId?: string | null;
  productName: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  totalPrice: number;
  notes?: string;
}

export interface TreasuryAccount {
  id: string;
  name: string;
  balance: number;
}

export interface PurchaseInvoiceFormData {
  supplierId: string;
  purchaseOrderId: string;
  referenceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  shippingCost: number;
  discountAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalTax: number;
  itemDiscounts: number;
  grandTotal: number;
  effectivePaid: number;
  remainingAmount: number;
}
