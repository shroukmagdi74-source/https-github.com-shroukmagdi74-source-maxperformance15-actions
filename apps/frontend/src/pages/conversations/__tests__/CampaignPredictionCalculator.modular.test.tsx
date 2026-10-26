// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock charts since recharts or svg rendering in jsdom can be noisy
vi.mock("../../../components/charts/LineChart", () => ({
  default: () => <div data-testid="line-chart">Mocked LineChart</div>,
}));

vi.mock("../../../components/charts/BarChart", () => ({
  default: () => <div data-testid="bar-chart">Mocked BarChart</div>,
}));

// Mock tokenManager and urlHelper
vi.mock("../../../utils/tokenManager", () => ({
  default: {
    createAuthHeaders: vi.fn(() => ({ Authorization: "Bearer token" })),
  },
}));

vi.mock("../../../utils/urlHelper", () => ({
  buildApiUrl: vi.fn((endpoint: string) => `http://api.local/${endpoint}`),
}));

import {
  CampaignRiskBadge,
  CampaignHeader,
  CampaignTabsNav,
  CampaignLiveInputsCard,
  CampaignGoalPredictorBanner,
  CampaignAchievementCards,
  CampaignRemainingMetrics,
  CampaignSummaryRow,
  CampaignPredictionCalculator,
  CampaignInputs,
  PredictionResults,
} from "../CampaignPredictionCalculator";

const mockInputs: CampaignInputs = {
  campaignName: "حملة الصيف",
  productName: "سماعة بلوتوث",
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
  successfulMessages: 500,
  failedMessages: 50,
  repliesReceived: 100,
  currentOrders: 20,
};

const mockResults: PredictionResults = {
  expectedMessagesSent: 1000,
  expectedSavedMessages: 750,
  expectedConversations: 188,
  expectedConversions: 23,
  expectedRevenue: 3450,
  expectedProfit: 1035,
  expectedRoi: 1970,
  costPerAcquisition: 2.17,
  breakEvenUnits: 2,
  breakEvenRevenue: 300,
  confidenceScore: 85,
  successRate: 90.9,
  failureRate: 9.1,
  replyRate: 20.0,
  orderRate: 4.0,
  totalSent: 550,
  orderAchievementRate: 20.0,
  remainingOrdersToTarget: 80,
  messagesToDailyTarget: 450,
  sendingAchievementRate: 55.0,
  expectedOrdersFromSuccess: 20,
  expectedOrdersFromDaily: 40,
  messagesPerOrder: 25,
  requiredSuccessfulMessages: 2500,
};

const formatNumber = (num: number) => num.toLocaleString("ar-EG");

describe("CampaignPredictionCalculator Modular Subcomponents", () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              avgOpenRate: 70,
              avgResponseRate: 20,
              avgConversionRate: 10,
              avgRevenuePerMessage: 1,
              avgRevenuePerConversation: 5,
              peakHours: [12, 18],
              bestDays: ["Monday"],
              costPerMessage: 0.04,
            },
          }),
      }),
    );
  });

  describe("CampaignRiskBadge", () => {
    it("renders high risk badge for negative ROI", () => {
      render(<CampaignRiskBadge roi={-10} />);
      expect(screen.getByText("مخاطر عالية")).toBeDefined();
    });

    it("renders medium risk badge for ROI < 50", () => {
      render(<CampaignRiskBadge roi={35} />);
      expect(screen.getByText("مخاطر متوسطة")).toBeDefined();
    });

    it("renders excellent opportunity badge for ROI >= 50", () => {
      render(<CampaignRiskBadge roi={120} />);
      expect(screen.getByText("فرصة ممتازة")).toBeDefined();
    });
  });

  describe("CampaignHeader", () => {
    it("renders title, description and historical data badge when defaults present", () => {
      render(
        <CampaignHeader
          defaults={{
            avgOpenRate: 70,
            avgResponseRate: 20,
            avgConversionRate: 10,
            avgRevenuePerMessage: 1,
            avgRevenuePerConversation: 5,
            peakHours: [12, 18],
            bestDays: ["Monday"],
            costPerMessage: 0.04,
          }}
        />,
      );
      expect(screen.getByText("حاسبة توقعات نتائج الحملات")).toBeDefined();
      expect(screen.getByText("بيانات تاريخية متاحة")).toBeDefined();
    });

    it("does not render historical data badge when defaults are null", () => {
      render(<CampaignHeader defaults={null} />);
      expect(screen.queryByText("بيانات تاريخية متاحة")).toBeNull();
    });
  });

  describe("CampaignTabsNav", () => {
    it("renders tabs and triggers onTabChange", () => {
      const handleTabChange = vi.fn();
      render(
        <CampaignTabsNav activeTab="input" onTabChange={handleTabChange} />,
      );

      expect(screen.getByText("إعدادات الحملة")).toBeDefined();
      expect(screen.getByText("النتائج المتوقعة")).toBeDefined();

      fireEvent.click(screen.getByText("النتائج المتوقعة"));
      expect(handleTabChange).toHaveBeenCalledWith("results");
    });
  });

  describe("CampaignLiveInputsCard", () => {
    it("renders inputs and handles changes and toggle", () => {
      const setInputs = vi.fn();
      const setShowAdvanced = vi.fn();

      render(
        <CampaignLiveInputsCard
          inputs={mockInputs}
          setInputs={setInputs}
          showAdvanced={false}
          setShowAdvanced={setShowAdvanced}
        />,
      );

      expect(screen.getByText("بيانات الحملة المباشرة")).toBeDefined();
      expect(screen.getByPlaceholderText("مثال: عرض سماعات بلوتوث")).toBeDefined();

      const toggleBtn = screen.getByText("إظهار إعدادات الحسابات المتقدمة");
      fireEvent.click(toggleBtn);
      expect(setShowAdvanced).toHaveBeenCalled();
    });
  });

  describe("CampaignGoalPredictorBanner", () => {
    it("renders order target and required messages", () => {
      render(
        <CampaignGoalPredictorBanner
          inputs={mockInputs}
          currentResults={mockResults}
          formatNumber={formatNumber}
        />,
      );

      expect(screen.getByText("توقعات تحقيق الهدف (Goal Predictor)")).toBeDefined();
      expect(screen.getByText("رسالة ناجحة")).toBeDefined();
      expect(screen.getByText("نسبة الردود الحالية")).toBeDefined();
      expect(screen.getByText("نسبة الأوردرات الحالية")).toBeDefined();
    });
  });

  describe("CampaignAchievementCards", () => {
    it("renders actual reach, replies, current orders, and performance", () => {
      render(
        <CampaignAchievementCards
          inputs={mockInputs}
          currentResults={mockResults}
          formatNumber={formatNumber}
        />,
      );

      expect(screen.getByText("الوصول الفعلي (ناجح)")).toBeDefined();
      expect(screen.getByText("الردود (الناس اللي ردت)")).toBeDefined();
      expect(screen.getAllByText("عدد الاوردرات الحالي").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("تحليل الأداء (أوردر/إرسال)")).toBeDefined();
    });
  });

  describe("CampaignRemainingMetrics", () => {
    it("renders remaining orders, failure statistics, and target metrics", () => {
      render(
        <CampaignRemainingMetrics
          inputs={mockInputs}
          currentResults={mockResults}
          formatNumber={formatNumber}
        />,
      );

      expect(screen.getByText("الباقي علي تارجت الاوردرات")).toBeDefined();
      expect(screen.getByText("إحصائيات الفشل")).toBeDefined();
      expect(screen.getByText("الباقي علي تارجيت ارسال")).toBeDefined();
      expect(screen.getByText("المتوقع عند اكتمال الإرسال")).toBeDefined();
    });
  });

  describe("CampaignSummaryRow", () => {
    it("renders summary row columns", () => {
      render(
        <CampaignSummaryRow
          inputs={mockInputs}
          currentResults={mockResults}
          formatNumber={formatNumber}
        />,
      );

      expect(screen.getByText("التارجيت اليومي")).toBeDefined();
      expect(screen.getByText("عدد الارسال الفاشل")).toBeDefined();
      expect(screen.getByText("نسبة الرسايل للارسال")).toBeDefined();
      expect(screen.getByText("سماعة بلوتوث")).toBeDefined();
    });
  });

  describe("CampaignPredictionCalculator (Coordinator Shell)", () => {
    it("renders full coordinator shell without crashing", async () => {
      render(<CampaignPredictionCalculator />);

      expect(screen.getByText("حاسبة توقعات نتائج الحملات")).toBeDefined();
      expect(screen.getByText("إعدادات الحملة")).toBeDefined();
      expect(screen.getByText("بيانات الحملة المباشرة")).toBeDefined();
      expect(screen.getByText("توقعات تحقيق الهدف (Goal Predictor)")).toBeDefined();
    });
  });
});
