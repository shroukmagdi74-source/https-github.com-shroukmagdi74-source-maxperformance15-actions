// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CreatePerformanceReview from "../hr/CreatePerformanceReview";
import api from "../../services/api";
import { tToast } from "../../utils/i18n-toast";
import { createInitialPerformanceReviewFormData } from "../hr/create-performance-review/helpers";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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
  },
}));

const mockEmployees = [
  {
    id: "emp-1",
    firstName: "كريم",
    lastName: "عادل",
    hasEmployeeRecord: true,
  },
  {
    id: "emp-2",
    firstName: "طارق",
    lastName: "نبيل",
    hasEmployeeRecord: true,
  },
];

describe("CreatePerformanceReview (Batch 520)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith("/hr/employees")) {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      if (url === "/hr/performance-reviews/rev-1") {
        return Promise.resolve({
          data: {
            review: {
              id: "rev-1",
              userId: "emp-1",
              reviewerId: "emp-2",
              reviewPeriod: "تقييم الربع الثالث 2026",
              periodStart: "2026-07-01T00:00:00Z",
              periodEnd: "2026-09-30T00:00:00Z",
              overallRating: "4.5",
              strengths: "التزام عالي بالمواعيد",
              improvements: "تطوير مهارات العرض",
              reviewerComments: "أداء متميز",
              status: "COMPLETED",
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders create performance review header, parties card, and details card", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/performance-reviews/new"]}>
        <Routes>
          <Route
            path="/hr/performance-reviews/new"
            element={<CreatePerformanceReview />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("إنشاء تقييم جديد")).toBeDefined();
    expect(screen.getByText("الأطراف المعنية")).toBeDefined();
    expect(screen.getByText("فترة التقييم وبيانات التقرير")).toBeDefined();
    expect(screen.getByText("5.0")).toBeDefined();
  });

  it("shows validation error toast when submitting without required fields", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/performance-reviews/new"]}>
        <Routes>
          <Route
            path="/hr/performance-reviews/new"
            element={<CreatePerformanceReview />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("إنشاء تقييم جديد");

    fireEvent.click(screen.getByText("حفظ ونشر التقييم"));

    expect(tToast.error).toHaveBeenCalledWith(
      "CreatePerformanceReview.msg_aee9"
    );
  });

  it("loads existing review data in edit mode and submits update", async () => {
    (api.put as any).mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={["/hr/performance-reviews/edit/rev-1"]}>
        <Routes>
          <Route
            path="/hr/performance-reviews/edit/:id"
            element={<CreatePerformanceReview />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("تعديل تقييم الأداء")).toBeDefined();
    expect(
      await screen.findByDisplayValue("تقييم الربع الثالث 2026")
    ).toBeDefined();
    expect(screen.getByText("4.5")).toBeDefined();

    fireEvent.click(screen.getByText("حفظ التعديلات"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/hr/performance-reviews/rev-1",
        expect.objectContaining({
          employeeId: "emp-1",
          reviewerId: "emp-2",
          reviewPeriod: "تقييم الربع الثالث 2026",
          overallRating: 4.5,
        })
      );
    });
  });

  it("creates initial performance review form data with default 5.0 rating", () => {
    const initial = createInitialPerformanceReviewFormData();
    expect(initial.overallRating).toBe(5.0);
    expect(initial.status).toBe("DRAFT");
  });
});
