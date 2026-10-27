/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdDetails from "../AdDetails";
import { facebookAdsService } from "../../../services/facebookAdsService";

vi.mock("../../../services/facebookAdsService", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    facebookAdsService: {
      getAdDetails: vi.fn(),
      getAdPerformanceBreakdown: vi.fn(),
      syncAdInsights: vi.fn(),
      getAdPreview: vi.fn(),
    },
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAdDetailsData = {
  ad: {
    id: "ad-001",
    name: "إعلان عباية الاستقبال الملكية",
    status: "ACTIVE",
    effectiveStatus: "ACTIVE",
    facebookAdId: "fb-ad-001",
    primaryText: "خصم 30% على تشكيلة عبايات الاستقبال الفاخرة لفترة محدودة",
    headline: "فخامة وأناقة ملكية",
    callToAction: "SHOP_NOW",
    creativeType: "IMAGE",
    linkUrl: "https://swan.maxp.online/p/royal-abaya",
    lastSyncAt: "2026-10-27T10:00:00.000Z",
    creative: {
      creativeId: "cr-777",
    },
  },
  campaign: {
    id: "camp-001",
    name: "حملة خريف 2026",
    pixelId: "pix-888",
  },
  adSet: {
    id: "adset-001",
    name: "جمهور المهتمات بالأزياء الراقية",
  },
  adAccount: {
    currency: "EGP",
  },
  verdict: {
    label: "إعلان ناجح (Scale)",
    tone: "green",
    reason: "عائد إنفاق إعلاني ممتاز مع تكلفة اكتساب منخفضة",
  },
  meta: {
    performanceSource: "META",
    metaInsightError: null,
  },
  decision: {
    label: "توسيع الميزانية (Scale)",
    tone: "green",
    reason: "ROAS أعلى من نقطة التعادل بـ 150%",
    nextAction: "زيادة الميزانية بنسبة 20% تدريجياً",
    confidence: { score: 94 },
    economics: {
      targetCpa: 120,
      breakEvenRoas: 2.2,
      costSource: "تكلفة المخزون المباشرة",
    },
    metrics: {
      estimatedProfit: 18500,
    },
    attribution: {
      exactDeliveredOrders: 42,
      relatedDeliveredOrders: 50,
    },
  },
  summary: {
    spend: 4500,
    purchases: 42,
    roas: 3.8,
    cpa: 107.14,
    ctr: 2.45,
    frequency: 1.3,
  },
  comparisons: {
    previousPeriod: {
      spend: 10,
      purchases: 25,
      roas: 15,
      cpa: -12,
      ctr: 5,
      frequency: 2,
    },
  },
  funnel: {
    diagnosis: {
      title: "فانل تحويل عالي الكفاءة",
      severity: "LOW",
      message: "معدل النقر إلى الوصول لصفحة الدفع يسير بمعدل استثنائي",
    },
    steps: [
      { key: "impressions", label: "الظهور", value: 45000, rate: 100 },
      { key: "clicks", label: "النقرات", value: 1100, rate: 2.45 },
      { key: "add_to_cart", label: "إضافة للسلة", value: 180, rate: 16.3 },
      { key: "purchases", label: "الشراء", value: 42, rate: 23.3 },
    ],
  },
  recommendations: [
    {
      priority: "HIGH",
      title: "زيادة ميزانية المجموعة الإعلانية",
      message: "الإعلان يحقق نتائج قوية ومستقرة، ارفع الميزانية للاستفادة من الزخم",
    },
  ],
  quality: {
    available: true,
    error: null,
    metrics: {
      qualityRanking: "AVERAGE",
      engagementRateRanking: "ABOVE_AVERAGE",
      conversionRateRanking: "ABOVE_AVERAGE",
    },
  },
  siblingAds: [
    {
      id: "ad-001",
      name: "إعلان عباية الاستقبال الملكية",
      metrics: {
        spend: 4500,
        purchases: 42,
        roas: 3.8,
        cpa: 107.14,
      },
    },
    {
      id: "ad-002",
      name: "إعلان فستان كريب مشجر",
      metrics: {
        spend: 3200,
        purchases: 20,
        roas: 2.1,
        cpa: 160,
      },
    },
  ],
};

const mockBreakdownData = {
  rows: [
    {
      key: "female_25_34",
      label: "إناث 25-34",
      metrics: {
        spend: 2500,
        purchases: 28,
        roas: 4.2,
        cpa: 89.28,
      },
    },
    {
      key: "female_35_44",
      label: "إناث 35-44",
      metrics: {
        spend: 1500,
        purchases: 12,
        roas: 3.4,
        cpa: 125,
      },
    },
  ],
};

describe("AdDetails Page Modular Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (facebookAdsService.getAdDetails as any).mockResolvedValue(mockAdDetailsData);
    (facebookAdsService.getAdPerformanceBreakdown as any).mockResolvedValue(
      mockBreakdownData,
    );
    (facebookAdsService.syncAdInsights as any).mockResolvedValue({ success: true });
    (facebookAdsService.getAdPreview as any).mockResolvedValue([
      { body: "<div id='preview-root'>معاينة الإعلان على فيسبوك</div>" },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/advertising/facebook-ads/ads/ad-001"]}>
        <Routes>
          <Route
            path="/advertising/facebook-ads/ads/:adId"
            element={<AdDetails />}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders ad header with name, status badge, and verdict", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText("إعلان عباية الاستقبال الملكية").length,
      ).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText("نشط")).toBeInTheDocument();
    expect(screen.getByText("إعلان ناجح (Scale)")).toBeInTheDocument();
    expect(screen.getByText("حملة خريف 2026 · جمهور المهتمات بالأزياء الراقية")).toBeInTheDocument();
  });

  it("renders decision & economics banner with confidence and target metrics", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("توسيع الميزانية (Scale)")).toBeInTheDocument();
    });

    expect(screen.getByText(/(94|٩٤)%?/)).toBeInTheDocument();
    expect(screen.getByText("هدف CPA")).toBeInTheDocument();
    expect(screen.getByText("Break-even ROAS")).toBeInTheDocument();
  });

  it("renders summary metric cards with spend and ROAS", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("الإنفاق")).toBeInTheDocument();
    });

    expect(screen.getByText("المشتريات")).toBeInTheDocument();
    expect(screen.getByText("ROAS")).toBeInTheDocument();
    expect(screen.getByText("CPA")).toBeInTheDocument();
  });

  it("renders funnel diagnosis and recommendations", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("تشخيص الفانل")).toBeInTheDocument();
    });

    expect(screen.getByText("فانل تحويل عالي الكفاءة")).toBeInTheDocument();
    expect(screen.getByText("توصيات القرار")).toBeInTheDocument();
    expect(screen.getByText("زيادة ميزانية المجموعة الإعلانية")).toBeInTheDocument();
  });

  it("renders demographic, placement, and device breakdowns", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("العمر والجنس")).toBeInTheDocument();
    });

    expect(screen.getByText("المنصة والموضع")).toBeInTheDocument();
    expect(screen.getByText("الأجهزة")).toBeInTheDocument();
    expect(screen.getAllByText("إناث 25-34").length).toBeGreaterThanOrEqual(1);
  });

  it("renders creative message, quality rankings, and in-group sibling comparison", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("الكريتيف والرسالة")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/خصم 30% على تشكيلة عبايات الاستقبال الفاخرة/),
    ).toBeInTheDocument();
    expect(screen.getByText("جودة الإعلان من Meta")).toBeInTheDocument();
    expect(screen.getByText("مقارنة داخل المجموعة")).toBeInTheDocument();
    expect(screen.getByText("إعلان فستان كريب مشجر")).toBeInTheDocument();
  });

  it("renders tracking connection health checklist", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("صحة التتبع والربط")).toBeInTheDocument();
    });

    expect(screen.getByText("Facebook Ad ID")).toBeInTheDocument();
    expect(screen.getByText("fb-ad-001")).toBeInTheDocument();
    expect(screen.getByText("Pixel")).toBeInTheDocument();
    expect(screen.getByText("pix-888")).toBeInTheDocument();
  });
});
