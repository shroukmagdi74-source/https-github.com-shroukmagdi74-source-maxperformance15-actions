export interface PartnerRecord {
  id: string;
  partnerCode: string;
  title: string;
  totalEarnings: number;
  pendingEarnings: number;
  totalPaid: number;
  status: string;
}

export interface PartnerStats {
  directReferralsCount: number;
  totalNetworkCount: number;
  activeCompaniesCount: number;
}

export interface PartnerTrends {
  earningsChange?: number;
  referralsChange?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export interface PartnerDashboardPagination {
  commissions: PaginationInfo;
  payouts: PaginationInfo;
  referrals: PaginationInfo;
}

export interface PartnerCommissionItem {
  id?: string;
  amount: number;
  level: number;
  status: string;
  createdAt: string;
  fromCompany?: {
    name?: string;
  } | null;
}

export interface PartnerPayoutItem {
  id?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface PartnerReferredCompany {
  name: string;
  status: string;
  createdAt: string;
}

export interface PartnerDashboardData {
  partner: PartnerRecord;
  stats: PartnerStats;
  trends?: PartnerTrends;
  pagination?: PartnerDashboardPagination;
  recentCommissions: PartnerCommissionItem[];
  recentPayouts: PartnerPayoutItem[];
  referredCompanies: PartnerReferredCompany[];
}

export interface HasMoreState {
  commissions: boolean;
  payouts: boolean;
  referrals: boolean;
}
