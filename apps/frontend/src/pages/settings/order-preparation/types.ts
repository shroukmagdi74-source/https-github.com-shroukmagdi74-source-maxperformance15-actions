export interface WarehouseOption {
  id: string;
  name: string;
}

export interface StatusOption {
  code: string;
  name: string;
}

export interface PreparationQcChecks {
  quantity: boolean;
  variant: boolean;
  packaging: boolean;
  accessories: boolean;
  invoiceSlip: boolean;
}

export interface PreparationSlipDocumentSettings {
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
}

export interface PreparationSettingsState {
  enabled: boolean;
  defaultWarehouseId: string;
  startingStatus: string;
  handoffStatus: string;
  autoReserveStock: boolean;
  requireStockBeforePreparing: boolean;
  allowPartialPreparation: boolean;
  allowCrossWarehouseTransfer: boolean;
  enableQcChecklist: boolean;
  qcChecks: PreparationQcChecks;
  enableBulkStatusUpdate: boolean;
  enableBulkWarehouseAssignment: boolean;
  enableBulkReserve: boolean;
  prioritizeShortageOrders: boolean;
  notifyOnPreparing: boolean;
  notifyOnPackaged: boolean;
  notifyOnReadyToShip: boolean;
  preparingSlaHours: number;
  packingSlaHours: number;
  handoffSlaHours: number;
  slipDocument: PreparationSlipDocumentSettings;
}

export const FALLBACK_PREPARATION_STATUSES: StatusOption[] = [
  { code: "CONFIRMED", name: "مؤكد" },
  { code: "PENDING_PREPARATION", name: "في انتظار التجهيز" },
  { code: "PREPARING", name: "قيد التجهيز" },
  { code: "QUALITY_CHECK", name: "فحص الجودة" },
  { code: "PACKAGED", name: "تم التغليف" },
  { code: "READY_TO_SHIP", name: "جاهز للشحن" },
  { code: "STOCK_SHORTAGE", name: "عجز مخزون" },
];

export const FALLBACK_HANDOFF_STATUSES: StatusOption[] = [
  { code: "READY_TO_SHIP", name: "جاهز للشحن" },
];

export const DEFAULT_SLIP_DOCUMENT_SETTINGS: PreparationSlipDocumentSettings = {
  documentTitle: "ورقة التجهيز",
  documentSubtitle: "مستند داخلي لفريق المخزن والتغليف قبل التسليم لشركة الشحن",
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
  preparationInstructions: "راجع الكمية والمقاس واللون قبل التسليم.",
  footerNote: "تم إنشاء هذا المستند تلقائياً من إدارة الطلبات.",
};

export const DEFAULT_SETTINGS: PreparationSettingsState = {
  enabled: true,
  defaultWarehouseId: "",
  startingStatus: "PENDING_PREPARATION",
  handoffStatus: "READY_TO_SHIP",
  autoReserveStock: true,
  requireStockBeforePreparing: true,
  allowPartialPreparation: true,
  allowCrossWarehouseTransfer: true,
  enableQcChecklist: true,
  qcChecks: {
    quantity: true,
    variant: true,
    packaging: true,
    accessories: false,
    invoiceSlip: true,
  },
  enableBulkStatusUpdate: true,
  enableBulkWarehouseAssignment: false,
  enableBulkReserve: true,
  prioritizeShortageOrders: true,
  notifyOnPreparing: false,
  notifyOnPackaged: true,
  notifyOnReadyToShip: true,
  preparingSlaHours: 6,
  packingSlaHours: 4,
  handoffSlaHours: 2,
  slipDocument: DEFAULT_SLIP_DOCUMENT_SETTINGS,
};

export const PIPELINE_STAGES = [
  { key: "CONFIRMED", label: "مؤكد", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { key: "PENDING_PREPARATION", label: "في انتظار التجهيز", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { key: "PREPARING", label: "قيد التجهيز", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { key: "QUALITY_CHECK", label: "فحص الجودة", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { key: "PACKAGED", label: "تم التغليف", color: "text-violet-600 bg-violet-50 border-violet-200" },
  { key: "READY_TO_SHIP", label: "جاهز للشحن", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

export const buildSettingsState = (
  rawValue: Partial<PreparationSettingsState> | null | undefined,
): PreparationSettingsState => {
  const safeValue =
    rawValue && typeof rawValue === "object" ? rawValue : undefined;
  return {
    ...DEFAULT_SETTINGS,
    ...safeValue,
    qcChecks: { ...DEFAULT_SETTINGS.qcChecks, ...(safeValue?.qcChecks || {}) },
    slipDocument: { ...DEFAULT_SLIP_DOCUMENT_SETTINGS, ...(safeValue?.slipDocument || {}) },
  };
};

export const normalizeStatuses = (value: unknown): StatusOption[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { code: string; name?: string; nameAr?: string; nameEn?: string } =>
      Boolean(item && typeof item === "object" && "code" in item),
    )
    .map((item) => ({
      code: String(item.code).toUpperCase(),
      name: item.name || item.nameAr || item.nameEn || item.code,
    }));
};
