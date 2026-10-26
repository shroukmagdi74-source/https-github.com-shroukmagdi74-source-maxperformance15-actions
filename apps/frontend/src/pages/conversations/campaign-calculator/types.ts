export interface CampaignInputs {
  campaignName: string;
  productName: string;
  targetAudienceSize: number;
  campaignDuration: number;
  messageType:
    | "promotional"
    | "reminder"
    | "welcome"
    | "abandoned_cart"
    | "custom";
  budget: number;
  costPerMessage: number;
  productPrice: number;
  profitMargin: number;
  averageOrderValue: number;
  expectedOpenRate: number;
  expectedResponseRate: number;
  expectedConversionRate: number;
  useHistoricalData: boolean;
  historicalPeriod: "7d" | "30d" | "90d";
  // Performance metrics
  dailyTarget: number;
  orderTarget: number;
  successfulMessages: number;
  failedMessages: number;
  repliesReceived: number;
  currentOrders: number;
}

export interface PredictionResults {
  expectedMessagesSent: number;
  expectedSavedMessages: number;
  expectedConversations: number;
  expectedConversions: number;
  expectedRevenue: number;
  expectedProfit: number;
  expectedRoi: number;
  costPerAcquisition: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  confidenceScore: number;

  // KPI rates
  successRate: number;
  failureRate: number;
  replyRate: number;
  orderRate: number;

  // Achievement/Goal fields
  totalSent: number;
  orderAchievementRate: number;
  remainingOrdersToTarget: number;
  messagesToDailyTarget: number;
  sendingAchievementRate: number;

  // Predictive fields
  expectedOrdersFromSuccess: number;
  expectedOrdersFromDaily: number;
  messagesPerOrder: number;
  requiredSuccessfulMessages: number;
}

export interface ScenarioResults {
  conservative: PredictionResults;
  realistic: PredictionResults;
  optimistic: PredictionResults;
  custom: PredictionResults;
}

export interface HistoricalDefaults {
  avgOpenRate: number;
  avgResponseRate: number;
  avgConversionRate: number;
  avgRevenuePerMessage: number;
  avgRevenuePerConversation: number;
  peakHours: number[];
  bestDays: string[];
  costPerMessage: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  inputs: CampaignInputs;
  results: PredictionResults;
  createdAt: Date;
}

export type CampaignTab = "input" | "results" | "scenarios" | "comparison";

export type StoredPredictionResults = Partial<PredictionResults> & {
  roi?: number;
  conversions?: number;
  revenue?: number;
  profit?: number;
};

export interface StoredScenarioPayload {
  id: string;
  name: string;
  inputs: CampaignInputs;
  results?: StoredPredictionResults;
  createdAt: string;
}

export interface SmartRecommendation {
  type: "warning" | "success" | "info";
  title: string;
  message: string;
}
