// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import JobPostingsSection from "../hr/recruitment/sections/JobPostingsSection";
import {
  getJobStatusBadge,
  getJobTypeLabel,
  getJobExperienceLabel,
  normalizeTextList,
} from "../hr/recruitment/sections/job-postings/helpers";

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

describe("JobPostingsSection Helpers", () => {
  it("resolves clean emoji-free status, type, and experience labels and normalizes multiline lists", () => {
    expect(getJobStatusBadge("ACTIVE").text).toBe("نشط");
    expect(getJobTypeLabel("FULL_TIME")).toBe("دوام كامل");
    expect(getJobExperienceLabel("SENIOR")).toBe("Senior");
    expect(normalizeTextList("React\nTypeScript\nNode.js")).toEqual([
      "React",
      "TypeScript",
      "Node.js",
    ]);
  });
});

describe("JobPostingsSection Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "job-10",
            title: "مهندس ذكاء اصطناعي",
            department: "الذكاء الاصطناعي",
            location: "القاهرة - مصر",
            type: "FULL_TIME",
            experienceLevel: "SENIOR",
            salaryMin: 35000,
            salaryMax: 55000,
            description: "تطوير نماذج الذكاء الاصطناعي والوكلاء",
            requirements: ["Python", "PyTorch"],
            responsibilities: ["بناء الوكلاء", "تحسين الأداء"],
            status: "ACTIVE",
            applicantsCount: 18,
            postedDate: "2026-10-20",
          },
        ],
      },
    });
  });

  it("renders job posting cards with salary range and applicants count", async () => {
    render(<JobPostingsSection />);

    await waitFor(() => {
      expect(screen.getByText("مهندس ذكاء اصطناعي")).toBeTruthy();
    });

    expect(screen.getByText("القاهرة - مصر")).toBeTruthy();
    expect(screen.getByText("35,000")).toBeTruthy();
    expect(screen.getByText("55,000")).toBeTruthy();
    expect(screen.getByText("18")).toBeTruthy();
  });

  it("opens job details modal when clicking عرض", async () => {
    render(<JobPostingsSection />);

    await waitFor(() => {
      expect(screen.getByText("عرض")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("عرض"));

    expect(
      screen.getByText("تطوير نماذج الذكاء الاصطناعي والوكلاء"),
    ).toBeTruthy();
    expect(screen.getByText("PyTorch")).toBeTruthy();
  });
});
