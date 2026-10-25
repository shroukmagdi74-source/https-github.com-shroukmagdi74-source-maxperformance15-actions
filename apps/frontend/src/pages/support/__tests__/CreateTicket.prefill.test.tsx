// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateTicket, {
  stripHtmlTags,
  resolveCategory,
  MAX_SUBJECT_LENGTH,
  MAX_BODY_LENGTH,
} from "../CreateTicket";

vi.mock("../../../services/supportService", () => ({
  default: {
    createTicket: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

describe("CreateTicket Prefill (Ticket SUP-1)", () => {
  it("prefills subject, category, and body when query parameters are supplied", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/support/tickets/new?subject=%D9%85%D8%B4%D9%83%D9%84%D8%A9&category=billing&body=%D8%AA%D9%81%D8%A7%D8%B5%D9%8A%D9%84",
        ]}
      >
        <CreateTicket />
      </MemoryRouter>
    );

    const subjectInput = screen.getByLabelText(/موضوع التذكرة/i) as HTMLInputElement;
    const categorySelect = screen.getByLabelText(/القسم المعني/i) as HTMLSelectElement;
    const contentTextarea = screen.getByLabelText(/شرح تفاصيل المشكلة/i) as HTMLTextAreaElement;

    expect(subjectInput.value).toBe("مشكلة");
    expect(categorySelect.value).toBe("billing");
    expect(contentTextarea.value).toBe("تفاصيل");
  });

  it("falls back to 'technical' when category is invalid or malicious (e.g. ?category=hack)", () => {
    render(
      <MemoryRouter initialEntries={["/support/tickets/new?category=hack"]}>
        <CreateTicket />
      </MemoryRouter>
    );

    const categorySelect = screen.getByLabelText(/القسم المعني/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe("technical");
  });

  it("leaves form fields empty with default category 'technical' when no query parameters are provided", () => {
    render(
      <MemoryRouter initialEntries={["/support/tickets/new"]}>
        <CreateTicket />
      </MemoryRouter>
    );

    const subjectInput = screen.getByLabelText(/موضوع التذكرة/i) as HTMLInputElement;
    const categorySelect = screen.getByLabelText(/القسم المعني/i) as HTMLSelectElement;
    const contentTextarea = screen.getByLabelText(/شرح تفاصيل المشكلة/i) as HTMLTextAreaElement;

    expect(subjectInput.value).toBe("");
    expect(categorySelect.value).toBe("technical");
    expect(contentTextarea.value).toBe("");
  });

  it("renders SuggestionFeedbackPage when preset=suggestion (preserving existing behavior)", () => {
    render(
      <MemoryRouter initialEntries={["/support/tickets/new?preset=suggestion"]}>
        <CreateTicket />
      </MemoryRouter>
    );

    expect(screen.getByText("شاركنا مقترحاتك لتطوير المنصة")).toBeInTheDocument();
    expect(screen.queryByText("فتح تذكرة دعم فني جديدة")).not.toBeInTheDocument();
  });

  it("strips any HTML tags from subject and body before displaying them (security rule)", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/support/tickets/new?subject=<b>مشكلة خطيرة</b>&body=<script>alert('xss')</script>تفاصيل المشكلة",
        ]}
      >
        <CreateTicket />
      </MemoryRouter>
    );

    const subjectInput = screen.getByLabelText(/موضوع التذكرة/i) as HTMLInputElement;
    const contentTextarea = screen.getByLabelText(/شرح تفاصيل المشكلة/i) as HTMLTextAreaElement;

    expect(subjectInput.value).toBe("مشكلة خطيرة");
    expect(contentTextarea.value).toBe("alert('xss')تفاصيل المشكلة");
    expect(subjectInput.value).not.toContain("<");
    expect(subjectInput.value).not.toContain(">");
    expect(contentTextarea.value).not.toContain("<script>");
  });

  it("truncates subject and body according to form limits", () => {
    const longSubject = "أ".repeat(MAX_SUBJECT_LENGTH + 50);
    const longBody = "ب".repeat(MAX_BODY_LENGTH + 200);

    render(
      <MemoryRouter
        initialEntries={[
          `/support/tickets/new?subject=${encodeURIComponent(longSubject)}&body=${encodeURIComponent(longBody)}`,
        ]}
      >
        <CreateTicket />
      </MemoryRouter>
    );

    const subjectInput = screen.getByLabelText(/موضوع التذكرة/i) as HTMLInputElement;
    const contentTextarea = screen.getByLabelText(/شرح تفاصيل المشكلة/i) as HTMLTextAreaElement;

    expect(subjectInput.value.length).toBe(MAX_SUBJECT_LENGTH);
    expect(contentTextarea.value.length).toBe(MAX_BODY_LENGTH);
  });

  describe("Helper unit tests", () => {
    it("resolveCategory correctly validates allowed categories and normalizes casing", () => {
      expect(resolveCategory("technical")).toBe("technical");
      expect(resolveCategory("BILLING")).toBe("billing");
      expect(resolveCategory(" Inquiry ")).toBe("inquiry");
      expect(resolveCategory("suggestion")).toBe("suggestion");
      expect(resolveCategory("complaint")).toBe("complaint");
      expect(resolveCategory("unknown")).toBe("technical");
      expect(resolveCategory("")).toBe("technical");
      expect(resolveCategory(null)).toBe("technical");
      expect(resolveCategory(undefined)).toBe("technical");
    });

    it("stripHtmlTags removes HTML tags and handles nested tags", () => {
      expect(stripHtmlTags("<p>مرحبا</p>")).toBe("مرحبا");
      expect(stripHtmlTags("<b><i>خط عريض ومائل</i></b>")).toBe("خط عريض ومائل");
      expect(stripHtmlTags("<script>alert(1)</script>")).toBe("alert(1)");
      expect(stripHtmlTags("<img src=\"x\" onerror=\"alert(1)\" />")).toBe("");
      expect(stripHtmlTags("نص عادي")).toBe("نص عادي");
      expect(stripHtmlTags("")).toBe("");
      expect(stripHtmlTags(null)).toBe("");
    });
  });
});
