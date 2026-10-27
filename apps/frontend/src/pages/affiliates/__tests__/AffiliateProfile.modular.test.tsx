// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  AffiliateHeaderCard,
  AffiliateMetricsCards,
  AffiliateOrdersTable,
  AffiliateCommissionsPayouts,
  AffiliateReferralsSection,
  AffiliateSettingsCard,
  AffiliateDocumentsCard,
  AffiliatePaymentDetailsCard,
  AffiliateReviewHistoryCard,
  Affiliate,
  AffiliateStats,
  AffiliateOrder,
  AffiliateCommission,
  AffiliatePayout,
  AffiliateReferral,
  AffiliateDocument,
  AffiliateReviewHistoryItem,
} from "../profile";

describe("AffiliateProfile Modular Subcomponents", () => {
  afterEach(() => {
    cleanup();
  });
  const mockAffiliate: Affiliate = {
    id: "aff-123",
    userId: "user-456",
    companyId: "comp-789",
    affiliateCode: "AFF-CODE-01",
    status: "ACTIVE",
    commissionRate: 15,
    commissionType: "PERCENTAGE",
    minPayout: 250,
    pendingEarnings: 1500,
    identityDocumentStatus: "APPROVED",
    identityDocumentUrl: "https://example.com/id.pdf",
    identityDocumentUploadedAt: "2026-03-01T10:00:00Z",
    canCreateOrdersForOthers: true,
    canViewCustomerData: true,
    paymentMethod: "INSTAPAY",
    paymentDetails: { account: "01012345678", provider: "InstaPay" },
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
    user: {
      name: "أحمد مسوق",
      email: "ahmed@example.com",
      phone: "+201012345678",
    },
  };

  const mockStats: AffiliateStats = {
    ordersCount: 42,
    confirmedCommissionAmount: 3800,
    processedPayoutAmount: 2000,
    deliveredOrders: 35,
    cancelledOrders: 2,
    commissionsCount: 38,
    payoutRequestsCount: 4,
  };

  const mockOrders: AffiliateOrder[] = [
    {
      id: "ord-1",
      orderNumber: "ORD-9901",
      customerName: "سارة محمد",
      status: "DELIVERED",
      total: 1200,
      createdAt: "2026-03-10T12:00:00Z",
    },
  ];

  const mockCommissions: AffiliateCommission[] = [
    {
      id: "comm-1",
      amount: 180,
      status: "APPROVED",
      createdAt: "2026-03-10T12:05:00Z",
      order: { orderNumber: "ORD-9901" },
    },
  ];

  const mockPayouts: AffiliatePayout[] = [
    {
      id: "pay-1",
      amount: 1000,
      status: "PAID",
      paymentMethod: "INSTAPAY",
      proofFileUrl: "https://example.com/transfer-receipt.jpg",
      createdAt: "2026-03-12T14:00:00Z",
    },
  ];

  const mockReferrals: AffiliateReferral[] = [
    {
      id: "ref-1",
      referralCode: "REF-XYZ",
      converted: true,
      source: "facebook",
      customer: {
        firstName: "سارة",
        lastName: "محمد",
        phone: "01099887766",
      },
      order: { orderNumber: "ORD-9901" },
    },
  ];

  const mockDocuments: AffiliateDocument[] = [
    {
      id: "doc-1",
      fileUrl: "https://example.com/id_v1.pdf",
      uploadedAt: "2026-03-01T10:00:00Z",
      isCurrent: true,
    },
  ];

  const mockReviewHistory: AffiliateReviewHistoryItem[] = [
    {
      id: "rev-1",
      title: "اعتماد المستندات وتفعيل الحساب",
      note: "تمت مراجعة بطاقة الرقم القومي بنجاح",
      createdAt: "2026-03-01T11:00:00Z",
    },
  ];

  it("AffiliateHeaderCard renders user info and status actions", () => {
    const updateStatus = vi.fn();
    render(
      <MemoryRouter>
        <AffiliateHeaderCard
          affiliate={mockAffiliate}
          displayName="أحمد مسوق"
          saving={false}
          updateStatus={updateStatus}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("أحمد مسوق")).toBeInTheDocument();
    expect(screen.getByText(/AFF-CODE-01/)).toBeInTheDocument();
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();

    const suspendBtn = screen.getByRole("button", { name: /إيقاف/ });
    fireEvent.click(suspendBtn);
    expect(updateStatus).toHaveBeenCalledWith("SUSPENDED");
  });

  it("AffiliateMetricsCards renders correct metrics and tabular values", () => {
    render(
      <AffiliateMetricsCards
        affiliate={mockAffiliate}
        stats={mockStats}
      />
    );

    expect(screen.getByText("الرصيد القابل للسحب")).toBeInTheDocument();
    expect(screen.getByText("العمولات المؤكدة")).toBeInTheDocument();
    expect(screen.getByText("طلبات المسوق")).toBeInTheDocument();
    expect(screen.getByText("تم تحويله")).toBeInTheDocument();
  });

  it("AffiliateOrdersTable renders orders table rows with links", () => {
    render(
      <MemoryRouter>
        <AffiliateOrdersTable orders={mockOrders} />
      </MemoryRouter>
    );

    expect(screen.getByText("ORD-9901")).toBeInTheDocument();
    expect(screen.getByText("سارة محمد")).toBeInTheDocument();
  });

  it("AffiliateCommissionsPayouts renders commission items and payout requests", () => {
    render(
      <AffiliateCommissionsPayouts
        commissions={mockCommissions}
        payouts={mockPayouts}
      />
    );

    expect(screen.getByText("تاريخ العمولات والسحوبات")).toBeInTheDocument();
    expect(screen.getByText("ORD-9901")).toBeInTheDocument();
    expect(screen.getByText("إثبات التحويل")).toBeInTheDocument();
  });

  it("AffiliateReferralsSection renders referrals and respects customer visibility", () => {
    render(
      <AffiliateReferralsSection
        referrals={mockReferrals}
        canViewCustomerData={true}
      />
    );

    expect(screen.getByText("REF-XYZ")).toBeInTheDocument();
    expect(screen.getByText("تم التحويل")).toBeInTheDocument();
    expect(screen.getByText("سارة محمد")).toBeInTheDocument();
  });

  it("AffiliateSettingsCard enables editing commission and saving policy", () => {
    const saveCommission = vi.fn();
    const savePolicy = vi.fn();
    const setCommissionRate = vi.fn();
    const setPolicyForm = vi.fn();

    render(
      <AffiliateSettingsCard
        commissionRate="15"
        setCommissionRate={setCommissionRate}
        saveCommission={saveCommission}
        commissionType="PERCENTAGE"
        policyForm={{
          minPayout: "250",
          canCreateOrdersForOthers: true,
          canViewCustomerData: true,
        }}
        setPolicyForm={setPolicyForm}
        savePolicy={savePolicy}
        saving={false}
      />
    );

    expect(screen.getByText("إعدادات المسوق")).toBeInTheDocument();
    const savePolicyBtn = screen.getByRole("button", { name: "حفظ الضوابط" });
    fireEvent.click(savePolicyBtn);
    expect(savePolicy).toHaveBeenCalled();
  });

  it("AffiliateDocumentsCard handles document approval and history", () => {
    const reviewDocument = vi.fn();
    render(
      <AffiliateDocumentsCard
        identityDocumentStatus="PENDING"
        identityDocumentUploadedAt="2026-03-01T10:00:00Z"
        identityDocumentUrl="https://example.com/id.pdf"
        documentHistory={mockDocuments}
        reviewDocument={reviewDocument}
        saving={false}
      />
    );

    expect(screen.getByText("المستندات والمراجعة")).toBeInTheDocument();
    expect(screen.getByText("فتح المستند الحالي")).toBeInTheDocument();

    const approveBtn = screen.getByRole("button", { name: "اعتماد المستند" });
    fireEvent.click(approveBtn);
    expect(reviewDocument).toHaveBeenCalledWith("APPROVED");
  });

  it("AffiliateReviewHistoryCard renders review log entries", () => {
    render(<AffiliateReviewHistoryCard reviewHistory={mockReviewHistory} />);

    expect(screen.getByText("سجل القرارات")).toBeInTheDocument();
    expect(screen.getByText("اعتماد المستندات وتفعيل الحساب")).toBeInTheDocument();
    expect(screen.getByText("تمت مراجعة بطاقة الرقم القومي بنجاح")).toBeInTheDocument();
  });

  it("AffiliatePaymentDetailsCard formats payment details", () => {
    render(
      <AffiliatePaymentDetailsCard
        paymentMethod="INSTAPAY"
        paymentDetails={mockAffiliate.paymentDetails}
      />
    );

    expect(screen.getByText("بيانات الدفع")).toBeInTheDocument();
    expect(screen.getByText("INSTAPAY")).toBeInTheDocument();
    expect(screen.getByText(/InstaPay/)).toBeInTheDocument();
  });
});
