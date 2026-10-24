/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrderInvoiceSettings from "../OrderInvoiceSettings";
import { apiClient } from "../../../services/apiClient";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockT = (key: string, fallback?: any) => {
  if (typeof fallback === "string") return fallback;
  return key;
};

vi.mock("react-i18next", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: mockT,
    }),
  };
});

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u-1", companyId: "c-123" },
  }),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

const mockInvoiceData = {
  autoGenerate: false,
  autoGenerateOnStatus: "",
  invoicePrefix: "INV",
  invoiceNumberFormat: "INV-YYYYMMDD-XXXXXX",
  defaultTaxRate: 14,
  defaultTerms: "Payment terms 14 days",
  defaultNotes: "Thank you for your business",
  defaultDueDays: 7,
  showCompanyLogo: true,
  showTaxBreakdown: true,
  showPaymentMethod: true,
  showOrderItems: true,
  autoEmailToCustomer: false,
  emailSubject: "",
  emailBody: "",
  pdfPageSize: "A4",
  pdfOrientation: "portrait",
  primaryColor: "#4F46E5",
  secondaryColor: "#6B7280",
  fontFamily: "Arial",
  showBarcodeOrderCode: true,
  showBarcodeShippingCode: true,
  showCustomFields: false,
};

const mockCompanyData = {
  id: "c-123",
  name: "Test Company",
  settings: {
    orderPreparation: {
      slipDocument: {
        documentTitle: "مستند تجهيز الطلب",
        documentSubtitle: "مستند داخلي لفرق التجهيز والمخزن",
        accentColor: "#2563eb",
        pageSize: "A4",
        pageOrientation: "portrait",
        showCompanyName: true,
        showCustomerEmail: false,
        showOrderNotes: true,
        showPaymentSummary: true,
        showFinancialSummary: true,
        showItemSku: true,
        showItemDetails: true,
        showItemColor: true,
        showItemSize: true,
        showItemPrice: true,
        showItemTotal: true,
        preparationInstructions: "يرجى التحقق من المقاس واللون",
        footerNote: "شكراً لجهودكم",
      },
    },
  },
};

describe("OrderInvoiceSettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === "/order-invoice-settings") {
        return Promise.resolve({ data: { success: true, data: mockInvoiceData } });
      }
      if (url === "/companies/current") {
        return Promise.resolve({ data: { success: true, data: mockCompanyData } });
      }
      return Promise.resolve({ data: { success: true, data: null } });
    });
    (apiClient.put as any).mockResolvedValue({ data: { success: true } });
    (apiClient.post as any).mockResolvedValue({
      data: { success: true, data: mockInvoiceData },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders hero section and action bar after loading", async () => {
    render(<OrderInvoiceSettings />);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_4")).toBeTruthy();
    });

    expect(screen.getByText("سجل الفواتير")).toBeTruthy();
    expect(screen.getByText("طباعة متعددة")).toBeTruthy();
    expect(screen.getByText("تجهيز الطلبات التشغيلي")).toBeTruthy();
  });

  it("renders 3 main tabs: invoice, print, slip", async () => {
    render(<OrderInvoiceSettings />);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_89")).toBeTruthy();
    });

    expect(screen.getByText("orderInvoiceSettings.k_98")).toBeTruthy();
    expect(screen.getByText("orderInvoiceSettings.k_49")).toBeTruthy();
  });

  it("switches to print tab and renders layout controls", async () => {
    render(<OrderInvoiceSettings />);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_98")).toBeTruthy();
    });

    const printTabTrigger = screen.getByText("orderInvoiceSettings.k_98");
    fireEvent.click(printTabTrigger);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_22")).toBeTruthy();
    });
  });

  it("switches to slip tab and renders slip controls", async () => {
    render(<OrderInvoiceSettings />);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_49")).toBeTruthy();
    });

    const slipTabTrigger = screen.getByText("orderInvoiceSettings.k_49");
    fireEvent.click(slipTabTrigger);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_41")).toBeTruthy();
    });
  });

  it("calls saveAll when clicking save button", async () => {
    render(<OrderInvoiceSettings />);

    await waitFor(() => {
      expect(screen.getByText("orderInvoiceSettings.k_96")).toBeTruthy();
    });

    const saveBtn = screen.getByText("orderInvoiceSettings.k_96");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/order-invoice-settings",
        expect.any(Object)
      );
      expect(apiClient.put).toHaveBeenCalledWith(
        "/companies/c-123",
        expect.any(Object)
      );
    });
  });
});
