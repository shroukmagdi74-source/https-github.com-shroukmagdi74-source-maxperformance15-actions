import { getStatusDisplay } from "../../../utils/statusRegistry";

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  total: number;
  sku: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: OrderItem[];
  itemsCount: number;
}

export interface CompanyDetails {
  id: string;
  name: string;
  logo: string | null;
}

export interface OrdersStats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    company: CompanyDetails;
    orders: Order[];
    stats: OrdersStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const getStatusInfo = (statusCode: string) => getStatusDisplay(statusCode);

export const getCompanyOrderImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const backendUrl =
    import.meta.env["VITE_API_URL"]?.replace("/api/v1", "") ||
    "http://localhost:3007";
  return `${backendUrl}/${path.replace(/^\/+/, "")}`;
};
