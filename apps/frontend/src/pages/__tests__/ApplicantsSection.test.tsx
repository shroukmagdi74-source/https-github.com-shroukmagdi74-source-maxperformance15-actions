// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ApplicantsSection from "../hr/recruitment/sections/ApplicantsSection";
import {
  normalizeApplicant,
  filterApplicantsList,
  getStatusBadge,
} from "../hr/recruitment/sections/applicants/helpers";

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("../../../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

vi.mock("../../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("ApplicantsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/hr/recruitment/applicants")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "app-1",
                name: "منى إبراهيم",
                email: "mona@example.com",
                phone: "01012345678",
                jobTitle: "مصمم واجهات",
                jobId: "job-1",
                appliedDate: "2026-10-10",
                status: "NEW",
                experience: 4,
                education: "بكالوريوس فنون تطبيقية",
                skills: ["Figma", "React"],
              },
            ],
          },
        });
      }
      if (url.includes("/hr/recruitment/jobs")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ id: "job-1", title: "مصمم واجهات" }],
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders applicants cards and filter bar", async () => {
    render(<ApplicantsSection />);

    await waitFor(() => {
      expect(screen.getByText("منى إبراهيم")).toBeInTheDocument();
    });

    expect(screen.getByText("المتقدمين")).toBeInTheDocument();
    expect(screen.getByText("مصمم واجهات")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
  });

  it("opens applicant details modal and add applicant modal", async () => {
    render(<ApplicantsSection />);

    await waitFor(() => {
      expect(screen.getByText("منى إبراهيم")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /عرض التفاصيل/i }));
    expect(screen.getByText("معلومات الاتصال")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));

    fireEvent.click(screen.getByRole("button", { name: /إضافة متقدم/i }));
    expect(screen.getByText("إضافة متقدم جديد")).toBeInTheDocument();
  });

  it("normalizes applicant records and filters by search/status via helpers", () => {
    const normalized = normalizeApplicant({
      id: "1",
      name: "يوسف",
      skills: "TypeScript, Node.js",
      status: "INVALID_STATUS",
    });

    expect(normalized.status).toBe("NEW");
    expect(normalized.skills).toEqual(["TypeScript", "Node.js"]);
    expect(getStatusBadge("HIRED").text).toBe("تم التوظيف");

    const filtered = filterApplicantsList([normalized], "يوسف", "NEW");
    expect(filtered).toHaveLength(1);
    expect(filterApplicantsList([normalized], "يوسف", "REJECTED")).toHaveLength(0);
  });
});
