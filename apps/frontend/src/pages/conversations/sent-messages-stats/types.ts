export interface SentMessagesStatsData {
  summary: {
    messages: {
      totalSent: number;
      totalSaved: number;
      totalIgnored: number;
      savedPercentage: number;
      ignoredPercentage: number;
      conversionRate: number;
    };
    conversations: {
      reached: number;
      ignored: number;
      created: number;
      existed: number;
      total: number;
    };
    revenue: {
      totalRevenue: number;
      totalOrderCount: number;
      avgRevenuePerMessage: number;
      avgRevenuePerConversation: number;
    };
  };
  dailyStats: Array<{
    date: string;
    saved: number;
    ignored: number;
    total: number;
    conversationsCreated: number;
    conversationsExisted: number;
    conversationsIgnored: number;
    savedReach: number;
    ignoredReach: number;
    revenue: number;
    orderCount: number;
  }>;
  hourlyStats?: Array<{
    hour: number;
    count: number;
    saved: number;
    ignored: number;
    revenue: number;
    orderCount: number;
  }>;
  weekdayStats?: Array<{
    day: number;
    dayName: string;
    count: number;
  }>;
  pageStats: Array<{
    pageId: string;
    pageName: string;
    count: number;
    percentage?: number;
  }>;
  comparison?: {
    previousPeriod: {
      from: string;
      to: string;
      totalSent: number;
      totalSaved: number;
      totalRevenue?: number;
    };
    changes: {
      sentChange: number;
      savedChange: number;
      revenueChange: number;
      sentTrend: "up" | "down" | "stable";
      savedTrend: "up" | "down" | "stable";
      revenueTrend: "up" | "down" | "stable";
    };
  };
  period: {
    from: string;
    to: string;
  };
}

export type SentMessagesTab = "overview" | "charts" | "tables" | "comparison";

export interface ConnectedPage {
  pageId: string;
  pageName: string;
}
