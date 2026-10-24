export type InvoiceSettings = {
  autoGenerate: boolean;
  autoGenerateOnStatus: string;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  defaultTaxRate: number;
  defaultTerms: string;
  defaultNotes: string;
  defaultDueDays: number;
  showCompanyLogo: boolean;
  showTaxBreakdown: boolean;
  showPaymentMethod: boolean;
  showOrderItems: boolean;
  autoEmailToCustomer: boolean;
  emailSubject: string;
  emailBody: string;
  pdfPageSize: "A4" | "Letter" | "Legal";
  pdfOrientation: "portrait" | "landscape";
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  showBarcodeOrderCode: boolean;
  showBarcodeShippingCode: boolean;
  showCustomFields: boolean;
};

export type SlipSettings = {
  documentTitle: string;
  documentSubtitle: string;
  accentColor: string;
  pageSize: "A4" | "A5";
  pageOrientation: "portrait" | "landscape";
  showCompanyName: boolean;
  showCustomerEmail: boolean;
  showOrderNotes: boolean;
  showPaymentSummary: boolean;
  showFinancialSummary: boolean;
  showItemSku: boolean;
  showItemDetails: boolean;
  showItemColor: boolean;
  showItemSize: boolean;
  showItemPrice: boolean;
  showItemTotal: boolean;
  preparationInstructions: string;
  footerNote: string;
};

export type SettingsMessageState = {
  type: "success" | "error";
  text: string;
};

export type SettingsTabValue = "invoice" | "print" | "slip";

export const defaultInvoice: InvoiceSettings = {
  autoGenerate: false,
  autoGenerateOnStatus: "",
  invoicePrefix: "INV",
  invoiceNumberFormat: "INV-YYYYMMDD-XXXXXX",
  defaultTaxRate: 0,
  defaultTerms: "",
  defaultNotes: "",
  defaultDueDays: 7,
  showCompanyLogo: true,
  showTaxBreakdown: true,
  showPaymentMethod: true,
  showOrderItems: true,
  autoEmailToCustomer: false,
  emailSubject: "",
  emailBody: "",
  pdfPageSize: "A4",
  pdfOrientation: "portrait",
  primaryColor: "#4F46E5",
  secondaryColor: "#6B7280",
  fontFamily: "Arial",
  showBarcodeOrderCode: true,
  showBarcodeShippingCode: true,
  showCustomFields: false,
};

export const statuses = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "PENDING_PREPARATION",
  "PREPARING",
  "QUALITY_CHECK",
  "PACKAGED",
  "READY_TO_SHIP",
] as const;

export const createDefaultSlip = (t: (key: string) => string): SlipSettings => ({
  documentTitle: t("orderInvoiceSettings.k_49"),
  documentSubtitle: t("orderInvoiceSettings.k_50"),
  accentColor: "#2563eb",
  pageSize: "A4",
  pageOrientation: "portrait",
  showCompanyName: true,
  showCustomerEmail: false,
  showOrderNotes: true,
  showPaymentSummary: true,
  showFinancialSummary: true,
  showItemSku: true,
  showItemDetails: true,
  showItemColor: true,
  showItemSize: true,
  showItemPrice: true,
  showItemTotal: true,
  preparationInstructions: t("orderInvoiceSettings.k_51"),
  footerNote: t("orderInvoiceSettings.k_52"),
});

export const createInvoiceFlags = (t: (key: string, fallback?: string) => string) =>
  [
    ["showCompanyLogo", t("orderInvoiceSettings.k_53")],
    ["showTaxBreakdown", t("orderInvoiceSettings.k_54")],
    ["showPaymentMethod", t("orderInvoiceSettings.k_55")],
    ["showOrderItems", t("orderInvoiceSettings.k_56")],
    [
      "showCustomFields",
      t(
        "orderInvoiceSettings.showCustomFields",
        "إظهار الحقول المخصصة ومواصفات الطلب"
      ),
    ],
  ] as const;

export const createBarcodeFlags = (t: (key: string) => string) =>
  [
    ["showBarcodeOrderCode", t("orderInvoiceSettings.k_57")],
    ["showBarcodeShippingCode", t("orderInvoiceSettings.k_58")],
  ] as const;

export const createSlipFlags = (t: (key: string) => string) =>
  [
    ["showCompanyName", t("orderInvoiceSettings.k_59")],
    ["showCustomerEmail", t("orderInvoiceSettings.k_60")],
    ["showOrderNotes", t("orderInvoiceSettings.k_61")],
    ["showPaymentSummary", t("orderInvoiceSettings.k_62")],
    ["showFinancialSummary", t("orderInvoiceSettings.k_63")],
    ["showItemSku", t("orderInvoiceSettings.k_64")],
    ["showItemDetails", t("orderInvoiceSettings.k_65")],
    ["showItemColor", t("orderInvoiceSettings.k_66")],
    ["showItemSize", t("orderInvoiceSettings.k_67")],
    ["showItemPrice", t("orderInvoiceSettings.k_68")],
    ["showItemTotal", t("orderInvoiceSettings.k_69")],
  ] as const;

export const createLabelForStatus =
  (t: (key: string) => string) => (status: string) =>
    (
      {
        "": t("orderInvoiceSettings.k_70"),
        CONFIRMED: t("orderInvoiceSettings.k_71"),
        PROCESSING: t("orderInvoiceSettings.k_72"),
        SHIPPED: t("orderInvoiceSettings.k_73"),
        DELIVERED: t("orderInvoiceSettings.k_74"),
        COMPLETED: t("orderInvoiceSettings.k_75"),
        PENDING_PREPARATION: t("orderInvoiceSettings.k_76"),
        PREPARING: t("orderInvoiceSettings.k_77"),
        QUALITY_CHECK: t("orderInvoiceSettings.k_78"),
        PACKAGED: t("orderInvoiceSettings.k_79"),
        READY_TO_SHIP: t("orderInvoiceSettings.k_80"),
      } as Record<string, string>
    )[status] || status;

export const createOrientationLabelMap = (t: (key: string) => string) =>
  ({
    portrait: t("orderInvoiceSettings.k_39"),
    landscape: t("orderInvoiceSettings.k_40"),
  }) as Record<
    InvoiceSettings["pdfOrientation"] | SlipSettings["pageOrientation"],
    string
  >;

export const normalizeInvoice = (
  value: Partial<InvoiceSettings> | null | undefined
): InvoiceSettings => ({
  ...defaultInvoice,
  ...(value || {}),
  autoGenerateOnStatus: value?.autoGenerateOnStatus || "",
  defaultTerms: value?.defaultTerms || "",
  defaultNotes: value?.defaultNotes || "",
  emailSubject: value?.emailSubject || "",
  emailBody: value?.emailBody || "",
  pdfPageSize:
    value?.pdfPageSize === "Letter" || value?.pdfPageSize === "Legal"
      ? value.pdfPageSize
      : "A4",
  pdfOrientation:
    value?.pdfOrientation === "landscape" ? "landscape" : "portrait",
});

export const normalizeSlip = (
  value: Partial<SlipSettings> | null | undefined,
  t: (key: string) => string
): SlipSettings => {
  const def = createDefaultSlip(t);
  return {
    ...def,
    ...(value || {}),
    documentTitle: value?.documentTitle || def.documentTitle,
    documentSubtitle: value?.documentSubtitle || def.documentSubtitle,
    accentColor: value?.accentColor || def.accentColor,
    pageSize: value?.pageSize === "A5" ? "A5" : "A4",
    pageOrientation:
      value?.pageOrientation === "landscape" ? "landscape" : "portrait",
    preparationInstructions:
      value?.preparationInstructions || def.preparationInstructions,
    footerNote: value?.footerNote || def.footerNote,
    showCompanyName:
      typeof value?.showCompanyName === "boolean"
        ? value.showCompanyName
        : def.showCompanyName,
    showCustomerEmail:
      typeof value?.showCustomerEmail === "boolean"
        ? value.showCustomerEmail
        : def.showCustomerEmail,
    showOrderNotes:
      typeof value?.showOrderNotes === "boolean"
        ? value.showOrderNotes
        : def.showOrderNotes,
    showPaymentSummary:
      typeof value?.showPaymentSummary === "boolean"
        ? value.showPaymentSummary
        : def.showPaymentSummary,
    showFinancialSummary:
      typeof value?.showFinancialSummary === "boolean"
        ? value.showFinancialSummary
        : def.showFinancialSummary,
    showItemSku:
      typeof value?.showItemSku === "boolean"
        ? value.showItemSku
        : def.showItemSku,
    showItemDetails:
      typeof value?.showItemDetails === "boolean"
        ? value.showItemDetails
        : def.showItemDetails,
    showItemColor:
      typeof value?.showItemColor === "boolean"
        ? value.showItemColor
        : def.showItemColor,
    showItemSize:
      typeof value?.showItemSize === "boolean"
        ? value.showItemSize
        : def.showItemSize,
    showItemPrice:
      typeof value?.showItemPrice === "boolean"
        ? value.showItemPrice
        : def.showItemPrice,
    showItemTotal:
      typeof value?.showItemTotal === "boolean"
        ? value.showItemTotal
        : def.showItemTotal,
  };
};
