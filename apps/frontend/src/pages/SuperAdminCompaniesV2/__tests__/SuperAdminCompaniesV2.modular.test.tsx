// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import { CompaniesHeader } from "../components/CompaniesHeader";
import { CompaniesLifecycleRibbon } from "../components/CompaniesLifecycleRibbon";
import { CompanyDeleteModal } from "../components/CompanyDeleteModal";
import { CompanyAddEmployeeModal } from "../components/CompanyAddEmployeeModal";
import { CompanyFacebookPagesModal } from "../components/CompanyFacebookPagesModal";
import { FollowUpHistoryList } from "../components/FollowUpHistoryList";
import { FollowUpAutomationCard } from "../components/FollowUpAutomationCard";
import { CompanyMobileActionsSheet } from "../components/CompanyMobileActionsSheet";
import type { Company, FollowUpState, FollowUpAutomation } from "../types";

afterEach(() => {
  cleanup();
});

const mockCompany: Company = {
  id: "comp-123",
  name: "شركة الأهرام للتوزيع",
  email: "info@ahram-dist.com",
  phone: "01012345678",
  website: "ahram-dist.com",
  currency: "EGP",
  isActive: true,
  createdAt: "2026-05-10T10:00:00Z",
  usersCount: 5,
  customersCount: 120,
  facebookPagesCount: 2,
  installedAppsCount: 4,
};

describe("SuperAdminCompaniesV2 Modular Components", () => {
  it("CompaniesHeader renders title, company counters, and triggers action buttons", () => {
    const onExport = vi.fn();
    const onRefresh = vi.fn();
    const onCreate = vi.fn();
    const onToggleFilter = vi.fn();

    render(
      <CompaniesHeader
        total={42}
        activeCompanies={35}
        isLoading={false}
        filterOpen={false}
        filterCount={2}
        onExport={onExport}
        onRefresh={onRefresh}
        onCreateCompany={onCreate}
        onToggleFilter={onToggleFilter}
      />
    );

    expect(screen.getByText("إدارة الشركات")).toBeInTheDocument();
    expect(screen.getByText(/42 شركة • 35 نشطة/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /تصدير/ }));
    expect(onExport).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /تحديث/ }));
    expect(onRefresh).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /إضافة شركة/ }));
    expect(onCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /فلاتر/ }));
    expect(onToggleFilter).toHaveBeenCalled();
  });

  it("CompaniesLifecycleRibbon renders lifecycle status boxes and fires callbacks", () => {
    const onClear = vi.fn();
    const onOpenView = vi.fn();

    const quickStats = {
      totalCompanies: 150,
      activeCompanies: 120,
      trialCompanies: 20,
      activeStores: 95,
      onboardingStuck: 15,
      followUpNow: 8,
      escalationDue: 4,
      urgentEscalationDue: 2,
    };

    render(
      <CompaniesLifecycleRibbon
        savedView="ALL"
        quickStats={quickStats}
        onClearFilters={onClear}
        onOpenView={onOpenView}
      />
    );

    expect(screen.getByText("كل الشركات")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("فترة تجريبية")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("متاجر نشطة")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getByText("تحتاج إعداد")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();

    fireEvent.click(screen.getByText("فترة تجريبية").closest("button")!);
    expect(onOpenView).toHaveBeenCalledWith("TRIAL");

    fireEvent.click(screen.getByText("كل الشركات").closest("button")!);
    expect(onClear).toHaveBeenCalled();
  });

  it("CompanyDeleteModal renders destructive warning and handles confirmations", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <CompanyDeleteModal
        isOpen={true}
        isMobile={false}
        ids={["comp-123"]}
        name="شركة الأهرام للتوزيع"
        deleting={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/هل أنت متأكد من حذف "شركة الأهرام للتوزيع"؟/)).toBeInTheDocument();
    expect(screen.getByText("تحذير نهائي")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /تأكيد الحذف/ }));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /إلغاء/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("CompanyAddEmployeeModal renders input fields and triggers submit", () => {
    const onChangeForm = vi.fn();
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <CompanyAddEmployeeModal
        isOpen={true}
        isMobile={false}
        company={mockCompany}
        employeeForm={{
          firstName: "سعيد",
          lastName: "خالد",
          email: "saeed@example.com",
          password: "password123",
          role: "COMPANY_ADMIN",
        }}
        employeeErrors={{}}
        saving={false}
        onClose={onClose}
        onChangeForm={onChangeForm}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/إضافة موظف إلى شركة الأهرام للتوزيع/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("سعيد")).toBeInTheDocument();
    expect(screen.getByDisplayValue("saeed@example.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /إضافة الموظف/ }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("CompanyFacebookPagesModal renders connected pages list and message counts", () => {
    const onClose = vi.fn();
    const pages = [
      {
        id: "p-1",
        pageName: "صفحة متجر الأهرام الرسمي",
        pageId: "1098237462",
        status: "CONNECTED",
        connectedAt: "2026-06-01T12:00:00Z",
        messageCount: 1420,
      },
    ];

    render(
      <CompanyFacebookPagesModal
        isOpen={true}
        isMobile={false}
        company={mockCompany}
        pages={pages}
        loading={false}
        onClose={onClose}
      />
    );

    expect(screen.getByText(/صفحات فيسبوك شركة الأهرام للتوزيع/)).toBeInTheDocument();
    expect(screen.getByText("صفحة متجر الأهرام الرسمي")).toBeInTheDocument();
    expect(screen.getByText("1098237462")).toBeInTheDocument();
    expect(screen.getByText("1420")).toBeInTheDocument();
  });

  it("FollowUpHistoryList renders activity logs", () => {
    const history = [
      {
        id: "hist-1",
        status: "in_progress",
        occurredAt: "2026-10-20T14:30:00Z",
        actor: { id: "u-1", label: "أحمد المشرف" },
        assignedOwner: { id: "u-2", label: "محمد المسؤول" },
        note: "تم التحدث مع مالك المتجر وتم إرشاده لإضافة الدومين المخصص",
      },
    ];

    render(<FollowUpHistoryList history={history as any} />);

    expect(screen.getByText("سجل نشاط المتابعة")).toBeInTheDocument();
    expect(screen.getByText("1 سجل")).toBeInTheDocument();
    expect(screen.getByText("أحمد المشرف")).toBeInTheDocument();
    expect(screen.getByText(/المسؤول: محمد المسؤول/)).toBeInTheDocument();
    expect(screen.getByText(/تم التحدث مع مالك المتجر/)).toBeInTheDocument();
  });

  it("FollowUpAutomationCard renders smart follow-up details and actions", () => {
    const onLogReminder = vi.fn();
    const onLogEscalation = vi.fn();

    const followUp: FollowUpState = {
      status: "in_progress",
      statusMeta: { label: "قيد المتابعة", className: "" },
      assignedOwner: { id: "u-1", label: "أيمن علي" },
      updatedAt: "2026-10-22T10:00:00Z",
      lastReminderSentAt: "2026-10-21T09:00:00Z",
      lastEscalatedAt: null,
      history: [],
    };

    const automation: FollowUpAutomation = {
      label: "أتمتة متقدمة",
      badgeClassName: "",
      description: "تم استحقاق تذكير هاتفي ومتابعة خطوات تفعيل المتجر",
      needsReminder: true,
      needsEscalation: false,
      needsUrgentEscalation: false,
    };

    render(
      <FollowUpAutomationCard
        followUp={followUp}
        automation={automation}
        saving={false}
        onLogReminder={onLogReminder}
        onLogEscalation={onLogEscalation}
      />
    );

    expect(screen.getByText("أتمتة المتابعة الذكية")).toBeInTheDocument();
    expect(screen.getByText(/تم استحقاق تذكير هاتفي/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /تسجيل التذكير/ }));
    expect(onLogReminder).toHaveBeenCalled();
  });

  it("CompanyMobileActionsSheet renders all 9 mobile action items", () => {
    const onDetails = vi.fn();
    const onFollowUp = vi.fn();
    const onEdit = vi.fn();
    const onUsers = vi.fn();
    const onPages = vi.fn();
    const onTransfer = vi.fn();
    const onEmployee = vi.fn();
    const onLogin = vi.fn();
    const onDelete = vi.fn();

    render(
      <CompanyMobileActionsSheet
        isOpen={true}
        onOpenChange={vi.fn()}
        company={mockCompany}
        onOpenDetails={onDetails}
        onOpenFollowUp={onFollowUp}
        onEdit={onEdit}
        onOpenUsers={onUsers}
        onOpenFacebookPages={onPages}
        onTransferOwnership={onTransfer}
        onAddEmployee={onEmployee}
        onLoginAsAdmin={onLogin}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("عرض التفاصيل")).toBeInTheDocument();
    expect(screen.getByText("إدارة المتابعة")).toBeInTheDocument();
    expect(screen.getByText("تعديل")).toBeInTheDocument();
    expect(screen.getByText("الأعضاء")).toBeInTheDocument();
    expect(screen.getByText("صفحات فيسبوك")).toBeInTheDocument();
    expect(screen.getByText("نقل الملكية")).toBeInTheDocument();
    expect(screen.getByText("إضافة موظف")).toBeInTheDocument();
    expect(screen.getByText("دخول كأدمن")).toBeInTheDocument();
    expect(screen.getByText("حذف")).toBeInTheDocument();

    fireEvent.click(screen.getByText("عرض التفاصيل"));
    expect(onDetails).toHaveBeenCalledWith(mockCompany);

    fireEvent.click(screen.getByText("دخول كأدمن"));
    expect(onLogin).toHaveBeenCalledWith(mockCompany);
  });
});
