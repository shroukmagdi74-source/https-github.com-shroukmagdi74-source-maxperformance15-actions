// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import ApplicationFormsSection from "../hr/recruitment/sections/ApplicationFormsSection";
import { companyAwareApi } from "../../services/companyAwareApi";
import { getApplicantStatusLabel } from "../hr/recruitment/sections/application-forms/helpers";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
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
  },
}));

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
  },
}));

const mockForms = [
  {
    id: "form-1",
    title: "استبيان مطور واجهات",
    slug: "frontend-dev-form",
    description: "استبيان التقديم لوظيفة مطور React",
    jobId: "job-1",
    jobTitle: "مطور واجهات أمامية",
    isActive: true,
    questionsCount: 5,
    responsesCount: 12,
    createdAt: "2026-10-10T10:00:00Z",
  },
];

const mockResponses = [
  {
    id: "resp-1",
    respondentName: "ياسر كمال",
    respondentEmail: "yasser@example.com",
    respondentPhone: "01012345678",
    isContacted: false,
    submittedAt: "2026-10-15T14:00:00Z",
    applicant: null,
    answers: [],
  },
];

describe("ApplicationFormsSection (Batch 521)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockImplementation((url: string) => {
      if (url === "/hr/recruitment/forms") {
        return Promise.resolve({ data: { success: true, data: mockForms } });
      }
      if (url === "/hr/recruitment/jobs") {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ id: "job-1", title: "مطور واجهات أمامية" }],
          },
        });
      }
      if (url === "/hr/recruitment/forms/form-1/responses") {
        return Promise.resolve({
          data: { success: true, data: mockResponses },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders application forms grid with counts and slug link", async () => {
    render(<ApplicationFormsSection />);

    expect(await screen.findByText("استبيان مطور واجهات")).toBeDefined();
    expect(screen.getByText("مطور واجهات أمامية")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
  });

  it("opens create form modal and creates a new form", async () => {
    (companyAwareApi.post as any).mockResolvedValueOnce({
      data: { success: true },
    });

    render(<ApplicationFormsSection />);
    await screen.findByText("استبيان مطور واجهات");

    fireEvent.click(screen.getByText("إنشاء استبيان جديد"));

    const titleInput = await screen.findByPlaceholderText(
      "مثال: استبيان التقديم لوظيفة مطور"
    );
    fireEvent.change(titleInput, {
      target: { value: "استبيان محاسب مالي" },
    });

    fireEvent.click(screen.getByText("إنشاء الاستبيان"));

    await waitFor(() => {
      expect(companyAwareApi.post).toHaveBeenCalledWith(
        "/hr/recruitment/forms",
        expect.objectContaining({
          title: "استبيان محاسب مالي",
        })
      );
    });
  });

  it("opens responses modal and displays respondent details", async () => {
    render(<ApplicationFormsSection />);
    await screen.findByText("استبيان مطور واجهات");

    fireEvent.click(screen.getByText("الردود"));

    expect(
      await screen.findByText("ردود: استبيان مطور واجهات")
    ).toBeDefined();
    expect(await screen.findByText("ياسر كمال")).toBeDefined();
    expect(screen.getByText("yasser@example.com")).toBeDefined();
  });

  it("maps applicant status codes to Arabic labels accurately", () => {
    expect(getApplicantStatusLabel("NEW")).toBe("جديد");
    expect(getApplicantStatusLabel("HIRED")).toBe("تم التوظيف");
    expect(getApplicantStatusLabel(undefined)).toBe("داخل المسار");
  });
});
