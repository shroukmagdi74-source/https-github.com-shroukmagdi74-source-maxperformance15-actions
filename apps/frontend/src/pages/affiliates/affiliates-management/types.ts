export interface Affiliate {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  isActive: boolean;
  commissionType: "PERCENTAGE" | "MARKUP";
  commissionRate: number;
  totalEarnings: number;
  paidEarnings: number;
  pendingEarnings: number;
  totalSales: number;
  totalClicks: number;
  minPayout: number;
  canCreateOrdersForOthers: boolean;
  canViewCustomerData: boolean;
  identityDocumentUrl?: string | null;
  identityDocumentUploadedAt?: string | null;
  identityDocumentStatus?:
    | "NOT_SUBMITTED"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED";
  identityDocumentReviewNote?: string | null;
  identityDocumentReviewedAt?: string | null;
  statusReason?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
  isMissingRecord?: boolean;
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
  uploadedByUserId?: string | null;
  source: string;
  isCurrent: boolean;
  replacedAt?: string | null;
}

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AffiliatePolicyFormData {
  minPayout: number;
  canCreateOrdersForOthers: boolean;
  canViewCustomerData: boolean;
}
