// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  PartnerDashboardHeader,
  PartnerDashboardStatsGrid,
  PartnerCommissionsTable,
  PartnerPayoutsTable,
  PartnerReferralsTable,
  PartnerPayoutRequestCard,
  PartnerRecord,
  PartnerStats,
  PartnerTrends,
  PartnerCommissionItem,
  PartnerPayoutItem,
  PartnerReferredCompany,
  calcHasMore,
  calcTrendPercent,
  getRankProgress,
  getStatusLabel,
  getStatusTone,
  getMethodLabel,
} from "../dashboard";

// Mock i18n
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const translations: Record<string, string> = {
          "platformPartner.dashboard.hello": "مرحباً",
          "platformPartner.dashboard.subtitle": "لوحة شركاء المنصة",
          "platformPartner.dashboard.partnerCodeCopied": "تم نسخ كود الشريك",
          "platformPartner.dashboard.referralLinkCopied": "تم نسخ رابط الإحالة",
          "platformPartner.dashboard.copyLink": "نسخ الرابط",
          "platformPartner.dashboard.stats.totalEarnings": "إجمالي الأرباح",
          "platformPartner.dashboard.stats.availablePayout": "الرصيد المتاح للسحب",
          "platformPartner.dashboard.stats.directReferrals": "الإحالات المباشرة",
          "platformPartner.dashboard.stats.totalNetwork": "إجمالي الشبكة",
          "platformPartner.dashboard.commissions.title": "سجل العمولات الأخيرة",
          "platformPartner.dashboard.commissions.source": "المصدر",
          "platformPartner.dashboard.commissions.amount": "المبلغ",
          "platformPartner.dashboard.commissions.level": "المستوى",
          "platformPartner.dashboard.commissions.status": "الحالة",
          "platformPartner.dashboard.commissions.date": "التاريخ",
          "platformPartner.dashboard.payout.recentPayouts": "سجل السحوبات",
          "platformPartner.dashboard.payout.amount": "المبلغ",
          "platformPartner.dashboard.payout.method": "طريقة الدفع",
          "platformPartner.dashboard.payout.status": "الحالة",
          "platformPartner.dashboard.payout.date": "التاريخ",
          "platformPartner.dashboard.referrals.historyTitle": "سجل الشركات المحالة",
          "platformPartner.dashboard.referrals.companyName": "اسم الشركة",
          "platformPartner.dashboard.referrals.status": "الحالة",
          "platformPartner.dashboard.referrals.date": "التاريخ",
          "platformPartner.dashboard.payout.readyForWithdrawal": "جاهز للسحب",
          "platformPartner.dashboard.payout.amountToWithdraw": "المبلغ المطلوب سحبه",
          "platformPartner.dashboard.payout.withdrawFunds": "طلب السحب",
          "platformPartner.dashboard.rankings.title": "التقدم في الرتب",
          "platformPartner.dashboard.rankings.nextRank": "الرتبة القادمة:",
          "common.loadMore": "تحميل المزيد",
        };
        return translations[key] || key;
      },
    }),
  };
});

// Mock useCurrency
vi.mock("../../../hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (amount: number) => `${amount} ج.م`,
  }),
}));

describe("PartnerDashboard Modular Subcomponents", () => {
  afterEach(() => {
    cleanup();
  });

  const mockPartner: PartnerRecord = {
    id: "part-123",
    partnerCode: "PART-8899",
    title: "SENIOR_PARTNER",
    totalEarnings: 15400,
    pendingEarnings: 3200,
    totalPaid: 12200,
    status: "ACTIVE",
  };

  const mockStats: PartnerStats = {
    directReferralsCount: 14,
    totalNetworkCount: 48,
    activeCompaniesCount: 12,
  };

  const mockTrends: PartnerTrends = {
    earningsChange: 25,
    referralsChange: 10,
  };

  const mockCommissions: PartnerCommissionItem[] = [
    {
      id: "comm-1",
      amount: 450,
      level: 1,
      status: "CONFIRMED",
      createdAt: "2026-03-15T10:00:00Z",
      fromCompany: { name: "شركة النيل للملابس" },
    },
  ];

  const mockPayouts: PartnerPayoutItem[] = [
    {
      id: "pay-1",
      amount: 2500,
      paymentMethod: "INSTAPAY",
      status: "PROCESSED",
      createdAt: "2026-03-10T12:00:00Z",
    },
  ];

  const mockReferrals: PartnerReferredCompany[] = [
    {
      name: "مؤسسة الأهرام للطباعة",
      status: "ACTIVE",
      createdAt: "2026-03-01T08:00:00Z",
    },
  ];

  it("PartnerDashboardHeader renders code, title badge, and trigger copy", () => {
    const copyToClipboard = vi.fn();
    render(
      <PartnerDashboardHeader
        partnerCode="PART-8899"
        partnerTitle="SENIOR_PARTNER"
        referralLink="https://maxp.online/auth/register?partner=PART-8899"
        copyToClipboard={copyToClipboard}
      />
    );

    expect(screen.getByText("مرحباً")).toBeInTheDocument();
    expect(screen.getAllByText(/PART-8899/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("نسخ الرابط")).toBeInTheDocument();

    const copyBtn = screen.getByRole("button", { name: /PART-8899/ });
    fireEvent.click(copyBtn);
    expect(copyToClipboard).toHaveBeenCalledWith("PART-8899", "تم نسخ كود الشريك");
  });

  it("PartnerDashboardStatsGrid renders stat cards with tabular values", () => {
    render(
      <PartnerDashboardStatsGrid
        partner={mockPartner}
        stats={mockStats}
        trends={mockTrends}
      />
    );

    expect(screen.getByText("إجمالي الأرباح")).toBeInTheDocument();
    expect(screen.getByText("15400 ج.م")).toBeInTheDocument();
    expect(screen.getByText("الرصيد المتاح للسحب")).toBeInTheDocument();
    expect(screen.getByText("3200 ج.م")).toBeInTheDocument();
    expect(screen.getByText("+25%")).toBeInTheDocument();
  });

  it("PartnerCommissionsTable renders commission details and handles loadMore", () => {
    const onLoadMore = vi.fn();
    render(
      <PartnerCommissionsTable
        commissions={mockCommissions}
        hasMore={true}
        onLoadMore={onLoadMore}
      />
    );

    expect(screen.getByText("سجل العمولات الأخيرة")).toBeInTheDocument();
    expect(screen.getByText("شركة النيل للملابس")).toBeInTheDocument();
    expect(screen.getByText("450 ج.م")).toBeInTheDocument();

    const loadMoreBtn = screen.getByRole("button", { name: "تحميل المزيد" });
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("PartnerPayoutsTable renders payout items and handles loadMore", () => {
    const onLoadMore = vi.fn();
    render(
      <PartnerPayoutsTable
        payouts={mockPayouts}
        hasMore={true}
        onLoadMore={onLoadMore}
      />
    );

    expect(screen.getByText("سجل السحوبات")).toBeInTheDocument();
    expect(screen.getByText("2500 ج.م")).toBeInTheDocument();

    const loadMoreBtn = screen.getByRole("button", { name: "تحميل المزيد" });
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("PartnerReferralsTable renders company names and statuses", () => {
    const onLoadMore = vi.fn();
    render(
      <PartnerReferralsTable
        referrals={mockReferrals}
        hasMore={false}
        onLoadMore={onLoadMore}
      />
    );

    expect(screen.getByText("سجل الشركات المحالة")).toBeInTheDocument();
    expect(screen.getByText("مؤسسة الأهرام للطباعة")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "تحميل المزيد" })).not.toBeInTheDocument();
  });

  it("PartnerPayoutRequestCard handles withdrawal submission", () => {
    const handlePayoutRequest = vi.fn((e) => {
      e.preventDefault();
      return Promise.resolve();
    });
    const setPayoutAmount = vi.fn();
    const setPayoutMethod = vi.fn();

    render(
      <PartnerPayoutRequestCard
        pendingEarnings={3200}
        payoutAmount="1000"
        setPayoutAmount={setPayoutAmount}
        payoutMethod="INSTAPAY"
        setPayoutMethod={setPayoutMethod}
        payoutLoading={false}
        handlePayoutRequest={handlePayoutRequest}
        partnerTitle="SENIOR_PARTNER"
      />
    );

    expect(screen.getByText("جاهز للسحب")).toBeInTheDocument();
    expect(screen.getByText("3200 ج.م")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "طلب السحب" });
    fireEvent.click(submitBtn);
    expect(handlePayoutRequest).toHaveBeenCalled();
  });

  it("Helper functions calculate trends, pagination and ranks accurately", () => {
    expect(calcHasMore({ page: 1, pageSize: 10, total: 25 })).toBe(true);
    expect(calcHasMore({ page: 3, pageSize: 10, total: 25 })).toBe(false);
    expect(calcTrendPercent(120, 100)).toBe(20);
    expect(calcTrendPercent(80, 100)).toBe(-20);

    const rankInfo = getRankProgress("SENIOR_PARTNER");
    expect(rankInfo.currentRankIndex).toBe(1);
    expect(rankInfo.progressToTop).toBe(50);
    expect(rankInfo.nextRankKey).toBe("MASTER_PARTNER");

    const tMock = ((k: string) => k) as any;
    expect(getStatusLabel("PAID", tMock)).toBeDefined();
    expect(getStatusTone("PAID")).toContain("emerald");
    expect(getStatusTone("PENDING")).toContain("amber");
    expect(getMethodLabel("INSTAPAY", tMock)).toBeDefined();
  });
});
