/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrderStatusManager from "../OrderStatusManager";

vi.mock("../../../utils/tokenManager", () => ({
  default: {
    createAuthHeaders: (headers: Record<string, string> = {}) => ({
      Authorization: "Bearer mock_token",
      ...headers,
    }),
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

const mockStatuses = [
  {
    id: "s-1",
    code: "PENDING",
    name: "قيد الانتظار",
    nameEn: "Pending",
    description: "New order awaiting confirmation",
    color: "#F59E0B",
    icon: "Clock",
    sortOrder: 1,
    statusType: "order",
    source: "system",
    isSystemStatus: true,
    isActive: true,
    mapsToSystem: "PENDING",
    notifyCustomer: false,
    notifyAdmin: true,
    allowStatusEdit: true,
  },
  {
    id: "s-2",
    code: "CONFIRMED",
    name: "مؤكد",
    nameEn: "Confirmed",
    description: "Order confirmed",
    color: "#10B981",
    icon: "CheckCircle",
    sortOrder: 2,
    statusType: "order",
    source: "system",
    isSystemStatus: true,
    isActive: true,
    mapsToSystem: "CONFIRMED",
    notifyCustomer: true,
    notifyAdmin: false,
    allowStatusEdit: false,
  },
  {
    id: "s-3",
    code: "PAID",
    name: "تم الدفع",
    nameEn: "Paid",
    description: "Payment captured",
    color: "#3B82F6",
    icon: "CreditCard",
    sortOrder: 1,
    statusType: "payment",
    source: "system",
    isSystemStatus: true,
    isActive: true,
    mapsToSystem: "PAID",
    notifyCustomer: true,
    notifyAdmin: true,
    allowStatusEdit: true,
  },
];

describe("OrderStatusManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes("/api/v1/order-status/initialize")) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, message: "Initialized" }),
        });
      }
      if (url.includes("/api/v1/order-status") && options?.method === "PUT") {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockStatuses[0] }),
        });
      }
      if (url.includes("/api/v1/order-status") && options?.method === "POST") {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: { ...mockStatuses[0], id: "s-new" } }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: [...mockStatuses] }),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header and order status items", async () => {
    render(<OrderStatusManager />);

    await waitFor(() => {
      expect(screen.getByText("إدارة حالات الطلبات")).toBeTruthy();
    });

    expect(screen.getByText("حالات الطلبات")).toBeTruthy();
    expect(screen.getByText("حالات الدفع")).toBeTruthy();
    expect(screen.getByText("حالات الشحن")).toBeTruthy();
    expect(screen.getByText("حالات التجهيز")).toBeTruthy();

    expect(screen.getByText("قيد الانتظار")).toBeTruthy();
    expect(screen.getByText("مؤكد")).toBeTruthy();
    expect(screen.getAllByText("PENDING").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CONFIRMED").length).toBeGreaterThanOrEqual(1);
  });

  it("switches to payment tab and displays payment status", async () => {
    render(<OrderStatusManager />);

    await waitFor(() => {
      expect(screen.getByText("قيد الانتظار")).toBeTruthy();
    });

    const paymentTabBtn = screen.getByRole("button", { name: /حالات الدفع/i });
    fireEvent.click(paymentTabBtn);

    await waitFor(() => {
      expect(screen.getByText("تم الدفع")).toBeTruthy();
    });

    expect(screen.getAllByText("PAID").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("قيد الانتظار")).toBeNull();
  });

  it("opens add status modal on clicking add status button", async () => {
    render(<OrderStatusManager />);

    await waitFor(() => {
      expect(screen.getByText("إدارة حالات الطلبات")).toBeTruthy();
    });

    const addBtn = screen.getByRole("button", { name: /إضافة حالة/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("إضافة حالة جديدة")).toBeTruthy();
    expect(screen.getByPlaceholderText("مثال: READY_TO_SHIP")).toBeTruthy();
    expect(screen.getByPlaceholderText("مثال: جاهز للشحن")).toBeTruthy();
  });

  it("handles initialize defaults action", async () => {
    render(<OrderStatusManager />);

    await waitFor(() => {
      expect(screen.getByText("إدارة حالات الطلبات")).toBeTruthy();
    });

    const initBtn = screen.getByRole("button", { name: /تهيئة الحالات/i });
    fireEvent.click(initBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/order-status/initialize",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("toggles status allow edit button", async () => {
    render(<OrderStatusManager />);

    await waitFor(() => {
      expect(screen.getByText("قيد الانتظار")).toBeTruthy();
    });

    const allowEditBtn = screen.getByRole("button", { name: "مسموح بالتعديل" });
    fireEvent.click(allowEditBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/order-status/s-1",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining('"allowStatusEdit":false'),
        })
      );
    });
  });
});
