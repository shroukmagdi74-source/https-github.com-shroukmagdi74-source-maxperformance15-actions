import { LucideIcon } from "lucide-react";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  mobile?: string;
  contactPerson?: string;
  currentBalance?: number;
}

export interface PurchaseInvoiceSummary {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

export interface ExistingPayment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  bankName?: string;
  checkNumber?: string;
  checkDate?: string;
  notes?: string;
  createdAt: string;
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    contactPerson?: string;
    currentBalance?: number;
  };
  purchaseInvoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  };
}

export interface PaymentMethodOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface SupplierPaymentFormData {
  supplierId: string;
  purchaseInvoiceId: string;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
  bankName: string;
  checkNumber: string;
  checkDate: string;
  notes: string;
}
