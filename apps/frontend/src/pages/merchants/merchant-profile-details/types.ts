export type MoneyValue = number | string | null | undefined;

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MerchantUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string | null;
}

export interface MerchantInventorySnapshot {
  stockLocation?: string;
  stockLocationLabel?: string;
  canEditStock?: boolean;
  warehouseNames?: string[];
  warehouseName?: string | null;
  merchantProductStock?: number;
  physicalQuantity?: number;
  physicalAvailable?: number;
  reservedQuantity?: number;
  availableForSale?: number;
}

export interface MerchantProduct {
  id: string;
  merchantSku?: string | null;
  merchantPrice?: MoneyValue;
  stock?: number | null;
  isActive?: boolean;
  syncEnabled?: boolean;
  lastSyncedAt?: string | null;
  inventorySnapshot?: MerchantInventorySnapshot | null;
  product?: {
    id: string;
    name?: string | null;
    sku?: string | null;
    price?: MoneyValue;
    stock?: number | null;
    isActive?: boolean;
  } | null;
}

export interface MerchantInventorySummary {
  linkedProducts?: number;
  availableForSale?: number;
  merchantProductStock?: number;
  physicalQuantity?: number;
  physicalAvailable?: number;
  reservedQuantity?: number;
  stockLocation?: string;
  stockLocationLabel?: string;
  warehouseNames?: string[];
}

export interface MerchantOperationRow {
  id: string;
  orderId?: string;
  orderNumber?: string;
  createdAt?: string;
  customerName?: string;
  customerPhone?: string;
  fulfillmentSource?: string;
  warehouseName?: string | null;
  shippingCompanyName?: string | null;
  trackingNumber?: string | null;
  merchantOrderStatus?: string;
  shipmentStatus?: string;
  orderStatus?: string;
  operationStatus?: string;
  pieces?: number;
  merchantAmount?: MoneyValue;
  commissionAmount?: MoneyValue;
  shippingCost?: MoneyValue;
  payablePieces?: number;
  pendingPayablePieces?: number;
  payableAmount?: MoneyValue;
  expectedAmount?: MoneyValue;
}

export interface MerchantOperationsSummary {
  summary?: {
    assignedOrdersCount?: number;
    assignedPieces?: number;
    preparationOrdersCount?: number;
    preparationPieces?: number;
    inShippingOrdersCount?: number;
    inShippingPieces?: number;
    deliveredOrdersCount?: number;
    deliveredPieces?: number;
    notDeliveredOrdersCount?: number;
    notDeliveredPieces?: number;
    payablePieces?: number;
    pendingPayablePieces?: number;
    expectedReceivableAmount?: MoneyValue;
    inShippingAmount?: MoneyValue;
    deliveredPayableAmount?: MoneyValue;
    notDeliveredAmount?: MoneyValue;
    shippingCostAmount?: MoneyValue;
    confirmedCommissionAmount?: MoneyValue;
    pendingCommissionAmount?: MoneyValue;
    paidAmount?: MoneyValue;
  };
  rows?: MerchantOperationRow[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
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
  updatedAt?: string;
  products?: MerchantProduct[];
  inventorySummary?: MerchantInventorySummary | null;
  operationsSummary?: MerchantOperationsSummary | null;
  _count?: {
    merchantOrders?: number;
    merchantProducts?: number;
    commissions?: number;
    merchant_payouts?: number;
    orders?: number;
  };
}

export interface MerchantCommissionRow {
  id: string;
  amount: MoneyValue;
  status: string;
  type?: string | null;
  calculationType?: string | null;
  rate?: number | null;
  markup?: MoneyValue;
  baseAmount?: MoneyValue;
  orderTotal: MoneyValue;
  merchantPayoutId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderNumber?: string | null;
    status?: string | null;
    total?: MoneyValue;
    createdAt?: string | null;
  } | null;
  merchant_payout?: {
    id: string;
    status?: string | null;
    createdAt?: string | null;
    processedAt?: string | null;
  } | null;
}

export interface MerchantPayoutRow {
  id: string;
  amount: MoneyValue;
  currency?: string | null;
  status: string;
  paymentMethod?: string | null;
  paymentDetails?: string | null;
  transactionId?: string | null;
  externalReference?: string | null;
  processedAt?: string | null;
  processedBy?: string | null;
  notes?: string | null;
  createdAt: string;
  commissions?: Array<{
    id: string;
    amount: MoneyValue;
    status: string;
    order?: {
      id: string;
      orderNumber?: string | null;
      status?: string | null;
    } | null;
  }>;
}

export interface MerchantWarehouse {
  id: string;
  name: string;
  location?: string | null;
  type?: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  _count?: {
    inventories?: number;
    shipments?: number;
  };
}

export interface ShippingCompany {
  id: string;
  name: string;
  slug?: string | null;
  phone?: string | null;
  providerKey?: string | null;
  integrationMode?: string | null;
  isActive?: boolean;
}

export interface MerchantProfileStats {
  linkedProducts: number;
  availableForSale: number;
  merchantProductStock: number;
  physicalQuantity: number;
  physicalAvailable: number;
  reservedQuantity: number;
  ordersCount: number;
  assignedPieces: number;
  deliveredOrders: number;
  deliveredPieces: number;
  inShippingOrders: number;
  inShippingPieces: number;
  notDeliveredOrders: number;
  notDeliveredPieces: number;
  payablePieces: number;
  pendingPayablePieces: number;
  expectedReceivableAmount: MoneyValue;
  deliveredPayableAmount: MoneyValue;
  inShippingAmount: MoneyValue;
  notDeliveredAmount: MoneyValue;
  shippingCostAmount: MoneyValue;
  commissionsCount: number;
  confirmedCommissionAmount: MoneyValue;
  pendingCommissionAmount: MoneyValue;
  paidCommissionAmount: MoneyValue;
  cancelledCommissionAmount: MoneyValue;
  availablePayoutAmount: MoneyValue;
  availableCommissionsCount: number;
  pendingPayoutAmount: MoneyValue;
  confirmedPayoutAmount: MoneyValue;
  paidPayoutAmount: MoneyValue;
  payoutRequestsCount: number;
  processedPayoutAmount: MoneyValue;
}

export interface MerchantProfileResponse {
  merchant: MerchantRecord;
  user?: MerchantUser | null;
  defaultWarehouse?: MerchantWarehouse | null;
  defaultShippingCompany?: ShippingCompany | null;
  merchantWarehouses: MerchantWarehouse[];
  inventorySummary?: MerchantInventorySummary | null;
  operationsSummary?: MerchantOperationsSummary | null;
  products: MerchantProduct[];
  commissions: MerchantCommissionRow[];
  payouts: MerchantPayoutRow[];
  stats: MerchantProfileStats;
}

export * from "./helpers";

