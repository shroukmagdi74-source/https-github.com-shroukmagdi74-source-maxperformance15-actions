import React from "react";

export type ProcurementTemplateId = "official_tax" | "modern_minimal" | "goods_receipt";

export interface ProcurementTemplateOption {
  id: ProcurementTemplateId;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  descriptionAr: string;
}

export const AVAILABLE_PROCUREMENT_TEMPLATES: ProcurementTemplateOption[] = [
  {
    id: "official_tax",
    nameAr: "الرسمي التجاري والضريبي",
    nameEn: "Official Corporate & Tax",
    badgeAr: "معتمد للشركات",
    descriptionAr: "قالب ضريبي معتمد للشركات يضم الأرقام الضريبية، تفصيل القيمة المضافة، والاعتمادات الثلاثية.",
  },
  {
    id: "modern_minimal",
    nameAr: "العصري الأنيق (مودرن)",
    nameEn: "Modern Minimalist",
    badgeAr: "مشتريات وخدمات",
    descriptionAr: "تصميم عصري بسيط بأرقام واضحة وهوامش مريحة، مثالي للمعدات والخدمات والتوريد السريع.",
  },
  {
    id: "goods_receipt",
    nameAr: "إذن استلام وفحص مخزني",
    nameEn: "Goods Receipt & QC Note",
    badgeAr: "مستودعات وجودة",
    descriptionAr: "مستند تشغيلي يركز على مطابقة الكميات وفحص الجودة وحالة البضاعة وتوقيع أمين المستودع.",
  },
];

export const DEFAULT_PROCUREMENT_TEMPLATE: ProcurementTemplateId = "official_tax";
export const PROCUREMENT_TEMPLATE_STORAGE_KEY = "maxp_procurement_print_template";

export interface NormalizedProcurementItem {
  id: string;
  productName: string;
  description?: string | null;
  sku?: string | null;
  quantity: number | string;
  receivedQuantity?: number | string;
  unitPrice: number | string;
  taxRate?: number | string;
  discountRate?: number | string;
  totalPrice: number | string;
}

export interface NormalizedProcurementData {
  documentType: "PO" | "PI";
  documentNumber: string;
  documentDate: string;
  dueDate?: string | null;
  expectedDelivery?: string | null;
  status: string;
  statusLabel: string;
  companyName: string;
  supplier: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    taxNumber?: string | null;
  };
  linkedReference?: {
    type: "PO" | "PI";
    number: string;
  } | null;
  items: NormalizedProcurementItem[];
  financialSummary: {
    subtotal: number | string;
    discountAmount?: number | string;
    taxAmount?: number | string;
    shippingCost?: number | string;
    totalAmount: number | string;
    paidAmount?: number | string;
    remainingAmount?: number | string;
  };
  notes?: string | null;
  paymentTerms?: string | null;
}

export interface ProcurementTemplateProps {
  data: NormalizedProcurementData;
  isRtl?: boolean;
}
