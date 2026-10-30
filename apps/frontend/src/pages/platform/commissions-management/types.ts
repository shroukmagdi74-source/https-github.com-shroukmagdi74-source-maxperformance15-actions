export interface Commission {
  id: string;
  orderId: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    total: number;
  } | null;
  affiliate?: {
    affiliateCode: string;
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
  merchant?: {
    name: string;
  } | null;
}

export interface AffiliatePayout {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string | null;
  externalReference?: string | null;
  notes?: string | null;
  proofFileUrl?: string | null;
  proofUploadedAt?: string | null;
  createdAt: string;
  processedAt?: string | null;
  affiliate: {
    affiliateCode: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  commissions: Array<{
    id: string;
    amount: number;
    status: string;
    order?: {
      orderNumber: string;
    } | null;
  }>;
}

export interface CommissionStats {
  totalAmount?: number;
  byType?: {
    AFFILIATE?: number;
    MERCHANT?: number;
    PLATFORM?: number;
  };
}

export interface CommissionFilters {
  status: string;
  type: string;
}
