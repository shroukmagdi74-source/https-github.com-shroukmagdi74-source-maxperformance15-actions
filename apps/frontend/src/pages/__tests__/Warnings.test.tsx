/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Warnings from "../hr/Warnings";
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

const mockWarnings = [
  {
    id: "warn-1",
    type: "WRITTEN",
    severity: "moderate",
    title: "تأخر متكرر عن مواعيد العمل",
    description: "تم رصد تأخر الموظف لأكثر من 45 دقيقة لعدة أيام متتالية دون إذن مسبق.",
    incidentDate: "2026-03-01T09:00:00Z",
    acknowledgedAt: null,
    employee: {
      id: "emp-101",
      firstName: "طارق",
      lastName: "سالم",
      employeeNumber: "EMP101",
      position: { title: "أخصائي مبيعات" },
      department: { name: "المبيعات" },
    },
  },
  {
    id: "warn-2",
    type: "FINAL",
    severity: "severe",
    title: "مخالفة قواعد السلامة والأمان",
    description: "عدم ارتداء معدات الوقاية الشخصية داخل منطقة العمل المحددة.",
    incidentDate: "2026-02-20T10:30:00Z",
    acknowledgedAt: "2026-02-21T11:00:00Z",
    employee: {
      id: "emp-102",
      firstName: "يوسف",
      lastName: "كمال",
      employeeNumber: "EMP102",
      position: { title: "فني صيانة" },
      department: { name: "الصيانة" },
    },
  },
];

const mockStats = {
  total: 24,
  byType: [
    { type: "VERBAL", _count: 10 },
    { type: "WRITTEN", _count: 8 },
    { type: "FINAL", _count: 4 },
    { type: "TERMINATION", _count: 2 },
  ],
  bySeverity: [
    { severity: "minor", _count: 12 },
    { severity: "moderate", _count: 8 },
    { severity: "severe", _count: 4 },
  ],
  acknowledged: 18,
  acknowledgmentRate: 75,
};

describe("Warnings Component (Batch 503)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/warnings/stats")) {
        return Promise.resolve({
          data: {
            stats: mockStats,
          },
        });
      }
      if (url.includes("/hr/warnings")) {
        return Promise.resolve({
          data: {
            warnings: mockWarnings,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and new warning button", async () => {
    render(
      <MemoryRouter>
        <Warnings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("الإنذارات والمخالفات")).toBeTruthy();
      expect(
        screen.getByText("إدارة ومتابعة المخالفات الإدارية والإجراءات التأديبية")
      ).toBeTruthy();
      expect(screen.getByText("تسجيل مخالفة جديدة")).toBeTruthy();
    });
  });

  it("renders statistics cards correctly", async () => {
    render(
      <MemoryRouter>
        <Warnings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إجمالي الإنذارات")).toBeTruthy();
      expect(screen.getByText("24")).toBeTruthy();
      expect(screen.getAllByText("قيد الانتظار").length).toBeGreaterThan(0);
      expect(screen.getByText("6")).toBeTruthy(); // 24 - 18
      expect(screen.getByText("مكتملة الإجراءات")).toBeTruthy();
      expect(screen.getByText("18")).toBeTruthy();
      expect(screen.getByText("مخالفات جسيمة")).toBeTruthy();
      expect(screen.getByText("4")).toBeTruthy();
    });
  });

  it("renders warning cards with employee information and badges", async () => {
    render(
      <MemoryRouter>
        <Warnings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("طارق سالم")).toBeTruthy();
      expect(screen.getByText("يوسف كمال")).toBeTruthy();
      expect(screen.getByText("تأخر متكرر عن مواعيد العمل")).toBeTruthy();
      expect(screen.getByText("مخالفة قواعد السلامة والأمان")).toBeTruthy();
      expect(screen.getByText("كتابي")).toBeTruthy();
      expect(screen.getByText("نهائي")).toBeTruthy();
    });
  });

  it("opens preview modal on clicking eye action button", async () => {
    render(
      <MemoryRouter>
        <Warnings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("طارق سالم")).toBeTruthy();
    });

    const eyeButtons = screen.getAllByTitle("عرض سريع");
    expect(eyeButtons.length).toBeGreaterThan(0);

    fireEvent.click(eyeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تفاصيل الواقعة")).toBeTruthy();
      expect(screen.getByText("إغلاق النافذة")).toBeTruthy();
      expect(screen.getByText("فتح الملف الكامل")).toBeTruthy();
    });
  });
});
