// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import HiringPipelineSection from "../hr/recruitment/sections/HiringPipelineSection";
import { companyAwareApi } from "../../services/companyAwareApi";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPipelineStats = [
  { id: "NEW", name: "جديد", count: 4, color: "blue" },
  { id: "INTERVIEW_SCHEDULED", name: "مقابلة مجدولة", count: 2, color: "purple" },
  { id: "HIRED", name: "تم التوظيف", count: 1, color: "emerald" },
];

const mockApplicants = [
  {
    id: "app-1",
    name: "ياسمين فؤاد",
    email: "yasmin@example.com",
    phone: "01122334455",
    status: "NEW",
    jobTitle: "مصممة منتجات",
    createdAt: "2026-10-22T10:00:00.000Z",
  },
];

describe("HiringPipelineSection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/recruitment/pipeline-stats")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockPipelineStats,
          },
        });
      }
      if (url.includes("/hr/recruitment/applicants")) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockApplicants,
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders hiring pipeline stages, applicant cards, and summary stats", async () => {
    render(<HiringPipelineSection />);

    await waitFor(() => {
      expect(screen.getByText("ياسمين فؤاد")).toBeTruthy();
    });

    expect(screen.getByText("yasmin@example.com")).toBeTruthy();
    expect(screen.getByText("مصممة منتجات")).toBeTruthy();
    expect(screen.getByText("إحصائيات المسار")).toBeTruthy();
    expect(screen.getByText("25%")).toBeTruthy();
  });

  it("switches selected stage when clicking another stage card", async () => {
    render(<HiringPipelineSection />);

    await waitFor(() => {
      expect(screen.getByText("ياسمين فؤاد")).toBeTruthy();
    });

    const interviewStages = screen.getAllByText("مقابلة مجدولة");
    fireEvent.click(interviewStages[0]);

    await waitFor(() => {
      expect(screen.getByText("تفاصيل مرحلة: مقابلة مجدولة")).toBeTruthy();
    });
  });
});
