export interface Connection {
  id: string;
  providerId: string;
  consumerId: string;
  allowProductPull: boolean;
  allowOrderPull: boolean;
  status: string;
  provider: {
    id: string;
    name: string;
    logo: string;
    email: string;
  };
}

export interface Request {
  id: string;
  requesterId: string;
  message: string;
  createdAt: string;
  requester: {
    name: string;
    logo: string;
    email: string;
  };
}

export interface InternalProductVariant {
  internalId: string;
  name: string;
  type: string;
  sku: string | null;
  price: number | null;
  comparePrice: number | null;
  cost: number | null;
  images: string[];
  stock: number;
  trackInventory: boolean;
  isActive: boolean;
  sortOrder: number;
  metadata: string | null;
}

export interface InternalProduct {
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  sku: string | null;
  stock: number;
  images: string[];
  category: string | null;
  internalId: string;
  source: string;
  variants?: InternalProductVariant[];
}

export interface InternalOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  orderItems: Array<{
    product: {
      name: string;
      sku: string;
    };
    quantity: number;
    price: number;
  }>;
}

export type InternalView = "main" | "pull-products" | "pull-orders";
export type InternalTab = "connections" | "requests" | "find" | "consumers";
