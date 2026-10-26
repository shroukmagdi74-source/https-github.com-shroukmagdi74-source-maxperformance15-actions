import { useState, useEffect, useMemo, useCallback } from "react";
import i18n from "../../../i18n";
import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";
import {
  CampaignInputs,
  HistoricalDefaults,
  PredictionResults,
  SavedScenario,
  ScenarioResults,
  SmartRecommendation,
  StoredScenarioPayload,
  StoredPredictionResults,
} from "./types";

const INITIAL_INPUTS: CampaignInputs = {
  campaignName: "",
  productName: "",
  targetAudienceSize: 1000,
  campaignDuration: 7,
  messageType: "promotional",
  budget: 500,
  costPerMessage: 0.05,
  productPrice: 150,
  profitMargin: 30,
  averageOrderValue: 150,
  expectedOpenRate: 75,
  expectedResponseRate: 25,
  expectedConversionRate: 12,
  useHistoricalData: true,
  historicalPeriod: "30d",
  dailyTarget: 1000,
  orderTarget: 100,
  successfulMessages: 0,
  failedMessages: 0,
  repliesReceived: 0,
  currentOrders: 0,
};

export const useCampaignCalculator = () => {
  const [defaults, setDefaults] = useState<HistoricalDefaults | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults | null>(null);
  const [inputs, setInputs] = useState<CampaignInputs>(INITIAL_INPUTS);

  // Fetch historical defaults on mount
  const fetchHistoricalDefaults = useCallback(async () => {
    try {
      const response = await fetch(
        buildApiUrl("campaign-calculator/defaults"),
        {
          headers: tokenManager.createAuthHeaders({
            "Content-Type": "application/json",
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDefaults(data.data);
          // Auto-fill with historical data if enabled
          if (inputs.useHistoricalData) {
            setInputs((prev) => ({
              ...prev,
              expectedOpenRate: data.data.avgOpenRate || prev.expectedOpenRate,
              expectedResponseRate:
                data.data.avgResponseRate || prev.expectedResponseRate,
              expectedConversionRate:
                data.data.avgConversionRate || prev.expectedConversionRate,
              costPerMessage: data.data.costPerMessage || prev.costPerMessage,
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error fetching historical defaults:", err);
    }
  }, [inputs.useHistoricalData]);

  const loadSavedScenarios = useCallback(() => {
    const saved = localStorage.getItem("campaignScenarios");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredScenarioPayload[];
        setSavedScenarios(
          parsed.map((scenario) => {
            const results = {
              ...(scenario.results || {}),
            } as StoredPredictionResults;
            if (
              results.roi !== undefined &&
              results.expectedRoi === undefined
            ) {
              results.expectedConversions = results.conversions;
              results.expectedRevenue = results.revenue;
              results.expectedProfit = results.profit;
              results.expectedRoi = results.roi;
            }
            return {
              ...scenario,
              results: results as PredictionResults,
              createdAt: new Date(scenario.createdAt),
            };
          }),
        );
      } catch (e) {
        console.error("Error loading saved scenarios:", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchHistoricalDefaults();
    loadSavedScenarios();
  }, [fetchHistoricalDefaults, loadSavedScenarios]);

  // Calculation function
  const calculatePredictions = useCallback(
    (campaignInputs: CampaignInputs): PredictionResults => {
      const {
        targetAudienceSize,
        costPerMessage,
        productPrice,
        profitMargin,
        averageOrderValue,
        expectedOpenRate,
        expectedResponseRate,
        expectedConversionRate,
        dailyTarget,
        orderTarget,
        successfulMessages,
        failedMessages,
        repliesReceived,
        currentOrders,
      } = campaignInputs;

      // Core calculations
      const expectedMessagesSent = targetAudienceSize;
      const expectedSavedMessages = Math.round(
        targetAudienceSize * (expectedOpenRate / 100),
      );
      const expectedConversations = Math.round(
        expectedSavedMessages * (expectedResponseRate / 100),
      );
      const expectedConversions = Math.round(
        expectedConversations * (expectedConversionRate / 100),
      );

      // Revenue calculations
      const expectedRevenue = expectedConversions * averageOrderValue;
      const expectedProfit = expectedRevenue * (profitMargin / 100);
      const totalCost = expectedMessagesSent * costPerMessage;
      const expectedRoi =
        totalCost > 0 ? ((expectedProfit - totalCost) / totalCost) * 100 : 0;

      // CPA and Break-even
      const costPerAcquisition =
        expectedConversions > 0 ? totalCost / expectedConversions : 0;
      const profitPerUnit = productPrice * (profitMargin / 100);
      const breakEvenUnits =
        profitPerUnit > 0 ? Math.ceil(totalCost / profitPerUnit) : 0;
      const breakEvenRevenue = breakEvenUnits * productPrice;

      // Confidence score based on data availability
      const confidenceScore = defaults ? 85 : 60;

      // Total Sent
      const totalSent = successfulMessages + failedMessages;

      // Rates calculation
      const successRate =
        totalSent > 0 ? (successfulMessages / totalSent) * 100 : 0;
      const failureRate =
        totalSent > 0 ? (failedMessages / totalSent) * 100 : 0;
      const replyRate =
        successfulMessages > 0
          ? (repliesReceived / successfulMessages) * 100
          : 0;
      const orderRate =
        successfulMessages > 0 ? (currentOrders / successfulMessages) * 100 : 0;

      // Achievement
      const orderAchievementRate =
        orderTarget > 0 ? (currentOrders / orderTarget) * 100 : 0;
      const remainingOrdersToTarget = Math.max(0, orderTarget - currentOrders);
      const messagesToDailyTarget = Math.max(0, dailyTarget - totalSent);
      const sendingAchievementRate =
        dailyTarget > 0 ? (totalSent / dailyTarget) * 100 : 0;

      // Predictors
      const avgOrderRate = orderRate / 100;
      const expectedOrdersFromSuccess = Math.round(
        successfulMessages * avgOrderRate,
      );
      const expectedOrdersFromDaily = Math.round(dailyTarget * avgOrderRate);
      const messagesPerOrder =
        currentOrders > 0 ? successfulMessages / currentOrders : 0;

      // Goal Predictor: required successful messages for target orders
      const requiredSuccessfulMessages =
        avgOrderRate > 0 ? Math.ceil(orderTarget / avgOrderRate) : 0;

      return {
        expectedMessagesSent,
        expectedSavedMessages,
        expectedConversations,
        expectedConversions,
        expectedRevenue,
        expectedProfit,
        expectedRoi,
        costPerAcquisition,
        breakEvenUnits,
        breakEvenRevenue,
        confidenceScore,
        successRate,
        failureRate,
        replyRate,
        orderRate,
        totalSent,
        orderAchievementRate,
        remainingOrdersToTarget,
        messagesToDailyTarget,
        sendingAchievementRate,
        expectedOrdersFromSuccess,
        expectedOrdersFromDaily,
        messagesPerOrder,
        requiredSuccessfulMessages,
      };
    },
    [defaults],
  );

  // Calculate scenarios
  useEffect(() => {
    const conservative: CampaignInputs = {
      ...inputs,
      expectedOpenRate: inputs.expectedOpenRate * 0.7,
      expectedResponseRate: inputs.expectedResponseRate * 0.6,
      expectedConversionRate: inputs.expectedConversionRate * 0.5,
    };

    const optimistic: CampaignInputs = {
      ...inputs,
      expectedOpenRate: Math.min(inputs.expectedOpenRate * 1.2, 95),
      expectedResponseRate: Math.min(inputs.expectedResponseRate * 1.3, 60),
      expectedConversionRate: Math.min(inputs.expectedConversionRate * 1.5, 40),
    };

    setScenarioResults({
      conservative: calculatePredictions(conservative),
      realistic: calculatePredictions(inputs),
      optimistic: calculatePredictions(optimistic),
      custom: calculatePredictions(inputs),
    });
  }, [inputs, calculatePredictions]);

  const currentResults = scenarioResults?.realistic;

  const saveScenario = useCallback(() => {
    if (!inputs.campaignName) {
      alert(i18n.t("CampaignPredictionCalculator.msg_1512"));
      return;
    }

    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name: inputs.campaignName,
      inputs: { ...inputs },
      results: calculatePredictions(inputs),
      createdAt: new Date(),
    };

    const updated = [...savedScenarios, newScenario];
    setSavedScenarios(updated);
    localStorage.setItem("campaignScenarios", JSON.stringify(updated));
    alert(i18n.t("CampaignPredictionCalculator.success_save_3135"));
  }, [inputs, calculatePredictions, savedScenarios]);

  // Chart data
  const funnelData = useMemo(() => {
    if (!currentResults) return [];
    return [
      {
        name: "الجمهور المستهدف",
        value: currentResults.expectedMessagesSent,
        color: "#3b82f6",
      },
      {
        name: "الرسائل المحفوظة",
        value: currentResults.expectedSavedMessages,
        color: "#8b5cf6",
      },
      {
        name: "المحادثات",
        value: currentResults.expectedConversations,
        color: "#f59e0b",
      },
      {
        name: "التحويلات",
        value: currentResults.expectedConversions,
        color: "#10b981",
      },
    ];
  }, [currentResults]);

  const dailyProjectionData = useMemo(() => {
    if (!currentResults) return [];
    const days = inputs.campaignDuration;
    const dailyRevenue = currentResults.expectedRevenue / days;
    const data = [];
    let cumulative = 0;

    for (let i = 1; i <= days; i++) {
      cumulative += dailyRevenue;
      data.push({
        day: `يوم ${i}`,
        daily: Math.round(dailyRevenue),
        cumulative: Math.round(cumulative),
        breakEven: currentResults.breakEvenRevenue,
      });
    }
    return data;
  }, [currentResults, inputs.campaignDuration]);

  // Recommendations
  const recommendations = useMemo(() => {
    const recs: SmartRecommendation[] = [];
    if (!currentResults) return recs;

    if (currentResults.expectedRoi < 0) {
      recs.push({
        type: "warning",
        title: "تحذير: ROI سالب",
        message:
          "الحملة المتوقع أن تكون غير مربحة. consider زيادة معدل التحويل أو تقليل التكلفة.",
      });
    }

    if (currentResults.expectedRoi > 100) {
      recs.push({
        type: "success",
        title: "فرصة ممتازة",
        message: `ROI متوقع ${currentResults.expectedRoi?.toFixed(0) || 0}% - هذه حملة واعدة جداً!`,
      });
    }

    if (inputs.expectedConversionRate < 5) {
      recs.push({
        type: "info",
        title: "تحسين معدل التحويل",
        message: "معدل التحويل منخفض. جرب تحسين نص الرسالة أو عرض خصم أكبر.",
      });
    }

    if (defaults) {
      if (inputs.expectedOpenRate < defaults.avgOpenRate) {
        recs.push({
          type: "info",
          title: "نسبة الفتح أقل من المتوسط",
          message: `متوسط الشركة ${defaults.avgOpenRate}%. تحقق من جودة عنوان الرسالة.`,
        });
      }
    }

    return recs;
  }, [currentResults, inputs, defaults]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat("ar-EG").format(value);
  }, []);

  return {
    inputs,
    setInputs,
    defaults,
    savedScenarios,
    showAdvanced,
    setShowAdvanced,
    scenarioResults,
    currentResults,
    funnelData,
    dailyProjectionData,
    recommendations,
    saveScenario,
    formatCurrency,
    formatNumber,
  };
};
