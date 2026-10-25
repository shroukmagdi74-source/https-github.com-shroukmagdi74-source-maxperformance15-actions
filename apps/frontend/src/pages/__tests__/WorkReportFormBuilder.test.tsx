// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import WorkReportFormBuilder from "../hr/work-reporting/WorkReportFormBuilder";
import {
  buildBlankField,
  computeFieldSourceCounts,
  normalizeDraftForSubmit,
} from "../hr/work-reporting/form-builder/helpers";

const { mockGet, mockPost, mockPut, mockToastError } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("../../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
  },
}));

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

describe("WorkReportFormBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form builder header, metadata inputs, and sidebar summary", () => {
    render(
      <MemoryRouter>
        <WorkReportFormBuilder />
      </MemoryRouter>
    );

    expect(screen.getByText("بناء فورم التقرير")).toBeInTheDocument();
    expect(screen.getByText("ملخص سريع")).toBeInTheDocument();
    expect(
      screen.getByText("أضف أول حقل لبدء بناء الفورم.")
    ).toBeInTheDocument();
  });

  it("adds manual fields and loads messaging preset when requested", () => {
    render(
      <MemoryRouter>
        <WorkReportFormBuilder />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /إضافة حقل يدوي/i }));
    expect(screen.getByText("حقل 1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /تحميل قالب فريق الرد/i })
    );
    expect(
      screen.queryByText("أضف أول حقل لبدء بناء الفورم.")
    ).not.toBeInTheDocument();
  });

  it("builds blank fields, computes counts, and normalizes drafts via helpers", () => {
    const f1 = buildBlankField(0);
    expect(f1.key).toBe("field_1");
    expect(f1.sourceType).toBe("MANUAL");

    const counts = computeFieldSourceCounts([
      f1,
      { ...f1, sourceType: "SYSTEM" },
    ]);
    expect(counts.MANUAL).toBe(1);
    expect(counts.SYSTEM).toBe(1);

    const normalized = normalizeDraftForSubmit({
      title: "  تقرير المبيعات  ",
      description: "  وصف  ",
      cadence: "DAILY",
      isActive: true,
      allowMultipleSubmissions: false,
      fields: [{ ...f1, label: "  عدد الطلبات  ", key: "orders count" }],
    });

    expect(normalized.title).toBe("تقرير المبيعات");
    expect(normalized.fields[0].label).toBe("عدد الطلبات");
    expect(normalized.fields[0].key).toBe("orders_count");
  });
});
