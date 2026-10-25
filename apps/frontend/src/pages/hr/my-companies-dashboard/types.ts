export type DashboardTab = "overview" | "reports" | "attendance";

export interface CompanyStats {
  company: {
    id: string;
    name: string;
    logo: string | null;
    isDefault?: boolean;
  };
  stats: {
    totalUsers: number;
    todayOrders: number;
    todayRevenue: number;
    unreadConversations: number;
    lowStockProducts: number;
    attendance: {
      present: number;
      late: number;
      absent: number;
    };
  };
}

export interface DashboardOverview {
  totalCompanies: number;
  totalUsers: number;
  totalTodayOrders: number;
  totalTodayRevenue: number;
  totalUnreadConversations: number;
  totalLowStockProducts: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    overview: DashboardOverview;
    byCompany: CompanyStats[];
  };
}
