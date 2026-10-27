export type MoneyValue = number | string | null | undefined;

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AffiliateUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface AffiliateRecord {
  id: string;
  userId: string;
  affiliateCode: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  commissionType: "PERCENTAGE" | "MARKUP";
  commissionRate: number;
  totalEarnings: MoneyValue;
  paidEarnings: MoneyValue;
  pendingEarnings: MoneyValue;
  totalSales: number;
  totalClicks: number;
  conversionRate: number;
  paymentMethod?: string | null;
  paymentDetails?: string | null;
  minPayout: MoneyValue;
  canCreateOrdersForOthers: boolean;
  canViewCustomerData: boolean;
  identityDocumentUrl?: string | null;
  identityDocumentUploadedAt?: string | null;
  identityDocumentStatus?: string | null;
  identityDocumentReviewNote?: string | null;
  statusReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user: AffiliateUser;
  company?: {
    id: string;
    name: string;
    slug: string;
    currency?: string | null;
  } | null;
}

export interface AffiliateProfileStats {
  ordersCount: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalOrderValue: MoneyValue;
  commissionsCount: number;
  confirmedCommissionAmount: MoneyValue;
  pendingCommissionAmount: MoneyValue;
  paidCommissionAmount: MoneyValue;
  cancelledCommissionAmount: MoneyValue;
  payoutRequestsCount: number;
  pendingPayoutAmount: MoneyValue;
  processedPayoutAmount: MoneyValue;
}

export interface AffiliateOrderRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string | null;
  total: MoneyValue;
  currency?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  sourceType?: string | null;
  orderSource?: string | null;
  createdAt: string;
}

export interface AffiliateCommissionRow {
  id: string;
  amount: MoneyValue;
  status: string;
  type?: string | null;
  calculationType?: string | null;
  rate?: number | null;
  orderTotal: MoneyValue;
  payoutId?: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderNumber?: string | null;
    status?: string | null;
    total?: MoneyValue;
    createdAt?: string | null;
  } | null;
}

export interface AffiliatePayoutRow {
  id: string;
  amount: MoneyValue;
  currency?: string | null;
  status: string;
  paymentMethod?: string | null;
  paymentDetails?: string | null;
  transactionId?: string | null;
  externalReference?: string | null;
  proofFileUrl?: string | null;
  processedAt?: string | null;
  createdAt: string;
  notes?: string | null;
}

export interface AffiliateReferralRow {
  id: string;
  referralCode: string;
  referralUrl?: string | null;
  converted: boolean;
  convertedAt?: string | null;
  source?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  order?: {
    id: string;
    orderNumber?: string | null;
    status?: string | null;
    total?: MoneyValue;
    createdAt?: string | null;
  } | null;
}

export interface AffiliateReviewLog {
  id: string;
  eventType: string;
  title: string;
  note?: string | null;
  previousStatus?: string | null;
  nextStatus?: string | null;
  previousDocumentStatus?: string | null;
  nextDocumentStatus?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface AffiliateDocumentVersion {
  id: string;
  fileUrl: string;
  uploadedAt: string;
  source: string;
  isCurrent: boolean;
  replacedAt?: string | null;
}

export interface AffiliateProfileResponse {
  affiliate: AffiliateRecord;
  stats: AffiliateProfileStats;
  orders: AffiliateOrderRow[];
  commissions: AffiliateCommissionRow[];
  payouts: AffiliatePayoutRow[];
  referrals: AffiliateReferralRow[];
  reviewHistory: AffiliateReviewLog[];
  documentHistory: AffiliateDocumentVersion[];
}
