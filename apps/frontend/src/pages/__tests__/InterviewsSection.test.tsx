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
import InterviewsSection from "../hr/recruitment/sections/InterviewsSection";
import {
  getInterviewStatusBadge,
  getInterviewTypeText,
  normalizeInterviewersList,
} from "../hr/recruitment/sections/interviews/helpers";

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
  },
}));

describe("InterviewsSection Helpers", () => {
  it("formats status badges, interview types, and normalizes interviewers list", () => {
    expect(getInterviewStatusBadge("SCHEDULED").text).toBe("مجدولة");
    expect(getInterviewTypeText("VIDEO")).toBe("مكالمة فيديو");
    expect(normalizeInterviewersList("أحمد, سارة, خالد")).toEqual([
      "أحمد",
      "سارة",
      "خالد",
    ]);
  });
});

describe("InterviewsSection Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/hr/recruitment/interviews") {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "int-1",
                applicantName: "كريم نبيل",
                applicantId: "app-1",
                jobTitle: "مهندس برمجيات أول",
                jobId: "job-1",
                date: "2026-11-10",
                time: "14:30",
                type: "VIDEO",
                location: "https://meet.google.com/abc",
                interviewers: ["طارق", "منى", "رامي", "سمر"],
                status: "SCHEDULED",
              },
            ],
          },
        });
      }
      if (url === "/hr/recruitment/applicants") {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "app-1",
                name: "كريم نبيل",
                email: "karim@example.com",
                phone: "01012345678",
                jobId: "job-1",
              },
            ],
          },
        });
      }
      if (url === "/hr/recruitment/jobs") {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "job-1",
                title: "مهندس برمجيات أول",
                department: "الهندسة",
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  it("renders scheduled interview card with applicant, job title, time, and overflow interviewers badge", async () => {
    render(<InterviewsSection />);

    await waitFor(() => {
      expect(screen.getByText("كريم نبيل")).toBeTruthy();
    });

    expect(screen.getByText("مهندس برمجيات أول")).toBeTruthy();
    expect(screen.getByText("14:30")).toBeTruthy();
    expect(screen.getByText("+1")).toBeTruthy();
  });

  it("opens schedule interview modal when clicking جدولة مقابلة جديدة", async () => {
    render(<InterviewsSection />);

    await waitFor(() => {
      expect(screen.getByText("جدولة مقابلة جديدة")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("جدولة مقابلة جديدة"));

    expect(screen.getByText("جدولة موعد")).toBeTruthy();
    expect(screen.getByText("تأكيد الجدولة")).toBeTruthy();
  });
});
