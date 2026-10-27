// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  getApiErrorMessage,
  getDocumentStatusLabel,
  getDocumentStatusStyle,
  getDocumentSourceLabel,
  getStatusStyle,
  getStatusLabel,
} from "../affiliates-management/helpers";
import { AffiliatesHeader } from "../affiliates-management/AffiliatesHeader";
import { AffiliatesStatsGrid } from "../affiliates-management/AffiliatesStatsGrid";
import { AffiliatesFiltersRow } from "../affiliates-management/AffiliatesFiltersRow";
import { AffiliateTableRow } from "../affiliates-management/AffiliateTableRow";
import { AffiliatesTable } from "../affiliates-management/AffiliatesTable";
import { AffiliatePolicyModal } from "../affiliates-management/AffiliatePolicyModal";
import { AffiliateReviewHistoryModal } from "../affiliates-management/AffiliateReviewHistoryModal";
import { AffiliatesManagement } from "../AffiliatesManagement";
import { Affiliate } from "../affiliates-management/types";

// Mock apiClient
const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
    post: vi.fn(),
  },
}));

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    actualTheme: "light",
  }),
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

const mockAffiliates: Affiliate[] = [
  {
    id: "aff-1",
    userId: "usr-1",
    user: {
      firstName: "أحمد",
      lastName: "منصور",
      email: "ahmed@example.com",
      phone: "01099887766",
    },
    status: "ACTIVE",
    isActive: true,
    commissionType: "PERCENTAGE",
    commissionRate: 15,
    totalEarnings: 4500,
    paidEarnings: 3000,
    pendingEarnings: 1500,
    totalSales: 42,
    totalClicks: 210,
    minPayout: 150,
    canCreateOrdersForOthers: true,
    canViewCustomerData: false,
    identityDocumentUrl: "https://example.com/id.pdf",
    identityDocumentStatus: "APPROVED",
    identityDocumentUploadedAt: "2026-02-01T10:00:00.000Z",
    statusReason: "مسوق معتمد وموثوق",
    createdAt: "2026-01-10T12:00:00.000Z",
  },
  {
    id: "aff-2",
    userId: "usr-2",
    user: {
      firstName: "سارة",
      lastName: "خالد",
      email: "sara@example.com",
      phone: "01122334455",
    },
    status: "PENDING",
    isActive: false,
    commissionType: "MARKUP",
    commissionRate: 50,
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
    totalSales: 0,
    totalClicks: 15,
    minPayout: 100,
    canCreateOrdersForOthers: false,
    canViewCustomerData: true,
    identityDocumentStatus: "NOT_SUBMITTED",
    createdAt: "2026-02-15T09:00:00.000Z",
  },
];

describe("AffiliatesManagement Modular Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Helpers", () => {
    it("getApiErrorMessage handles Axios errors and fallback", () => {
      const fallback = "حدث خطأ";
      expect(getApiErrorMessage(null, fallback)).toBe(fallback);
      expect(
        getApiErrorMessage(
          { response: { data: { message: "غير مصرح" } } },
          fallback,
        ),
      ).toBe("غير مصرح");
    });

    it("getDocumentStatusLabel returns Arabic labels for statuses", () => {
      expect(getDocumentStatusLabel("APPROVED")).toBe("المستند معتمد");
      expect(getDocumentStatusLabel("REJECTED")).toBe("المستند مرفوض");
      expect(getDocumentStatusLabel("PENDING_REVIEW")).toBe("المستند قيد المراجعة");
      expect(getDocumentStatusLabel(null)).toBe("لا يوجد مستند");
    });

    it("getDocumentStatusStyle returns class strings", () => {
      expect(getDocumentStatusStyle("APPROVED")).toContain("emerald");
      expect(getDocumentStatusStyle("REJECTED")).toContain("red");
    });

    it("getDocumentSourceLabel returns correct label", () => {
      expect(getDocumentSourceLabel("RESUBMISSION")).toBe("إعادة رفع");
      expect(getDocumentSourceLabel("REGISTRATION")).toBe("التسجيل الأول");
    });

    it("getStatusStyle and getStatusLabel return expected strings", () => {
      expect(getStatusStyle("ACTIVE")).toContain("green");
      expect(getStatusStyle("PENDING")).toContain("orange");
      expect(getStatusStyle("SUSPENDED")).toContain("red");

      expect(getStatusLabel("ACTIVE")).toBe("نشط");
      expect(getStatusLabel("PENDING")).toBe("قيد المراجعة");
      expect(getStatusLabel("SUSPENDED")).toBe("موقوف");
    });
  });

  describe("AffiliatesHeader", () => {
    it("renders title and subtitle", () => {
      render(<AffiliatesHeader isDark={false} />);
      expect(screen.getByText("إدارة شبكة المسوقين (Premium)")).toBeInTheDocument();
      expect(
        screen.getByText("تحكم كامل في المسوقين والعمولات والبيانات المالية."),
      ).toBeInTheDocument();
    });
  });

  describe("AffiliatesStatsGrid", () => {
    it("renders all 4 stat cards with tabular-nums", () => {
      render(
        <AffiliatesStatsGrid
          isDark={false}
          stats={{
            totalCount: 25,
            pendingCount: 4,
            totalSales: 130,
            totalEarnings: "12500.50",
          }}
        />,
      );

      expect(screen.getByText("الجمهور المستهدف")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("ينتظرون التفعيل")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("إجمالي المبيعات")).toBeInTheDocument();
      expect(screen.getByText("130")).toBeInTheDocument();
      expect(screen.getByText("إجمالي العمولات")).toBeInTheDocument();
      expect(screen.getByText("12500.50")).toBeInTheDocument();
    });
  });

  describe("AffiliatesFiltersRow", () => {
    it("renders search input and filter buttons", () => {
      const setSearchTerm = vi.fn();
      const setFilterStatus = vi.fn();

      render(
        <AffiliatesFiltersRow
          isDark={false}
          searchTerm="أحمد"
          setSearchTerm={setSearchTerm}
          filterStatus="ACTIVE"
          setFilterStatus={setFilterStatus}
        />,
      );

      const searchInput = screen.getByPlaceholderText(
        "بحث بالاسم، البريد، أو الهاتف...",
      );
      expect(searchInput).toHaveValue("أحمد");

      fireEvent.change(searchInput, { target: { value: "سارة" } });
      expect(setSearchTerm).toHaveBeenCalledWith("سارة");

      const pendingBtn = screen.getByText("قيد المراجعة");
      fireEvent.click(pendingBtn);
      expect(setFilterStatus).toHaveBeenCalledWith("PENDING");
    });
  });

  describe("AffiliateTableRow", () => {
    it("renders affiliate details and handles commission editing", () => {
      const setEditingCommission = vi.fn();
      const setNewCommission = vi.fn();
      const updateCommission = vi.fn();
      const handleStatusUpdate = vi.fn();
      const openPolicyEditor = vi.fn();
      const openReviewHistory = vi.fn();
      const handleDocumentReviewUpdate = vi.fn();

      render(
        <MemoryRouter>
          <table>
            <tbody>
              <AffiliateTableRow
                affiliate={mockAffiliates[0]}
                isDark={false}
                editingCommission={null}
                newCommission={15}
                updatingDocumentAffiliateId={null}
                setEditingCommission={setEditingCommission}
                setNewCommission={setNewCommission}
                updateCommission={updateCommission}
                handleStatusUpdate={handleStatusUpdate}
                openPolicyEditor={openPolicyEditor}
                openReviewHistory={openReviewHistory}
                handleDocumentReviewUpdate={handleDocumentReviewUpdate}
              />
            </tbody>
          </table>
        </MemoryRouter>,
      );

      expect(screen.getByText("أحمد منصور")).toBeInTheDocument();
      expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
      expect(screen.getByText("01099887766")).toBeInTheDocument();
      expect(screen.getByText("15%")).toBeInTheDocument();
      expect(screen.getByText("مستند الاعتماد")).toBeInTheDocument();
      expect(screen.getByText("المستند معتمد")).toBeInTheDocument();
      expect(screen.getByText("اعتماد المستند")).toBeInTheDocument();
      expect(screen.getByText("رفض المستند")).toBeInTheDocument();
      expect(screen.getByText("الضوابط")).toBeInTheDocument();
      expect(screen.getByText("سجل المراجعة")).toBeInTheDocument();

      fireEvent.click(screen.getByText("الضوابط"));
      expect(openPolicyEditor).toHaveBeenCalledWith(mockAffiliates[0]);

      fireEvent.click(screen.getByText("سجل المراجعة"));
      expect(openReviewHistory).toHaveBeenCalledWith(mockAffiliates[0]);

      fireEvent.click(screen.getByText("اعتماد المستند"));
      expect(handleDocumentReviewUpdate).toHaveBeenCalledWith(
        mockAffiliates[0],
        "APPROVED",
      );
    });
  });

  describe("AffiliatesTable", () => {
    it("renders rows and table headers", () => {
      render(
        <MemoryRouter>
          <AffiliatesTable
            isDark={false}
            filteredAffiliates={mockAffiliates}
            editingCommission={null}
            newCommission={0}
            updatingDocumentAffiliateId={null}
            setEditingCommission={vi.fn()}
            setNewCommission={vi.fn()}
            updateCommission={vi.fn()}
            handleStatusUpdate={vi.fn()}
            openPolicyEditor={vi.fn()}
            openReviewHistory={vi.fn()}
            handleDocumentReviewUpdate={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(screen.getByText("المسوق")).toBeInTheDocument();
      expect(screen.getAllByText("البيانات المالية").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("الأداء").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("أحمد منصور")).toBeInTheDocument();
      expect(screen.getByText("سارة خالد")).toBeInTheDocument();
    });

    it("renders empty state message when list is empty", () => {
      render(
        <MemoryRouter>
          <AffiliatesTable
            isDark={false}
            filteredAffiliates={[]}
            editingCommission={null}
            newCommission={0}
            updatingDocumentAffiliateId={null}
            setEditingCommission={vi.fn()}
            setNewCommission={vi.fn()}
            updateCommission={vi.fn()}
            handleStatusUpdate={vi.fn()}
            openPolicyEditor={vi.fn()}
            openReviewHistory={vi.fn()}
            handleDocumentReviewUpdate={vi.fn()}
          />
        </MemoryRouter>,
      );

      expect(
        screen.getByText("لم يتم العثور على أي مسوقين يطابقون خيارات البحث."),
      ).toBeInTheDocument();
    });
  });

  describe("AffiliatePolicyModal", () => {
    it("renders policy inputs and triggers onSave and onClose", () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      const setPolicyForm = vi.fn();

      render(
        <AffiliatePolicyModal
          isDark={false}
          affiliate={mockAffiliates[0]}
          policyForm={{
            minPayout: 200,
            canCreateOrdersForOthers: true,
            canViewCustomerData: false,
          }}
          setPolicyForm={setPolicyForm}
          savingPolicy={false}
          onClose={onClose}
          onSave={onSave}
        />,
      );

      expect(screen.getByText("ضوابط المسوق")).toBeInTheDocument();
      expect(screen.getByText("أحمد منصور")).toBeInTheDocument();
      expect(screen.getByDisplayValue("200")).toBeInTheDocument();

      fireEvent.click(screen.getByText("إلغاء"));
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("حفظ التغييرات"));
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("returns null when affiliate is null", () => {
      const { container } = render(
        <AffiliatePolicyModal
          isDark={false}
          affiliate={null}
          policyForm={{
            minPayout: 100,
            canCreateOrdersForOthers: true,
            canViewCustomerData: true,
          }}
          setPolicyForm={vi.fn()}
          savingPolicy={false}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("AffiliateReviewHistoryModal", () => {
    it("renders review logs and document version comparison", () => {
      const onClose = vi.fn();
      render(
        <AffiliateReviewHistoryModal
          isDark={false}
          affiliate={mockAffiliates[0]}
          loadingReviewHistory={false}
          reviewHistory={[
            {
              id: "rev-1",
              title: "تفعيل حساب المسوق",
              eventType: "STATUS_UPDATE",
              previousStatus: "PENDING",
              nextStatus: "ACTIVE",
              createdAt: "2026-02-05T11:00:00Z",
              note: "تم التحقق من بطاقة الهوية",
              actor: { id: "admin-1", name: "مدير النظام" },
            },
          ]}
          documentHistory={[
            {
              id: "doc-1",
              fileUrl: "https://example.com/doc-v1.pdf",
              uploadedAt: "2026-02-01T10:00:00Z",
              source: "REGISTRATION",
              isCurrent: true,
            },
          ]}
          onClose={onClose}
        />,
      );

      expect(screen.getByText("سجل مراجعات المسوق")).toBeInTheDocument();
      expect(screen.getByText("مقارنة المستندات")).toBeInTheDocument();
      expect(screen.getByText("تفعيل حساب المسوق")).toBeInTheDocument();
      expect(screen.getByText("تم التحقق من بطاقة الهوية")).toBeInTheDocument();
      expect(screen.getByText("مدير النظام")).toBeInTheDocument();

      fireEvent.click(screen.getByText("إغلاق"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("AffiliatesManagement Coordinator", () => {
    it("renders spinner when loading", () => {
      mockGet.mockReturnValue(new Promise(() => {}));
      render(
        <MemoryRouter>
          <AffiliatesManagement />
        </MemoryRouter>,
      );

      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });
});
