export interface ReportSummary {
  healthScore: number;
  status: string;
  keyMetrics: {
    totalResponses: number;
    successRate: string;
    averageResponseTime: string;
    activeAlerts: number;
  };
  mainConcerns: string[];
  recommendationsCount: number;
  lastGenerated: string;
}

export interface DailyReport {
  type: string;
  date: string;
  generatedAt: string;
  performance: {
    totalResponses: number;
    successRate: number;
    errorRate: number;
    averageResponseTime: number;
    slowRate: number;
    emptyRate: number;
    healthStatus: string;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    suggestion: string;
  }>;
  executiveSummary: {
    healthScore: number;
    status: string;
    keyMetrics: {
      totalResponses: number;
      successRate: string;
      averageResponseTime: string;
      activeAlerts: number;
    };
    mainConcerns: string[];
    overallTrend: string;
  };
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "excellent":
      return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
    case "good":
      return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
    case "fair":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
    case "poor":
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    default:
      return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "critical":
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700";
    case "high":
      return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700";
    case "medium":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700";
    case "low":
      return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700";
    default:
      return "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600";
  }
};
