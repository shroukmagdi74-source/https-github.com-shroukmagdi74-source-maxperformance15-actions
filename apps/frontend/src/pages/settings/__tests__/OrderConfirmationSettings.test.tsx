/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrderConfirmationSettings from "../OrderConfirmationSettings";
import orderConfirmationService from "../../../services/orderConfirmationService";

vi.mock("../../../services/orderConfirmationService", () => ({
  default: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    getEligibleUsers: vi.fn(),
    getProducts: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSettings = {
  enabled: true,
  requireSourceTypes: ["storefront", "manual"],
  requireStatuses: ["PENDING"],
  requireMatchMode: "any",
  confirmStatus: "CONFIRMED",
  distributionEnabled: true,
  distributionStrategy: "round_robin",
  eligibleRoles: ["AGENT", "MANAGER"],
  eligibleUserIds: ["u1"],
  regionRules: { القاهرة: ["u1"] },
  specialtyRules: {},
  orderValueRules: [{ minTotal: 500, maxTotal: 2000, userIds: ["u1"] }],
  maxCallsNoAnswer: 3,
  intervalMinutes: 30,
  notifyOnNew: true,
  autoAssignOnConfirm: true,
  workloadStatuses: [],
};

const mockUsers = [
  { id: "u1", firstName: "أحمد", lastName: "علي", role: "AGENT", availability: "available" },
  { id: "u2", firstName: "سارة", lastName: "محمد", role: "MANAGER", availability: "away" },
];

const mockProducts = [
  { id: "p1", name: "قميص كلاسيك", sku: "SHIRT-01" },
  { id: "p2", name: "بنطلون جينز", sku: "PANTS-02" },
];

describe("OrderConfirmationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (orderConfirmationService.getSettings as any).mockResolvedValue({
      success: true,
      data: { ...mockSettings },
    });
    (orderConfirmationService.getEligibleUsers as any).mockResolvedValue({
      success: true,
      data: [...mockUsers],
    });
    (orderConfirmationService.getProducts as any).mockResolvedValue({
      success: true,
      data: [...mockProducts],
    });
    (orderConfirmationService.updateSettings as any).mockResolvedValue({
      success: true,
      data: { ...mockSettings },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header and main sections after loading", async () => {
    render(<OrderConfirmationSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات التأكيد والتوزيع")).toBeTruthy();
    });

    expect(screen.getByText("تفعيل التأكيد")).toBeTruthy();
    expect(screen.getByText("تفعيل التوزيع التلقائي")).toBeTruthy();
    expect(screen.getByText("دورة مكالمات التأكيد")).toBeTruthy();
    expect(screen.getByText("حفظ الإعدادات")).toBeTruthy();
  });

  it("handles toggling confirmation switch", async () => {
    render(<OrderConfirmationSettings />);

    await waitFor(() => {
      expect(screen.getByText("تفعيل التأكيد")).toBeTruthy();
    });

    const switchBtn = screen.getByRole("switch", { name: "تفعيل التأكيد" });
    expect(switchBtn.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(switchBtn);
    expect(switchBtn.getAttribute("aria-checked")).toBe("false");
  });

  it("handles distribution strategy changes and roles", async () => {
    render(<OrderConfirmationSettings />);

    await waitFor(() => {
      expect(screen.getByText("طريقة التوزيع")).toBeTruthy();
    });

    const strategySelect = screen.getAllByRole("combobox")[1] as HTMLSelectElement;
    expect(strategySelect.value).toBe("round_robin");

    fireEvent.change(strategySelect, { target: { value: "by_region" } });
    expect(strategySelect.value).toBe("by_region");
  });

  it("updates call cycle settings inputs", async () => {
    render(<OrderConfirmationSettings />);

    await waitFor(() => {
      expect(screen.getByText("أقصى عدد محاولات بدون رد")).toBeTruthy();
    });

    const numberInputs = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    const maxCallsInput = numberInputs[0];
    const intervalInput = numberInputs[1];

    expect(maxCallsInput.value).toBe("3");
    expect(intervalInput.value).toBe("30");

    fireEvent.change(maxCallsInput, { target: { value: "5" } });
    expect(maxCallsInput.value).toBe("5");

    fireEvent.change(intervalInput, { target: { value: "45" } });
    expect(intervalInput.value).toBe("45");
  });

  it("saves updated settings successfully", async () => {
    render(<OrderConfirmationSettings />);

    await waitFor(() => {
      expect(screen.getByText("حفظ الإعدادات")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: "حفظ الإعدادات" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(orderConfirmationService.updateSettings).toHaveBeenCalledTimes(1);
    });
  });
});
