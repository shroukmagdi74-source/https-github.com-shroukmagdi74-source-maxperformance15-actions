/* @vitest-environment jsdom */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import TurboSettings from "../TurboSettings";

const mockNavigate = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockApiGet = vi.fn();
const mockApiPut = vi.fn();
const mockApiPost = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "turbo.k_1": "فشل تحميل إعدادات Turbo",
        "turbo.k_2": "يرجى إدخال API Key",
        "turbo.k_3": "لا يمكن تفعيل Turbo بدون إدخال API Key",
        "turbo.k_4": "تم حفظ الإعدادات بنجاح",
        "turbo.k_5": "فشل حفظ الإعدادات",
        "turbo.k_6": "يرجى إدخال API Key لاختبار الاتصال",
        "turbo.k_7": "القاهرة",
        "turbo.k_8": "تم الاتصال بنجاح",
        "turbo.k_9": "فشل الاتصال",
        "turbo.k_10": "مفعل",
        "turbo.k_11": "معطل",
        "turbo.k_12": "خدمة Turbo مفعلة وجاهزة للاستخدام",
        "turbo.k_13": "خدمة Turbo معطلة",
        "turbo.k_14": "إخفاء",
        "turbo.k_15": "تغيير المفتاح",
        "turbo.k_16": "مفتاح API جديد",
        "turbo.k_17": "أدخل مفتاح API",
        "turbo.k_18": "معلومات هامة",
        "turbo.k_19": "تأكد من صحة المفتاح",
        "turbo.k_20": "إنشاء الشحنات تلقائياً",
        "turbo.k_21": "جاري الحفظ...",
        "turbo.k_22": "حفظ الإعدادات",
        "turbo.k_23": "جاري تحميل الإعدادات...",
        "turbo.k_24": "إعدادات المتجر",
        "turbo.k_25": "إعدادات شركة شحن Turbo",
        "turbo.k_26": "ربط متجرك مع Turbo لإنشاء الشحنات",
        "turbo.k_27": "تم حفظ مفتاح API مسبقاً",
        "turbo.k_28": "يمكنك الحصول على المفتاح من",
        "turbo.k_29": "بوابة Turbo",
        "turbo.k_30": "اختبار الاتصال",
        "turbo.k_31": "كود العميل الرئيسي الخاص بك",
        "turbo.k_32": "رقم هاتف الراسل",
        "turbo.k_33": "الرقم المسجل لدى Turbo",
        "turbo.k_34": "إنشاء بوليصة شحن تلقائياً عند تأكيد الطلب",
        "turbo.k_35": "رابط الـ Webhook",
        "turbo.k_36": "الصق هذا الرابط في لوحة Turbo",
        "turbo.k_37": "الرابط المقترح:",
        "turbo.k_38": "Webhook Token",
        "turbo.k_39": "رمز الحماية للتحقق من صحة الطلبات",
        "turbo.k_40": "اختياري ولكن ينصح به",
        "turbo.k_41": "يتم استخدام الكود الرئيسي لتحديد الحساب",
        "turbo.k_42": "يتم إشعار المتجر بتحديثات الشحنات عبر Webhook",
        "turbo.k_43": "يمكنك اختبار الاتصال قبل الحفظ",
        "turbo.k_44": "تأكد من إدخال رقم هاتف صحيح",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    put: (...args: unknown[]) => mockApiPut(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

const mockSettingsData = {
  turboEnabled: true,
  turboAutoCreate: true,
  turboApiKey: "",
  turboMainClientCode: 37321,
  turboSenderNumber: "01012345678",
  turboWebhookUrl: "https://example.com/api/v1/turbo-webhook/webhook",
  turboWebhookToken: "test-token",
  hasApiKey: true,
  maskedApiKey: "tb_live_••••••••••••1234",
};

describe("TurboSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue({
      data: {
        success: true,
        data: mockSettingsData,
      },
    });
    mockApiPut.mockResolvedValue({
      data: {
        success: true,
      },
    });
    mockApiPost.mockResolvedValue({
      data: {
        success: true,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and displays Turbo settings correctly", async () => {
    render(<TurboSettings />);

    await waitFor(() => {
      expect(screen.getByText("إعدادات شركة شحن Turbo")).toBeInTheDocument();
      expect(screen.getByText("مفعل")).toBeInTheDocument();
      expect(screen.getByText("tb_live_••••••••••••1234")).toBeInTheDocument();
      expect(screen.getByDisplayValue("37321")).toBeInTheDocument();
      expect(screen.getByDisplayValue("01012345678")).toBeInTheDocument();
    });
  });

  it("toggles API key input visibility when clicking change key", async () => {
    render(<TurboSettings />);

    await waitFor(() => {
      expect(screen.getByText("تغيير المفتاح")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("تغيير المفتاح"));

    expect(screen.getByPlaceholderText("أدخل مفتاح API")).toBeInTheDocument();
    expect(screen.getByText("إخفاء")).toBeInTheDocument();
  });

  it("saves updated Turbo settings when clicking save button", async () => {
    render(<TurboSettings />);

    await waitFor(() => {
      expect(screen.getByText("حفظ الإعدادات")).toBeInTheDocument();
    });

    const clientCodeInput = screen.getByDisplayValue("37321");
    fireEvent.change(clientCodeInput, { target: { value: "99999" } });

    fireEvent.click(screen.getByText("حفظ الإعدادات"));

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith(
        "/store-settings/turbo",
        expect.objectContaining({
          turboMainClientCode: 99999,
          turboEnabled: true,
        })
      );
      expect(mockToastSuccess).toHaveBeenCalledWith("تم حفظ الإعدادات بنجاح");
    });
  });

  it("tests connection successfully when clicking test button", async () => {
    render(<TurboSettings />);

    await waitFor(() => {
      expect(screen.getByText("اختبار الاتصال")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("اختبار الاتصال"));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        "/turbo/calculate",
        expect.objectContaining({
          city: "القاهرة",
        })
      );
      expect(mockToastSuccess).toHaveBeenCalledWith("تم الاتصال بنجاح");
    });
  });

  it("navigates back to shipping companies when breadcrumb clicked", async () => {
    render(<TurboSettings />);

    await waitFor(() => {
      expect(screen.getByText("شركات الشحن")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("شركات الشحن"));
    expect(mockNavigate).toHaveBeenCalledWith("/shipping-companies");
  });
});
