export interface CustomerLoyaltyProgram {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  type: "POINTS" | "TIER" | "CASHBACK" | "REFERRAL";
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "SUSPENDED";
  pointsPerPurchase: number;
  pointsPerReferral: number;
  redemptionRate: number;
  minimumPoints: number;
  maxPointsPerTransaction: number;
  expiryMonths: number;
  createdAt: string;
  updatedAt: string;
  customersCount: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

export interface CustomerLoyaltyTier {
  id: string;
  name: string;
  nameAr?: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  color: string;
  icon: string;
  customersCount: number;
}

export interface CustomerLoyaltyRecord {
  id: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  program: CustomerLoyaltyProgram;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  tier?: CustomerLoyaltyTier;
  joinDate: string;
  lastActivity: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface CashbackSettings {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "SUSPENDED";
  rules: {
    cashbackPercent: number;
    base: "total" | "subtotal";
    trigger: string;
    maxPerOrder?: number;
    tierOverrides?: Record<string, number>;
  };
}

export interface CashbackDraft {
  cashbackPercent: number;
  base: "total" | "subtotal";
  status: CashbackSettings["status"];
  maxPerOrder: number;
  tierOverrides: Record<string, number>;
}

export interface WalletStats {
  totalCashback: number;
}

export type LoyaltyTabKey =
  | "programs"
  | "customers"
  | "tiers"
  | "analytics"
  | "cashback";
