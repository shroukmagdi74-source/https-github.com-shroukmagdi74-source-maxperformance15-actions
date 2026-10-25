// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import AssetList from "../hr/assets/AssetList";
import { companyAwareApi } from "../../services/companyAwareApi";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../hooks/useCurrency", () => ({
  useCurrency: () => ({
    formatPrice: (val: number | string) => `${val} ج.م`,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => "toast-id"),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    loading: vi.fn(() => "toast-id"),
  },
}));

vi.mock("../hr/assets/AssetForm", () => ({
  default: () => <div data-testid="asset-form-modal">Asset Form Modal</div>,
}));

vi.mock("../hr/assets/AssetAssignmentModal", () => ({
  default: () => <div data-testid="asset-assign-modal">Asset Assignment Modal</div>,
}));

const mockAssets = [
  {
    id: "asset-1",
    name: "MacBook Pro 16",
    code: "AST-101",
    model: "M3 Max",
    status: "AVAILABLE",
    purchaseValue: 85000,
    category: { id: "cat-1", name: "أجهزة لابتوب" },
    currentHolder: null,
  },
  {
    id: "asset-2",
    name: "Dell UltraSharp 27",
    code: "AST-102",
    model: "U2723QE",
    status: "IN_USE",
    purchaseValue: 22000,
    category: { id: "cat-2", name: "شاشات" },
    currentHolder: {
      firstName: "سارة",
      lastName: "محمود",
      employeeNumber: "EMP-305",
    },
  },
];

describe("AssetList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/assets/categories")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: "cat-1", name: "أجهزة لابتوب" },
              { id: "cat-2", name: "شاشات" },
            ],
          },
        });
      }
      return Promise.resolve({
        data: {
          success: true,
          data: mockAssets,
          pagination: { totalPages: 1 },
        },
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders asset list rows, status badges, holder info, and formatted prices", async () => {
    render(<AssetList refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro 16")).toBeTruthy();
    });

    expect(screen.getByText("AST-101")).toBeTruthy();
    expect(screen.getByText("Dell UltraSharp 27")).toBeTruthy();
    expect(screen.getByText("سارة محمود")).toBeTruthy();
    expect(screen.getByText("EMP-305")).toBeTruthy();
    expect(screen.getByText("85000 ج.م")).toBeTruthy();
  });

  it("shows floating bulk actions bar when selecting an asset row", async () => {
    render(<AssetList refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText("MacBook Pro 16")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("MacBook Pro 16"));

    await waitFor(() => {
      expect(screen.getByText(/عنصر محدد/)).toBeTruthy();
    });
  });
});
