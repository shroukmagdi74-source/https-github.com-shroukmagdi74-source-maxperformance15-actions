import React from "react";

export type ProcurementTemplateId =
  | "commercial_factory"
  | "compact_eco"
  | "official_tax"
  | "modern_minimal"
  | "goods_receipt";

export interface ProcurementTemplateOption {
  id: ProcurementTemplateId;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  paperSize: "A4" | "A5";
  paperSizeLabelAr: string;
  descriptionAr: string;
  accentColor?: string;
  isEco?: boolean;
}

export const AVAILABLE_PROCUREMENT_TEMPLATES: ProcurementTemplateOption[] = [
  {
    id: "commercial_factory",
    nameAr: "نموذج المصانع والمؤسسات التجارية",
    nameEn: "Factory & Commercial Pro Edition",
    badgeAr: "الأكثر طلباً للمصانع",
    paperSize: "A4",
    paperSizeLabelAr: "A4 كاملة",
    descriptionAr: "تصميم أنيق بالهوية التجارية مع بطاقتي المورد والفاتورة، تفصيل تعبئة الوحدة، وشريط إجمالي مالي عريض.",
    accentColor: "#DC2626",
  },
  {
    id: "compact_eco",
    nameAr: "الموفر للطباعة (نصف ورقة A5)",
    nameEn: "Eco Half-Page Compact (A5)",
    badgeAr: "موفر 50% ورق وحبر",
    paperSize: "A5",
    paperSizeLabelAr: "A5 نصف ورقة",
    descriptionAr: "مخصص للطباعة الاقتصادية السريعة على نصف ورقة (A5 أو 2 بالفاتورة)، يقلل استهلاك الورق والحبر للمشتريات اليومية.",
    accentColor: "#059669",
    isEco: true,
  },
  {
    id: "official_tax",
    nameAr: "الرسمي التجاري والضريبي",
    nameEn: "Official Corporate & Tax",
    badgeAr: "معتمد للشركات",
    paperSize: "A4",
    paperSizeLabelAr: "A4 كاملة",
    descriptionAr: "قالب ضريبي رسمي يضم الأرقام الضريبية، تفصيل القيمة المضافة، والاعتمادات الثلاثية المعتمدة محاسبياً.",
    accentColor: "#0F172A",
  },
  {
    id: "modern_minimal",
    nameAr: "العصري الأنيق (مودرن)",
    nameEn: "Modern Minimalist",
    badgeAr: "مشتريات وخدمات",
    paperSize: "A4",
    paperSizeLabelAr: "A4 كاملة",
    descriptionAr: "تصميم عصري بخطوط هادئة وأرقام واضحة وهوامش مريحة، مثالي للمعدات والخدمات والتوريد المباشر.",
    accentColor: "#2563EB",
  },
  {
    id: "goods_receipt",
    nameAr: "إذن استلام وفحص مخزني",
    nameEn: "Goods Receipt & QC Note",
    badgeAr: "مستودعات وجودة",
    paperSize: "A4",
    paperSizeLabelAr: "A4 كاملة",
    descriptionAr: "مستند تشغيلي يركز على مطابقة الكميات الفعلية مع أمر الشراء وفحص الجودة وتوقيع أمين المستودع.",
    accentColor: "#D97706",
  },
];

export const DEFAULT_PROCUREMENT_TEMPLATE: ProcurementTemplateId = "commercial_factory";
export const PROCUREMENT_TEMPLATE_STORAGE_KEY = "maxp_procurement_print_template";

export interface NormalizedProcurementItem {
  id: string;
  productName: string;
  description?: string | null;
  sku?: string | null;
  quantity: number | string;
  packagingUnit?: string | null; // e.g. "كرتونة", "كيس", "باكت", "علبة", "قطعة"
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
  warehouseName?: string | null;
  status: string;
  statusLabel: string;
  companyName: string;
  buyer?: {
    name?: string;
    taxNumber?: string | null;
    crNumber?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    slogan?: string | null;
  };
  supplier: {
    id: string;
    code?: string | null;
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
    taxRate?: number | string;
    shippingCost?: number | string;
    totalAmount: number | string;
    paidAmount?: number | string;
    remainingAmount?: number | string;
  };
  notes?: string | null;
  paymentTerms?: string | null;
  signatures?: {
    purchasingTitle?: string;
    financeTitle?: string;
    warehouseTitle?: string;
    showStamp?: boolean;
    showBlock?: boolean;
  };
}

export interface ProcurementTemplateProps {
  data: NormalizedProcurementData;
  isRtl?: boolean;
}
