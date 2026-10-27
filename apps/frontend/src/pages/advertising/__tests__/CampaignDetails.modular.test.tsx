/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CampaignDetails from "../CampaignDetails";
import { facebookAdsService } from "../../../services/facebookAdsService";

vi.mock("../../../services/facebookAdsService", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    facebookAdsService: {
      getCampaign: vi.fn(),
      getCampaignInsights: vi.fn(),
      syncFromFacebook: vi.fn(),
      pauseCampaign: vi.fn(),
      resumeCampaign: vi.fn(),
      deleteCampaign: vi.fn(),
      pauseAdSet: vi.fn(),
      resumeAdSet: vi.fn(),
      duplicateAdSet: vi.fn(),
      updateAdSet: vi.fn(),
      pauseAd: vi.fn(),
      resumeAd: vi.fn(),
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

const mockCampaign = {
  id: "camp-123",
  name: "حملة الجمعة البيضاء 2026",
  objective: "OUTCOME_SALES",
  status: "ACTIVE",
  effectiveStatus: "ACTIVE",
  budgetAmount: 1500,
  budgetType: "DAILY",
  adAccountId: "act-999",
  facebookCampaignId: "fb-camp-123",
  deliveryReadiness: {
    label: "جاهزة للتسليم",
  },
  adAccount: {
    currency: "EGP",
  },
  adSets: [
    {
      id: "adset-1",
      name: "مجموعة القاهرة والجيزة 25-45",
      status: "ACTIVE",
      effectiveStatus: "ACTIVE",
      budgetAmount: 500,
      budgetType: "DAILY",
      facebookAdSetId: "fb-adset-1",
      locations: ["Cairo", "Giza"],
      ageMin: 25,
      ageMax: 45,
      genders: [1, 2],
      optimizationGoal: "OFFSITE_CONVERSIONS",
      ads: [
        {
          id: "ad-1",
          name: "إعلان فيديو تي شيرت صيفي",
          headline: "احصل على خصم 50% اليوم",
          status: "ACTIVE",
          effectiveStatus: "ACTIVE",
          facebookAdId: "fb-ad-1",
          callToAction: "SHOP_NOW",
          imageUrl: "https://example.com/ad1.jpg",
          spend: 350,
          roas: 3.8,
          purchases: 18,
        },
      ],
    },
  ],
};

const mockInsights = {
  data: {
    spend: 1250,
    impressions: 45000,
    clicks: 1800,
    purchases: 64,
    roas: 3.85,
    cpa: 19.5,
    ctr: 4.0,
    frequency: 1.25,
  },
  dateRange: {
    startDate: "2026-10-01",
    endDate: "2026-10-27",
  },
};

describe("CampaignDetails Modular Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);

    vi.mocked(facebookAdsService.getCampaign).mockResolvedValue(mockCampaign as any);
    vi.mocked(facebookAdsService.getCampaignInsights).mockResolvedValue(mockInsights as any);
    vi.mocked(facebookAdsService.syncFromFacebook).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.pauseCampaign).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.resumeCampaign).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.deleteCampaign).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.pauseAdSet).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.resumeAdSet).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.duplicateAdSet).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.updateAdSet).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.pauseAd).mockResolvedValue({} as any);
    vi.mocked(facebookAdsService.resumeAd).mockResolvedValue({} as any);
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={["/advertising/facebook-ads/campaigns/camp-123"]}>
        <Routes>
          <Route
            path="/advertising/facebook-ads/campaigns/:id"
            element={<CampaignDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

  it("renders campaign header with name, readiness, and metrics cards", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("حملة الجمعة البيضاء 2026")).toBeInTheDocument();
      expect(screen.getByText("جاهزة للتسليم")).toBeInTheDocument();
      expect(screen.getByText("الإنفاق")).toBeInTheDocument();
      expect(screen.getByText("المشتريات")).toBeInTheDocument();
      expect(screen.getByText("ROAS")).toBeInTheDocument();
      expect(screen.getByText("3.85x")).toBeInTheDocument();
      expect(screen.getByText("CTR")).toBeInTheDocument();
    });
  });

  it("displays ad set row with budget and targeting details", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("مجموعة القاهرة والجيزة 25-45")).toBeInTheDocument();
      expect(screen.getByText(/ID: fb-adset-1/)).toBeInTheDocument();
      expect(screen.getByText(/القاهرة، الجيزة/)).toBeInTheDocument();
      expect(screen.getByText(/25-45\+ سنة/)).toBeInTheDocument();
    });
  });

  it("allows inline editing of ad set budget", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("مجموعة القاهرة والجيزة 25-45")).toBeInTheDocument();
    });

    const editTrigger = screen.getByTitle("اضغط لتعديل الميزانية سريعاً");
    fireEvent.click(editTrigger);

    const budgetInput = screen.getByPlaceholderText("الميزانية");
    expect(budgetInput).toBeInTheDocument();

    fireEvent.change(budgetInput, { target: { value: "750" } });

    const saveBtn = screen.getByTitle("حفظ");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(facebookAdsService.updateAdSet).toHaveBeenCalledWith("adset-1", {
        budgetAmount: 750,
      });
    });
  });

  it("handles 1-click duplication of an ad set", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("مجموعة القاهرة والجيزة 25-45")).toBeInTheDocument();
    });

    const duplicateBtn = screen.getByTitle("تكرار المجموعة الإعلانية بنقرة واحدة");
    fireEvent.click(duplicateBtn);

    await waitFor(() => {
      expect(facebookAdsService.duplicateAdSet).toHaveBeenCalledWith("adset-1");
    });
  });

  it("toggles ad set status", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("مجموعة القاهرة والجيزة 25-45")).toBeInTheDocument();
    });

    const toggleBtn = screen.getByTitle("تبديل حالة المجموعة الإعلانية");
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(facebookAdsService.pauseAdSet).toHaveBeenCalledWith("adset-1");
    });
  });

  it("toggles ad status and displays ad metrics", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("إعلان فيديو تي شيرت صيفي")).toBeInTheDocument();
      expect(screen.getByText("احصل على خصم 50% اليوم")).toBeInTheDocument();
      expect(screen.getByText("SHOP_NOW")).toBeInTheDocument();
      expect(screen.getByText("350 ج.م")).toBeInTheDocument();
      expect(screen.getByText("3.80x")).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();
    });

    const toggleAdBtn = screen.getByTitle("اضغط لإيقاف أو تشغيل الإعلان");
    fireEvent.click(toggleAdBtn);

    await waitFor(() => {
      expect(facebookAdsService.pauseAd).toHaveBeenCalledWith("ad-1");
    });
  });

  it("triggers sync with Meta on clicking sync button", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("حملة الجمعة البيضاء 2026")).toBeInTheDocument();
    });

    const syncBtn = screen.getByTitle("مزامنة الهيكل وأحدث البيانات مباشرة من Meta");
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(facebookAdsService.syncFromFacebook).toHaveBeenCalledWith("act-999", {
        includeStructure: true,
      });
    });
  });

  it("pauses active campaign", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("حملة الجمعة البيضاء 2026")).toBeInTheDocument();
    });

    const pauseBtn = screen.getAllByRole("button", { name: "إيقاف" })[0];
    fireEvent.click(pauseBtn);

    await waitFor(() => {
      expect(facebookAdsService.pauseCampaign).toHaveBeenCalledWith("camp-123");
    });
  });
});
