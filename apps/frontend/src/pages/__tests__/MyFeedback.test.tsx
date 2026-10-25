// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyFeedback from "../hr/MyFeedback";
import api from "@/services/api";
import { calculateMyFeedbackStats } from "../hr/my-feedback/helpers";

const mockT = (key: string) => key;
const mockUser = { id: "user-1", role: "EMPLOYEE" };

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock("@/hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockFeedbackItems = [
  {
    id: "fb-sent-1",
    type: "SUGGESTION",
    category: "تطوير",
    content: "اقتراح لتحسين نظام البصمة",
    isAnonymous: false,
    fromUserId: "user-1",
    toUserId: undefined,
    status: "RESOLVED",
    adminReply: "شكراً لاقتراحك، جاري التنفيذ",
    repliedAt: "2026-10-15T12:00:00Z",
    fromEmployee: { id: "emp-1", firstName: "أحمد", lastName: "علي" },
    toEmployee: null,
    createdAt: "2026-10-10T10:00:00Z",
  },
  {
    id: "fb-rec-1",
    type: "PEER",
    category: "تعاون",
    content: "تعاون ممتاز في المشروع الأخير",
    rating: 5,
    isAnonymous: false,
    fromUserId: "user-2",
    toUserId: "user-1",
    status: "ACTIVE",
    fromEmployee: { id: "emp-2", firstName: "منى", lastName: "كامل" },
    toEmployee: { id: "emp-1", firstName: "أحمد", lastName: "علي" },
    createdAt: "2026-10-12T09:00:00Z",
  },
];

describe("MyFeedback (Batch 519)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      data: {
        success: true,
        feedback: mockFeedbackItems,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders my feedback header, stats cards, and sent feedback list", async () => {
    render(
      <MemoryRouter>
        <MyFeedback />
      </MemoryRouter>
    );

    expect(await screen.findByText("employee.feedback.title")).toBeDefined();
    expect(
      await screen.findByText("اقتراح لتحسين نظام البصمة")
    ).toBeDefined();
    expect(
      screen.getByText("شكراً لاقتراحك، جاري التنفيذ")
    ).toBeDefined();
    expect(screen.getByText("5.0")).toBeDefined();
  });

  it("filters feedback items when searching by content", async () => {
    render(
      <MemoryRouter>
        <MyFeedback />
      </MemoryRouter>
    );

    await screen.findByText("اقتراح لتحسين نظام البصمة");

    const searchInput = screen.getByPlaceholderText(
      "employee.feedback.searchPlaceholder"
    );
    fireEvent.change(searchInput, { target: { value: "غير موجود" } });

    expect(
      await screen.findByText("employee.feedback.noRecords")
    ).toBeDefined();
  });

  it("opens quick preview dialog when clicking preview button", async () => {
    render(
      <MemoryRouter>
        <MyFeedback />
      </MemoryRouter>
    );

    await screen.findByText("اقتراح لتحسين نظام البصمة");

    fireEvent.click(screen.getByLabelText("معاينة الرسالة"));

    expect(
      await screen.findByText("employee.feedback.quickView")
    ).toBeDefined();
  });

  it("calculates received count, sent count, and average rating accurately", () => {
    const stats = calculateMyFeedbackStats(mockFeedbackItems as any, "user-1");
    expect(stats).toEqual({
      receivedCount: 1,
      sentCount: 1,
      avgRating: "5.0",
    });
  });
});
