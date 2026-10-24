/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WalletManagement from "../WalletManagement";

const mockWallets = [
  {
    id: "w-1",
    name: "فودافون كاش - المبيعات",
    number: "01012345678",
    icon: "",
    color: "#e11d48",
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-01-15T12:00:00Z",
  },
  {
    id: "w-2",
    name: "انستاباي - الحساب الرئيسي",
    number: "01187654321",
    icon: "",
    color: "#2563eb",
    isActive: false,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
];

const mockReceipts = [
  {
    id: "rc-1",
    submittedAt: "2026-10-20T14:30:00Z",
    receiptImage: "uploads/receipts/test.png",
    invoice: {
      invoiceNumber: "INV-9988",
      totalAmount: 1500,
      company: {
        name: "شركة النور للملابس",
        email: "info@alnoor.com",
      },
    },
    walletNumber: {
      name: "فودافون كاش - المبيعات",
      number: "01012345678",
    },
  },
];

const mockCompanies = [
  {
    companyId: "c-1",
    companyName: "شركة العالمية للتجارة",
    companyEmail: "alamia@test.com",
    balance: 5000,
    currency: "EGP",
    totalDeposited: 12000,
    totalSpent: 7000,
  },
];

vi.mock("@/services/apiClient", () => ({
  apiClient: {
    get: vi.fn((url: string) => {
      if (url.includes("/wallet-payment/admin/wallet-numbers")) {
        return Promise.resolve({ data: { success: true, data: mockWallets } });
      }
      if (url.includes("/wallet-payment/admin/pending-receipts")) {
        return Promise.resolve({ data: { success: true, data: mockReceipts } });
      }
      if (url.includes("/admin/wallet/companies")) {
        return Promise.resolve({ data: { success: true, data: mockCompanies } });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

vi.mock("sonner", () => {
  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };
  return {
    __esModule: true,
    default: toastMock,
    toast: toastMock,
  };
});

vi.mock("@/utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("WalletManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and telemetry ribbon correctly", async () => {
    render(<WalletManagement />);

    expect(screen.getByText("إدارة المحافظ والمدفوعات")).toBeTruthy();
    expect(screen.getByText("تحديث البيانات")).toBeTruthy();
    expect(screen.getAllByText("أرقام المحافظ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("المحافظ المفعلة").length).toBeGreaterThan(0);
    expect(screen.getAllByText("الإيصالات المعلقة").length).toBeGreaterThan(0);
    expect(screen.getAllByText("أرصدة الشركات").length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getAllByText("فودافون كاش - المبيعات").length).toBeGreaterThan(0);
      expect(screen.getAllByText("انستاباي - الحساب الرئيسي").length).toBeGreaterThan(0);
    });
  });

  it("opens add wallet dialog when clicking add wallet button", async () => {
    render(<WalletManagement />);

    await waitFor(() => {
      expect(screen.getAllByText("فودافون كاش - المبيعات").length).toBeGreaterThan(0);
    });

    const addButtons = screen.getAllByText("إضافة محفظة");
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("إضافة محفظة جديدة")).toBeTruthy();
      expect(screen.getByLabelText("اسم المحفظة")).toBeTruthy();
      expect(screen.getByLabelText("رقم المحفظة")).toBeTruthy();
    });
  });

  it("switches to pending receipts tab and displays receipt", async () => {
    render(<WalletManagement />);

    const receiptsTab = screen.getByRole("tab", { name: /الإيصالات المعلقة/ });
    fireEvent.click(receiptsTab);

    await waitFor(() => {
      expect(screen.getAllByText("شركة النور للملابس").length).toBeGreaterThan(0);
      expect(screen.getAllByText("INV-9988").length).toBeGreaterThan(0);
    });
  });

  it("switches to company wallets tab and displays companies", async () => {
    render(<WalletManagement />);

    const companiesTab = screen.getByRole("tab", { name: /محافظ الشركات/ });
    fireEvent.click(companiesTab);

    await waitFor(() => {
      expect(screen.getAllByText("شركة العالمية للتجارة").length).toBeGreaterThan(0);
      expect(screen.getAllByText("alamia@test.com").length).toBeGreaterThan(0);
    });
  });
});
