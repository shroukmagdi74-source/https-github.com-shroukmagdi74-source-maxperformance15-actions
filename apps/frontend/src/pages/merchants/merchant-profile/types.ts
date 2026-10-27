export interface MerchantProduct {
  id: string;
  merchantSku?: string | null;
  merchantPrice?: number | string | null;
  stock?: number | null;
  syncEnabled?: boolean;
  lastSyncedAt?: string | null;
  inventorySnapshot?: MerchantInventorySnapshot | null;
  product?: {
    id: string;
    name: string;
    price?: number | string | null;
  } | null;
}

export interface MerchantInventorySnapshot {
  stockLocationLabel: string;
  canEditStock: boolean;
  warehouseNames?: string[];
  warehouseName?: string | null;
  merchantProductStock: number;
  physicalQuantity: number;
  physicalAvailable: number;
  reservedQuantity: number;
  availableForSale: number;
}

export interface MerchantInventorySummary {
  linkedProducts: number;
  availableForSale: number;
  merchantProductStock: number;
  physicalQuantity: number;
  physicalAvailable: number;
  reservedQuantity: number;
  stockLocationLabel: string;
  warehouseNames?: string[];
}

export interface MerchantOperationsTotals {
  assignedOrdersCount: number;
  assignedPieces: number;
  preparationOrdersCount: number;
  preparationPieces: number;
  inShippingOrdersCount: number;
  inShippingPieces: number;
  deliveredOrdersCount: number;
  deliveredPieces: number;
  notDeliveredOrdersCount: number;
  notDeliveredPieces: number;
  payablePieces: number;
  pendingPayablePieces: number;
  expectedReceivableAmount: number;
  inShippingAmount: number;
  deliveredPayableAmount: number;
  notDeliveredAmount: number;
  shippingCostAmount: number;
  confirmedCommissionAmount: number;
  pendingCommissionAmount: number;
  paidAmount: number;
}

export interface MerchantOperationRow {
  id: string;
  orderId?: string;
  orderNumber?: string;
  createdAt?: string;
  customerName?: string;
  fulfillmentSource?: string;
  warehouseName?: string | null;
  shippingCompanyName?: string | null;
  trackingNumber?: string | null;
  operationStatus?: string;
  pieces?: number;
  merchantAmount?: number;
  payableAmount?: number;
  expectedAmount?: number;
}

export interface MerchantOperationsSummary {
  summary?: Partial<MerchantOperationsTotals>;
  rows?: MerchantOperationRow[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ProductOption {
  id: string;
  name: string;
  price?: number | string | null;
  stock?: number | null;
  isDropshipped?: boolean;
}

export interface WarehouseOption {
  id: string;
  name: string;
  location?: string | null;
  isActive?: boolean;
}

export interface ShippingCompanyOption {
  id: string;
  name: string;
  slug?: string | null;
  isActive?: boolean;
}

export interface MerchantRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  commissionRate: number;
  autoFulfill?: boolean;
  fulfillmentMode?: string | null;
  defaultWarehouseId?: string | null;
  defaultShippingCompanyId?: string | null;
  webhookUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  products?: MerchantProduct[];
  inventorySummary?: MerchantInventorySummary | null;
  operationsSummary?: MerchantOperationsSummary | null;
}

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: ProductOption[];
}

export interface SyncInventoryResult {
  synced?: number;
  timestamp?: string;
}

export interface MerchantProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  commissionRate: number;
  autoFulfill: boolean;
  fulfillmentMode: string;
  defaultWarehouseId: string;
  defaultShippingCompanyId: string;
  webhookUrl: string;
  isActive: boolean;
}

export interface MerchantLinkFormState {
  productId: string;
  merchantSku: string;
  merchantPrice: string;
  stock: string;
  syncEnabled: boolean;
}
