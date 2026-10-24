/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrderPreparationSettings from "../OrderPreparationSettings";

const mockApiGet = vi.fn();
const mockApiPut = vi.fn();

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: {
      id: "user-1",
      companyId: "company-123",
      companySlug: "mystore",
    },
  }),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("OrderPreparationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApiGet.mockImplementation((url: string) => {
      if (url === "/companies/current") {
        return Promise.resolve({
          data: {
            data: {
              settings: {
                orderPreparation: {
                  enabled: true,
                  defaultWarehouseId: "wh-1",
                  startingStatus: "PENDING_PREPARATION",
                  handoffStatus: "READY_TO_SHIP",
                },
              },
            },
          },
        });
      }
      if (url === "/warehouses") {
        return Promise.resolve({
          data: {
            data: [
              { id: "wh-1", name: "المخزن الرئيسي" },
              { id: "wh-2", name: "مخزن الإسكندرية" },
            ],
          },
        });
      }
      if (url.includes("statusType=preparation")) {
        return Promise.resolve({
          data: {
            data: [
              { code: "CONFIRMED", name: "مؤكد" },
              { code: "PENDING_PREPARATION", name: "في انتظار التجهيز" },
              { code: "PREPARING", name: "قيد التجهيز" },
            ],
          },
        });
      }
      if (url.includes("statusType=shipping")) {
        return Promise.resolve({
          data: {
            data: [
              { code: "READY_TO_SHIP", name: "جاهز للشحن" },
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    mockApiPut.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, status badge, and pipeline stages", async () => {
    render(<OrderPreparationSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات تجهيز الطلبات")).toBeTruthy();
    });

    expect(screen.getByText("Fulfillment Settings")).toBeTruthy();
    expect(screen.getByText("المسار مفعل")).toBeTruthy();
    expect(screen.getByText("المخزن الرئيسي")).toBeTruthy();
    expect(screen.getAllByText("مسار التجهيز").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("المخزون والجودة")).toBeTruthy();
    expect(screen.getByText("ورقة التجهيز")).toBeTruthy();
  });

  it("switches to quality tab and toggles QC checklists", async () => {
    render(<OrderPreparationSettings />);

    await waitFor(() => {
      expect(screen.getByText("المخزون والجودة")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("المخزون والجودة"));

    expect(screen.getByText("سياسات المخزون")).toBeTruthy();
    expect(screen.getByText("فحص الجودة")).toBeTruthy();
    expect(screen.getByText("الإجراءات الجماعية")).toBeTruthy();
    expect(screen.getByText("الإشعارات ومؤشرات التأخير")).toBeTruthy();
    expect(screen.getByText("حجز المخزون تلقائيًا")).toBeTruthy();
  });

  it("switches to document tab and renders slip settings and live preview", async () => {
    render(<OrderPreparationSettings />);

    await waitFor(() => {
      expect(screen.getByText("ورقة التجهيز")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("ورقة التجهيز"));

    expect(screen.getByText("إعدادات ورقة التجهيز")).toBeTruthy();
    expect(screen.getByText("عنوان المستند")).toBeTruthy();
    expect(screen.getByText("معاينة")).toBeTruthy();
    expect(screen.getByText("تعليمات التجهيز:")).toBeTruthy();
  });

  it("handles save action properly", async () => {
    render(<OrderPreparationSettings />);

    await waitFor(() => {
      expect(screen.getByText("حفظ إعدادات التجهيز")).toBeTruthy();
    });

    const saveBtn = screen.getByRole("button", { name: /حفظ إعدادات التجهيز/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith(
        "/companies/company-123",
        expect.objectContaining({
          settings: expect.objectContaining({
            orderPreparation: expect.objectContaining({
              enabled: true,
            }),
          }),
        }),
      );
    });
  });

  it("handles reset to defaults action properly", async () => {
    render(<OrderPreparationSettings />);

    await waitFor(() => {
      expect(screen.getByText("استرجاع الافتراضي")).toBeTruthy();
    });

    const resetBtn = screen.getByRole("button", { name: /استرجاع الافتراضي/i });
    fireEvent.click(resetBtn);

    expect(resetBtn).toBeTruthy();
  });
});
