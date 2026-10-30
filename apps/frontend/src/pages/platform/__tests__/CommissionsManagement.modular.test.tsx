// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  CommissionsHeader,
  CommissionsStatsCards,
  CommissionsFiltersBar,
  PayoutRequestsTable,
  CommissionsListTable,
  getPayoutStatusColor,
  getPayoutStatusText,
  getCommissionTypeColor,
  getCommissionTypeText,
  getCommissionStatusColor,
  getCommissionStatusText,
  Commission,
  AffiliatePayout,
  CommissionStats,
} from "../commissions-management";
import { CommissionsManagement } from "../CommissionsManagement";

afterEach(() => {
  cleanup();
});

vi.mock("../commissions-management/useCommissionsManagement", () => ({
  useCommissionsManagement: () => ({
    formatPrice: (amount: number) => `${amount} ج.م`,
    isDark: false,
    commissions: [],
    payouts: [],
    stats: null,
    loading: false,
    processingPayoutId: null,
    proofInputRef: { current: null },
    filters: { status: "", type: "" },
    setFilters: vi.fn(),
    pendingPayouts: [],
    pendingPayoutAmount: 0,
    updateCommissionStatus: vi.fn(),
    recordExternalPayout: vi.fn(),
    cancelPayoutRequest: vi.fn(),
    openProofUploadDialog: vi.fn(),
    uploadPayoutProof: vi.fn(),
  }),
}));

const mockStats: CommissionStats = {
  totalAmount: 50000,
  byType: {
    AFFILIATE: 30000,
    MERCHANT: 15000,
    PLATFORM: 5000,
  },
};

const mockPayout: AffiliatePayout = {
  id: "payout-101",
  amount: 2500,
  status: "PENDING",
  paymentMethod: "محفظة فودافون كاش",
  createdAt: "2026-02-15T12:00:00Z",
  affiliate: {
    affiliateCode: "AFF-TOP",
    user: {
      firstName: "سارة",
      lastName: "أحمد",
      email: "sara@affiliate.com",
      phone: "01000000001",
    },
  },
  commissions: [
    {
      id: "comm-1",
      amount: 2500,
      status: "CONFIRMED",
      order: { orderNumber: "ORD-111" },
    },
  ],
};

const mockCommission: Commission = {
  id: "comm-202",
  orderId: "ord-202",
  type: "AFFILIATE",
  amount: 450,
  status: "CONFIRMED",
  createdAt: "2026-02-16T10:00:00Z",
  order: {
    orderNumber: "ORD-999",
    total: 3000,
  },
  affiliate: {
    affiliateCode: "AFF-VIP",
    user: {
      firstName: "كريم",
      lastName: "علي",
    },
  },
};

describe("CommissionsManagement Modular Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Helper Functions", () => {
    it("returns correct status texts and colors", () => {
      expect(getPayoutStatusText("PROCESSED")).toBe("تم التحويل");
      expect(getPayoutStatusText("CANCELLED")).toBe("ملغي");
      expect(getPayoutStatusText("FAILED")).toBe("فشل");
      expect(getPayoutStatusText("PENDING")).toBe("قيد الانتظار");

      expect(getPayoutStatusColor("PROCESSED", false)).toContain("green");
      expect(getPayoutStatusColor("CANCELLED", false)).toContain("red");
      expect(getPayoutStatusColor("PENDING", false)).toContain("yellow");

      expect(getCommissionTypeText("AFFILIATE")).toBe("مسوق");
      expect(getCommissionTypeText("MERCHANT")).toBe("تاجر");
      expect(getCommissionTypeText("PLATFORM")).toBe("منصة");

      expect(getCommissionTypeColor("AFFILIATE", false)).toContain("green");
      expect(getCommissionTypeColor("MERCHANT", false)).toContain("purple");
      expect(getCommissionTypeColor("PLATFORM", false)).toContain("orange");

      expect(getCommissionStatusText("PAID")).toBe("مدفوع");
      expect(getCommissionStatusText("CONFIRMED")).toBe("مؤكد");
      expect(getCommissionStatusText("CANCELLED")).toBe("ملغي");
      expect(getCommissionStatusText("PENDING")).toBe("معلق");

      expect(getCommissionStatusColor("PAID", false)).toContain("green");
      expect(getCommissionStatusColor("CONFIRMED", false)).toContain("blue");
      expect(getCommissionStatusColor("CANCELLED", false)).toContain("red");
      expect(getCommissionStatusColor("PENDING", false)).toContain("yellow");
    });
  });

  describe("CommissionsHeader", () => {
    it("renders page title and subtitle", () => {
      render(<CommissionsHeader isDark={false} />);
      expect(screen.getByText("إدارة العمولات")).toBeTruthy();
      expect(
        screen.getByText("عرض وإدارة العمولات وطلبات سحب المسوقين")
      ).toBeTruthy();
    });
  });

  describe("CommissionsStatsCards", () => {
    it("renders stats cards when stats are provided", () => {
      render(
        <CommissionsStatsCards
          stats={mockStats}
          pendingPayoutsCount={3}
          pendingPayoutAmount={7500}
          formatPrice={(val) => `${val} ج.م`}
          isDark={false}
        />
      );

      expect(screen.getByText("إجمالي العمولات")).toBeTruthy();
      expect(screen.getByText("50000 ج.م")).toBeTruthy();
      expect(screen.getByText("عمولات المسوقين")).toBeTruthy();
      expect(screen.getByText("30000 ج.م")).toBeTruthy();
      expect(screen.getByText("عمولات التجار")).toBeTruthy();
      expect(screen.getByText("15000 ج.م")).toBeTruthy();
      expect(screen.getByText("عمولات المنصة")).toBeTruthy();
      expect(screen.getByText("5000 ج.م")).toBeTruthy();
      expect(screen.getByText("طلبات السحب المعلقة")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();
      expect(screen.getByText("قيمة السحب المعلق")).toBeTruthy();
      expect(screen.getByText("7500 ج.م")).toBeTruthy();
    });

    it("renders nothing when stats is null", () => {
      const { container } = render(
        <CommissionsStatsCards
          stats={null}
          pendingPayoutsCount={0}
          pendingPayoutAmount={0}
          formatPrice={(val) => `${val}`}
          isDark={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("CommissionsFiltersBar", () => {
    it("renders filter selects and triggers updates", () => {
      const setFilters = vi.fn();
      render(
        <CommissionsFiltersBar
          filters={{ status: "PENDING", type: "AFFILIATE" }}
          setFilters={setFilters}
          isDark={false}
        />
      );

      const statusSelect = screen.getByLabelText("تصفية حسب الحالة");
      fireEvent.change(statusSelect, { target: { value: "CONFIRMED" } });
      expect(setFilters).toHaveBeenCalled();

      const typeSelect = screen.getByLabelText("تصفية حسب النوع");
      fireEvent.change(typeSelect, { target: { value: "MERCHANT" } });
      expect(setFilters).toHaveBeenCalled();
    });
  });

  describe("PayoutRequestsTable", () => {
    it("renders payout requests table with actions", () => {
      const onRecord = vi.fn();
      const onCancel = vi.fn();
      const onOpenProof = vi.fn();

      render(
        <PayoutRequestsTable
          payouts={[mockPayout]}
          processingPayoutId={null}
          formatPrice={(val) => `${val} ج.م`}
          isDark={false}
          onRecordExternalPayout={onRecord}
          onCancelPayoutRequest={onCancel}
          onOpenProofUploadDialog={onOpenProof}
        />
      );

      expect(screen.getByText("سارة أحمد")).toBeTruthy();
      expect(screen.getByText("AFF-TOP")).toBeTruthy();
      expect(screen.getByText("2500 ج.م")).toBeTruthy();
      expect(screen.getByText("محفظة فودافون كاش")).toBeTruthy();
      expect(screen.getByText("قيد الانتظار")).toBeTruthy();

      fireEvent.click(screen.getByText("تسجيل التحويل"));
      expect(onRecord).toHaveBeenCalledWith("payout-101");

      fireEvent.click(screen.getByText("رفض الطلب"));
      expect(onCancel).toHaveBeenCalledWith("payout-101");
    });

    it("renders empty state when payouts list is empty", () => {
      render(
        <PayoutRequestsTable
          payouts={[]}
          processingPayoutId={null}
          formatPrice={(val) => `${val}`}
          isDark={false}
          onRecordExternalPayout={vi.fn()}
          onCancelPayoutRequest={vi.fn()}
          onOpenProofUploadDialog={vi.fn()}
        />
      );

      expect(screen.getByText("لا توجد طلبات سحب حالياً")).toBeTruthy();
    });
  });

  describe("CommissionsListTable", () => {
    it("renders commissions list table with confirm action", () => {
      const onUpdateStatus = vi.fn();

      render(
        <CommissionsListTable
          commissions={[mockCommission]}
          formatPrice={(val) => `${val} ج.م`}
          isDark={false}
          onUpdateCommissionStatus={onUpdateStatus}
        />
      );

      expect(screen.getByText("ORD-999")).toBeTruthy();
      expect(screen.getByText("مسوق")).toBeTruthy();
      expect(screen.getByText(/كريم علي/)).toBeTruthy();
      expect(screen.getByText("450 ج.م")).toBeTruthy();
      expect(screen.getByText("مؤكد")).toBeTruthy();

      fireEvent.click(screen.getByText("تأكيد الدفع"));
      expect(onUpdateStatus).toHaveBeenCalledWith("comm-202", "PAID");
    });

    it("renders empty state when commissions list is empty", () => {
      render(
        <CommissionsListTable
          commissions={[]}
          formatPrice={(val) => `${val}`}
          isDark={false}
          onUpdateCommissionStatus={vi.fn()}
        />
      );

      expect(screen.getByText("لا توجد عمولات")).toBeTruthy();
    });
  });

  describe("CommissionsManagement Coordinator", () => {
    it("renders without crashing", () => {
      render(<CommissionsManagement />);
      expect(screen.getByText("إدارة العمولات")).toBeTruthy();
      expect(screen.getByText("لا توجد طلبات سحب حالياً")).toBeTruthy();
      expect(screen.getByText("لا توجد عمولات")).toBeTruthy();
    });
  });
});
