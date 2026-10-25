// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import OwnerAttendanceReport from "../OwnerAttendanceReport";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          companies: [{ id: "c1", name: "شركة النور", logo: null }],
          summary: {
            totalCompanies: 1,
            totalEmployees: 12,
            totalPresent: 10,
            totalLate: 2,
            totalAbsent: 0,
            overallAttendanceRate: 92,
          },
          byEmployee: [],
        },
      },
    }),
  },
}));

describe("OwnerAttendanceReport", () => {
  it("renders header and subtitle after loading", async () => {
    render(<OwnerAttendanceReport />);
    await waitFor(() => {
      expect(screen.getByText("تقرير حضور الموظفين")).toBeTruthy();
      expect(
        screen.getByText("تتبُّع انضباط الموظفين في جميع شركاتك"),
      ).toBeTruthy();
    });
  });
});
