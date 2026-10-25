// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import AssetRequests from "../hr/assets/AssetRequests";
import { apiClient } from "../../services/apiClient";

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockRequests = [
  {
    id: "req-1",
    assetType: "حاسوب مكتبي",
    category: "أجهزة",
    reason: "تعيين موظف جديد",
    priority: "HIGH",
    status: "PENDING",
    requestedBy: "emp-1",
    createdAt: "2026-10-20T10:00:00.000Z",
  },
  {
    id: "req-2",
    assetType: "شاشة عرض 27 بوصة",
    category: "ملحقات",
    reason: "استبدال شاشة تالفة",
    priority: "NORMAL",
    status: "APPROVED",
    requestedBy: "emp-2",
    createdAt: "2026-10-19T12:00:00.000Z",
  },
];

describe("AssetRequests Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mockRequests,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders asset requests table and opens fulfill modal for approved request", async () => {
    render(<AssetRequests />);

    await waitFor(() => {
      expect(screen.getByText("حاسوب مكتبي")).toBeTruthy();
    });

    expect(screen.getByText("شاشة عرض 27 بوصة")).toBeTruthy();
    expect(screen.getAllByText("قيد الانتظار").length).toBeGreaterThan(0);
    expect(screen.getAllByText("موافق عليه").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("تخصيص"));
    expect(screen.getByText("تخصيص أصل")).toBeTruthy();
  });
});
