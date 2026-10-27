// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  calculateAge,
  calculateTenure,
  getNextOccasion,
  getInitials,
} from "../components/helpers";
import { AnimatedNumber, InfoField, SectionCard } from "../components/ProfileWidgets";
import { MerchantProfileView } from "../components/MerchantProfileView";
import { ProfileHeroHeader } from "../components/ProfileHeroHeader";
import { ProfileOverviewTab } from "../components/ProfileOverviewTab";
import { ProfileJobTab } from "../components/ProfileJobTab";
import { ProfileCustodyTab } from "../components/ProfileCustodyTab";
import { ProfileDocumentsTab } from "../components/ProfileDocumentsTab";
import { ProfileWarningsTab } from "../components/ProfileWarningsTab";
import { ProfileEventsTab } from "../components/ProfileEventsTab";
import { UserIcon } from "@heroicons/react/24/outline";

afterEach(() => {
  cleanup();
});

const mockT = (key: string, opts?: any) => {
  if (opts?.years !== undefined && opts?.months !== undefined) {
    return `${opts.years}y ${opts.months}m`;
  }
  if (opts?.years !== undefined) return `${opts.years}y`;
  if (opts?.months !== undefined) return `${opts.months}m`;
  if (opts?.company) return `Company: ${opts.company}`;
  return key;
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({ derivedTheme: "light" }),
}));

vi.mock("../../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    formatDate: (d: string) => (d ? `formatted-${d}` : "—"),
  }),
}));

vi.mock("../../../components/settings/DefaultPageSelector", () => ({
  DefaultPageSelector: ({ value }: { value: string }) => (
    <div data-testid="default-page-selector">DefaultPage: {value}</div>
  ),
}));

describe("Profile Helpers", () => {
  it("calculates age correctly", () => {
    expect(calculateAge("")).toBe("-");
    const today = new Date();
    const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    expect(calculateAge(twentyYearsAgo.toISOString())).toBe(20);
  });

  it("calculates tenure correctly with t function", () => {
    expect(calculateTenure("", mockT as any)).toBe("-");
    const today = new Date();
    const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth() - 3, today.getDate());
    const tenure = calculateTenure(twoYearsAgo.toISOString(), mockT as any);
    expect(tenure).toBe("2y 3m");
  });

  it("calculates getNextOccasion returns date and positive diffDays", () => {
    expect(getNextOccasion("")).toBeNull();
    const occasion = getNextOccasion("1990-05-15");
    expect(occasion).not.toBeNull();
    expect(occasion?.days).toBeGreaterThanOrEqual(0);
  });

  it("extracts initials correctly", () => {
    expect(getInitials("Ahmed", "Ali")).toBe("AA");
    expect(getInitials("Sara", "")).toBe("S");
    expect(getInitials("", "")).toBe("");
  });
});

describe("ProfileWidgets", () => {
  it("renders AnimatedNumber with tabular-nums", () => {
    render(<AnimatedNumber value={1500} suffix=" EGP" />);
    const el = screen.getByText(/EGP/);
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("tabular-nums");
  });

  it("renders InfoField in read-only mode and editing mode", () => {
    const { rerender } = render(<InfoField label="City" value="Cairo" />);
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Cairo")).toBeInTheDocument();

    const handleChange = vi.fn();
    rerender(<InfoField label="City" value="Cairo" editing onChange={handleChange} />);
    const input = screen.getByDisplayValue("Cairo");
    fireEvent.change(input, { target: { value: "Alexandria" } });
    expect(handleChange).toHaveBeenCalledWith("Alexandria");
  });

  it("renders SectionCard with title and children", () => {
    render(
      <SectionCard icon={UserIcon} title="Personal Section" accent="indigo">
        <div>Content Inside</div>
      </SectionCard>
    );
    expect(screen.getByText("Personal Section")).toBeInTheDocument();
    expect(screen.getByText("Content Inside")).toBeInTheDocument();
  });
});

describe("MerchantProfileView", () => {
  const dummyFormData = {
    firstName: "Mokhtar",
    lastName: "Elhenawy",
    email: "mokhtar@test.com",
    phone: "01012345678",
    address: "Street 1",
    city: "Cairo",
    country: "Egypt",
    maritalStatus: "SINGLE",
    gender: "MALE",
    dateOfBirth: "1995-01-01",
    nationalId: "12345678901234",
    emergencyContactName: "Father",
    emergencyContactRelation: "Parent",
    emergencyContactPhone: "01123456789",
  };

  it("renders merchant view with company info and portal link", () => {
    render(
      <BrowserRouter>
        <MerchantProfileView
          user={{ role: "MERCHANT", company: { name: "Dropship Co" } }}
          formData={dummyFormData}
          defaultPage="/apps"
          settingsLoading={false}
          onDefaultPageChange={vi.fn()}
          hasAffiliatePro={true}
        />
      </BrowserRouter>
    );
    expect(screen.getByText("Mokhtar Elhenawy")).toBeInTheDocument();
    expect(screen.getByText("mokhtar@test.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /employee\.profile\.merchantPortal/i })).toHaveAttribute(
      "href",
      "/merchant-portal"
    );
  });

  it("renders affiliate view with affiliate tools link", () => {
    render(
      <BrowserRouter>
        <MerchantProfileView
          user={{ role: "AFFILIATE", company: { name: "Affiliate Hub" } }}
          formData={dummyFormData}
          defaultPage="/affiliates/dashboard"
          settingsLoading={false}
          onDefaultPageChange={vi.fn()}
          hasAffiliatePro={true}
        />
      </BrowserRouter>
    );
    const affiliateLinks = screen.getAllByRole("link", { name: /employee\.profile\.affiliateDashboard/i });
    expect(affiliateLinks.length).toBeGreaterThanOrEqual(1);
    expect(affiliateLinks[0]).toHaveAttribute("href", "/affiliates/dashboard");
  });
});

describe("Profile Subcomponents", () => {
  const dummyEmployee: any = {
    id: "emp-1",
    employeeNumber: "EMP001",
    firstName: "Omar",
    lastName: "Khaled",
    email: "omar@company.com",
    phone: "01000000000",
    avatar: "",
    dateOfBirth: "1992-06-15",
    gender: "MALE",
    maritalStatus: "MARRIED",
    nationalId: "29206150100000",
    address: "Nasr City",
    city: "Cairo",
    country: "Egypt",
    hireDate: "2022-01-01",
    contractType: "FULL_TIME",
    status: "ACTIVE",
    baseSalary: 12000,
    annualLeaveBalance: 21,
    sickLeaveBalance: 14,
    bankName: "CIB",
    bankIban: "EG123456789012345678901234567",
    emergencyContactName: "Nour",
    emergencyContactRelation: "Wife",
    emergencyContactPhone: "01111111111",
    department: { name: "Engineering" },
    position: { title: "Senior Developer" },
    manager: { firstName: "Tamer", lastName: "Hassan" },
    documents_rel: [{ type: "ID", title: "National ID Scan", createdAt: "2022-01-02" }],
  };

  const dummyFormData = {
    firstName: "Omar",
    lastName: "Khaled",
    email: "omar@company.com",
    phone: "01000000000",
    address: "Nasr City",
    city: "Cairo",
    country: "Egypt",
    maritalStatus: "MARRIED",
    gender: "MALE",
    dateOfBirth: "1992-06-15",
    nationalId: "29206150100000",
    emergencyContactName: "Nour",
    emergencyContactRelation: "Wife",
    emergencyContactPhone: "01111111111",
  };

  it("renders ProfileHeroHeader with employee details", () => {
    const handleSave = vi.fn();
    const handleAvatar = vi.fn();
    render(
      <ProfileHeroHeader
        user={{}}
        employee={dummyEmployee}
        formData={dummyFormData}
        setFormData={vi.fn()}
        isEditing={false}
        setIsEditing={vi.fn()}
        saving={false}
        uploading={false}
        onSave={handleSave}
        onAvatarClick={handleAvatar}
      />
    );
    expect(screen.getByText("Omar Khaled")).toBeInTheDocument();
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("#EMP001")).toBeInTheDocument();
  });

  it("renders ProfileOverviewTab with stats and contact info", () => {
    render(
      <ProfileOverviewTab
        employee={dummyEmployee}
        formData={dummyFormData}
        setFormData={vi.fn()}
        isEditing={false}
        hasHrBasic={true}
        defaultPage="/apps"
        settingsLoading={false}
        onDefaultPageChange={vi.fn()}
      />
    );
    expect(screen.getByText("omar@company.com")).toBeInTheDocument();
    expect(screen.getByTestId("default-page-selector")).toBeInTheDocument();
  });

  it("renders ProfileJobTab with job details, financial info and bank details", () => {
    render(<ProfileJobTab employee={dummyEmployee} />);
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    expect(screen.getByText("Tamer Hassan")).toBeInTheDocument();
    expect(screen.getByText("CIB")).toBeInTheDocument();
    expect(screen.getByText("EG123456789012345678901234567")).toBeInTheDocument();
  });

  it("renders ProfileCustodyTab with empty state and asset items", () => {
    const { rerender } = render(<ProfileCustodyTab myCustody={[]} />);
    expect(screen.getByText("employee.profile.noCustody")).toBeInTheDocument();

    const assets = [
      {
        id: "ast-1",
        name: "MacBook Pro M2",
        status: "ASSIGNED",
        code: "DEV-042",
        serialNumber: "SN12345678",
        assignedDate: "2023-01-15",
      },
    ];
    rerender(<ProfileCustodyTab myCustody={assets} />);
    expect(screen.getByText("MacBook Pro M2")).toBeInTheDocument();
    expect(screen.getByText("DEV-042")).toBeInTheDocument();
    expect(screen.getByText("SN12345678")).toBeInTheDocument();
  });

  it("renders ProfileDocumentsTab with documents list", () => {
    render(<ProfileDocumentsTab employee={dummyEmployee} />);
    expect(screen.getByText("National ID Scan")).toBeInTheDocument();
  });

  it("renders ProfileWarningsTab with empty state and warnings", () => {
    const { rerender } = render(
      <ProfileWarningsTab warnings={[]} onAcknowledgeSuccess={vi.fn()} />
    );
    expect(screen.getByText("employee.profile.noWarnings")).toBeInTheDocument();

    const warnings = [
      {
        id: "w-1",
        title: "Late Attendance",
        severity: "major",
        incidentDate: "2023-05-10",
        description: "Arrived 2 hours late without notice",
        actionTaken: "Verbal warning",
      },
    ];
    rerender(
      <ProfileWarningsTab warnings={warnings} onAcknowledgeSuccess={vi.fn()} />
    );
    expect(screen.getByText("Late Attendance")).toBeInTheDocument();
    expect(screen.getByText("Arrived 2 hours late without notice")).toBeInTheDocument();
    expect(screen.getByText("Verbal warning")).toBeInTheDocument();
  });

  it("renders ProfileEventsTab with birthday and work anniversary", () => {
    render(<ProfileEventsTab employee={dummyEmployee} />);
    expect(screen.getByText("employee.profile.nextBirthday")).toBeInTheDocument();
    expect(screen.getByText("employee.profile.workAnniversary")).toBeInTheDocument();
  });
});
