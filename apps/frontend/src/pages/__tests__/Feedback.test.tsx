/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Feedback from "../hr/Feedback";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "usr-admin-1",
      firstName: "أحمد",
      lastName: "المدير",
      role: "COMPANY_ADMIN",
      companyId: "comp-123",
    },
  }),
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

const mockFeedback = [
  {
    id: "fb-1",
    type: "PEER",
    category: "التعاون الفريقي",
    content: "أداء ممتاز وتنسيق رائع في إنجاز المهام المطلوبة خلال الأسبوع.",
    rating: 5,
    isAnonymous: false,
    fromUserId: "usr-emp-1",
    toUserId: "usr-emp-2",
    status: "PENDING",
    fromEmployee: {
      id: "emp-1",
      firstName: "سعيد",
      lastName: "جمال",
      email: "saeed@example.com",
    },
    toEmployee: {
      id: "emp-2",
      firstName: "منى",
      lastName: "خالد",
      email: "mona@example.com",
    },
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "fb-2",
    type: "GENERAL",
    category: "بيئة العمل",
    content: "اقتراح لتحسين الإضاءة وسرعة الإنترنت في المكتب الرئيسي.",
    rating: 4,
    isAnonymous: true,
    fromUserId: "usr-emp-3",
    toUserId: "management",
    status: "PENDING",
    fromEmployee: {
      id: "emp-3",
      firstName: "مجهول",
      lastName: "المصدر",
    },
    createdAt: "2026-03-02T12:00:00Z",
  },
];

const mockStats = {
  total: 42,
  averageRating: 4.6,
  byType: [
    { type: "PEER", _count: 20 },
    { type: "GENERAL", _count: 12 },
    { type: "MANAGER", _count: 10 },
  ],
};

describe("Feedback Component (Batch 504)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/feedback/stats")) {
        return Promise.resolve({
          data: {
            success: true,
            stats: mockStats,
          },
        });
      }
      if (url.includes("/hr/feedback")) {
        return Promise.resolve({
          data: {
            success: true,
            feedback: mockFeedback,
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and new feedback button", async () => {
    render(
      <MemoryRouter>
        <Feedback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("التغذية الراجعة 360°")).toBeTruthy();
      expect(
        screen.getByText("نظرة شاملة على الأداء والتفاعل في الشركة")
      ).toBeTruthy();
      expect(screen.getByText("تغذية راجعة جديدة")).toBeTruthy();
    });
  });

  it("renders statistics overview cards", async () => {
    render(
      <MemoryRouter>
        <Feedback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("الإجمالي")).toBeTruthy();
      expect(screen.getByText("42")).toBeTruthy();
      expect(screen.getByText("متوسط الرضا العام")).toBeTruthy();
      expect(screen.getByText("4.6")).toBeTruthy();
      expect(screen.getByText("التميز")).toBeTruthy();
    });
  });

  it("renders feedback list items with sender and receiver information", async () => {
    render(
      <MemoryRouter>
        <Feedback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("منى خالد")).toBeTruthy();
      expect(screen.getByText("تغذية راجعة عامة")).toBeTruthy();
      expect(
        screen.getByText(
          "أداء ممتاز وتنسيق رائع في إنجاز المهام المطلوبة خلال الأسبوع."
        )
      ).toBeTruthy();
      expect(screen.getByText("مجهول المصدر")).toBeTruthy();
      expect(screen.getByText("من: سعيد جمال")).toBeTruthy();
    });
  });

  it("opens reply dialog when privileged user clicks reply on general feedback", async () => {
    render(
      <MemoryRouter>
        <Feedback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إضافة رد")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("إضافة رد"));

    await waitFor(() => {
      expect(screen.getByText("الرد على التغذية الراجعة")).toBeTruthy();
      expect(
        screen.getByText(
          '"اقتراح لتحسين الإضاءة وسرعة الإنترنت في المكتب الرئيسي."'
        )
      ).toBeTruthy();
      expect(screen.getByText("إرسال الرد")).toBeTruthy();
    });
  });
});
