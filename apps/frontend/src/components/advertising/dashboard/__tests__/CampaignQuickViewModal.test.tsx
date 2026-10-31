// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CampaignQuickViewModal from "../CampaignQuickViewModal";
import {
  facebookAdsService,
  type FacebookCampaign,
} from "../../../../services/facebookAdsService";
import {
  CampaignQuickViewHeader,
  CampaignOverviewTab,
  CampaignWeaknessesTab,
  CampaignAdSetsTab,
  CampaignQuickViewFooter,
} from "../campaign-quick-view";

vi.mock("../../../../services/facebookAdsService", () => ({
  facebookAdsService: {
    getCampaign: vi.fn().mockResolvedValue({}),
    getCampaignInsights: vi.fn().mockResolvedValue({}),
    updateCampaign: vi.fn().mockResolvedValue({}),
    pauseCampaign: vi.fn().mockResolvedValue({}),
    resumeCampaign: vi.fn().mockResolvedValue({}),
    updateAdSet: vi.fn().mockResolvedValue({}),
    pauseAdSet: vi.fn().mockResolvedValue({}),
    resumeAdSet: vi.fn().mockResolvedValue({}),
    pauseAd: vi.fn().mockResolvedValue({}),
    resumeAd: vi.fn().mockResolvedValue({}),
  },
  CAMPAIGN_OBJECTIVES: [
    { value: "OUTCOME_SALES", label: "المبيعات والتحويلات" },
    { value: "OUTCOME_TRAFFIC", label: "زيارات الموقع" },
  ],
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockCampaign: FacebookCampaign = {
  id: "camp-123",
  companyId: "comp-1",
  name: "حملة الصيف للملابس",
  objective: "OUTCOME_SALES",
  status: "ACTIVE",
  effectiveStatus: "ACTIVE",
  budgetType: "DAILY",
  budgetAmount: 500,
  facebookCampaignId: "meta-camp-999",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  deliveryReadiness: {
    isDeliverable: true,
    status: "DELIVERING",
    label: "يسلم فعلياً",
    reasons: [],
    counts: {
      adSetsTotal: 2,
      adSetsActive: 2,
      adsTotal: 4,
      adsActive: 3,
      adsActiveInActiveAdSets: 3,
      adSetStatuses: {},
      adStatuses: {},
    },
  },
  adSets: [
    {
      id: "adset-1",
      campaignId: "camp-123",
      name: "مجموعة القاهرة والجيزة",
      status: "ACTIVE",
      budgetType: "DAILY",
      budgetAmount: 250,
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
      ads: [
        {
          id: "ad-1",
          adSetId: "adset-1",
          companyId: "comp-1",
          name: "إعلان فيديو رئيسي",
          status: "ACTIVE",
          creativeType: "SINGLE_VIDEO",
          primaryText: "عروض الصيف",
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-01T00:00:00.000Z",
        },
      ],
    },
  ],
};

describe("CampaignQuickViewModal - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <MemoryRouter>
        <CampaignQuickViewModal
          isOpen={false}
          campaign={mockCampaign}
          selectedCurrency="EGP"
          selectedAdAccountId="act_123"
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders campaign summary, telemetry and tabs when open", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CampaignQuickViewModal
            isOpen={true}
            campaign={mockCampaign}
            performance={{
              spend: 250,
              impressions: 12000,
              clicks: 340,
              ctr: 2.83,
              cpc: 0.73,
              cpa: 50,
              roas: 3.2,
              purchases: 5,
              purchaseValue: 800,
              frequency: 1.2,
            }}
            selectedCurrency="EGP"
            selectedAdAccountId="act_123"
            onClose={vi.fn()}
          />
        </MemoryRouter>,
      );
    });

    expect(screen.getByDisplayValue("حملة الصيف للملابس")).toBeDefined();
    expect(screen.getByText(/ID: meta-camp-999/)).toBeDefined();
    expect(screen.getByText(/3.2x/)).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });

  it("diagnoses weaknesses such as budget bleed when spend is high with 0 purchases", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CampaignQuickViewModal
            isOpen={true}
            campaign={mockCampaign}
            performance={{
              spend: 300,
              impressions: 10000,
              clicks: 120,
              ctr: 0.6,
              cpc: 2.5,
              cpa: 0,
              roas: 0,
              purchases: 0,
              purchaseValue: 0,
              frequency: 3.2,
            }}
            selectedCurrency="EGP"
            selectedAdAccountId="act_123"
            onClose={vi.fn()}
          />
        </MemoryRouter>,
      );
    });

    const weaknessesTab = screen.getByRole("button", { name: /نقاط الضعف والتشخيص/ });
    fireEvent.click(weaknessesTab);

    expect(screen.getByText(/نزيف ميزانية حرج/)).toBeDefined();
    expect(screen.getByText(/ضعف الـ Hook/)).toBeDefined();
    expect(screen.getByText(/إرهاق الجمهور/)).toBeDefined();
  });

  it("renders ad set structure and allows editing targeting in Tab 3", async () => {
    vi.mocked(facebookAdsService.updateAdSet).mockResolvedValueOnce({
      id: "adset-1",
      name: "مجموعة استهداف القاهرة والنساء المحدثة",
      budgetAmount: 150,
      ageMin: 20,
      ageMax: 50,
      genders: ["2"],
      locations: ["Cairo", "Giza"],
    } as any);

    await act(async () => {
      render(
        <MemoryRouter>
          <CampaignQuickViewModal
            isOpen={true}
            campaign={mockCampaign}
            selectedCurrency="EGP"
            selectedAdAccountId="act_123"
            onClose={vi.fn()}
          />
        </MemoryRouter>,
      );
    });

    const structureTab = screen.getByRole("button", { name: /المجموعات وتعديل الاستهداف/ });
    fireEvent.click(structureTab);

    expect(screen.getByText("مجموعة القاهرة والجيزة")).toBeDefined();

    const editTargetingBtn = screen.getByText(/تعديل الاستهداف والمجموعة/);
    fireEvent.click(editTargetingBtn);

    expect(screen.getByText("الفئة العمرية المستهدفة")).toBeDefined();
    expect(screen.getByText("الجنس المستهدف")).toBeDefined();
    expect(screen.getByText(/المحافظات المستهدفة/)).toBeDefined();

    const womenBtn = screen.getByText("نساء");
    fireEvent.click(womenBtn);

    const saveTargetingBtn = screen.getByText("حفظ استهداف المجموعة");
    await act(async () => {
      fireEvent.click(saveTargetingBtn);
    });

    expect(facebookAdsService.updateAdSet).toHaveBeenCalledWith(
      "adset-1",
      expect.objectContaining({
        genders: ["2"],
      }),
    );
  });

  it("renders CampaignQuickViewHeader directly and supports status toggle", () => {
    const onToggle = vi.fn();
    const onClose = vi.fn();

    render(
      <CampaignQuickViewHeader
        isEn={false}
        campaignStatus="ACTIVE"
        togglingStatus={false}
        campaignName="حملة تيست"
        setCampaignName={vi.fn()}
        deliveryBadgeClass="bg-emerald-100"
        deliveryLabel="نشطة"
        facebookCampaignId="12345"
        copiedId={false}
        loadingDetails={false}
        selectedAdAccountId="act_1"
        onToggleStatus={onToggle}
        onCopyMetaId={vi.fn()}
        onRefresh={vi.fn()}
        onClose={onClose}
      />
    );

    expect(screen.getByDisplayValue("حملة تيست")).toBeDefined();
    const toggleBtn = screen.getByTitle("إيقاف الحملة مؤقتاً");
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByLabelText("إغلاق النافذة");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders CampaignQuickViewFooter with navigation link and save button", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <CampaignQuickViewFooter
          isEn={false}
          fullDetailsUrl="/campaigns/123"
          saving={false}
          onClose={onClose}
          onSaveChanges={onSave}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("الانتقال لصفحة استوديو الحملة الكاملة")).toBeDefined();
    const saveBtn = screen.getByText("حفظ التعديلات");
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
