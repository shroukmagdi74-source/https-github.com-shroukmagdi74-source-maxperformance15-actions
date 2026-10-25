// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AssetsOverviewDashboard from "../hr/assets/AssetsOverviewDashboard";
import {
  ASSET_DASHBOARD_SECTIONS,
  ASSET_REPORT_CARDS,
  getAssetSectionTitle,
} from "../hr/assets/dashboard/helpers";

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(() => Promise.resolve({ data: { success: true, data: [] } })),
  },
}));

vi.mock("../hr/assets/sections/OverviewSection", () => ({
  default: () => <div>OverviewSection Mock</div>,
}));

vi.mock("../hr/assets/AssetList", () => ({
  default: () => <div>AssetList Mock</div>,
}));

describe("AssetsOverviewDashboard Helpers", () => {
  it("provides section definitions, report cards, and active section titles", () => {
    expect(ASSET_DASHBOARD_SECTIONS.length).toBeGreaterThanOrEqual(10);
    expect(ASSET_REPORT_CARDS).toHaveLength(6);
    expect(getAssetSectionTitle("manage")).toBe("إدارة الأصول");
    expect(getAssetSectionTitle("reports")).toBe("التقارير");
  });
});

describe("AssetsOverviewDashboard Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders sidebar navigation and overview section by default", () => {
    render(<AssetsOverviewDashboard />);

    expect(screen.getByText("إدارة الأصول والعهدة")).toBeTruthy();
    expect(screen.getByText("OverviewSection Mock")).toBeTruthy();
  });

  it("switches to reports section and displays 6 downloadable report cards", async () => {
    render(<AssetsOverviewDashboard />);

    fireEvent.click(screen.getByText("التقارير"));

    await waitFor(() => {
      expect(screen.getByText("كل الأصول")).toBeTruthy();
    });
    expect(screen.getByText("العهد الحالية")).toBeTruthy();
    expect(screen.getByText("الأصول المتاحة")).toBeTruthy();
    expect(screen.getAllByText("Excel")).toHaveLength(6);
    expect(screen.getAllByText("PDF")).toHaveLength(6);
  });
});
