// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import AssetRequestsSection from "../hr/assets/sections/AssetRequestsSection";
import { companyAwareApi } from "../../services/companyAwareApi";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRequests = [
  {
    id: "req-101",
    requestedBy: "emp-1",
    assetType: "حاسوب محمول (Laptop)",
    reason: "جهاز العمل الحالي بطيء",
    priority: "HIGH",
    status: "PENDING",
    createdAt: "2026-10-20T09:00:00.000Z",
    requester: {
      firstName: "طارق",
      lastName: "نبيل",
      employeeNumber: "EMP-501",
    },
  },
  {
    id: "req-102",
    requestedBy: "emp-1",
    assetType: "شاشة (Monitor)",
    reason: "شاشة إضافية للتصميم",
    priority: "NORMAL",
    status: "APPROVED",
    createdAt: "2026-10-18T11:00:00.000Z",
    requester: {
      firstName: "طارق",
      lastName: "نبيل",
      employeeNumber: "EMP-501",
    },
  },
];

describe("AssetRequestsSection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mockRequests,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders employee requests view and opens new request modal", async () => {
    render(<AssetRequestsSection />);

    await waitFor(() => {
      expect(screen.getByText("حاسوب محمول (Laptop)")).toBeTruthy();
    });

    expect(screen.getByText("شاشة إضافية للتصميم")).toBeTruthy();

    fireEvent.click(screen.getByText("طلب جديد"));
    expect(screen.getByText("تقديم طلب عهدة")).toBeTruthy();
  });

  it("switches to HR view and shows pending request approval actions", async () => {
    render(<AssetRequestsSection />);

    await waitFor(() => {
      expect(screen.getByText("حاسوب محمول (Laptop)")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("إدارة HR"));

    await waitFor(() => {
      expect(screen.getByText("إدارة طلبات الموظفين")).toBeTruthy();
    });

    expect(screen.getByText("موافقة وارسال WhatsApp")).toBeTruthy();
  });
});
