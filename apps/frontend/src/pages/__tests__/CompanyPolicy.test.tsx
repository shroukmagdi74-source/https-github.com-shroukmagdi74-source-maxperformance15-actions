/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CompanyPolicy from "../hr/CompanyPolicy";
import api from "../../services/api";

vi.mock("react-quill", () => ({
  default: ({ value, onChange, placeholder }: any) => (
    <textarea
      data-testid="mock-react-quill"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("../../services/api", () => ({
  default: {
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

const mockPolicies = [
  {
    id: "pol-1",
    title: "سياسة الحضور والانصراف المرن",
    content: "<p>يسمح للموظف بالحضور بين الساعة 8:00 صباحاً و 10:00 صباحاً.</p>",
    category: "attendance",
    isActive: true,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-10T11:00:00Z",
    version: 2,
  },
  {
    id: "pol-2",
    title: "سياسة الإجازات السنوية والمرضية",
    content: "<p>يحق لكل موظف الحصول على 21 يوماً إجازة سنوية مدفوعة الأجر.</p>",
    category: "leaves",
    isActive: false,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-02-16T12:00:00Z",
    version: 1,
  },
];

describe("CompanyPolicy Component (Batch 506)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/policies")) {
        return Promise.resolve({
          data: {
            success: true,
            policies: mockPolicies,
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and new policy button", async () => {
    render(
      <MemoryRouter>
        <CompanyPolicy />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("سياسات الشركة")).toBeTruthy();
      expect(
        screen.getByText("الدليل الشامل للوائح والقوانين التنظيمية")
      ).toBeTruthy();
      expect(screen.getByText("إضافة سياسة جديدة")).toBeTruthy();
    });
  });

  it("renders stats cards correctly", async () => {
    render(
      <MemoryRouter>
        <CompanyPolicy />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إجمالي السياسات")).toBeTruthy();
      expect(screen.getByText("السياسات الفعالة")).toBeTruthy();
      expect(screen.getByText("التحديثات الأخيرة")).toBeTruthy();
      expect(screen.getByText("فئات السياسات")).toBeTruthy();
    });
  });

  it("renders policies table with titles, categories, and version numbers", async () => {
    render(
      <MemoryRouter>
        <CompanyPolicy />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("سياسة الحضور والانصراف المرن")).toBeTruthy();
      expect(screen.getByText("سياسة الإجازات السنوية والمرضية")).toBeTruthy();
      expect(screen.getByText("الحضور والانصراف")).toBeTruthy();
      expect(screen.getByText("الإجازات")).toBeTruthy();
      expect(screen.getByText("V2.0")).toBeTruthy();
      expect(screen.getByText("V1.0")).toBeTruthy();
      expect(screen.getByText("نشط")).toBeTruthy();
      expect(screen.getByText("غير نشط")).toBeTruthy();
    });
  });

  it("opens add policy dialog on clicking new policy button", async () => {
    render(
      <MemoryRouter>
        <CompanyPolicy />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إضافة سياسة جديدة")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("إضافة سياسة جديدة"));

    await waitFor(() => {
      expect(screen.getAllByText("إضافة سياسة جديدة").length).toBeGreaterThan(0);
      expect(screen.getByPlaceholderText("مثال: سياسة العمل عن بُعد")).toBeTruthy();
      expect(screen.getByText("حفظ السياسة")).toBeTruthy();
    });
  });

  it("opens view policy dialog when clicking on a policy row", async () => {
    render(
      <MemoryRouter>
        <CompanyPolicy />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("سياسة الحضور والانصراف المرن")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("سياسة الحضور والانصراف المرن"));

    await waitFor(() => {
      expect(screen.getByText("النسخة 2.0")).toBeTruthy();
      expect(screen.getByText("تعديل السياسة")).toBeTruthy();
    });
  });
});
