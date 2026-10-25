// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import AssetMaintenanceSection from "../hr/assets/sections/AssetMaintenanceSection";
import { companyAwareApi } from "../../services/companyAwareApi";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (val: number | string) => `${val} ج.م`,
  }),
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AssetMaintenanceSection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/assets/alerts")) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              expiringWarranties: [
                { name: "طابعة ليزر HP", code: "AST-201", endDate: "2026-11-15", type: "WARRANTY" },
              ],
              upcomingMaintenance: [
                { name: "سيرفر قاعدة البيانات", code: "AST-202", scheduledDate: "2026-11-01", maintenanceType: "صيانة دورية", type: "MAINTENANCE" },
              ],
            },
          },
        });
      }
      if (url.includes("/hr/assets/maintenance")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "m-1",
                assetId: "a-1",
                type: "إصلاح عطل",
                description: "تغيير مروحة التبريد",
                cost: 1500,
                status: "COMPLETED",
                startDate: "2026-10-10",
                performedBy: "مركز الصيانة المعتمد",
                asset: { name: "حاسوب تصميم", code: "AST-300" },
              },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          success: true,
          data: [{ id: "a-1", name: "حاسوب تصميم", code: "AST-300" }],
        },
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders warranty alerts, upcoming maintenance, history table, and opens add modal", async () => {
    render(<AssetMaintenanceSection />);

    await waitFor(() => {
      expect(screen.getByText("طابعة ليزر HP")).toBeTruthy();
    });

    expect(screen.getByText("سيرفر قاعدة البيانات")).toBeTruthy();
    expect(screen.getByText("تغيير مروحة التبريد")).toBeTruthy();
    expect(screen.getByText("1500 ج.م")).toBeTruthy();

    fireEvent.click(screen.getByText("تسجيل صيانة"));
    expect(screen.getByText("تسجيل عملية صيانة / جدولة")).toBeTruthy();
  });
});
