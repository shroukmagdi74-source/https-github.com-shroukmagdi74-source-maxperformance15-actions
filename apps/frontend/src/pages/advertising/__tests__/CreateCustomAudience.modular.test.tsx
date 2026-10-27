// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CreateCustomAudience from "../CreateCustomAudience";
import { facebookAdsService } from "../../../services/facebookAdsService";

vi.mock("../../../services/facebookAdsService", () => ({
  facebookAdsService: {
    getAdAccounts: vi.fn(),
    getFacebookPixels: vi.fn(),
    getFacebookPages: vi.fn(),
    createCustomAudience: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CreateCustomAudience (Modular)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();

    (facebookAdsService.getAdAccounts as any).mockResolvedValue([
      { id: "act_101", accountId: "101", name: "حساب إعلاني رئيسي" },
    ]);
    (facebookAdsService.getFacebookPixels as any).mockResolvedValue([
      { id: "pix_202", name: "بيكسل المتجر الرئيسي" },
    ]);
    (facebookAdsService.getFacebookPages as any).mockResolvedValue([
      { id: "page_303", name: "صفحة فيسبوك الرسمية" },
    ]);
    (facebookAdsService.createCustomAudience as any).mockResolvedValue({
      id: "aud_999",
      name: "جمهور اختباري",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders step 1 and validates required audience name", async () => {
    render(
      <MemoryRouter initialEntries={["/advertising/facebook-ads/audiences/create"]}>
        <Routes>
          <Route
            path="/advertising/facebook-ads/audiences/create"
            element={<CreateCustomAudience />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("إنشاء جمهور مخصص جديد")).toBeInTheDocument();
    expect(screen.getByText("معلومات الجمهور")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/مثال: عملاء نشطون/i)).toBeInTheDocument();

    // Click next without name
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    // Should stay on step 1
    expect(screen.getByText("معلومات الجمهور")).toBeInTheDocument();
  });

  it("progresses to step 2, allows setting website pixel criteria, and advances to review", async () => {
    render(
      <MemoryRouter initialEntries={["/advertising/facebook-ads/audiences/create"]}>
        <Routes>
          <Route
            path="/advertising/facebook-ads/audiences/create"
            element={<CreateCustomAudience />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Fill name in step 1
    const nameInput = screen.getByPlaceholderText(/مثال: عملاء نشطون/i);
    fireEvent.change(nameInput, { target: { value: "زوار المتجر - ٣٠ يوم" } });

    // Click next to step 2
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    // Verify step 2
    await waitFor(() => {
      expect(screen.getByText("Facebook Pixel *")).toBeInTheDocument();
    });

    expect(screen.getByText(/بيكسل المتجر الرئيسي/i)).toBeInTheDocument();

    // Change event type
    const eventSelect = screen.getByLabelText("نوع الحدث (Event) *");
    fireEvent.change(eventSelect, { target: { value: "PURCHASE" } });

    // Advance to step 3 (review)
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    await waitFor(() => {
      expect(
        screen.getByText("مراجعة إعدادات الجمهور المخصص"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("زوار المتجر - ٣٠ يوم")).toBeInTheDocument();
    expect(screen.getByText("PURCHASE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "إنشاء الجمهور" })).toBeInTheDocument();

    // Click submit
    fireEvent.click(screen.getByRole("button", { name: "إنشاء الجمهور" }));

    await waitFor(() => {
      expect(facebookAdsService.createCustomAudience).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "زوار المتجر - ٣٠ يوم",
          eventType: "PURCHASE",
          audienceType: "WEBSITE",
        }),
      );
    });
  });

  it("handles customer list manual parsing in step 2", async () => {
    render(
      <MemoryRouter initialEntries={["/advertising/facebook-ads/audiences/create"]}>
        <Routes>
          <Route
            path="/advertising/facebook-ads/audiences/create"
            element={<CreateCustomAudience />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Set name
    fireEvent.change(screen.getByPlaceholderText(/مثال: عملاء نشطون/i), {
      target: { value: "قائمة العملاء المهمين" },
    });

    // Select CUSTOMER_LIST
    fireEvent.click(screen.getByText(/قائمة العملاء \(Customer List\)/i));

    // Next to step 2
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    await waitFor(() => {
      expect(
        screen.getByText("عملاء متجر MaxP (استيراد تلقائي)"),
      ).toBeInTheDocument();
    });

    // Switch to manual input
    fireEvent.click(screen.getByText("إدخال يدوي / لصق نصوص"));

    const textArea = screen.getByPlaceholderText(/01012345678/i);
    fireEvent.change(textArea, {
      target: {
        value: "test@example.com\n01012345678, client2@example.com",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "تحليل وتأكيد القائمة" }));

    expect(screen.getByText(/العدد الجاهز للرفع: 3/i)).toBeInTheDocument();
  });

  it("displays Meta TOS banner when API indicates terms acceptance is required", async () => {
    (facebookAdsService.createCustomAudience as any).mockRejectedValueOnce({
      response: {
        data: {
          errorCode: "FACEBOOK_CUSTOM_AUDIENCE_TOS_REQUIRED",
          tosUrl: "https://business.facebook.com/customaudiences/tos/?act=123",
        },
      },
    });

    render(
      <MemoryRouter initialEntries={["/advertising/facebook-ads/audiences/create"]}>
        <Routes>
          <Route
            path="/advertising/facebook-ads/audiences/create"
            element={<CreateCustomAudience />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/مثال: عملاء نشطون/i), {
      target: { value: "جمهور مشروط" },
    });

    // Next to step 2
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    await waitFor(() => {
      expect(screen.getByText("Facebook Pixel *")).toBeInTheDocument();
    });

    // Next to step 3
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "إنشاء الجمهور" })).toBeInTheDocument();
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "إنشاء الجمهور" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "مطلوب قبول شروط الجماهير المخصصة (Meta TOS) لهذا الحساب",
        ),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /قبول الشروط في مدير إعلانات Meta/i }),
    ).toHaveAttribute(
      "href",
      "https://business.facebook.com/customaudiences/tos/?act=123",
    );
  });
});
