// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import DevGoalDetails from "../DevGoalDetails";

vi.mock("../../../utils/tokenManager", () => ({
  default: {
    getAccessToken: () => "mock-token",
    createAuthHeaders: (headers: any = {}) => ({
      Authorization: "Bearer mock-token",
      ...headers,
    }),
  },
}));

vi.mock("../../../utils/urlHelper", () => ({
  buildApiUrl: (path: string) => `http://localhost:3000/api/${path}`,
}));

vi.mock("../../../i18n", () => ({
  __esModule: true,
  default: {
    dir: () => "rtl",
    language: "ar",
    t: (key: string) => key,
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockGoalData = {
  id: "goal-101",
  title: "إطلاق محرك الإعلانات الذكي 2026",
  description: "تطوير ودمج وكلاء الذكاء الاصطناعي مع Meta Ads API",
  status: "ACTIVE",
  type: "STRATEGIC",
  priority: "HIGH",
  targetType: "NUMBER",
  targetValue: 20,
  currentValue: 15,
  unit: "ميزة",
  progress: 75,
  confidence: "ON_TRACK",
  startDate: "2026-10-01T00:00:00.000Z",
  endDate: "2026-12-31T00:00:00.000Z",
  quarter: "Q4 2026",
  tags: ["AI", "Ads", "Automation"],
  owner: { id: "m-1", name: "مختار الحناوي", userId: "u-1" },
  project: { id: "p-1", name: "منصة MaxP", color: "#4f46e5" },
  parentGoal: null,
  childGoals: [],
  keyResults: [
    {
      id: "kr-1",
      title: "دقة استهداف الجمهور 95%",
      description: "تحقيق دقة فائقة في تحليل الجمهور",
      targetType: "PERCENTAGE",
      targetValue: 95,
      currentValue: 90,
      unit: "%",
      weight: 2,
      confidence: "ON_TRACK",
      status: "ACTIVE",
    },
  ],
  linkedTasks: [
    {
      id: "t-1",
      title: "بناء واجهة الكنترول بانل للمصمم الذكي",
      status: "DONE",
      priority: "HIGH",
      assigneeId: "m-1",
    },
  ],
  _count: { keyResults: 1, linkedTasks: 1, childGoals: 0 },
};

const mockCheckInsData = [
  {
    id: "ci-1",
    content: "تم إكمال اختبارات الربط بنجاح وكافة العمليات جاهزة",
    confidence: "ON_TRACK",
    progressValue: 75,
    blockers: null,
    createdAt: "2026-10-25T10:00:00.000Z",
    member: { id: "m-1", name: "مختار الحناوي", userId: "u-1" },
  },
];

describe("DevGoalDetails Modular Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("check-ins")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockCheckInsData }),
        });
      }
      if (url.includes("goals/goal-101")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockGoalData }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/super-admin/dev-goals/goal-101"]}>
        <Routes>
          <Route
            path="/super-admin/dev-goals/:id"
            element={<DevGoalDetails />}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders goal header with title, status, confidence, and progress percentage", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("إطلاق محرك الإعلانات الذكي 2026"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("نشط")).toBeInTheDocument();
    expect(screen.getByText("على المسار")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders progress ribbon with current and target values", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/15 \/ 20/)).toBeInTheDocument();
    });

    expect(screen.getByText("نسبة الإنجاز")).toBeInTheDocument();
  });

  it("renders Overview tab with owner, project, and telemetry counts", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("مواصفات وتصنيف الهدف")).toBeInTheDocument();
    });

    expect(screen.getByText("مختار الحناوي")).toBeInTheDocument();
    expect(screen.getByText("منصة MaxP")).toBeInTheDocument();
    expect(screen.getByText("إحصائيات الإنجاز")).toBeInTheDocument();
  });

  it("switches to Key Results tab and displays key results list", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /النتائج الرئيسية/ })).toBeInTheDocument();
    });

    const krTab = screen.getByRole("button", { name: /النتائج الرئيسية/ });
    fireEvent.click(krTab);

    expect(
      screen.getByText("دقة استهداف الجمهور 95%"),
    ).toBeInTheDocument();
    expect(screen.getByText(/وزن: 2/)).toBeInTheDocument();
  });

  it("switches to Tasks tab and displays linked tasks", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /المهام المرتبطة/ })).toBeInTheDocument();
    });

    const tasksTab = screen.getByRole("button", { name: /المهام المرتبطة/ });
    fireEvent.click(tasksTab);

    expect(
      screen.getByText("بناء واجهة الكنترول بانل للمصمم الذكي"),
    ).toBeInTheDocument();
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });

  it("switches to Check-ins tab and displays check-in history", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /المراجعات/ })).toBeInTheDocument();
    });

    const checkInsTab = screen.getByRole("button", { name: /المراجعات/ });
    fireEvent.click(checkInsTab);

    expect(
      screen.getByText("تم إكمال اختبارات الربط بنجاح وكافة العمليات جاهزة"),
    ).toBeInTheDocument();
  });

  it("opens Key Result modal when 'نتيجة رئيسية جديدة' is clicked", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /النتائج الرئيسية/ })).toBeInTheDocument();
    });

    const krTab = screen.getByRole("button", { name: /النتائج الرئيسية/ });
    fireEvent.click(krTab);

    const addKRButton = screen.getByRole("button", { name: /نتيجة رئيسية جديدة/ });
    fireEvent.click(addKRButton);

    expect(screen.getByPlaceholderText(/خفض زمن الاستجابة/)).toBeInTheDocument();
  });
});
