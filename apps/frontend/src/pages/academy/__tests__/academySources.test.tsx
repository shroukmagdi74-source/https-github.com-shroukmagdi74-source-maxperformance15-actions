// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AcademySourcesPage from "../AcademySourcesPage";
import { academyApi, SourcesAnalyticsData } from "../academyApi";

vi.mock("../academyApi", () => ({
  academyApi: {
    getSourcesAnalytics: vi.fn(),
  },
}));

const mockAnalyticsData: SourcesAnalyticsData = {
  range: { days: 30, from: "2026-09-24T00:00:00.000Z", to: "2026-10-24T00:00:00.000Z" },
  totals: {
    enrollments: 4,
    paidEnrollments: 2,
    attributedEnrollments: 3,
    unattributedEnrollments: 1,
    revenue: 300,
    enrollmentValue: 400,
  },
  bySource: [
    {
      source: "facebook",
      medium: "paid_social",
      platform: "facebook",
      enrollments: 2,
      paidEnrollments: 1,
      revenue: 100,
      enrollmentValue: 200,
    },
    {
      source: "unknown",
      medium: "",
      platform: "",
      enrollments: 1,
      paidEnrollments: 1,
      revenue: 200,
      enrollmentValue: 200,
    },
  ],
  byCampaign: [
    {
      campaignName: "حملة الصيف",
      campaignId: "camp-summer",
      adId: "ad-1",
      adSetId: "set-1",
      source: "facebook",
      medium: "paid_social",
      enrollments: 2,
      paidEnrollments: 1,
      revenue: 100,
      enrollmentValue: 200,
      lastEnrolledAt: "2026-10-24T12:00:00.000Z",
    },
    {
      campaignName: "", // Empty campaign name -> renders "غير معروف"
      campaignId: "",
      adId: "",
      adSetId: "",
      source: "unknown",
      medium: "",
      enrollments: 1,
      paidEnrollments: 1,
      revenue: 200,
      enrollmentValue: 200,
      lastEnrolledAt: "2026-10-24T12:00:00.000Z",
    },
  ],
  byLanding: [
    {
      landingPath: "/portal/course/c-1",
      referrer: "https://m.facebook.com/",
      enrollments: 2,
      paidEnrollments: 1,
    },
  ],
  byDay: [
    { date: "2026-10-24", enrollments: 4, paidEnrollments: 2, revenue: 300 },
  ],
};

describe("AcademySourcesPage (ACAD-SRC-1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders KPIs from mock analytics response", async () => {
    vi.mocked(academyApi.getSourcesAnalytics).mockResolvedValue(mockAnalyticsData);

    render(<AcademySourcesPage />);

    await waitFor(() => {
      expect(screen.getByText("مصادر تسجيل الطلاب ونتائج الحملات")).toBeTruthy();
    });

    // Check KPIs
    expect(screen.getByText("إجمالي التسجيلات")).toBeTruthy();
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);

    expect(screen.getByText("تسجيلات مدفوعة")).toBeTruthy();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);

    expect(screen.getByText("نسبة معروف المصدر")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy(); // 3 / 4 = 75%
  });

  it("renders «غير معروف» for empty campaign name", async () => {
    vi.mocked(academyApi.getSourcesAnalytics).mockResolvedValue(mockAnalyticsData);

    render(<AcademySourcesPage />);

    await waitFor(() => {
      expect(screen.getByText("حملة الصيف")).toBeTruthy();
    });

    const unknownElements = screen.getAllByText("غير معروف");
    expect(unknownElements.length).toBeGreaterThan(0);
  });
});
