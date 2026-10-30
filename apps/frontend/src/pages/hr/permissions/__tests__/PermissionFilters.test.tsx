import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PermissionFilters } from "../PermissionFilters";

const translations: Record<string, string> = {
  "employee.permissions.all": "الكل",
  "employee.permissions.pendingTab": "قيد الانتظار",
  "employee.permissions.approvedTab": "الموافق عليها",
  "employee.permissions.rejectedTab": "المرفوضة",
  "employee.permissions.typePlaceholder": "نوع الإذن",
  "employee.permissions.allTypes": "كل الأنواع",
  "employee.permissions.externalAssignment": "مأمورية عمل خارجية",
  "employee.permissions.exitDeductible": "إذن خروج (خصم)",
  "employee.permissions.emergencyNonDeductible": "إذن طارئ (بدون خصم)",
  "employee.permissions.compensatory": "إذن تعويضي",
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => translations[key] || fallback || key,
  }),
}));

describe("PermissionFilters", () => {
  const defaultProps = {
    activeTab: "all",
    setActiveTab: jest.fn(),
    typeFilter: "all",
    setTypeFilter: jest.fn(),
    pendingCount: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders translated 'كل الأنواع' when typeFilter is 'all' and does not render raw 'all'", () => {
    render(<PermissionFilters {...defaultProps} typeFilter="all" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("كل الأنواع");

    // Ensure no element in the document contains the raw "all" value
    expect(screen.queryByText("all")).toBeNull();
    expect(screen.queryByText(/^all$/i)).toBeNull();
    const exactMatches = screen.queryAllByText(
      (_, element) => element?.textContent?.trim() === "all",
    );
    expect(exactMatches).toHaveLength(0);
  });

  it("renders translated 'مأمورية عمل خارجية' when typeFilter is 'FIXED_HOURS'", () => {
    render(<PermissionFilters {...defaultProps} typeFilter="FIXED_HOURS" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("مأمورية عمل خارجية");
    expect(screen.getByText("مأمورية عمل خارجية")).toBeInTheDocument();
  });

  it("renders placeholder 'نوع الإذن' when typeFilter is empty", () => {
    render(<PermissionFilters {...defaultProps} typeFilter="" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("نوع الإذن");
    expect(screen.getByText("نوع الإذن")).toBeInTheDocument();
  });

  it("renders translated label for other permission types (DEDUCTIBLE)", () => {
    render(<PermissionFilters {...defaultProps} typeFilter="DEDUCTIBLE" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("إذن خروج (خصم)");
    expect(screen.getByText("إذن خروج (خصم)")).toBeInTheDocument();
  });

  it("triggers setActiveTab when clicking on tabs", () => {
    const setActiveTab = jest.fn();
    render(<PermissionFilters {...defaultProps} setActiveTab={setActiveTab} />);

    const approvedTab = screen.getByText("الموافق عليها");
    fireEvent.click(approvedTab);
    expect(setActiveTab).toHaveBeenCalledWith("approved", expect.anything());
  });
});
