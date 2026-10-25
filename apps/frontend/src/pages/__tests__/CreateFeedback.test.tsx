// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CreateFeedback from "../hr/CreateFeedback";
import api from "../../services/api";
import { isReviewFeedbackType } from "../hr/create-feedback/helpers";

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
    firstName: "سارة",
    lastName: "محمود",
    position: { title: "مدير منتج" },
    department: { name: "المنتجات" },
  },
];

describe("CreateFeedback (Batch 518)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/employees") {
        return Promise.resolve({ data: { employees: mockEmployees } });
      }
      if (url === "/hr/feedback/fb-1") {
        return Promise.resolve({
          data: {
            feedback: {
              id: "fb-1",
              toUserId: "emp-1",
              type: "PEER",
              category: "تعاون",
              content: "أداء رائع وتعاون مستمر",
              rating: 5,
              isAnonymous: true,
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

  it("renders create feedback header, form fields, and guidelines sidebar", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/feedback/new"]}>
        <Routes>
          <Route path="/hr/feedback/new" element={<CreateFeedback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("إرسال شكوى أو اقتراح")).toBeDefined();
    expect(screen.getByText("تفاصيل الرسالة")).toBeDefined();
    expect(screen.getByText("إرشادات التغذية الراجعة")).toBeDefined();
    expect(screen.getByText("إرسال كمجهول الهوية")).toBeDefined();
  });

  it("updates star rating when clicking rating stars", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/feedback/new"]}>
        <Routes>
          <Route path="/hr/feedback/new" element={<CreateFeedback />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("إرسال شكوى أو اقتراح");

    fireEvent.click(screen.getByLabelText("تقييم 4"));

    expect(screen.getByText("4")).toBeDefined();
  });

  it("loads existing feedback in edit mode and displays selected employee card", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/feedback/edit/fb-1"]}>
        <Routes>
          <Route path="/hr/feedback/edit/:id" element={<CreateFeedback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("تعديل الرسالة")).toBeDefined();
    expect(await screen.findByDisplayValue("أداء رائع وتعاون مستمر")).toBeDefined();
    expect(await screen.findByText("الموظف المختار")).toBeDefined();
    expect(screen.getByText("سارة محمود")).toBeDefined();
  });

  it("identifies review feedback types accurately", () => {
    expect(isReviewFeedbackType("PEER")).toBe(true);
    expect(isReviewFeedbackType("MANAGER")).toBe(true);
    expect(isReviewFeedbackType("SUGGESTION")).toBe(false);
  });
});
