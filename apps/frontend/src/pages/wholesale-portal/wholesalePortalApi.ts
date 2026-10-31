import { apiClient } from '../../services/apiClient';

export interface WholesaleProfile {
  id: string;
  wholesaleCustomerId: string;
  customerId: string;
  companyId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  isActive: boolean;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
}

export interface WholesaleOrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  productSku?: string | null;
  productImage?: string | null;
  quantity: number;
  price: number;
  total: number;
}

export interface WholesaleOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  shippingAddress?: string | null;
  city?: string | null;
  governorate?: string | null;
  itemsCount: number;
  items?: WholesaleOrderItem[];
}

export interface StatementLine {
  date: string;
  type: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface WholesaleStatement {
  statement?: unknown;
  lines: StatementLine[];
  customerName: string;
  customerPhone?: string | null;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  closingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
}

export interface WholesalePriceItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  wholesalePrice: number;
  regularPrice: number;
  minQuantity: number;
  priceListId: string;
  priceListName?: string | null;
}

export interface CreateWholesaleOrderPayload {
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  notes?: string;
  shippingAddress?: string;
  city?: string;
  governorate?: string;
}

export const wholesalePortalApi = {
  async getProfile(): Promise<WholesaleProfile> {
    const res = await apiClient.get<{ success: boolean; data: WholesaleProfile }>('/wholesale-portal/me');
    return res.data.data;
  },

  async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{
    data: WholesaleOrder[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const res = await apiClient.get('/wholesale-portal/orders', { params });
    return res.data;
  },

  async getOrderDetails(orderId: string): Promise<WholesaleOrder> {
    const res = await apiClient.get<{ success: boolean; data: WholesaleOrder }>(`/wholesale-portal/orders/${orderId}`);
    return res.data.data;
  },

  async getStatement(params?: { periodStart?: string; periodEnd?: string }): Promise<WholesaleStatement> {
    const res = await apiClient.get<{ success: boolean; data: WholesaleStatement }>('/wholesale-portal/statement', { params });
    return res.data.data;
  },

  async getPriceList(): Promise<WholesalePriceItem[]> {
    const res = await apiClient.get<{ success: boolean; data: WholesalePriceItem[] }>('/wholesale-portal/price-list');
    return res.data.data;
  },

  async createOrder(payload: CreateWholesaleOrderPayload): Promise<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
  }> {
    const res = await apiClient.post('/wholesale-portal/orders', payload);
    return res.data.data;
  },
};
