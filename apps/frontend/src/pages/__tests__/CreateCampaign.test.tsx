/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateCampaign from "../advertising/CreateCampaign";
import { facebookAdsService } from "../../services/facebookAdsService";
import { apiClient } from "../../services/apiClient";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", companyId: "comp-1", role: "ADMIN" },
  }),
}));

vi.mock("../../services/facebookAdsService", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    facebookAdsService: {
      getAdAccounts: vi.fn(),
      createCampaign: vi.fn(),
    },
  };
});

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockAdAccounts = [
  {
    id: "act_101",
    account_id: "act_101",
    name: "حساب إعلاني رئيسي",
    currency: "EGP",
    isActive: true,
  },
];

const mockPixels = [
  {
    pixelId: "pix_202",
    pixelName: "بكسل المتجر",
    businessId: "biz_1",
    businessName: "Business 1",
  },
];

describe("CreateCampaign Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (facebookAdsService.getAdAccounts as any).mockResolvedValue(mockAdAccounts);
    (apiClient.get as any).mockResolvedValue({
      data: { success: true, pixels: mockPixels },
    });
  });

  it("renders header, wizard stepper, and Step 1 form fields", async () => {
    render(
      <MemoryRouter>
        <CreateCampaign />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "إنشاء حملة إعلانية جديدة" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "معلومات الحملة" })).toBeTruthy();
    expect(screen.getByLabelText(/اسم الحملة/)).toBeTruthy();
    expect(screen.getByLabelText(/هدف الحملة/)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/حساب إعلاني رئيسي/)).toBeTruthy();
    });
  });

  it("allows entering name and navigating to Step 2 (Budget & Schedule)", async () => {
    render(
      <MemoryRouter>
        <CreateCampaign />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/حساب إعلاني رئيسي/)).toBeTruthy();
    });

    const nameInput = screen.getByLabelText(/اسم الحملة/);
    fireEvent.change(nameInput, { target: { value: "حملة تجريبية سريعة" } });

    const nextBtn = screen.getByRole("button", { name: /التالي/ });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "الميزانية والجدولة" })).toBeTruthy();
      expect(screen.getByText(/تفعيل Campaign Budget Optimization/)).toBeTruthy();
    });
  });

  it("navigates back to previous step when clicking Previous button", async () => {
    render(
      <MemoryRouter>
        <CreateCampaign />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/حساب إعلاني رئيسي/)).toBeTruthy();
    });

    const nameInput = screen.getByLabelText(/اسم الحملة/);
    fireEvent.change(nameInput, { target: { value: "حملة الرجوع للخلف" } });

    const nextBtn = screen.getByRole("button", { name: /التالي/ });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "الميزانية والجدولة" })).toBeTruthy();
    });

    const prevBtn = screen.getByRole("button", { name: /السابق/ });
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "معلومات الحملة" })).toBeTruthy();
    });
  });

  it("advances through steps to Step 6 (Review & Confirm)", async () => {
    render(
      <MemoryRouter>
        <CreateCampaign />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/حساب إعلاني رئيسي/)).toBeTruthy();
    });

    // Step 1 -> 2
    fireEvent.change(screen.getByLabelText(/اسم الحملة/), {
      target: { value: "حملة المراجعة الشاملة" },
    });
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));

    // Step 2 -> 3
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "الميزانية والجدولة" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));

    // Step 3 -> 4
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "الاستهداف" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));

    // Step 4 -> 5
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "المواضع" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));

    // Step 5 -> 6
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "إعدادات متقدمة" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));

    // Step 6: Review & Launch
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "مراجعة وإطلاق" })).toBeTruthy();
      expect(screen.getByRole("button", { name: /إنشاء الحملة/ })).toBeTruthy();
      expect(screen.getByText("حملة المراجعة الشاملة")).toBeTruthy();
    });
  });
});
