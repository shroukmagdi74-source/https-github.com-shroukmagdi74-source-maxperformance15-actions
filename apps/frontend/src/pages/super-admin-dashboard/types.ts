export interface DashboardData {
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    totalCustomers: number;
    totalConversations: number;
  };
  comparison: {
    companiesGrowth: number;
    usersGrowth: number;
    customersGrowth: number;
  };
  recentActivity: {
    newCompaniesLast30Days: number;
    newUsersLast30Days: number;
    newCustomersLast30Days: number;
  };
  trends: {
    date: string;
    companies: number;
    users: number;
    customers: number;
  }[];
  health: {
    status: string;
    uptime: number;
    database: string;
    dbStats: {
      queryCount: number;
      latency: number;
      queue: number;
      active: number;
    };
    environment: string;
    timestamp: string;
  };
  systems: {
    systemName: string;
    displayName: string;
    category: string;
    isEnabled: boolean;
    resourceUsage: string;
  }[];
  alerts: {
    id: string;
    type: string;
    message: string;
    category: string;
    action: string;
    timestamp: string;
  }[];
}
