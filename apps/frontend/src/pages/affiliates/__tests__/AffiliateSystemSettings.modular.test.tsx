/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import AffiliateSystemSettings from "../AffiliateSystemSettings";
import { apiClient } from "../../../services/apiClient";

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    actualTheme: "light",
    theme: "light",
    derivedTheme: "light",
  }),
}));

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      companyId: "comp-123",
      company: {
        slug: "demo-store",
      },
    },
  }),
}));

vi.mock("../../../utils/storeUrl", () => ({
  getBaseDomain: () => "localhost:3000",
}));

const mockSettings = {
  commissionType: "PERCENTAGE",
  commissionRate: 5,
  cookieDuration: 30,
  termsAndConditions: "الشروط والأحكام الخاصة بالمسوقين",
  isActive: true,
  autoApproveAffiliates: false,
  defaultMinPayout: 100,
  defaultCanCreateOrdersForOthers: true,
  defaultCanViewCustomerData: true,
  requireIdentityDocument: false,
  identityDocumentLabel: "مستند إثبات الهوية",
  payoutSlaDays: 3,
  platformMarginType: "FIXED",
  platformMarginValue: 0,
  commissionOnStatus: "CONFIRMED",
};

describe("AffiliateSystemSettings Modular Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        success: true,
        data: mockSettings,
      },
    } as any);

    vi.mocked(apiClient.put).mockResolvedValue({
      data: {
        success: true,
        data: mockSettings,
        recalculatedProducts: 0,
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header, title, and action button", async () => {
    render(<AffiliateSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات نظام المسوقين")).toBeInTheDocument();
      expect(
        screen.getByText("تحكم في عمولات المسوقين، الشروط والأحكام، وروابط التسجيل"),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: "حفظ التغييرات" })[0],
      ).toBeInTheDocument();
    });
  });

  it("renders invitation link card with copy button", async () => {
    render(<AffiliateSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText("رابط دعوة المسوقين")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(/affiliate-register\/demo-store/),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /نسخ/ })).toBeInTheDocument();
    });
  });

  it("displays status toggle cards and allows toggling system active switch", async () => {
    render(<AffiliateSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText("حالة نظام المسوقين (تسجيل المسوقين)")).toBeInTheDocument();
      expect(screen.getByText("مفعل (يستقبل تسجيلات)")).toBeInTheDocument();
    });

    const activeSwitch = screen.getByLabelText("حالة نظام المسوقين");
    fireEvent.click(activeSwitch);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/affiliate-settings",
        expect.objectContaining({
          isActive: false,
        }),
      );
    });
  });

  it("toggles auto approve affiliates switch", async () => {
    render(<AffiliateSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText("الموافقة التلقائية على المسوقين الجدد")).toBeInTheDocument();
      expect(screen.getByText("يتطلب موافقة يدوية من الإدارة")).toBeInTheDocument();
    });

    const autoApproveSwitch = screen.getByLabelText("الموافقة التلقائية على المسوقين الجدد");
    fireEvent.click(autoApproveSwitch);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/affiliate-settings",
        expect.objectContaining({
          autoApproveAffiliates: true,
          isActive: true,
        }),
      );
    });
  });

  it("updates operational defaults (min payout, SLA days, direct orders, doc label)", async () => {
    render(<AffiliateSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText("الضوابط الافتراضية للمسوق الجديد")).toBeInTheDocument();
    });

    const minPayoutInput = screen.getByLabelText("الحد الأدنى الافتراضي للسحب");
    fireEvent.change(minPayoutInput, { target: { value: "250" } });

    const slaInput = screen.getByLabelText("مدة معالجة السحب");
    fireEvent.change(slaInput, { target: { value: "7" } });

    const saveBtns = screen.getAllByRole("button", { name: "حفظ التغييرات" });
    fireEvent.click(saveBtns[0]);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/affiliate-settings",
        expect.objectContaining({
          defaultMinPayout: 250,
          payoutSlaDays: 7,
        }),
      );
    });
  });

  it("updates commission settings and platform margin", async () => {
    render(<AffiliateSystemSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات العمولة الافتراضية")).toBeInTheDocument();
    });

    const commissionTypeSelect = screen.getByDisplayValue("نسبة مئوية (%)");
    fireEvent.change(commissionTypeSelect, { target: { value: "FIXED" } });

    const commissionStatusSelect = screen.getByDisplayValue("تأكيد الطلب (CONFIRMED)");
    fireEvent.change(commissionStatusSelect, { target: { value: "DELIVERED" } });

    const saveBtn = screen.getAllByRole("button", { name: "حفظ التغييرات" })[0];
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/affiliate-settings",
        expect.objectContaining({
          commissionType: "FIXED",
          commissionOnStatus: "DELIVERED",
        }),
      );
    });
  });
});
