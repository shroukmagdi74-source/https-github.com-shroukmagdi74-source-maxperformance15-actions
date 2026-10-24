import { DailyLog } from "../AgencyPerformanceModal";

export type PricingModel =
  | "RETAINER"
  | "PERCENT_SPEND"
  | "PERCENT_SALES"
  | "FIXED_ORDER"
  | "FIXED_ITEM"
  | "HYBRID";

export type HybridType = "PERCENT_SPEND" | "PERCENT_SALES" | "FIXED_ORDER";

export interface ExtraServiceItem {
  id: string;
  month: string;
  title: string;
  category: string;
  amount: number;
  date?: string;
  notes?: string;
}

export interface MonthlyLog {
  month: string;
  adSpend: number;
  salesRevenue: number;
  ordersCount: number;
  unitsSold: number;
  isPaid?: boolean;
  paidAt?: string;
  notes?: string;
}

export interface AgencyClient {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  pricingModel: PricingModel;
  pricingRate?: number;
  baseRetainer?: number;
  feePerOrder?: number;
  feePerItem?: number;
  hybridType?: HybridType;
  monthlyBudget: number;
  currentSpend: number;
  monthlySales?: number;
  monthlyOrders?: number;
  monthlyUnits?: number;
  isOffPlatform?: boolean;
  adAccountId?: string;
  dataSource?: "META" | "CSV" | "MANUAL" | string;
  lastSyncedAt?: string;
  lastSyncSource?: string;
  status: "active" | "lead" | "paused" | "completed";
  notes?: string;
  extraServices?: ExtraServiceItem[];
  monthlyLogs?: MonthlyLog[];
  dailyLogs?: DailyLog[];
  createdAt: string;
}

export interface AgencyApproval {
  id: string;
  clientId: string;
  clientName?: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  copyText?: string;
  channel: string;
  status:
    | "CLIENT_REVIEW"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "pending"
    | "approved"
    | "changes_requested";
  clientFeedback?: string;
  deadline?: string;
  shareToken?: string;
  publicToken?: string;
  createdAt: string;
}

export interface ClientInvoiceStatement {
  clientId: string;
  clientName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  pricingModel: PricingModel;
  isOffPlatform: boolean;
  month: string;
  performance: {
    spend: number;
    sales: number;
    orders: number;
    units: number;
    roas?: number;
    cpa?: number;
    aov?: number;
  };
  baseAgencyFee: number;
  calculationExplanation: string;
  extraServices: ExtraServiceItem[];
  extraServicesSum: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string | null;
}

export interface InvoicesResponse {
  month: string;
  agencyName: string;
  summary: {
    totalClientsCount: number;
    totalInvoiced: number;
    totalPaid: number;
    totalUnpaid: number;
  };
  statements: ClientInvoiceStatement[];
}

export const PRICING_MODEL_LABELS: Record<
  PricingModel,
  { label: string; desc: string; badgeColor: string }
> = {
  RETAINER: {
    label: "اشتراك شهري ثابت",
    desc: "مبلغ مقطوع شهرياً بغض النظر عن حجم الإنفاق أو المبيعات",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  },
  PERCENT_SPEND: {
    label: "نسبة من ميزانية الإعلانات (%)",
    desc: "نسبة مئوية من إجمالي الإنفاق الإعلاني الفعلي خلال الشهر",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-300",
  },
  PERCENT_SALES: {
    label: "نسبة من المبيعات (%)",
    desc: "عمولة أداء كنسبة من إجمالي إيرادات المبيعات المحققة",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-300",
  },
  FIXED_ORDER: {
    label: "قيمة ثابتة لكل طلب (CPO)",
    desc: "مبلغ محدد لكل أوردر مكتمل",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-300",
  },
  FIXED_ITEM: {
    label: "قيمة ثابتة لكل قطعة مباعة",
    desc: "مبلغ محدد لكل وحدة أو قطعة يتم بيعها",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
  },
  HYBRID: {
    label: "مبلغ ثابت + عمولة أداء",
    desc: "اشتراك شهري أساسي بالإضافة إلى نسبة أداء من الإنفاق أو المبيعات أو الأوردرات",
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-300",
  },
};

export const EXTRA_SERVICE_PRESETS = [
  {
    category: "LOGO_DESIGN",
    title: "تصميم لوجو وهوية بصرية كاملة",
    defaultAmount: 3500,
  },
  {
    category: "VIDEO_REELS",
    title: "إنتاج ومونتاج فيديو إعلاني / ريلز احترافي",
    defaultAmount: 2500,
  },
  {
    category: "LANDING_PAGE",
    title: "تصميم وتطوير صفحة هبوط بيعية (Landing Page)",
    defaultAmount: 4000,
  },
  {
    category: "PHOTOSHOOT",
    title: "جلسة تصوير منتجات احترافية (Photoshoot)",
    defaultAmount: 3000,
  },
  {
    category: "COPYWRITING",
    title: "كتابة سيناريوهات ونصوص إعلانية (Copywriting)",
    defaultAmount: 1500,
  },
  {
    category: "EXTERNAL_EXPENSE",
    title: "مصروف إعلاني خارجي أو اشتراك أدوات",
    defaultAmount: 1000,
  },
  {
    category: "OTHER",
    title: "خدمة إضافية مخصصة",
    defaultAmount: 1000,
  },
];
