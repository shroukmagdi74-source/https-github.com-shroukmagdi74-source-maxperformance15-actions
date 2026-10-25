/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Benefits from "../hr/Benefits";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockBenefits = [
  {
    id: "ben-1",
    name: "تأمين طبي VIP",
    description: "تغطية تأمينية شاملة للموظف والأسرة",
    type: "health_insurance",
    cost: 1200,
    currency: "EGP",
    isActive: true,
    activeEnrollments: 14,
  },
  {
    id: "ben-2",
    name: "بدل انتقال شهري",
    description: "تغطية نفقات الانتقال للعمل",
    type: "transportation",
    cost: 800,
    currency: "EGP",
    isActive: false,
    activeEnrollments: 5,
  },
];

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "سعيد",
    lastName: "رمضان",
    employeeNumber: "EMP201",
  },
];

describe("Benefits Page Component (Batch 493)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/benefits")) {
        return Promise.resolve({
          data: {
            benefits: mockBenefits,
            pagination: { total: 2, page: 1, limit: 9, totalPages: 1 },
          },
        });
      }
      if (url.startsWith("/hr/employees")) {
        return Promise.resolve({
          data: {
            employees: mockEmployees,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and action button", async () => {
    render(
      <MemoryRouter>
        <Benefits />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("المزايا والتعويضات")).toBeTruthy();
      expect(
        screen.getByText("إدارة المزايا الإضافية وبرامج الرعاية الخاصة بالموظفين")
      ).toBeTruthy();
      expect(screen.getByText("إضافة ميزة جديدة")).toBeTruthy();
    });
  });

  it("renders filter elements", async () => {
    render(
      <MemoryRouter>
        <Benefits />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("ابحث عن ميزة بالاسم أو الوصف...")
      ).toBeTruthy();
    });
  });

  it("renders benefits cards in grid properly", async () => {
    render(
      <MemoryRouter>
        <Benefits />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("تأمين طبي VIP")).toBeTruthy();
      expect(
        screen.getByText("تغطية تأمينية شاملة للموظف والأسرة")
      ).toBeTruthy();
      expect(screen.getByText("بدل انتقال شهري")).toBeTruthy();
      expect(screen.getByText("تأمين صحي")).toBeTruthy();
      expect(screen.getByText("بدل انتقال")).toBeTruthy();
      expect(screen.getByText("نشط")).toBeTruthy();
      expect(screen.getByText("متوقف")).toBeTruthy();
    });
  });

  it("opens create benefit dialog on click", async () => {
    render(
      <MemoryRouter>
        <Benefits />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إضافة ميزة جديدة")).toBeTruthy();
    });

    const addBtn = screen.getByText("إضافة ميزة جديدة");
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText("اسم الميزة الفريد")).toBeTruthy();
      expect(screen.getByText("نوع الميزة")).toBeTruthy();
      expect(screen.getByText("التكلفة الشهرية")).toBeTruthy();
    });
  });
});
