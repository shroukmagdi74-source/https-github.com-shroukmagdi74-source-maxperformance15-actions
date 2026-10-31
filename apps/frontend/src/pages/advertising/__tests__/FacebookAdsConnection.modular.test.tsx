/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import FacebookAdsConnection from "../FacebookAdsConnection";
import { facebookAdsService } from "../../../services/facebookAdsService";

vi.mock("../../../services/facebookAdsService", () => ({
  facebookAdsService: {
    getAdsConnectionStatus: vi.fn(),
    getAdsAuthorizationUrl: vi.fn(),
    disconnectAdsConnectionSource: vi.fn(),
    saveAdAccount: vi.fn(),
  },
}));

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", companyId: "comp-123", email: "merchant@maxp.online" },
    token: "fake-jwt",
  }),
}));

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { language: "ar" },
      t: (k: string) => k,
    }),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockStatus = {
  connected: true,
  connectedFacebookAccountsCount: 1,
  isolatedAdAccountsCount: 1,
  savedAdAccounts: [
    {
      id: "saved-1",
      accountId: "act_101",
      name: "حساب ملابس سوان الرئيسي",
      currency: "EGP",
      timezone: "Africa/Cairo",
      isActive: false,
      hasIsolatedToken: true,
      tokenSource: "facebook_account",
      connectionSourceId: "src-1",
      connectionSource: {
        id: "src-1",
        facebookUserId: "fb-123",
        facebookUserName: "أحمد الميديا باير",
        facebookUserEmail: "ahmed@example.com",
      },
      metaHealth: {
        accountStatus: "1",
        disableReason: null,
      },
    },
  ],
  connectionSources: [
    {
      id: "src-1",
      facebookUserId: "fb-123",
      facebookUserName: "أحمد الميديا باير",
      facebookUserEmail: "ahmed@example.com",
      status: "connected",
      hasToken: true,
      syncedAdAccountsCount: 1,
      lastSyncedAt: "2026-10-31T09:00:00.000Z",
      lastError: null,
      isActive: true,
    },
  ],
  remote: {
    checked: true,
    ok: true,
    accountsCount: 1,
    error: null,
  },
  remoteSources: [
    {
      sourceId: "src-1",
      checked: true,
      ok: true,
      accountsCount: 1,
      error: null,
    },
  ],
  pageConnection: {
    connectedPagesCount: 2,
    pages: [],
  },
};

describe("FacebookAdsConnection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders status, sources, and ad accounts successfully", async () => {
    vi.mocked(facebookAdsService.getAdsConnectionStatus).mockResolvedValue(mockStatus as any);

    render(
      <MemoryRouter>
        <FacebookAdsConnection />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("ربط إعلانات Meta").length).toBeGreaterThan(0);
      expect(screen.getAllByText("أحمد الميديا باير").length).toBeGreaterThan(0);
      expect(screen.getByText("حساب ملابس سوان الرئيسي")).toBeInTheDocument();
      expect(screen.getByText("act_101")).toBeInTheDocument();
      expect(screen.getByText("نشط في Meta")).toBeInTheDocument();
    });
  });

  it("triggers saveAdAccount when clicking 'تعيين كنشط'", async () => {
    vi.mocked(facebookAdsService.getAdsConnectionStatus).mockResolvedValue(mockStatus as any);
    vi.mocked(facebookAdsService.saveAdAccount).mockResolvedValue({ success: true } as any);

    render(
      <MemoryRouter>
        <FacebookAdsConnection />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("تعيين كنشط")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("تعيين كنشط"));

    await waitFor(() => {
      expect(facebookAdsService.saveAdAccount).toHaveBeenCalledWith({
        accountId: "act_101",
        name: "حساب ملابس سوان الرئيسي",
        currency: "EGP",
        timezone: "Africa/Cairo",
      });
    });
  });

  it("handles 2-step inline disconnect confirmation without window.confirm", async () => {
    vi.mocked(facebookAdsService.getAdsConnectionStatus).mockResolvedValue(mockStatus as any);
    vi.mocked(facebookAdsService.disconnectAdsConnectionSource).mockResolvedValue({
      success: true,
    } as any);

    render(
      <MemoryRouter>
        <FacebookAdsConnection />
      </MemoryRouter>,
    );

    const disconnectBtn = await screen.findByRole("button", { name: /فصل/i });
    expect(disconnectBtn).toBeInTheDocument();
    expect(disconnectBtn).not.toBeDisabled();

    // Step 1: Click "فصل"
    fireEvent.click(disconnectBtn);

    // Step 2: Cancel button (X with title 'إلغاء') appears in confirmation state
    const cancelBtn = await screen.findByTitle("إلغاء");
    expect(cancelBtn).toBeInTheDocument();

    // Click confirm button (the active disconnect button in confirmation mode)
    const confirmBtn = screen.getByRole("button", { name: /فصل/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(facebookAdsService.disconnectAdsConnectionSource).toHaveBeenCalledWith("src-1");
    });
  });
});
