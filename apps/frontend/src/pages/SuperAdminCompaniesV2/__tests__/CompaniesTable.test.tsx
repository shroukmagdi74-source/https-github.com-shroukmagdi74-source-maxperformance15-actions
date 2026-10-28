// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CompaniesTable } from "../components/CompaniesTable";
import {
  getCallStatusColor,
  getCallStatusLabel,
  getWhatsAppUrl,
} from "../components/companies-table";
import type { Company, QuickStats } from "../types";

vi.mock("../../../utils/companyFollowUp", () => ({
  getCompaniesFollowUpAutomationStats: vi.fn(() => ({})),
  getCompanyFollowUpState: vi.fn(() => ({
    status: "unassigned",
    statusMeta: { label: "", className: "" },
    assignedOwner: { id: null, label: "" },
    updatedAt: null,
    nextActionAt: null,
    lastReminderSentAt: null,
    lastEscalatedAt: null,
    history: [],
  })),
  getCompanyFollowUpAutomationState: vi.fn(() => ({
    level: "idle",
    label: "",
    badgeClassName: "",
    description: "",
    needsReminder: false,
    needsEscalation: false,
    needsUrgentEscalation: false,
  })),
  getCompanyFollowUpReminderState: vi.fn(() => ({
    isActionable: false,
    badgeClassName: "",
    nextActionLabel: "",
    isMine: false,
    needsFollowUpToday: false,
  })),
  getCompaniesFollowUpReminderStats: vi.fn(() => ({ myDueToday: 0 })),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const baseStats: QuickStats = {
  totalCompanies: 0,
  activeCompanies: 0,
  connectedFacebookPages: 0,
  followUpNow: 0,
  escalationDue: 0,
  urgentEscalationDue: 0,
  stale72h: 0,
  myDueToday: 0,
};

const makeCompany = (id: string, overrides: Partial<Company> = {}): Company =>
  ({
    id,
    name: `Company ${id}`,
    email: `${id}@test.com`,
    phone: null,
    website: null,
    currency: "EGP",
    isActive: true,
    createdAt: "2024-01-01",
    _count: { users: 0, customers: 0, facebookPages: 0 },
    ...overrides,
  }) as Company;

const defaultProps = {
  companies: [] as Company[],
  totalPages: 1,
  currentPage: 1,
  onPageChange: vi.fn(),
  pageSize: 10,
  totalItems: 0,
  selectedIds: [] as string[],
  onToggleSelect: vi.fn(),
  onToggleSelectAll: vi.fn(),
  isAllVisibleSelected: false,
  isSomeVisibleSelected: false,
  loading: false,
  onOpenDetails: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onOpenUsers: vi.fn(),
  onOpenFollowUp: vi.fn(),
  onOpenFacebookPages: vi.fn(),
  onTransferOwnership: vi.fn(),
  onAddEmployee: vi.fn(),
  onLoginAsAdmin: vi.fn(),
  onRunFollowUpAction: vi.fn(),
  isMobile: false,
  stats: baseStats,
};

describe("CompaniesTable and Modular Subcomponents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("helpers", () => {
    it("formats WhatsApp URL correctly", () => {
      expect(getWhatsAppUrl(null)).toBeNull();
      expect(getWhatsAppUrl("01012345678")).toBe("https://wa.me/201012345678");
      expect(getWhatsAppUrl("+201012345678")).toBe("https://wa.me/201012345678");
    });

    it("formats call status labels and colors", () => {
      expect(getCallStatusLabel("answered")).toBe("تم الرد");
      expect(getCallStatusLabel("no_answer")).toBe("لم يرد");
      expect(getCallStatusLabel("call_back_later")).toBe("معاودة الاتصال");
      expect(getCallStatusLabel("not_called")).toBe("لم يتم الاتصال");

      expect(getCallStatusColor("answered")).toContain("emerald");
      expect(getCallStatusColor("no_answer")).toContain("rose");
      expect(getCallStatusColor("call_back_later")).toContain("amber");
      expect(getCallStatusColor("unknown")).toContain("slate");
    });
  });

  it("shows loading skeletons when loading is true", () => {
    const { container } = render(<CompaniesTable {...defaultProps} loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty state when no companies", () => {
    render(<CompaniesTable {...defaultProps} companies={[]} />);
    expect(screen.getByText("لا توجد شركات مطابقة")).toBeInTheDocument();
    expect(screen.getByText(/جرّب تعديل الفلاتر/)).toBeInTheDocument();
  });

  it("renders company names in the table", () => {
    const companies = [
      makeCompany("1", { name: "شركة الأولى" }),
      makeCompany("2", { name: "شركة الثانية" }),
    ];
    render(<CompaniesTable {...defaultProps} companies={companies} totalItems={2} />);
    expect(screen.getByText("شركة الأولى")).toBeInTheDocument();
    expect(screen.getByText("شركة الثانية")).toBeInTheDocument();
  });

  it("renders active status badge", () => {
    const companies = [makeCompany("1", { isActive: true })];
    render(<CompaniesTable {...defaultProps} companies={companies} totalItems={1} />);
    expect(screen.getByText("نشطة")).toBeInTheDocument();
  });

  it("renders inactive status badge", () => {
    const companies = [makeCompany("1", { isActive: false })];
    render(<CompaniesTable {...defaultProps} companies={companies} totalItems={1} />);
    expect(screen.getByText("متوقفة")).toBeInTheDocument();
  });

  it("calls onOpenDetails when company name is clicked", () => {
    const onOpenDetails = vi.fn();
    const companies = [makeCompany("1")];
    render(
      <CompaniesTable
        {...defaultProps}
        companies={companies}
        totalItems={1}
        onOpenDetails={onOpenDetails}
      />,
    );
    fireEvent.click(screen.getByText("Company 1"));
    expect(onOpenDetails).toHaveBeenCalledWith(companies[0]);
  });

  it("handles pagination controls", () => {
    const onPageChange = vi.fn();
    const companies = [makeCompany("1"), makeCompany("2")];
    render(
      <CompaniesTable
        {...defaultProps}
        companies={companies}
        totalItems={2}
        totalPages={3}
        currentPage={2}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByText(/صفحة/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("السابق"));
    expect(onPageChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByText("التالي"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables previous on first page", () => {
    const companies = [makeCompany("1")];
    render(
      <CompaniesTable
        {...defaultProps}
        companies={companies}
        totalItems={1}
        totalPages={3}
        currentPage={1}
      />,
    );
    const prevButton = screen.getByText("السابق").closest("button");
    expect(prevButton).toBeDisabled();
  });

  it("disables next on last page", () => {
    const companies = [makeCompany("1")];
    render(
      <CompaniesTable
        {...defaultProps}
        companies={companies}
        totalItems={1}
        totalPages={3}
        currentPage={3}
      />,
    );
    const nextButton = screen.getByText("التالي").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("renders email for each company", () => {
    const companies = [makeCompany("1", { email: "test@example.com" })];
    render(<CompaniesTable {...defaultProps} companies={companies} totalItems={1} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders mobile single-depth view when isMobile is true", () => {
    const companies = [makeCompany("1", { name: "شركة الموبايل" })];
    render(<CompaniesTable {...defaultProps} companies={companies} isMobile={true} totalItems={1} />);
    expect(screen.getByText("شركة الموبايل")).toBeInTheDocument();
    expect(screen.getByText(/دخول كأدمن/)).toBeInTheDocument();
  });
});
