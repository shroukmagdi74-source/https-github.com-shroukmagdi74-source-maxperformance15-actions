// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import OwnerReports from "../OwnerReports";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          summary: {
            totalCompanies: 2,
            totalEmployees: 24,
            presentCount: 20,
            lateCount: 3,
            absentCount: 1,
            onLeaveCount: 0,
          },
          byCompany: [],
          records: [],
          overview: {
            totalCompanies: 2,
            totalRevenue: 45000,
            totalOrders: 150,
            totalCompleted: 130,
          },
          dailyBreakdown: [],
        },
      },
    }),
  },
}));

describe("OwnerReports", () => {
  it("renders unified reports header and tabs", async () => {
    render(<OwnerReports />);
    await waitFor(() => {
      expect(screen.getByText("التقارير الموحدة")).toBeTruthy();
      expect(screen.getByText("حضور اليوم")).toBeTruthy();
      expect(screen.getByText("تقرير المبيعات")).toBeTruthy();
    });
  });
});
